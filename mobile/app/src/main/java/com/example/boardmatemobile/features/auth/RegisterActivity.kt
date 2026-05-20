package com.example.boardmatemobile.features.auth

import android.content.Intent
import android.os.Bundle
import android.text.Editable
import android.text.InputType
import android.text.TextWatcher
import android.view.View
import android.widget.*
import androidx.activity.ComponentActivity
import androidx.lifecycle.lifecycleScope
import com.example.boardmatemobile.R
import com.example.boardmatemobile.data.repository.AuthRepository
import kotlinx.coroutines.launch

class RegisterActivity : ComponentActivity() {

    private var showPassword = false

    private val emailPattern = Regex("^[a-zA-Z0-9._%+\\-]+@gmail\\.com$")
    private val passwordPattern = Regex("^(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{6,}$")

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register)

        val etFirstName      = findViewById<EditText>(R.id.etFirstName)
        val etLastName       = findViewById<EditText>(R.id.etLastName)
        val etEmail          = findViewById<EditText>(R.id.etEmail)
        val etPassword       = findViewById<EditText>(R.id.etPassword)
        val spinnerRole      = findViewById<Spinner>(R.id.spinnerRole)
        val btnRegister      = findViewById<Button>(R.id.btnRegister)
        val btnToggle        = findViewById<ImageButton>(R.id.btnTogglePassword)
        val tvError          = findViewById<TextView>(R.id.tvError)
        val tvEmailError     = findViewById<TextView>(R.id.tvEmailError)
        val tvPasswordError  = findViewById<TextView>(R.id.tvPasswordError)
        val tvLogin          = findViewById<TextView>(R.id.tvLogin)

        // Role spinner
        val roles = listOf("Student / Boarder", "Boarding House Owner")
        val roleValues = listOf("ROLE_USER", "ROLE_ADMIN")
        spinnerRole.adapter = ArrayAdapter(this, android.R.layout.simple_spinner_dropdown_item, roles)

        // Show/hide password toggle
        etPassword.addTextChangedListener(object : TextWatcher {
            override fun afterTextChanged(s: Editable?) {
                btnToggle.visibility = if (s.isNullOrEmpty()) View.GONE else View.VISIBLE
            }
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
        })

        btnToggle.setOnClickListener {
            showPassword = !showPassword
            etPassword.inputType = if (showPassword)
                InputType.TYPE_TEXT_VARIATION_VISIBLE_PASSWORD
            else
                InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_PASSWORD
            etPassword.setSelection(etPassword.text.length)
            btnToggle.setImageResource(
                if (showPassword) R.drawable.ic_eye_off else R.drawable.ic_eye
            )
        }

        // Clear errors on type
        etEmail.addTextChangedListener(object : TextWatcher {
            override fun afterTextChanged(s: Editable?) { tvEmailError.visibility = View.GONE; tvError.visibility = View.GONE }
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
        })
        etPassword.addTextChangedListener(object : TextWatcher {
            override fun afterTextChanged(s: Editable?) { tvPasswordError.visibility = View.GONE; tvError.visibility = View.GONE }
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
        })

        btnRegister.setOnClickListener {
            val firstName = etFirstName.text.toString().trim()
            val lastName  = etLastName.text.toString().trim()
            val email     = etEmail.text.toString().trim()
            val password  = etPassword.text.toString()
            val role      = roleValues[spinnerRole.selectedItemPosition]

            // Validation
            if (firstName.isEmpty() || lastName.isEmpty()) {
                showError(tvError, "Please enter your first and last name.")
                return@setOnClickListener
            }
            if (!emailPattern.matches(email)) {
                tvEmailError.text = "Email must end with @gmail.com"
                tvEmailError.visibility = View.VISIBLE
                return@setOnClickListener
            }
            if (!passwordPattern.matches(password)) {
                tvPasswordError.text = "Password must have 1 uppercase, 1 number, 1 special character, min 6 characters"
                tvPasswordError.visibility = View.VISIBLE
                return@setOnClickListener
            }

            register(firstName, lastName, email, password, role, btnRegister, tvError)
        }

        tvLogin.setOnClickListener {
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
        }
    }

    private fun register(
        firstName: String,
        lastName: String,
        email: String,
        password: String,
        role: String,
        btn: Button,
        tvError: TextView
    ) {
        btn.isEnabled = false
        btn.text = "Creating account..."
        tvError.visibility = View.GONE

        lifecycleScope.launch {
            try {
                AuthRepository.register(firstName, lastName, email, password, role)
                Toast.makeText(
                    this@RegisterActivity,
                    "Account created successfully! Please login.",
                    Toast.LENGTH_LONG
                ).show()
                startActivity(Intent(this@RegisterActivity, LoginActivity::class.java))
                finish()
            } catch (e: Exception) {
                btn.isEnabled = true
                btn.text = "Create Account"
                showError(tvError, e.message ?: "Registration failed. Please try again.")
            }
        }
    }

    private fun showError(tvError: TextView, message: String) {
        tvError.text = message
        tvError.visibility = View.VISIBLE
    }
}