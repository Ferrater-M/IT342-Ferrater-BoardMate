package com.example.boardmatemobile.features.owner

import android.app.DatePickerDialog
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.activity.ComponentActivity
import com.example.boardmatemobile.R
import com.example.boardmatemobile.data.model.RoomResponse
import com.example.boardmatemobile.data.remote.RetrofitClient
import com.example.boardmatemobile.utils.toIdString
import kotlinx.coroutines.*
import java.text.SimpleDateFormat
import java.util.*

class EditBillsActivity : ComponentActivity() {

    private lateinit var room: RoomResponse
    private val mainScope = MainScope()
    private val necessities = mutableListOf<Pair<String, String>>() // (name, price)

    private lateinit var tvRoomInfo: TextView
    private lateinit var etRentPrice: EditText
    private lateinit var etBillingDate: EditText
    private lateinit var llNecessitiesContainer: LinearLayout
    private lateinit var btnAddNecessity: Button
    private lateinit var btnCancel: Button
    private lateinit var btnSave: Button
    private lateinit var btnBack: Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_edit_bills)

        room = intent.getSerializableExtra("room") as RoomResponse

        tvRoomInfo = findViewById(R.id.tvRoomInfo)
        etRentPrice = findViewById(R.id.etRentPrice)
        etBillingDate = findViewById(R.id.etBillingDate)
        llNecessitiesContainer = findViewById(R.id.llNecessitiesContainer)
        btnAddNecessity = findViewById(R.id.btnAddNecessity)
        btnCancel = findViewById(R.id.btnCancel)
        btnSave = findViewById(R.id.btnSave)
        btnBack = findViewById(R.id.btnBack)

        tvRoomInfo.text = "Edit Bills for Room ${room.roomNumber}"
        etRentPrice.setText(room.price)
        etBillingDate.setText(room.billingMonth ?: getCurrentDate())

        parseNecessities(room.inclusions ?: "")

        btnBack.setOnClickListener { finish() }
        btnCancel.setOnClickListener { finish() }
        btnAddNecessity.setOnClickListener { addNecessityRow("", "") }
        etBillingDate.setOnClickListener { showDatePicker() }
        btnSave.setOnClickListener { saveChanges() }
    }

    private fun getCurrentDate(): String {
        val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
        return sdf.format(Date())
    }

    private fun showDatePicker() {
        val calendar = Calendar.getInstance()
        val year = calendar.get(Calendar.YEAR)
        val month = calendar.get(Calendar.MONTH)
        val day = calendar.get(Calendar.DAY_OF_MONTH)

        DatePickerDialog(this, { _, y, m, d ->
            val selectedDate = String.format(Locale.getDefault(), "%04d-%02d-%02d", y, m + 1, d)
            etBillingDate.setText(selectedDate)
        }, year, month, day).show()
    }

    private fun parseNecessities(inclusions: String) {
        necessities.clear()
        llNecessitiesContainer.removeAllViews()

        if (inclusions.isNotEmpty()) {
            inclusions.split(",").forEach { item ->
                val parts = item.split(":")
                val name = parts.getOrNull(0)?.trim() ?: ""
                val price = parts.getOrNull(1)?.trim() ?: "0"
                if (name.isNotEmpty()) {
                    addNecessityRow(name, price)
                }
            }
        }
    }

    private fun addNecessityRow(name: String, price: String) {
        val view = LayoutInflater.from(this).inflate(R.layout.item_necessity, llNecessitiesContainer, false)
        val etName = view.findViewById<EditText>(R.id.etNecessityName)
        val etPrice = view.findViewById<EditText>(R.id.etNecessityPrice)
        val btnRemove = view.findViewById<Button>(R.id.btnRemoveNecessity)

        etName.setText(name)
        etPrice.setText(price)

        btnRemove.setOnClickListener {
            llNecessitiesContainer.removeView(view)
            updateNecessitiesList()
        }

        etName.addTextChangedListener(object : android.text.TextWatcher {
            override fun afterTextChanged(s: android.text.Editable?) { updateNecessitiesList() }
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
        })
        etPrice.addTextChangedListener(object : android.text.TextWatcher {
            override fun afterTextChanged(s: android.text.Editable?) { updateNecessitiesList() }
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
        })

        llNecessitiesContainer.addView(view)
        updateNecessitiesList()
    }

    private fun updateNecessitiesList() {
        necessities.clear()
        for (i in 0 until llNecessitiesContainer.childCount) {
            val view = llNecessitiesContainer.getChildAt(i)
            val etName = view.findViewById<EditText>(R.id.etNecessityName)
            val etPrice = view.findViewById<EditText>(R.id.etNecessityPrice)
            val name = etName.text.toString().trim()
            val price = etPrice.text.toString().trim()
            if (name.isNotEmpty()) {
                necessities.add(Pair(name, price))
            }
        }
    }

    private fun serializeNecessities(): String {
        return necessities.joinToString(",") { "${it.first}:${it.second}" }
    }

    private fun saveChanges() {
        val prefs = getSharedPreferences("boardmate_prefs", Context.MODE_PRIVATE)
        val token = prefs.getString("token", "") ?: ""

        val newRentPrice = etRentPrice.text.toString().trim()
        val newBillingDate = etBillingDate.text.toString().trim()
        val newInclusions = serializeNecessities()

        android.util.Log.d("EditBills", "Saving changes - roomId: ${room.id.toIdString()}")
        android.util.Log.d("EditBills", "  newRentPrice: $newRentPrice")
        android.util.Log.d("EditBills", "  newBillingDate: $newBillingDate")
        android.util.Log.d("EditBills", "  newInclusions: $newInclusions")

        if (newRentPrice.isEmpty()) {
            Toast.makeText(this, "Please enter rent price", Toast.LENGTH_SHORT).show()
            return
        }

        mainScope.launch {
            try {
                val updatedRoom = room.copy(
                    price = newRentPrice,
                    billingMonth = newBillingDate,
                    inclusions = newInclusions
                )
                android.util.Log.d("EditBills", "Calling updateRoom API...")
                val res = RetrofitClient.instance.updateRoom(
                    room.id.toIdString(),
                    "Bearer $token",
                    updatedRoom
                )
                android.util.Log.d("EditBills", "Response code: ${res.code()}")
                android.util.Log.d("EditBills", "Response successful: ${res.isSuccessful}")

                if (res.isSuccessful) {
                    Toast.makeText(this@EditBillsActivity, "Billing updated for $newBillingDate!", Toast.LENGTH_SHORT).show()
                    finish()
                } else {
                    val errorBody = res.errorBody()?.string()
                    android.util.Log.e("EditBills", "Error body: $errorBody")
                    Toast.makeText(this@EditBillsActivity, "Failed to update bills (${res.code()})", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                android.util.Log.e("EditBills", "Exception updating bills", e)
                Toast.makeText(this@EditBillsActivity, "Error: ${e.javaClass.simpleName} - ${e.message}", Toast.LENGTH_LONG).show()
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        mainScope.cancel()
    }
}
