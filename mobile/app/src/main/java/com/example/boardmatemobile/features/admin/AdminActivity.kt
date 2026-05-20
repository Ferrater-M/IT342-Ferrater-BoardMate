package com.example.boardmatemobile.features.admin

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.example.boardmatemobile.R
import com.example.boardmatemobile.data.model.Application
import com.example.boardmatemobile.data.remote.RetrofitClient
import com.example.boardmatemobile.features.auth.LoginActivity
import kotlinx.coroutines.*

class AdminActivity : ComponentActivity() {

    private var activeTab = "pending"
    private val pendingApplications = mutableListOf<Application>()
    private val historyApplications = mutableListOf<Application>()
    private lateinit var adapter: ApplicationAdapter
    private lateinit var rvApplications: RecyclerView
    private lateinit var tvLoading: TextView
    private lateinit var tvEmpty: TextView
    private lateinit var tvTitle: TextView
    private lateinit var tabPending: TextView
    private lateinit var tabHistory: TextView

    private val mainScope = MainScope()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_admin)

        // ── SHARED PREFS ───────────────────────────────────────────────
        val prefs = getSharedPreferences("boardmate_prefs", Context.MODE_PRIVATE)
        val token = prefs.getString("token", "") ?: ""
        val role = prefs.getString("role", "")
        val name = prefs.getString("name", "Admin")
        val pic = prefs.getString("profilePicture", "")

        // Redirect if wrong role
        if (role != "ROLE_SUPERADMIN") {
            finish()
            return
        }

        // ── VIEWS ─────────────────────────────────────────────────────
        rvApplications = findViewById(R.id.rvApplications)
        tvLoading = findViewById(R.id.tvLoading)
        tvEmpty = findViewById(R.id.tvEmpty)
        tvTitle = findViewById(R.id.tvTitle)
        tabPending = findViewById(R.id.tabPending)
        tabHistory = findViewById(R.id.tabHistory)

        val tvUserName = findViewById<TextView>(R.id.tvUserName)
        val tvUserRole = findViewById<TextView>(R.id.tvUserRole)
        val tvLogout = findViewById<TextView>(R.id.tvLogout)
        val ivAvatar = findViewById<ImageView>(R.id.ivAvatar)

        tvUserName.text = name
        tvUserRole.text = "System Administrator"

        if (pic.isNullOrEmpty()) {
            ivAvatar.setImageResource(android.R.drawable.ic_menu_gallery)
        } else {
            Glide.with(this).load(pic).into(ivAvatar)
        }

        // Setup RecyclerView
        rvApplications.layoutManager = LinearLayoutManager(this)
        adapter = ApplicationAdapter(
            onViewClick = { app ->
                Toast.makeText(this, "View: ${app.fullName}", Toast.LENGTH_SHORT).show()
            },
            onApproveClick = { app ->
                approveApplication(token, app)
            },
            onRejectClick = { app ->
                rejectApplication(token, app)
            }
        )
        rvApplications.adapter = adapter

        // Tabs
        tabPending.setOnClickListener {
            activeTab = "pending"
            updateTabUI()
            showApplications()
        }
        tabHistory.setOnClickListener {
            activeTab = "history"
            updateTabUI()
            showApplications()
        }

        // Logout
        tvLogout.setOnClickListener {
            val edit = prefs.edit()
            edit.clear()
            edit.apply()
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
        }

        // Fetch data
        fetchAllData(token)
    }

    private fun updateTabUI() {
        if (activeTab == "pending") {
            tabPending.setBackgroundColor(0xFF1E3A8A.toInt())
            tabPending.setTextColor(0xFFFFFFFF.toInt())
            tabPending.setTypeface(null, android.graphics.Typeface.BOLD)
            tabHistory.setBackgroundColor(0xFFFFFFFF.toInt())
            tabHistory.setTextColor(0xFF6B7280.toInt())
            tabHistory.setTypeface(null, android.graphics.Typeface.NORMAL)
            tvTitle.text = "Pending Owner Applications"
        } else {
            tabHistory.setBackgroundColor(0xFF1E3A8A.toInt())
            tabHistory.setTextColor(0xFFFFFFFF.toInt())
            tabHistory.setTypeface(null, android.graphics.Typeface.BOLD)
            tabPending.setBackgroundColor(0xFFFFFFFF.toInt())
            tabPending.setTextColor(0xFF6B7280.toInt())
            tabPending.setTypeface(null, android.graphics.Typeface.NORMAL)
            tvTitle.text = "Application History"
        }
    }

    private fun showApplications() {
        val list = if (activeTab == "pending") pendingApplications else historyApplications
        adapter.submitList(list)

        if (list.isEmpty()) {
            tvEmpty.visibility = View.VISIBLE
            rvApplications.visibility = View.GONE
            if (activeTab == "pending") {
                tvEmpty.text = "No pending applications"
            } else {
                tvEmpty.text = "No application history"
            }
        } else {
            tvEmpty.visibility = View.GONE
            rvApplications.visibility = View.VISIBLE
        }
    }

    private fun fetchAllData(token: String) {
        mainScope.launch {
            try {
                val pendingRes = RetrofitClient.instance.getApplications("Bearer $token")
                if (pendingRes.isSuccessful) {
                    pendingApplications.clear()
                    pendingApplications.addAll(pendingRes.body() ?: emptyList())
                }

                val historyRes = RetrofitClient.instance.getApplicationsHistory("Bearer $token")
                if (historyRes.isSuccessful) {
                    historyApplications.clear()
                    historyApplications.addAll(historyRes.body() ?: emptyList())
                }

                showApplications()
                tvLoading.visibility = View.GONE
            } catch (e: Exception) {
                tvLoading.text = "Error: ${e.message}"
            }
        }
    }

    private fun approveApplication(token: String, app: Application) {
        mainScope.launch {
            try {
                val res = RetrofitClient.instance.approveApplication(
                    "Bearer $token",
                    mapOf("email" to (app.email ?: ""))
                )
                if (res.isSuccessful) {
                    Toast.makeText(this@AdminActivity, "Application Approved!", Toast.LENGTH_SHORT).show()
                    fetchAllData(token)
                }
            } catch (e: Exception) {
                Toast.makeText(this@AdminActivity, "Error: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun rejectApplication(token: String, app: Application) {
        mainScope.launch {
            try {
                val res = RetrofitClient.instance.rejectApplication(
                    "Bearer $token",
                    mapOf("email" to (app.email ?: ""))
                )
                if (res.isSuccessful) {
                    Toast.makeText(this@AdminActivity, "Application Rejected!", Toast.LENGTH_SHORT).show()
                    fetchAllData(token)
                }
            } catch (e: Exception) {
                Toast.makeText(this@AdminActivity, "Error: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        mainScope.cancel()
    }
}
