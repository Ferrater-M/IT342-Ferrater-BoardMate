package com.example.boardmatemobile.features.houses

import android.animation.ValueAnimator
import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.view.MotionEvent
import android.view.View
import android.view.animation.DecelerateInterpolator
import android.widget.*
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.boardmatemobile.R
import com.example.boardmatemobile.data.remote.RetrofitClient
import com.example.boardmatemobile.features.auth.LoginActivity
import com.example.boardmatemobile.features.contact.ContactActivity
import com.example.boardmatemobile.features.owner.OwnerDashboardActivity
import com.example.boardmatemobile.features.admin.AdminActivity
import kotlinx.coroutines.MainScope
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch

class MyVisitsActivity : Activity() {

    private val activityScope = MainScope()
    private var isExpanded = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_my_visits)

        val prefs   = getSharedPreferences("boardmate_prefs", MODE_PRIVATE)
        val token   = prefs.getString("token", "") ?: ""
        val name    = prefs.getString("name", "User") ?: "User"
        val role    = prefs.getString("role", "") ?: ""

        // ── VIEWS ─────────────────────────────────────────────────────
        val sidebar         = findViewById<LinearLayout>(R.id.sidebar)
        val overlay         = findViewById<View>(R.id.overlay)
        val mainContent     = findViewById<LinearLayout>(R.id.mainContent)
        val tvSidebarLogo   = findViewById<TextView>(R.id.tvSidebarLogo)
        val tvUserName      = findViewById<TextView>(R.id.tvUserName)
        val tvUserRole      = findViewById<TextView>(R.id.tvUserRole)
        val tvLogout        = findViewById<TextView>(R.id.tvLogout)
        val tvLoading       = findViewById<TextView>(R.id.tvLoading)
        val layoutEmpty     = findViewById<LinearLayout>(R.id.layoutEmpty)
        val btnBrowse       = findViewById<Button>(R.id.btnBrowse)
        val rvVisits        = findViewById<RecyclerView>(R.id.rvVisits)

        val navHomeItem     = findViewById<LinearLayout>(R.id.navHomeItem)
        val navRoomsItem    = findViewById<LinearLayout>(R.id.navRoomsItem)
        val navContactItem  = findViewById<LinearLayout>(R.id.navContactItem)

        val allLabels = listOf(
            findViewById<TextView>(R.id.navHomeLabel),
            findViewById<TextView>(R.id.navRoomsLabel),
            findViewById<TextView>(R.id.navVisitsLabel),
            findViewById<TextView>(R.id.navContactLabel)
        )

        // ── USER INFO ─────────────────────────────────────────────────
        tvUserName.text = name
        tvUserRole.text = when (role) {
            "ROLE_ADMIN"      -> "Owner"
            "ROLE_SUPERADMIN" -> "Admin"
            else              -> "Boarder"
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
            allLabels.forEach { it.visibility = if (expand) View.VISIBLE else View.GONE }
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

        // ── NAV CLICKS WITH ACTIVE STATE ──────────────────────────────
        fun setActiveNavItem(activeItem: LinearLayout) {
            val navItems = listOf(navHomeItem, navRoomsItem, findViewById(R.id.navVisitsItem), navContactItem)
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
            finish()
        }
        navRoomsItem.setOnClickListener {
            setActiveNavItem(navRoomsItem)
            startActivity(Intent(this, RoomsActivity::class.java))
        }
        navContactItem.setOnClickListener {
            setActiveNavItem(navContactItem)
            startActivity(Intent(this, ContactActivity::class.java))
        }

        // Add hover effects to nav items
        listOf(navHomeItem, navRoomsItem, findViewById(R.id.navVisitsItem), navContactItem).forEach { item ->
            item.setOnHoverListener { _, event ->
                if (event.action == MotionEvent.ACTION_HOVER_ENTER) {
                    item.alpha = 0.8f
                } else if (event.action == MotionEvent.ACTION_HOVER_EXIT) {
                    item.alpha = 1.0f
                }
                false
            }
        }

        // Close sidebar when clicking outside on overlay
        overlay.setOnClickListener {
            setSidebarWidth(false)
        }

        // ── LOGOUT ────────────────────────────────────────────────────
        tvLogout.setOnClickListener {
            prefs.edit().clear().apply()
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
        }

        // ── BROWSE BUTTON ─────────────────────────────────────────────
        btnBrowse.setOnClickListener {
            startActivity(Intent(this, RoomsActivity::class.java))
        }

        // ── RECYCLERVIEW ──────────────────────────────────────────────
        val adapter = VisitAdapter()
        rvVisits.layoutManager = LinearLayoutManager(this)
        rvVisits.adapter = adapter

        // ── FETCH VISITS ──────────────────────────────────────────────
        activityScope.launch {
            try {
                val res = RetrofitClient.instance.getMyVisits("Bearer $token")
                if (res.isSuccessful) {
                    val visits = res.body()
                        ?.sortedByDescending { it.createdAt }
                        ?: emptyList()

                    if (visits.isEmpty()) {
                        layoutEmpty.visibility = View.VISIBLE
                        rvVisits.visibility    = View.GONE
                    } else {
                        layoutEmpty.visibility = View.GONE
                        rvVisits.visibility    = View.VISIBLE
                        adapter.submitList(visits)
                    }
                } else {
                    layoutEmpty.visibility = View.VISIBLE
                }
            } catch (e: Exception) {
                Toast.makeText(
                    this@MyVisitsActivity,
                    "Failed to load visits: ${e.message}",
                    Toast.LENGTH_SHORT
                ).show()
                layoutEmpty.visibility = View.VISIBLE
            } finally {
                tvLoading.visibility = View.GONE
            }
        }
    }

    private fun dpToPx(dp: Int): Int {
        return (dp * resources.displayMetrics.density).toInt()
    }

    override fun onDestroy() {
        super.onDestroy()
        activityScope.cancel()
    }
}