package com.example.boardmatemobile.features.auth

import android.content.Intent
import android.content.SharedPreferences
import android.graphics.Color
import android.os.Bundle
import android.text.Editable
import android.text.InputType
import android.text.TextWatcher
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.ImageButton
import android.widget.TextView
import androidx.activity.ComponentActivity
import androidx.lifecycle.lifecycleScope
import com.example.boardmatemobile.R
import com.example.boardmatemobile.data.repository.AuthRepository
import com.example.boardmatemobile.features.houses.DashboardActivity
import com.example.boardmatemobile.features.owner.OwnerDashboardActivity
import kotlinx.coroutines.launch

class LoginActivity : ComponentActivity() {

    private var showPassword = false
    private lateinit var sharedPrefs: SharedPreferences

    private val emailPattern = Regex("^[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}$")

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)

        sharedPrefs = getSharedPreferences("boardmate_prefs", MODE_PRIVATE)

        // Check if user is already logged in
        if (sharedPrefs.contains("token")) {
            val role = sharedPrefs.getString("role", "") ?: ""
            val intent = when (role) {
                "ROLE_ADMIN" -> Intent(this, OwnerDashboardActivity::class.java)
                else -> Intent(this, DashboardActivity::class.java)
            }
            startActivity(intent)
            finish()
            return
        }

        val etEmail = findViewById<EditText>(R.id.etEmail)
        val etPassword = findViewById<EditText>(R.id.etPassword)
        val btnSignIn = findViewById<Button>(R.id.btnSignIn)
        val btnTogglePassword = findViewById<ImageButton>(R.id.btnTogglePassword)
        val tvError = findViewById<TextView>(R.id.tvError)
        val tvCreateAccount = findViewById<TextView>(R.id.tvCreateAccount)
        val tvForgotPassword = findViewById<TextView>(R.id.tvForgotPassword)
        val tvBackendStatus = findViewById<TextView>(R.id.tvBackendStatus)
        val viewStatusDot = findViewById<View>(R.id.viewStatusDot)

        // Show/hide password toggle when typing
        etPassword.addTextChangedListener(object : TextWatcher {
            override fun afterTextChanged(s: Editable?) {
                btnTogglePassword.visibility =
                    if (s.isNullOrEmpty()) View.GONE else View.VISIBLE
            }
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
        })

        btnTogglePassword.setOnClickListener {
            showPassword = !showPassword
            etPassword.inputType = if (showPassword)
                InputType.TYPE_TEXT_VARIATION_VISIBLE_PASSWORD
            else
                InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_PASSWORD
            etPassword.setSelection(etPassword.text.length)
            btnTogglePassword.setImageResource(
                if (showPassword) R.drawable.ic_eye_off else R.drawable.ic_eye
            )
        }

        btnSignIn.setOnClickListener {
            val email = etEmail.text.toString().trim()
            val password = etPassword.text.toString()
            
            if (email.isEmpty() || password.isEmpty()) {
                showError(tvError, "Please fill in all fields.")
                return@setOnClickListener
            }
            
            if (!emailPattern.matches(email)) {
                showError(tvError, "Please enter a valid email address.")
                return@setOnClickListener
            }
            
            login(email, password, btnSignIn, tvError)
        }

        tvCreateAccount.setOnClickListener {
            startActivity(Intent(this, RegisterActivity::class.java))
        }

        tvForgotPassword.setOnClickListener {
            // TODO: navigate to forgot password screen
        }

        checkBackendHealth(tvBackendStatus, viewStatusDot)
    }

    private fun checkBackendHealth(tvStatus: TextView, dot: View) {
        lifecycleScope.launch {
            try {
                val isHealthy = AuthRepository.checkHealth()
                if (isHealthy) {
                    tvStatus.text = "Backend: Connected"
                    tvStatus.setTextColor(Color.parseColor("#059669"))
                    dot.setBackgroundColor(Color.parseColor("#10B981"))
                } else {
                    tvStatus.text = "Backend: Unavailable"
                    tvStatus.setTextColor(Color.parseColor("#DC2626"))
                    dot.setBackgroundColor(Color.parseColor("#EF4444"))
                }
            } catch (e: Exception) {
                tvStatus.text = "Backend: Error"
                tvStatus.setTextColor(Color.parseColor("#DC2626"))
                dot.setBackgroundColor(Color.parseColor("#EF4444"))
            }
        }
    }

    private fun login(
        email: String,
        password: String,
        btn: Button,
        tvError: TextView
    ) {
        btn.isEnabled = false
        btn.text = "Signing in..."
        tvError.visibility = View.GONE

        lifecycleScope.launch {
            try {
                val response = AuthRepository.login(email, password)
                // Save to SharedPreferences
                with(sharedPrefs.edit()) {
                    putString("token", response.token)
                    putString("role", response.role)
                    putString("name", response.name)
                    putLong("userId", response.userId)
                    putString("email", response.email)
                    response.profilePicture?.let {
                        putString("profilePicture", it)
                    }
                    apply()
                }

                // Navigate based on role
                val intent = when (response.role) {
                    "ROLE_ADMIN", "ROLE_OWNER" -> Intent(this@LoginActivity, OwnerDashboardActivity::class.java)
                    else -> Intent(this@LoginActivity, DashboardActivity::class.java)
                }
                startActivity(intent)
                finish()
            } catch (e: Exception) {
                btn.isEnabled = true
                btn.text = "Sign In"
                showError(tvError, e.message ?: "Login failed. Please check your credentials and try again.")
            }
        }
    }

    private fun showError(tvError: TextView, message: String) {
        tvError.text = message
        tvError.visibility = View.VISIBLE
    }
}