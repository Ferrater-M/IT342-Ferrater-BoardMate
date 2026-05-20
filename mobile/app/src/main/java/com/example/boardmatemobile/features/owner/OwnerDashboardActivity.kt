package com.example.boardmatemobile.features.owner

import com.example.boardmatemobile.utils.toIdString
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.example.boardmatemobile.R
import com.example.boardmatemobile.data.model.HouseResponse
import com.example.boardmatemobile.data.remote.RetrofitClient
import com.example.boardmatemobile.features.auth.LoginActivity
import kotlinx.coroutines.*

class OwnerDashboardActivity : ComponentActivity() {

    private var activeTab = "houses"
    private val houses = mutableListOf<HouseResponse>()
    private val visitRequests = mutableListOf<Any>()
    private lateinit var rvItems: RecyclerView
    private lateinit var tvLoading: TextView
    private lateinit var tvEmpty: TextView
    private lateinit var tvTitle: TextView
    private lateinit var tabHouses: TextView
    private lateinit var tabVisits: TextView
    private lateinit var btnAddHouse: Button
    private val mainScope = MainScope()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_owner_dashboard)

        val prefs = getSharedPreferences("boardmate_prefs", Context.MODE_PRIVATE)
        val token = prefs.getString("token", "") ?: ""
        val role = prefs.getString("role", "")
        val name = prefs.getString("name", "Owner")
        val pic = prefs.getString("profilePicture", "")

        if (role != "ROLE_OWNER" && role != "ROLE_ADMIN") {
            finish()
            return
        }

        rvItems = findViewById(R.id.rvItems)
        tvLoading = findViewById(R.id.tvLoading)
        tvEmpty = findViewById(R.id.tvEmpty)
        tvTitle = findViewById(R.id.tvTitle)
        tabHouses = findViewById(R.id.tabHouses)
        tabVisits = findViewById(R.id.tabVisits)
        btnAddHouse = findViewById(R.id.btnAddHouse)
        val tvUserName = findViewById<TextView>(R.id.tvUserName)
        val tvUserRole = findViewById<TextView>(R.id.tvUserRole)
        val tvWelcome = findViewById<TextView>(R.id.tvWelcome)
        val tvLogout = findViewById<TextView>(R.id.tvLogout)
        val ivAvatar = findViewById<ImageView>(R.id.ivAvatar)

        tvUserName.text = name
        tvWelcome.text = "Welcome, $name (Owner)"
        tvUserRole.text = "Property Owner"

        if (pic.isNullOrEmpty()) {
            ivAvatar.setImageResource(android.R.drawable.ic_menu_gallery)
        } else {
            Glide.with(this).load(pic).into(ivAvatar)
        }

        rvItems.layoutManager = LinearLayoutManager(this)

        tabHouses.setOnClickListener {
            activeTab = "houses"
            updateTabUI()
            showItems()
        }
        tabVisits.setOnClickListener {
            activeTab = "visits"
            updateTabUI()
            showItems()
        }

        tvLogout.setOnClickListener {
            val edit = prefs.edit()
            edit.clear()
            edit.apply()
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
        }

        fetchData(token)
    }

    private fun updateTabUI() {
        if (activeTab == "houses") {
            tabHouses.setBackgroundColor(0xFF1E3A8A.toInt())
            tabHouses.setTextColor(0xFFFFFFFF.toInt())
            tabHouses.setTypeface(null, android.graphics.Typeface.BOLD)
            tabVisits.setBackgroundColor(0xFFFFFFFF.toInt())
            tabVisits.setTextColor(0xFF6B7280.toInt())
            tabVisits.setTypeface(null, android.graphics.Typeface.NORMAL)
            tvTitle.text = "My Boarding Houses"
            btnAddHouse.visibility = View.VISIBLE
        } else {
            tabVisits.setBackgroundColor(0xFF1E3A8A.toInt())
            tabVisits.setTextColor(0xFFFFFFFF.toInt())
            tabVisits.setTypeface(null, android.graphics.Typeface.BOLD)
            tabHouses.setBackgroundColor(0xFFFFFFFF.toInt())
            tabHouses.setTextColor(0xFF6B7280.toInt())
            tabHouses.setTypeface(null, android.graphics.Typeface.NORMAL)
            tvTitle.text = "Visit Requests"
            btnAddHouse.visibility = View.GONE
        }
    }

    private fun showItems() {
        if (activeTab == "houses") {
            val adapter = HouseOwnerAdapter(
                onEditClick = { house ->
                    val intent = Intent(this, EditHouseActivity::class.java)
                    intent.putExtra(EditHouseActivity.EXTRA_HOUSE, house)
                    startActivity(intent)
                },
                onDeleteClick = { house ->
                    val prefs = getSharedPreferences("boardmate_prefs", Context.MODE_PRIVATE)
                    val token = prefs.getString("token", "") ?: ""
                    mainScope.launch {
                        try {
                            val res = RetrofitClient.instance.deleteHouse(house.id.toString(), "Bearer $token")
                            if (res.isSuccessful) {
                                Toast.makeText(this@OwnerDashboardActivity, "House deleted!", Toast.LENGTH_SHORT).show()
                                fetchData(token)
                            } else {
                                Toast.makeText(this@OwnerDashboardActivity, "Failed to delete house", Toast.LENGTH_SHORT).show()
                            }
                        } catch (e: Exception) {
                            Toast.makeText(this@OwnerDashboardActivity, "Error: ${e.message}", Toast.LENGTH_SHORT).show()
                        }
                    }
                },
                onManageRoomsClick = { house ->
                    val intent = Intent(this, ManageRoomsActivity::class.java)
                    intent.putExtra("house_id", house.id.toIdString())
                    intent.putExtra("house_name", house.name)
                    startActivity(intent)
                }
            )
            rvItems.adapter = adapter
            adapter.submitList(houses)

            if (houses.isEmpty()) {
                tvEmpty.visibility = View.VISIBLE
                rvItems.visibility = View.GONE
            } else {
                tvEmpty.visibility = View.GONE
                rvItems.visibility = View.VISIBLE
            }
        } else {
            if (visitRequests.isEmpty()) {
                tvEmpty.visibility = View.VISIBLE
                rvItems.visibility = View.GONE
            } else {
                tvEmpty.visibility = View.GONE
                rvItems.visibility = View.VISIBLE
            }
        }
    }

    private fun fetchData(token: String) {
        mainScope.launch {
            try {
                val res = RetrofitClient.instance.getMyHouses("Bearer $token")
                if (res.isSuccessful) {
                    houses.clear()
                    houses.addAll(res.body() ?: emptyList())
                }
                showItems()
                tvLoading.visibility = View.GONE
            } catch (e: Exception) {
                tvLoading.text = "Error: ${e.message}"
            }
        }
    }

    private fun convertIdToString(id: Any): String {
        return when (id) {
            is Number -> id.toLong().toString()
            else -> id.toString()
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        mainScope.cancel()
    }
}

class HouseOwnerAdapter(
    private val onEditClick: (HouseResponse) -> Unit,
    private val onDeleteClick: (HouseResponse) -> Unit,
    private val onManageRoomsClick: (HouseResponse) -> Unit
) : ListAdapter<HouseResponse, HouseOwnerAdapter.HouseOwnerViewHolder>(HouseOwnerDiffCallback()) {

    inner class HouseOwnerViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val tvHouseName = itemView.findViewById<TextView>(R.id.tvHouseName)
        private val tvLocation = itemView.findViewById<TextView>(R.id.tvLocation)
        private val tvPrice = itemView.findViewById<TextView>(R.id.tvPrice)
        private val tvRoomsLeft = itemView.findViewById<TextView>(R.id.tvRoomsLeft)
        private val tvRating = itemView.findViewById<TextView>(R.id.tvRating)
        private val btnEdit = itemView.findViewById<Button>(R.id.btnEdit)
        private val btnDelete = itemView.findViewById<Button>(R.id.btnDelete)
        private val btnManageRooms = itemView.findViewById<Button>(R.id.btnManageRooms)

        fun bind(house: HouseResponse) {
            tvHouseName.text = house.name ?: "N/A"
            tvLocation.text = house.location ?: "N/A"
            tvPrice.text = "Price: ${house.price ?: "N/A"}"
            val roomsLeftVal = house.calculatedRoomsLeft ?: house.roomsLeft ?: 0
            tvRoomsLeft.text = "Rooms Left: $roomsLeftVal"
            tvRating.text = "Rating: ${house.rating ?: 0}"

            btnEdit.setOnClickListener { onEditClick(house) }
            btnDelete.setOnClickListener { onDeleteClick(house) }
            btnManageRooms.setOnClickListener { onManageRoomsClick(house) }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): HouseOwnerViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_house_owner, parent, false)
        return HouseOwnerViewHolder(view)
    }

    override fun onBindViewHolder(holder: HouseOwnerViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    class HouseOwnerDiffCallback : androidx.recyclerview.widget.DiffUtil.ItemCallback<HouseResponse>() {
        override fun areItemsTheSame(oldItem: HouseResponse, newItem: HouseResponse): Boolean {
            return oldItem.id == newItem.id
        }

        override fun areContentsTheSame(oldItem: HouseResponse, newItem: HouseResponse): Boolean {
            return oldItem == newItem
        }
    }
}
