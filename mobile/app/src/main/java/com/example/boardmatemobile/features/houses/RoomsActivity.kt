package com.example.boardmatemobile.features.houses

import com.example.boardmatemobile.utils.toIdString
import android.animation.ValueAnimator
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.view.Gravity
import android.view.MotionEvent
import android.view.View
import android.view.animation.DecelerateInterpolator
import android.widget.*
import androidx.activity.ComponentActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.example.boardmatemobile.R
import com.example.boardmatemobile.data.model.HouseResponse
import com.example.boardmatemobile.data.remote.ApiService
import com.example.boardmatemobile.data.remote.RetrofitClient
import com.example.boardmatemobile.features.auth.LoginActivity
import com.example.boardmatemobile.features.admin.AdminActivity
import com.example.boardmatemobile.features.contact.ContactActivity
import com.example.boardmatemobile.features.owner.OwnerDashboardActivity
import kotlinx.coroutines.*

class RoomsActivity : ComponentActivity() {

    private var isExpanded = false
    private val allHouses = mutableListOf<HouseResponse>()
    private lateinit var houseAdapter: HouseAdapter
    private lateinit var rvHouses: RecyclerView
    private lateinit var tvLoading: TextView
    private lateinit var tvEmpty: TextView
    private lateinit var tvTitle: TextView

    private val mainScope = MainScope()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_rooms)

        // ── SHARED PREFS ───────────────────────────────────────────────
        val prefs = getSharedPreferences("boardmate_prefs", Context.MODE_PRIVATE)
        val token = prefs.getString("token", "")
        val role = prefs.getString("role", "")
        val name = prefs.getString("name", "User")
        val pic = prefs.getString("profilePicture", "")

        // Redirect if wrong role
        when (role) {
            "ROLE_ADMIN" -> {
                startActivity(Intent(this, OwnerDashboardActivity::class.java))
                finish()
                return
            }
            "ROLE_SUPERADMIN" -> {
                startActivity(Intent(this, AdminActivity::class.java))
                finish()
                return
            }
        }

        // ── VIEWS ─────────────────────────────────────────────────────
        rvHouses  = findViewById(R.id.rvHouses)
        tvLoading = findViewById(R.id.tvLoading)
        tvEmpty   = findViewById(R.id.tvEmpty)
        tvTitle   = findViewById(R.id.tvTitle)

        val sidebar         = findViewById<LinearLayout>(R.id.sidebar)
        val overlay         = findViewById<View>(R.id.overlay)
        val mainContent     = findViewById<LinearLayout>(R.id.mainContent)
        val tvSidebarLogo   = findViewById<TextView>(R.id.tvSidebarLogo)
        val tvUserName      = findViewById<TextView>(R.id.tvUserName)
        val tvUserRole      = findViewById<TextView>(R.id.tvUserRole)
        val tvLogout        = findViewById<TextView>(R.id.tvLogout)
        val ivAvatar        = findViewById<ImageView>(R.id.ivAvatar)

        val navHomeItem     = findViewById<LinearLayout>(R.id.navHomeItem)
        val navRoomsItem    = findViewById<LinearLayout>(R.id.navRoomsItem)
        val navVisitsItem   = findViewById<LinearLayout>(R.id.navVisitsItem)
        val navContactItem  = findViewById<LinearLayout>(R.id.navContactItem)
        val navOwnerItem    = findViewById<LinearLayout>(R.id.navOwnerItem)
        val navAdminItem    = findViewById<LinearLayout>(R.id.navAdminItem)

        val navHomeLabel    = findViewById<TextView>(R.id.navHomeLabel)
        val navRoomsLabel   = findViewById<TextView>(R.id.navRoomsLabel)
        val navVisitsLabel  = findViewById<TextView>(R.id.navVisitsLabel)
        val navContactLabel = findViewById<TextView>(R.id.navContactLabel)
        val navOwnerLabel   = findViewById<TextView>(R.id.navOwnerLabel)
        val navAdminLabel   = findViewById<TextView>(R.id.navAdminLabel)

        val allLabels = listOf(
            navHomeLabel,
            navRoomsLabel,
            navVisitsLabel,
            navContactLabel,
            navOwnerLabel,
            navAdminLabel
        )

        // ── USER INFO ─────────────────────────────────────────────────
        tvUserName.text = name
        tvUserRole.text = when (role) {
            "ROLE_ADMIN"      -> "Owner"
            "ROLE_SUPERADMIN" -> "Admin"
            else              -> "Boarder"
        }

        if (pic.isNullOrEmpty()) {
            ivAvatar.setImageResource(android.R.drawable.ic_menu_gallery)
        } else {
            Glide.with(this).load(pic).into(ivAvatar)
        }

        // Setup RecyclerView
        rvHouses.layoutManager = LinearLayoutManager(this)
        houseAdapter = HouseAdapter(onHouseClick = { house ->
            val intent = Intent(this, RoomDetailsActivity::class.java)
            intent.putExtra("house_id", house.id.toIdString())
            startActivity(intent)
        })
        rvHouses.adapter = houseAdapter

        // ── SIDEBAR ANIMATION ─────────────────────────────────────────
        val collapsedWidth = dpToPx(56)
        val expandedWidth  = dpToPx(220)

        // Set initial padding for collapsed sidebar
        mainContent.setPadding(collapsedWidth, 0, 0, 0)

        fun setSidebarWidth(expand: Boolean) {
            val from = if (expand) collapsedWidth else expandedWidth
            val to   = if (expand) expandedWidth  else collapsedWidth

            ValueAnimator.ofInt(from, to).apply {
                duration = 300
                interpolator = DecelerateInterpolator()
                addUpdateListener {
                    sidebar.layoutParams.width = it.animatedValue as Int
                    sidebar.requestLayout()
                }
                start()
            }
            allLabels.forEach { label ->
                label.visibility = if (expand) View.VISIBLE else View.GONE
            }
            tvSidebarLogo.text = if (expand) "BoardMate" else "B"
            overlay.visibility = if (expand) View.VISIBLE else View.GONE

            // Keep padding at collapsed width so content isn't hidden
            mainContent.setPadding(collapsedWidth, 0, 0, 0)

            isExpanded = expand
        }

        // Make sidebar clickable anywhere
        sidebar.isClickable = true
        sidebar.isFocusable = true

        // Click anywhere on sidebar to toggle
        sidebar.setOnClickListener {
            setSidebarWidth(!isExpanded)
        }

        // Also allow double-click for quick toggle
        var lastClickTime: Long = 0
        sidebar.setOnTouchListener { _, event ->
            if (event.action == MotionEvent.ACTION_UP) {
                val clickTime = System.currentTimeMillis()
                if (clickTime - lastClickTime < 300) {
                    // Double click - quick toggle
                    setSidebarWidth(!isExpanded)
                }
                lastClickTime = clickTime
            }
            false // Let the click listener still work
        }

        // Close sidebar when clicking outside on overlay
        overlay.setOnClickListener {
            setSidebarWidth(false)
        }

        // ── NAV CLICKS WITH ACTIVE STATE ──────────────────────────────
        fun setActiveNavItem(activeItem: LinearLayout) {
            val navItems = listOf(navHomeItem, navRoomsItem, navVisitsItem, navContactItem, navOwnerItem, navAdminItem)
            navItems.forEach { item ->
                if (item == activeItem) {
                    item.setBackgroundColor(0x1AFFFFFF) // Active background
                } else {
                    item.setBackgroundColor(0x00000000) // Transparent
                }
            }
        }

        navHomeItem.setOnClickListener {
            setActiveNavItem(navHomeItem)
            startActivity(Intent(this, DashboardActivity::class.java))
        }
        navRoomsItem.setOnClickListener {
            setActiveNavItem(navRoomsItem)
            setSidebarWidth(false)
        }
        navVisitsItem.setOnClickListener {
            setActiveNavItem(navVisitsItem)
            startActivity(Intent(this, MyVisitsActivity::class.java))
        }
        navContactItem.setOnClickListener {
            setActiveNavItem(navContactItem)
            startActivity(Intent(this, ContactActivity::class.java))
        }
        navOwnerItem.setOnClickListener {
            setActiveNavItem(navOwnerItem)
            startActivity(Intent(this, OwnerDashboardActivity::class.java))
        }
        navAdminItem.setOnClickListener {
            setActiveNavItem(navAdminItem)
            startActivity(Intent(this, AdminActivity::class.java))
        }

        // Add hover effects to nav items
        listOf(navHomeItem, navRoomsItem, navVisitsItem, navContactItem, navOwnerItem, navAdminItem).forEach { item ->
            item.setOnHoverListener { _, event ->
                if (event.action == MotionEvent.ACTION_HOVER_ENTER) {
                    item.alpha = 0.8f
                } else if (event.action == MotionEvent.ACTION_HOVER_EXIT) {
                    item.alpha = 1.0f
                }
                false
            }
        }

        // ── LOGOUT ────────────────────────────────────────────────────
        tvLogout.setOnClickListener {
            val edit = prefs.edit()
            edit.clear()
            edit.apply()
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
        }

        // ── FETCH HOUSES ────────────────────────────────────────────────
        mainScope.launch {
            try {
                val response = RetrofitClient.instance.getHouses("Bearer $token")
                if (response.isSuccessful) {
                    val housesList = response.body() ?: emptyList()
                    allHouses.clear()
                    allHouses.addAll(housesList)
                    houseAdapter.submitList(allHouses)

                    rvHouses.visibility = View.VISIBLE
                    tvLoading.visibility = View.GONE
                    tvEmpty.visibility = View.GONE
                } else {
                    tvLoading.text = "Failed to load houses"
                }
            } catch (e: Exception) {
                tvLoading.text = "Error: ${e.message}"
            }
        }
    }

    private fun dpToPx(dp: Int): Int {
        val density = resources.displayMetrics.density
        return (dp * density).toInt()
    }

    override fun onDestroy() {
        super.onDestroy()
        mainScope.cancel()
    }
}
