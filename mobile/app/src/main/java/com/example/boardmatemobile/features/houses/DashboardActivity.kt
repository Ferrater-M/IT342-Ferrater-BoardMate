package com.example.boardmatemobile.features.houses

import com.example.boardmatemobile.utils.toIdString
import android.animation.ValueAnimator
import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.MotionEvent
import android.view.View
import android.view.animation.DecelerateInterpolator
import android.widget.*
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.boardmatemobile.R
import com.example.boardmatemobile.data.model.HouseResponse
import com.example.boardmatemobile.data.remote.RetrofitClient
import com.example.boardmatemobile.features.auth.LoginActivity
import com.example.boardmatemobile.features.owner.OwnerDashboardActivity
import com.example.boardmatemobile.features.owner.ApplyOwnerActivity
import com.example.boardmatemobile.features.admin.AdminActivity
import com.example.boardmatemobile.features.contact.ContactActivity
import kotlinx.coroutines.MainScope
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch

class DashboardActivity : Activity() {

    private lateinit var rvHouses: RecyclerView
    private lateinit var tvLoading: TextView
    private lateinit var tvEmpty: TextView
    private lateinit var adapter: HouseAdapter
    private var allHouses = listOf<HouseResponse>()
    private var isExpanded = false
    private val activityScope = MainScope()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_dashboard)

        val prefs = getSharedPreferences("boardmate_prefs", MODE_PRIVATE)
        val role  = prefs.getString("role", "") ?: ""
        val name  = prefs.getString("name", "User") ?: "User"
        val token = prefs.getString("token", "") ?: ""

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

        // ── VIEWS ────────────────────────────────────────────────────
        rvHouses  = findViewById(R.id.rvHouses)
        tvLoading = findViewById(R.id.tvLoading)
        tvEmpty   = findViewById(R.id.tvEmpty)

        val sidebar         = findViewById<LinearLayout>(R.id.sidebar)
        val overlay         = findViewById<View>(R.id.overlay)
        val mainContent     = findViewById<LinearLayout>(R.id.mainContent)
        val tvSidebarLogo   = findViewById<TextView>(R.id.tvSidebarLogo)
        val tvUserName      = findViewById<TextView>(R.id.tvUserName)
        val tvUserRole      = findViewById<TextView>(R.id.tvUserRole)
        val tvLogout        = findViewById<TextView>(R.id.tvLogout)
        val etSearch        = findViewById<EditText>(R.id.etSearch)
        val layoutCta       = findViewById<LinearLayout>(R.id.layoutCta)
        val btnApplyOwner   = findViewById<Button>(R.id.btnApplyOwner)
        val tvPending       = findViewById<TextView>(R.id.tvAppStatusPending)
        val tvRejected      = findViewById<TextView>(R.id.tvAppStatusRejected)

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

        // ── ROLE-BASED VISIBILITY ─────────────────────────────────────
        when (role) {
            "ROLE_ADMIN" -> {
                navOwnerItem.visibility  = View.VISIBLE
                navOwnerLabel.visibility = View.GONE
            }
            "ROLE_SUPERADMIN" -> {
                navAdminItem.visibility  = View.VISIBLE
                navAdminLabel.visibility = View.GONE
            }
            "ROLE_USER" -> {
                layoutCta.visibility = View.VISIBLE
            }
        }

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
            setSidebarWidth(false)
        }
        navRoomsItem.setOnClickListener {
            setActiveNavItem(navRoomsItem)
            startActivity(Intent(this, RoomsActivity::class.java))
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
            prefs.edit().clear().apply()
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
        }

        // ── RECYCLERVIEW ──────────────────────────────────────────────
        adapter = HouseAdapter { house ->
            val intent = Intent(this, RoomDetailsActivity::class.java)
            intent.putExtra("houseId", house.id.toIdString())
            startActivity(intent)
        }
        rvHouses.layoutManager = LinearLayoutManager(this)
        rvHouses.adapter = adapter

        // ── SEARCH ────────────────────────────────────────────────────
        etSearch.addTextChangedListener(object : TextWatcher {
            override fun afterTextChanged(s: Editable?) { filterHouses(s.toString()) }
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
        })

        // ── CTA BUTTON ────────────────────────────────────────────────
        btnApplyOwner.setOnClickListener {
            startActivity(Intent(this, ApplyOwnerActivity::class.java))
        }

        // ── FETCH DATA ────────────────────────────────────────────────
        fetchHouses(token)

        if (role == "ROLE_USER") {
            checkApplicationStatus(token, tvPending, tvRejected, btnApplyOwner)
        }
    }

    // ── FETCH HOUSES ──────────────────────────────────────────────────
    private fun fetchHouses(token: String) {
        activityScope.launch {
            try {
                val res = RetrofitClient.instance.getHouses("Bearer $token")
                if (res.isSuccessful) {
                    allHouses = res.body() ?: emptyList()
                    filterHouses("")
                } else {
                    showEmpty()
                }
            } catch (e: Exception) {
                showEmpty()
                Toast.makeText(
                    this@DashboardActivity,
                    "Failed to load houses: ${e.message}",
                    Toast.LENGTH_SHORT
                ).show()
            } finally {
                tvLoading.visibility = View.GONE
            }
        }
    }

    // ── FILTER HOUSES ─────────────────────────────────────────────────
    private fun filterHouses(query: String) {
        val filtered = allHouses.filter { house ->
            val matchesSearch = query.isEmpty() ||
                    house.name.lowercase().contains(query.lowercase()) ||
                    house.location.lowercase().contains(query.lowercase())
            val isRecommended = query.isNotEmpty() || (house.rating ?: 0.0) >= 4.0
            matchesSearch && isRecommended
        }

        if (filtered.isEmpty()) {
            showEmpty()
        } else {
            tvEmpty.visibility  = View.GONE
            rvHouses.visibility = View.VISIBLE
            adapter.submitList(filtered)
        }
    }

    // ── CHECK APPLICATION STATUS ──────────────────────────────────────
    private fun checkApplicationStatus(
        token: String,
        tvPending: TextView,
        tvRejected: TextView,
        btnApply: Button
    ) {
        activityScope.launch {
            try {
                val res = RetrofitClient.instance.getApplicationStatus("Bearer $token")
                if (res.isSuccessful) {
                    when (res.body()?.status) {
                        "PENDING" -> {
                            tvPending.visibility = View.VISIBLE
                            btnApply.visibility  = View.GONE
                        }
                        "REJECTED" -> {
                            tvRejected.visibility = View.VISIBLE
                            btnApply.text = "Re-apply as Owner"
                        }
                    }
                }
            } catch (e: Exception) {
                // silently ignore
            }
        }
    }

    // ── HELPERS ───────────────────────────────────────────────────────
    private fun showEmpty() {
        rvHouses.visibility = View.GONE
        tvEmpty.visibility  = View.VISIBLE
    }

    private fun dpToPx(dp: Int): Int {
        return (dp * resources.displayMetrics.density).toInt()
    }

    // Cancel coroutines when activity is destroyed
    override fun onDestroy() {
        super.onDestroy()
        activityScope.cancel()
    }
}