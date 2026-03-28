package com.example.boardmatemobile

import android.os.Bundle
import android.view.View
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

class RegisterActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register) // your XML file name

        val emailEditText = findViewById<EditText>(R.id.emailEditText)
        val passwordEditText = findViewById<EditText>(R.id.passwordEditText)
        val roleSpinner = findViewById<Spinner>(R.id.roleSpinner)
        val registerButton = findViewById<Button>(R.id.registerButton)
        val loginButton = findViewById<Button>(R.id.loginButton)

        // Role options
        val roles = listOf("Boarder (looking for a room)" to "ROLE_USER",
            "Owner (listing a property)" to "ROLE_ADMIN")
        val adapter = ArrayAdapter(this, android.R.layout.simple_spinner_item, roles.map { it.first })
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        roleSpinner.adapter = adapter

        registerButton.setOnClickListener {
            val email = emailEditText.text.toString().trim()
            val password = passwordEditText.text.toString().trim()
            val role = roles[roleSpinner.selectedItemPosition].second

            if (email.isEmpty() || password.isEmpty()) {
                Toast.makeText(this, "Please fill all fields", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            registerUser(email, password, role)
        }

        loginButton.setOnClickListener {
            // Navigate to LoginActivity (if you have one)
            Toast.makeText(this, "Go to Login screen", Toast.LENGTH_SHORT).show()
        }
    }

    private fun registerUser(email: String, password: String, role: String) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val url = URL("https://yourbackend.com/api/auth/register") // replace with your API
                val conn = url.openConnection() as HttpURLConnection
                conn.requestMethod = "POST"
                conn.setRequestProperty("Content-Type", "application/json")
                conn.doOutput = true

                val body = JSONObject()
                body.put("email", email)
                body.put("password", password)
                body.put("role", role)

                conn.outputStream.use { os ->
                    os.write(body.toString().toByteArray())
                }

                val responseCode = conn.responseCode

                runOnUiThread {
                    if (responseCode in 200..299) {
                        Toast.makeText(this@RegisterActivity, "Registration successful!", Toast.LENGTH_SHORT).show()
                    } else {
                        Toast.makeText(this@RegisterActivity, "Registration failed", Toast.LENGTH_SHORT).show()
                    }
                }
                conn.disconnect()

            } catch (e: Exception) {
                runOnUiThread {
                    Toast.makeText(this@RegisterActivity, e.message ?: "Error occurred", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }
}