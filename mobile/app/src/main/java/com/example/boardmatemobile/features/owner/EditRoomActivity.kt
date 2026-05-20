package com.example.boardmatemobile.features.owner

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.widget.ArrayAdapter
import android.widget.Button
import android.widget.EditText
import android.widget.Spinner
import android.widget.Toast
import androidx.activity.ComponentActivity
import com.example.boardmatemobile.R
import com.example.boardmatemobile.data.model.RoomResponse
import com.example.boardmatemobile.data.remote.RetrofitClient
import kotlinx.coroutines.*

class EditRoomActivity : ComponentActivity() {

    companion object {
        const val EXTRA_ROOM = "room"
    }

    private val mainScope = MainScope()
    private lateinit var etRoomNumber: EditText
    private lateinit var spRoomType: Spinner
    private lateinit var etRoomPrice: EditText
    private lateinit var etInclusions: EditText
    private lateinit var spStatus: Spinner
    private lateinit var spPaymentStatus: Spinner
    private lateinit var btnSave: Button
    private lateinit var btnCancel: Button
    private lateinit var room: RoomResponse

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_edit_room)

        room = intent.getSerializableExtra(EXTRA_ROOM) as RoomResponse

        etRoomNumber = findViewById(R.id.etRoomNumber)
        spRoomType = findViewById(R.id.spRoomType)
        etRoomPrice = findViewById(R.id.etRoomPrice)
        etInclusions = findViewById(R.id.etInclusions)
        spStatus = findViewById(R.id.spStatus)
        spPaymentStatus = findViewById(R.id.spPaymentStatus)
        btnSave = findViewById(R.id.btnSaveRoom)
        btnCancel = findViewById(R.id.btnCancelRoom)

        val roomTypes = arrayOf("Single", "Double", "Shared")
        val roomTypeAdapter = ArrayAdapter(this, android.R.layout.simple_spinner_item, roomTypes)
        roomTypeAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        spRoomType.adapter = roomTypeAdapter

        val statuses = arrayOf("Available", "Occupied")
        val statusAdapter = ArrayAdapter(this, android.R.layout.simple_spinner_item, statuses)
        statusAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        spStatus.adapter = statusAdapter

        val paymentStatuses = arrayOf("Not Paid", "Paid")
        val paymentStatusAdapter = ArrayAdapter(this, android.R.layout.simple_spinner_item, paymentStatuses)
        paymentStatusAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        spPaymentStatus.adapter = paymentStatusAdapter

        etRoomNumber.setText(room.roomNumber)
        etRoomPrice.setText(room.price)
        etInclusions.setText(room.inclusions)
        spRoomType.setSelection(roomTypes.indexOf(room.type))
        spStatus.setSelection(statuses.indexOf(room.status))
        spPaymentStatus.setSelection(paymentStatuses.indexOf(room.paymentStatus))

        btnCancel.setOnClickListener {
            finish()
        }

        btnSave.setOnClickListener {
            val prefs = getSharedPreferences("boardmate_prefs", Context.MODE_PRIVATE)
            val token = prefs.getString("token", "") ?: ""

            val updatedRoom = room.copy(
                roomNumber = etRoomNumber.text.toString(),
                type = spRoomType.selectedItem.toString(),
                price = etRoomPrice.text.toString(),
                inclusions = etInclusions.text.toString(),
                status = spStatus.selectedItem.toString(),
                paymentStatus = spPaymentStatus.selectedItem.toString()
            )

            mainScope.launch {
                try {
                    val res = RetrofitClient.instance.updateRoom(
                        room.id,
                        "Bearer $token",
                        updatedRoom
                    )
                    if (res.isSuccessful) {
                        Toast.makeText(this@EditRoomActivity, "Room updated!", Toast.LENGTH_SHORT).show()
                        finish()
                    } else {
                        Toast.makeText(this@EditRoomActivity, "Failed to update room", Toast.LENGTH_SHORT).show()
                    }
                } catch (e: Exception) {
                    Toast.makeText(this@EditRoomActivity, "Error: ${e.message}", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        mainScope.cancel()
    }
}
