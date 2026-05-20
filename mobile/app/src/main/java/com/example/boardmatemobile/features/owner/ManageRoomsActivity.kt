package com.example.boardmatemobile.features.owner

import com.example.boardmatemobile.utils.toIdString
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.Button
import android.widget.EditText
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.Spinner
import android.widget.TextView
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.example.boardmatemobile.R
import com.example.boardmatemobile.data.model.RoomResponse
import com.example.boardmatemobile.data.remote.RetrofitClient
import com.example.boardmatemobile.features.auth.LoginActivity
import kotlinx.coroutines.*

class ManageRoomsActivity : ComponentActivity() {

    private val rooms = mutableListOf<RoomResponse>()
    private lateinit var rvRooms: RecyclerView
    private lateinit var llRoomsContainer: LinearLayout
    private lateinit var tvLoading: TextView
    private lateinit var tvEmpty: TextView
    private lateinit var houseId: String
    private lateinit var houseName: String
    private val mainScope = MainScope()
    private lateinit var adapter: RoomAdapter
    private lateinit var etAddRoomNumber: EditText
    private lateinit var spAddRoomType: Spinner
    private lateinit var etAddRoomPrice: EditText
    private lateinit var spAddRoomStatus: Spinner
    private lateinit var btnAddRoom: Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_manage_rooms)

        val prefs = getSharedPreferences("boardmate_prefs", Context.MODE_PRIVATE)
        val name = prefs.getString("name", "Owner")
        val token = prefs.getString("token", "") ?: ""
        houseId = intent.getStringExtra("house_id") ?: ""
        houseName = intent.getStringExtra("house_name") ?: "House"

        val tvTitle = findViewById<TextView>(R.id.tvTitle)
        val tvUserName = findViewById<TextView>(R.id.tvUserName)
        val tvUserRole = findViewById<TextView>(R.id.tvUserRole)
        val tvLogout = findViewById<TextView>(R.id.tvLogout)
        val ivAvatar = findViewById<ImageView>(R.id.ivAvatar)
        val btnBack = findViewById<Button>(R.id.btnBack)
        rvRooms = findViewById(R.id.rvRooms)
        llRoomsContainer = findViewById(R.id.llRoomsContainer)
        tvLoading = findViewById(R.id.tvLoading)
        tvEmpty = findViewById(R.id.tvEmpty)
        etAddRoomNumber = findViewById(R.id.etAddRoomNumber)
        spAddRoomType = findViewById(R.id.spAddRoomType)
        etAddRoomPrice = findViewById(R.id.etAddRoomPrice)
        spAddRoomStatus = findViewById(R.id.spAddRoomStatus)
        btnAddRoom = findViewById(R.id.btnAddRoom)

        tvTitle.text = "Manage Rooms for $houseName"
        tvUserName.text = name
        tvUserRole.text = "Property Owner"
        ivAvatar.setImageResource(android.R.drawable.ic_menu_gallery)

        rvRooms.layoutManager = LinearLayoutManager(this)

        // Set up spinners
        val roomTypes = arrayOf("Single", "Double", "Shared")
        val roomTypeAdapter = ArrayAdapter(this, android.R.layout.simple_spinner_item, roomTypes)
        roomTypeAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        spAddRoomType.adapter = roomTypeAdapter

        val statuses = arrayOf("Available", "Occupied")
        val statusAdapter = ArrayAdapter(this, android.R.layout.simple_spinner_item, statuses)
        statusAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        spAddRoomStatus.adapter = statusAdapter

        adapter = RoomAdapter(
            rooms = rooms,
            onGenerateReceiptClick = { room ->
                generateReceipt(token, room)
            },
            onViewReceiptsClick = { room ->
                val intent = Intent(this, ReceiptsActivity::class.java)
                intent.putExtra("roomId", room.id.toIdString())
                intent.putExtra("roomNumber", room.roomNumber)
                startActivity(intent)
            },
            onEditBillsClick = { room ->
                val intent = Intent(this, EditBillsActivity::class.java)
                intent.putExtra("room", room)
                startActivity(intent)
            },
            onDeleteClick = { room ->
                mainScope.launch {
                    try {
                        val res = RetrofitClient.instance.deleteRoom(room.id.toIdString(), "Bearer $token")
                        if (res.isSuccessful) {
                            Toast.makeText(this@ManageRoomsActivity, "Room deleted!", Toast.LENGTH_SHORT).show()
                            loadRooms(token)
                        } else {
                            Toast.makeText(this@ManageRoomsActivity, "Failed to delete room", Toast.LENGTH_SHORT).show()
                        }
                    } catch (e: Exception) {
                        Toast.makeText(this@ManageRoomsActivity, "Error: ${e.message}", Toast.LENGTH_SHORT).show()
                    }
                }
            }
        )
        rvRooms.adapter = adapter

        btnBack.setOnClickListener {
            startActivity(Intent(this, OwnerDashboardActivity::class.java))
            finish()
        }

        btnAddRoom.setOnClickListener {
            addNewRoom(token)
        }

        tvLogout.setOnClickListener {
            val edit = prefs.edit()
            edit.clear()
            edit.apply()
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
        }

        loadRooms(token)
    }

    private fun parseInclusions(inclusions: String?): List<Pair<String, String>> {
        if (inclusions.isNullOrEmpty()) {
            return emptyList()
        }
        return inclusions.split(",").map { part ->
            val split = part.split(":")
            if (split.size == 2) {
                split[0].trim() to split[1].trim()
            } else {
                split[0].trim() to "0"
            }
        }.filter { it.first.isNotEmpty() }
    }

    private fun calculateTotalAmount(price: String?, inclusions: String?): String {
        val priceNum = (price ?: "0").replace(Regex("[^0-9]"), "").toIntOrNull() ?: 0
        val inclusionTotal = parseInclusions(inclusions).sumOf {
            it.second.replace(Regex("[^0-9]"), "").toIntOrNull() ?: 0
        }
        val total = priceNum + inclusionTotal
        return "₱${total}"
    }

    private fun generateReceipt(token: String, room: RoomResponse) {
        mainScope.launch {
            try {
                val totalAmount = calculateTotalAmount(room.price, room.inclusions)

                val receiptRequest = com.example.boardmatemobile.data.model.ReceiptRequest(
                    roomNumber = room.roomNumber,
                    billingDate = room.billingMonth ?: "",
                    price = room.price ?: "",
                    inclusions = room.inclusions ?: "",
                    totalAmount = totalAmount,
                    paymentStatus = "Paid"
                )

                val res = RetrofitClient.instance.addReceipt(
                    room.id.toIdString(),
                    "Bearer $token",
                    receiptRequest
                )

                if (res.isSuccessful) {
                    Toast.makeText(
                        this@ManageRoomsActivity,
                        "Receipt successfully generated for ${room.billingMonth}!",
                        Toast.LENGTH_SHORT
                    ).show()
                } else {
                    val errorBody = res.errorBody()?.string()
                    android.util.Log.e("ManageRooms", "Failed to generate receipt: $errorBody")
                    Toast.makeText(
                        this@ManageRoomsActivity,
                        "Failed to generate receipt",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            } catch (e: Exception) {
                android.util.Log.e("ManageRooms", "Error generating receipt", e)
                Toast.makeText(
                    this@ManageRoomsActivity,
                    "Error: ${e.message}",
                    Toast.LENGTH_SHORT
                ).show()
            }
        }
    }

    private fun addNewRoom(token: String) {
        val roomNumber = etAddRoomNumber.text.toString().trim()
        val type = spAddRoomType.selectedItem.toString()
        val price = etAddRoomPrice.text.toString().trim()
        val status = spAddRoomStatus.selectedItem.toString()

        if (roomNumber.isEmpty() || price.isEmpty()) {
            Toast.makeText(this, "Please fill in Room # and Price", Toast.LENGTH_SHORT).show()
            return
        }

        mainScope.launch {
            try {
                val newRoom = RoomResponse(
                    id = "",
                    roomNumber = roomNumber,
                    type = type,
                    price = price,
                    status = status,
                    paymentStatus = "Not Paid"
                )

                val res = RetrofitClient.instance.addRoom(houseId, "Bearer $token", newRoom)
                if (res.isSuccessful) {
                    Toast.makeText(this@ManageRoomsActivity, "Room added!", Toast.LENGTH_SHORT).show()
                    etAddRoomNumber.text.clear()
                    etAddRoomPrice.text.clear()
                    loadRooms(token)
                } else {
                    Toast.makeText(this@ManageRoomsActivity, "Failed to add room", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@ManageRoomsActivity, "Error: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        mainScope.cancel()
    }

    override fun onResume() {
        super.onResume()
        val prefs = getSharedPreferences("boardmate_prefs", Context.MODE_PRIVATE)
        val token = prefs.getString("token", "") ?: ""
        loadRooms(token)
    }

    private fun loadRooms(token: String) {
        tvLoading.visibility = View.VISIBLE
        tvEmpty.visibility = View.GONE
        rvRooms.visibility = View.GONE

        mainScope.launch {
            try {
                android.util.Log.d("ManageRooms", "Calling getHouseById with houseId: $houseId")
                val res = RetrofitClient.instance.getHouseById(houseId.toIdString(), "Bearer $token")
                android.util.Log.d("ManageRooms", "Response code: ${res.code()}")
                android.util.Log.d("ManageRooms", "Response is successful: ${res.isSuccessful}")
                
                if (res.isSuccessful) {
                    rooms.clear()
                    val houseDetails = res.body()
                    android.util.Log.d("ManageRooms", "House details: $houseDetails")
                    val roomsList = houseDetails?.rooms
                    android.util.Log.d("ManageRooms", "Rooms list: $roomsList")
                    
                    Toast.makeText(
                        this@ManageRoomsActivity, 
                        "Received ${roomsList?.size ?: 0} rooms from backend", 
                        Toast.LENGTH_LONG
                    ).show()
                    
                    roomsList?.forEachIndexed { index, roomDetail ->
                        android.util.Log.d("ManageRooms", "Processing room $index: $roomDetail")
                        rooms.add(
                            RoomResponse(
                            id = roomDetail.id?.toIdString() ?: "",
                            roomNumber = roomDetail.roomNumber ?: "",
                            type = roomDetail.type ?: "",
                            price = roomDetail.price ?: "",
                            inclusions = roomDetail.inclusions,
                            status = roomDetail.status ?: "Available",
                            paymentStatus = roomDetail.paymentStatus ?: "Not Paid",
                            billingMonth = roomDetail.billingMonth,
                            occupantName = roomDetail.occupantName
                        )
                        )
                    }
                    android.util.Log.d("ManageRooms", "Total rooms after processing: ${rooms.size}")
                    android.util.Log.d("ManageRooms", "Calling adapter.updateRooms with ${rooms.size} rooms")
                    adapter.updateRooms(rooms.toList())
                    android.util.Log.d("ManageRooms", "adapter.updateRooms() completed, adapter.getItemCount(): ${adapter.itemCount}")

                    android.util.Log.d("ManageRooms", "Now manually adding ${rooms.size} rooms to llRoomsContainer")
                    llRoomsContainer.removeAllViews()
                    rooms.forEach { room ->
                        val itemView = LayoutInflater.from(this@ManageRoomsActivity).inflate(R.layout.item_room, llRoomsContainer, false)

                        val tvRoomNumber = itemView.findViewById<TextView>(R.id.tvRoomNumber)
                        val tvRoomType = itemView.findViewById<TextView>(R.id.tvRoomType)
                        val tvRoomPrice = itemView.findViewById<TextView>(R.id.tvRoomPrice)
                        val tvRoomOccupant = itemView.findViewById<TextView>(R.id.tvRoomOccupant)
                        val tvRoomStatus = itemView.findViewById<TextView>(R.id.tvRoomStatus)
                        val tvPaymentStatus = itemView.findViewById<TextView>(R.id.tvPaymentStatus)
                        val tvInclusions = itemView.findViewById<TextView>(R.id.tvInclusions)
                        val btnGenerateReceipt = itemView.findViewById<Button>(R.id.btnGenerateReceipt)
                        val btnViewReceipts = itemView.findViewById<Button>(R.id.btnViewReceipts)
                        val btnEditBills = itemView.findViewById<Button>(R.id.btnEditBills)
                        val btnDeleteRoom = itemView.findViewById<Button>(R.id.btnDeleteRoom)

                        tvRoomNumber.text = "Room ${room.roomNumber}"
                        tvRoomType.text = room.type
                        tvRoomPrice.text = "₱${room.price}"
                        tvRoomOccupant.text = if (room.occupantName.isNullOrEmpty()) "Occupant: —" else "Occupant: ${room.occupantName}"
                        tvInclusions.text = "Inclusions: ${room.inclusions ?: "—"}"

                        if (room.status == "Available") {
                            tvRoomStatus.text = "Available"
                            tvRoomStatus.setTextColor(0xFF059669.toInt())
                            tvRoomStatus.setBackgroundColor(0xFFECFDF5.toInt())
                        } else {
                            tvRoomStatus.text = "Occupied"
                            tvRoomStatus.setTextColor(0xFFDC2626.toInt())
                            tvRoomStatus.setBackgroundColor(0xFFFEF2F2.toInt())
                        }

                        if (room.paymentStatus == "Paid") {
                            tvPaymentStatus.text = "Paid"
                            tvPaymentStatus.setTextColor(0xFF059669.toInt())
                            tvPaymentStatus.setBackgroundColor(0xFFECFDF5.toInt())
                            btnGenerateReceipt.visibility = View.VISIBLE
                        } else {
                            tvPaymentStatus.text = "Not Paid"
                            tvPaymentStatus.setTextColor(0xFFDC2626.toInt())
                            tvPaymentStatus.setBackgroundColor(0xFFFEF2F2.toInt())
                            btnGenerateReceipt.visibility = View.GONE
                        }

                        btnViewReceipts.visibility = View.VISIBLE

                        btnGenerateReceipt.setOnClickListener {
                            generateReceipt(token, room)
                        }

                        btnViewReceipts.setOnClickListener {
                            val intent = Intent(this@ManageRoomsActivity, ReceiptsActivity::class.java)
                            intent.putExtra("roomId", room.id.toIdString())
                            intent.putExtra("roomNumber", room.roomNumber)
                            startActivity(intent)
                        }

                        btnEditBills.setOnClickListener {
                            val intent = Intent(this@ManageRoomsActivity, EditBillsActivity::class.java)
                            intent.putExtra("room", room)
                            startActivity(intent)
                        }
                        btnDeleteRoom.setOnClickListener {
                            mainScope.launch {
                                try {
                                    val res = RetrofitClient.instance.deleteRoom(room.id.toIdString(), "Bearer $token")
                                    if (res.isSuccessful) {
                                        Toast.makeText(this@ManageRoomsActivity, "Room deleted!", Toast.LENGTH_SHORT).show()
                                        loadRooms(token)
                                    } else {
                                        Toast.makeText(this@ManageRoomsActivity, "Failed to delete room", Toast.LENGTH_SHORT).show()
                                    }
                                } catch (e: Exception) {
                                    Toast.makeText(this@ManageRoomsActivity, "Error: ${e.message}", Toast.LENGTH_SHORT).show()
                                }
                            }
                        }

                        llRoomsContainer.addView(itemView)
                    }

                    if (rooms.isEmpty()) {
                        tvEmpty.visibility = View.VISIBLE
                        rvRooms.visibility = View.GONE
                        llRoomsContainer.visibility = View.GONE
                    } else {
                        tvEmpty.visibility = View.GONE
                        rvRooms.visibility = View.GONE
                        llRoomsContainer.visibility = View.VISIBLE
                    }
                } else {
                    val errorBody = res.errorBody()?.string()
                    android.util.Log.e("ManageRooms", "Failed to load rooms. Code: ${res.code()}, Error: $errorBody")
                    Toast.makeText(
                        this@ManageRoomsActivity, 
                        "Failed to load rooms (${res.code()})", 
                        Toast.LENGTH_SHORT
                    ).show()
                }
            } catch (e: Exception) {
                android.util.Log.e("ManageRooms", "Exception loading rooms", e)
                Toast.makeText(
                    this@ManageRoomsActivity, 
                    "Error: ${e.javaClass.simpleName} - ${e.message}", 
                    Toast.LENGTH_LONG
                ).show()
            } finally {
                tvLoading.visibility = View.GONE
            }
        }
    }
}

class RoomAdapter(
    private val rooms: MutableList<RoomResponse>,
    private val onGenerateReceiptClick: (RoomResponse) -> Unit,
    private val onViewReceiptsClick: (RoomResponse) -> Unit,
    private val onEditBillsClick: (RoomResponse) -> Unit,
    private val onDeleteClick: (RoomResponse) -> Unit
) : RecyclerView.Adapter<RoomAdapter.RoomViewHolder>() {

    inner class RoomViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val tvRoomNumber = itemView.findViewById<TextView>(R.id.tvRoomNumber)
        private val tvRoomType = itemView.findViewById<TextView>(R.id.tvRoomType)
        private val tvRoomPrice = itemView.findViewById<TextView>(R.id.tvRoomPrice)
        private val tvRoomOccupant = itemView.findViewById<TextView>(R.id.tvRoomOccupant)
        private val tvRoomStatus = itemView.findViewById<TextView>(R.id.tvRoomStatus)
        private val tvPaymentStatus = itemView.findViewById<TextView>(R.id.tvPaymentStatus)
        private val tvInclusions = itemView.findViewById<TextView>(R.id.tvInclusions)
        private val btnGenerateReceipt = itemView.findViewById<Button>(R.id.btnGenerateReceipt)
        private val btnViewReceipts = itemView.findViewById<Button>(R.id.btnViewReceipts)
        private val btnEditBills = itemView.findViewById<Button>(R.id.btnEditBills)
        private val btnDeleteRoom = itemView.findViewById<Button>(R.id.btnDeleteRoom)

        fun bind(room: RoomResponse) {
            tvRoomNumber.text = "Room ${room.roomNumber}"
            tvRoomType.text = room.type
            tvRoomPrice.text = "₱${room.price}"
            tvRoomOccupant.text = if (room.occupantName.isNullOrEmpty()) "Occupant: —" else "Occupant: ${room.occupantName}"
            tvInclusions.text = "Inclusions: ${room.inclusions ?: "—"}"

            if (room.status == "Available") {
                tvRoomStatus.text = "Available"
                tvRoomStatus.setTextColor(0xFF059669.toInt())
                tvRoomStatus.setBackgroundColor(0xFFECFDF5.toInt())
            } else {
                tvRoomStatus.text = "Occupied"
                tvRoomStatus.setTextColor(0xFFDC2626.toInt())
                tvRoomStatus.setBackgroundColor(0xFFFEF2F2.toInt())
            }

            if (room.paymentStatus == "Paid") {
                tvPaymentStatus.text = "Paid"
                tvPaymentStatus.setTextColor(0xFF059669.toInt())
                tvPaymentStatus.setBackgroundColor(0xFFECFDF5.toInt())
                btnGenerateReceipt.visibility = View.VISIBLE
            } else {
                tvPaymentStatus.text = "Not Paid"
                tvPaymentStatus.setTextColor(0xFFDC2626.toInt())
                tvPaymentStatus.setBackgroundColor(0xFFFEF2F2.toInt())
                btnGenerateReceipt.visibility = View.GONE
            }

            btnViewReceipts.visibility = View.VISIBLE
            btnGenerateReceipt.setOnClickListener { onGenerateReceiptClick(room) }
            btnViewReceipts.setOnClickListener { onViewReceiptsClick(room) }
            btnEditBills.setOnClickListener { onEditBillsClick(room) }
            btnDeleteRoom.setOnClickListener { onDeleteClick(room) }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RoomViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_room, parent, false)
        return RoomViewHolder(view)
    }

    override fun onBindViewHolder(holder: RoomViewHolder, position: Int) {
        holder.bind(rooms[position])
    }

    override fun getItemCount(): Int = rooms.size

    fun updateRooms(newRooms: List<RoomResponse>) {
        rooms.clear()
        rooms.addAll(newRooms)
        android.util.Log.d("RoomAdapter", "Updating adapter with ${newRooms.size} rooms, calling notifyDataSetChanged()")
        notifyDataSetChanged()
    }
}
