package com.example.boardmatemobile.features.owner

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.ArrayAdapter
import android.widget.Button
import android.widget.EditText
import android.widget.Spinner
import android.widget.Toast
import androidx.activity.ComponentActivity
import com.example.boardmatemobile.R
import com.example.boardmatemobile.data.remote.RetrofitClient
import com.example.boardmatemobile.features.houses.DashboardActivity
import kotlinx.coroutines.*

class ApplyOwnerActivity : ComponentActivity() {

    private lateinit var etFullName: EditText
    private lateinit var etEmail: EditText
    private lateinit var etPhoneNumber: EditText
    private lateinit var etHouseName: EditText
    private lateinit var etHouseAddress: EditText
    private lateinit var etTotalRooms: EditText
    private lateinit var spinnerBusinessPermit: Spinner
    private lateinit var etExperience: EditText
    private lateinit var etReason: EditText
    private lateinit var btnCancel: Button
    private lateinit var btnSubmit: Button
    private val mainScope = MainScope()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_apply_owner)

        etFullName = findViewById(R.id.etFullName)
        etEmail = findViewById(R.id.etEmail)
        etPhoneNumber = findViewById(R.id.etPhoneNumber)
        etHouseName = findViewById(R.id.etHouseName)
        etHouseAddress = findViewById(R.id.etHouseAddress)
        etTotalRooms = findViewById(R.id.etTotalRooms)
        spinnerBusinessPermit = findViewById(R.id.spinnerBusinessPermit)
        etExperience = findViewById(R.id.etExperience)
        etReason = findViewById(R.id.etReason)
        btnCancel = findViewById(R.id.btnCancel)
        btnSubmit = findViewById(R.id.btnSubmit)

        val prefs = getSharedPreferences("boardmate_prefs", Context.MODE_PRIVATE)
        val name = prefs.getString("name", "")
        val email = prefs.getString("email", "")
        etFullName.setText(name)
        etEmail.setText(email)

        val permitOptions = arrayOf("Yes, I have it", "No, currently processing", "I am a private homeowner")
        val adapter = ArrayAdapter(this, android.R.layout.simple_spinner_item, permitOptions)
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        spinnerBusinessPermit.adapter = adapter

        btnCancel.setOnClickListener {
            startActivity(Intent(this, DashboardActivity::class.java))
            finish()
        }

        btnSubmit.setOnClickListener { submitApplication(prefs) }
    }

    private fun submitApplication(prefs: android.content.SharedPreferences) {
        val fullName = etFullName.text.toString().trim()
        val email = etEmail.text.toString().trim()
        val phoneNumber = etPhoneNumber.text.toString().trim()
        val houseName = etHouseName.text.toString().trim()
        val houseAddress = etHouseAddress.text.toString().trim()
        val totalRooms = etTotalRooms.text.toString().trim()
        val hasBusinessPermit = when (spinnerBusinessPermit.selectedItemPosition) {
            0 -> "yes"
            1 -> "no"
            else -> "none"
        }
        val experience = etExperience.text.toString().trim()
        val reason = etReason.text.toString().trim()

        if (fullName.isEmpty() || email.isEmpty() || phoneNumber.isEmpty() ||
            houseName.isEmpty() || houseAddress.isEmpty() || totalRooms.isEmpty() ||
            experience.isEmpty() || reason.isEmpty()) {
            Toast.makeText(this, "Please fill in all fields!", Toast.LENGTH_SHORT).show()
            return
        }

        btnSubmit.isEnabled = false
        btnSubmit.text = "Submitting..."

        val token = prefs.getString("token", "") ?: ""
        mainScope.launch {
            try {
                val request = mapOf(
                    "fullName" to fullName,
                    "email" to email,
                    "phoneNumber" to phoneNumber,
                    "houseName" to houseName,
                    "houseAddress" to houseAddress,
                    "totalRooms" to totalRooms,
                    "hasBusinessPermit" to hasBusinessPermit,
                    "experience" to experience,
                    "reason" to reason
                )
                val res = RetrofitClient.instance.applyOwner("Bearer $token", request)
                if (res.isSuccessful) {
                    Toast.makeText(
                        this@ApplyOwnerActivity,
                        "Application Submitted Successfully! Please wait for system administrator approval.",
                        Toast.LENGTH_LONG
                    ).show()
                    startActivity(Intent(this@ApplyOwnerActivity, DashboardActivity::class.java))
                    finish()
                } else {
                    Toast.makeText(this@ApplyOwnerActivity, "Application failed!", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@ApplyOwnerActivity, "Error: ${e.message}", Toast.LENGTH_SHORT).show()
            } finally {
                btnSubmit.isEnabled = true
                btnSubmit.text = "Submit Application"
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        mainScope.cancel()
    }
}
