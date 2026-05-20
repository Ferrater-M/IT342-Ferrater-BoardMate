package com.example.boardmatemobile.features.owner

import com.example.boardmatemobile.utils.toIdString
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.activity.ComponentActivity
import com.example.boardmatemobile.R
import com.example.boardmatemobile.data.model.HouseResponse
import com.example.boardmatemobile.data.remote.RetrofitClient
import kotlinx.coroutines.*

class EditHouseActivity : ComponentActivity() {

    companion object {
        const val EXTRA_HOUSE = "house"
    }

    private val mainScope = MainScope()
    private lateinit var etHouseName: EditText
    private lateinit var etLocation: EditText
    private lateinit var etPrice: EditText
    private lateinit var etDescription: EditText
    private lateinit var etImageUrl: EditText
    private lateinit var btnSave: Button
    private lateinit var btnCancel: Button
    private lateinit var house: HouseResponse

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_edit_house)

        house = intent.getSerializableExtra(EXTRA_HOUSE) as HouseResponse

        etHouseName = findViewById(R.id.etHouseName)
        etLocation = findViewById(R.id.etLocation)
        etPrice = findViewById(R.id.etPrice)
        etDescription = findViewById(R.id.etDescription)
        etImageUrl = findViewById(R.id.etImageUrl)
        btnSave = findViewById(R.id.btnSaveHouse)
        btnCancel = findViewById(R.id.btnCancel)

        etHouseName.setText(house.name)
        etLocation.setText(house.location)
        etPrice.setText(house.price)
        etDescription.setText(house.description ?: "")
        etImageUrl.setText(house.imageUrl ?: "")

        btnCancel.setOnClickListener {
            finish()
        }

        btnSave.setOnClickListener {
            val prefs = getSharedPreferences("boardmate_prefs", Context.MODE_PRIVATE)
            val token = prefs.getString("token", "") ?: ""

            val updatedHouse = house.copy(
                name = etHouseName.text.toString(),
                location = etLocation.text.toString(),
                price = etPrice.text.toString(),
                description = etDescription.text.toString(),
                imageUrl = etImageUrl.text.toString()
            )

            mainScope.launch {
                try {
                    val res = RetrofitClient.instance.updateHouse(
                        house.id.toIdString(),
                        "Bearer $token",
                        updatedHouse
                    )
                    if (res.isSuccessful) {
                        Toast.makeText(this@EditHouseActivity, "House updated!", Toast.LENGTH_SHORT).show()
                        finish()
                    } else {
                        Toast.makeText(this@EditHouseActivity, "Failed to update house", Toast.LENGTH_SHORT).show()
                    }
                } catch (e: Exception) {
                    Toast.makeText(this@EditHouseActivity, "Error: ${e.message}", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        mainScope.cancel()
    }
}
