package com.example.boardmatemobile.features.houses

import com.example.boardmatemobile.utils.toIdString

import android.app.Activity
import android.app.AlertDialog
import android.content.Intent
import android.graphics.Color
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.widget.*
import com.bumptech.glide.Glide
import com.example.boardmatemobile.R
import com.example.boardmatemobile.data.model.HouseDetailResponse
import com.example.boardmatemobile.data.model.RoomDetail
import com.example.boardmatemobile.data.remote.RetrofitClient
import com.example.boardmatemobile.features.auth.LoginActivity
import com.example.boardmatemobile.features.owner.OwnerDashboardActivity
import com.example.boardmatemobile.features.admin.AdminActivity
import com.example.boardmatemobile.features.contact.ContactActivity
import kotlinx.coroutines.MainScope
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch

class RoomDetailsActivity : Activity() {

    private val activityScope = MainScope()
    private var house: HouseDetailResponse? = null
    private var currentImageIndex = 0
    private var userRating = 0
    private val stars = mutableListOf<TextView>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_room_details)

        val prefs       = getSharedPreferences("boardmate_prefs", MODE_PRIVATE)
        val token       = prefs.getString("token", "") ?: ""
        val role        = prefs.getString("role", "") ?: ""
        val name        = prefs.getString("name", "User") ?: "User"
        val userId      = prefs.getString("userId", "") ?: ""
        val houseId     = intent.getStringExtra("houseId") ?: intent.getStringExtra("house_id") ?: ""

        // Redirect if wrong role
        when (role) {
            "ROLE_ADMIN" -> {
                startActivity(Intent(this, OwnerDashboardActivity::class.java))
                finish(); return
            }
            "ROLE_SUPERADMIN" -> {
                startActivity(Intent(this, AdminActivity::class.java))
                finish(); return
            }
        }

        // ── VIEWS ─────────────────────────────────────────────────────
        val tvLoading        = findViewById<TextView>(R.id.tvLoading)
        val layoutHeader     = findViewById<LinearLayout>(R.id.layoutHeader)
        val layoutRoomsHeader= findViewById<LinearLayout>(R.id.layoutRoomsHeader)
        val layoutRoomsTable = findViewById<LinearLayout>(R.id.layoutRoomsTable)
        val layoutRoomRows   = findViewById<LinearLayout>(R.id.layoutRoomRows)
        val ivHouseImage     = findViewById<ImageView>(R.id.ivHouseImage)
        val btnPrev          = findViewById<Button>(R.id.btnPrevImage)
        val btnNext          = findViewById<Button>(R.id.btnNextImage)
        val tvHouseName      = findViewById<TextView>(R.id.tvHouseName)
        val tvMeta           = findViewById<TextView>(R.id.tvMeta)
        val tvPriceRooms     = findViewById<TextView>(R.id.tvPriceRooms)
        val tvDescription    = findViewById<TextView>(R.id.tvDescription)
        val tvRoomsCount     = findViewById<TextView>(R.id.tvRoomsCount)
        val tvBreadcrumb     = findViewById<TextView>(R.id.tvBreadcrumb)
        val btnBack          = findViewById<Button>(R.id.btnBack)
        val btnRequestVisit  = findViewById<Button>(R.id.btnRequestVisit)
        val tvUserName       = findViewById<TextView>(R.id.tvUserName)
        val tvUserRole       = findViewById<TextView>(R.id.tvUserRole)
        val tvLogout         = findViewById<TextView>(R.id.tvLogout)
        val flexAmenities    = findViewById<com.google.android.flexbox.FlexboxLayout>(R.id.flexAmenities)

        // Star views
        stars.addAll(listOf(
            findViewById(R.id.star1),
            findViewById(R.id.star2),
            findViewById(R.id.star3),
            findViewById(R.id.star4),
            findViewById(R.id.star5)
        ))

        // ── USER INFO ─────────────────────────────────────────────────
        tvUserName.text = name
        tvUserRole.text = when (role) {
            "ROLE_ADMIN"      -> "Owner"
            "ROLE_SUPERADMIN" -> "Admin"
            else              -> "Boarder"
        }

        // ── NAV CLICKS ────────────────────────────────────────────────
        findViewById<TextView>(R.id.navHome).setOnClickListener {
            startActivity(Intent(this, DashboardActivity::class.java)); finish()
        }
        findViewById<TextView>(R.id.navRooms).setOnClickListener {
            startActivity(Intent(this, RoomsActivity::class.java)); finish()
        }
        findViewById<TextView>(R.id.navVisits).setOnClickListener {
            startActivity(Intent(this, MyVisitsActivity::class.java))
        }
        findViewById<TextView>(R.id.navContact).setOnClickListener {
            startActivity(Intent(this, ContactActivity::class.java))
        }
        btnBack.setOnClickListener { finish() }

        // ── LOGOUT ────────────────────────────────────────────────────
        tvLogout.setOnClickListener {
            prefs.edit().clear().apply()
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
        }

        // ── STARS ─────────────────────────────────────────────────────
        stars.forEachIndexed { index, star ->
            star.setOnClickListener {
                if (userRating != index + 1) submitRating(index + 1, token, houseId)
            }
        }

        // ── REQUEST VISIT ─────────────────────────────────────────────
        btnRequestVisit.setOnClickListener {
            showVisitModal(houseId, token)
        }

        // ── FETCH HOUSE ───────────────────────────────────────────────
        activityScope.launch {
            try {
                val res = RetrofitClient.instance.getHouseById(houseId, "Bearer $token")
                if (res.isSuccessful) {
                    house = res.body()
                    house?.let { h ->
                        tvLoading.visibility = View.GONE
                        layoutHeader.visibility      = View.VISIBLE
                        layoutRoomsHeader.visibility = View.VISIBLE
                        layoutRoomsTable.visibility  = View.VISIBLE

                        // Breadcrumb
                        tvBreadcrumb.text = "Boarding Houses > ${h.name}"

                        // Images
                        val images = h.imageUrls?.takeIf { it.isNotEmpty() }
                            ?: listOfNotNull(h.imageUrl)
                        loadImage(ivHouseImage, images, currentImageIndex)

                        if (images.size > 1) {
                            btnPrev.visibility = View.VISIBLE
                            btnNext.visibility = View.VISIBLE
                            btnPrev.setOnClickListener {
                                currentImageIndex = (currentImageIndex - 1 + images.size) % images.size
                                loadImage(ivHouseImage, images, currentImageIndex)
                            }
                            btnNext.setOnClickListener {
                                currentImageIndex = (currentImageIndex + 1) % images.size
                                loadImage(ivHouseImage, images, currentImageIndex)
                            }
                        }

                        // Info
                        tvHouseName.text   = h.name
                        tvMeta.text        = "📍 ${h.location}  •  ⭐ ${h.rating} Rating"
                        tvPriceRooms.text  = "💰 ${h.price}  •  🏠 ${h.roomsLeft} rooms available"
                        tvDescription.text = h.description
                        tvRoomsCount.text  = "${h.rooms?.size ?: 0} rooms • ${h.roomsLeft} available"

                        // Amenities
                        val amenities = h.rooms
                            ?.flatMap { parseInclusions(it.inclusions).map { i -> i.first } }
                            ?.distinct()
                            ?.takeIf { it.isNotEmpty() }
                            ?: listOf("Wi-Fi", "Water Included", "24/7 Security")

                        flexAmenities.removeAllViews()
                        amenities.forEach { amenity ->
                            val pill = TextView(this@RoomDetailsActivity).apply {
                                text = "• $amenity"
                                setTextColor(Color.parseColor("#444444"))
                                textSize = 12f
                                setPadding(20, 10, 20, 10)
                                setBackgroundResource(R.drawable.input_field_bg)
                                val params = com.google.android.flexbox.FlexboxLayout.LayoutParams(
                                    com.google.android.flexbox.FlexboxLayout.LayoutParams.WRAP_CONTENT,
                                    com.google.android.flexbox.FlexboxLayout.LayoutParams.WRAP_CONTENT
                                )
                                params.setMargins(0, 0, 12, 8)
                                layoutParams = params
                            }
                            flexAmenities.addView(pill)
                        }

                        // Rooms table rows
                        layoutRoomRows.removeAllViews()
                        h.rooms?.forEach { room ->
                            addRoomRow(layoutRoomRows, room, userId, name, token)
                        }
                    }
                } else {
                    tvLoading.text = "House not found."
                }
            } catch (e: Exception) {
                tvLoading.text = "Error loading house: ${e.message}"
            }
        }

        // Fetch user's existing rating
        activityScope.launch {
            try {
                val res = RetrofitClient.instance.getMyRating(houseId, "Bearer $token")
                if (res.isSuccessful) {
                    val rating = res.body()
                    if (rating != null && rating > 0) {
                        userRating = rating
                        updateStars(userRating)
                    }
                }
            } catch (e: Exception) { /* ignore */ }
        }
    }

    // ── ROOM ROW ──────────────────────────────────────────────────────
    private fun addRoomRow(
        container: LinearLayout,
        room: RoomDetail,
        userId: String,
        userName: String,
        token: String
    ) {
        val row = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            setPadding(32, 28, 32, 28)
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
        }

        val isOccupant = (room.occupantId?.toString() == userId) ||
                (room.occupantName == userName && userName.isNotEmpty())

        val displayStatus = if (room.status == "Occupied" || room.status == "Your Room")
            "Occupied" else room.status ?: "Available"

        fun cell(text: String, weight: Float, color: Int? = null, bold: Boolean = false): TextView {
            return TextView(this).apply {
                this.text = text
                textSize = 13f
                setTextColor(color ?: Color.parseColor("#334155"))
                if (bold) setTypeface(null, android.graphics.Typeface.BOLD)
                layoutParams = LinearLayout.LayoutParams(0,
                    LinearLayout.LayoutParams.WRAP_CONTENT, weight)
            }
        }

        row.addView(cell(room.roomNumber ?: "-", 1f))
        row.addView(cell(room.type ?: "-", 1f))
        row.addView(cell(room.price ?: "-", 1f))
        row.addView(cell(
            parseInclusions(room.inclusions).joinToString(", ") { it.first }.ifEmpty { "-" },
            2f
        ))

        // Status badge
        val statusView = TextView(this).apply {
            text = displayStatus
            textSize = 11f
            setPadding(16, 6, 16, 6)
            setTypeface(null, android.graphics.Typeface.BOLD)
            if (displayStatus == "Available") {
                setTextColor(Color.parseColor("#059669"))
                setBackgroundResource(R.drawable.badge_approved_bg)
            } else {
                setTextColor(Color.parseColor("#475569"))
                setBackgroundResource(R.drawable.badge_pending_bg)
            }
            layoutParams = LinearLayout.LayoutParams(0,
                LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
        }
        row.addView(statusView)

        // Action
        val actionView = TextView(this).apply {
            layoutParams = LinearLayout.LayoutParams(0,
                LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
            if (isOccupant) {
                text = "View Billing →"
                setTextColor(Color.parseColor("#1E3A8A"))
                setTypeface(null, android.graphics.Typeface.BOLD)
                paintFlags = paintFlags or android.graphics.Paint.UNDERLINE_TEXT_FLAG
                setOnClickListener { showBillingModal(room, token) }
            } else {
                text = "-"
                setTextColor(Color.parseColor("#94A3B8"))
            }
        }
        row.addView(actionView)

        // Divider
        val divider = View(this).apply {
            setBackgroundColor(Color.parseColor("#F1F5F9"))
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, 1)
        }

        container.addView(row)
        container.addView(divider)
    }

    // ── VISIT MODAL ───────────────────────────────────────────────────
    private fun showVisitModal(houseId: String, token: String) {
        val view = LayoutInflater.from(this).inflate(R.layout.modal_visit_request, null)
        val etDateTime = view.findViewById<EditText>(R.id.etDateTime)
        val etMessage  = view.findViewById<EditText>(R.id.etMessage)
        val btnSubmit  = view.findViewById<Button>(R.id.btnSubmitVisit)
        val btnCancel  = view.findViewById<Button>(R.id.btnCancelVisit)

        val dialog = AlertDialog.Builder(this)
            .setView(view)
            .setCancelable(true)
            .create()
        dialog.window?.setBackgroundDrawableResource(android.R.color.transparent)

        btnCancel.setOnClickListener { dialog.dismiss() }

        btnSubmit.setOnClickListener {
            val dateTime = etDateTime.text.toString().trim()
            val message  = etMessage.text.toString().trim()
            if (dateTime.isEmpty()) {
                Toast.makeText(this, "Please select a date and time.", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            btnSubmit.isEnabled = false
            btnSubmit.text = "Submitting..."
            activityScope.launch {
                try {
                    val res = RetrofitClient.instance.requestVisit(
                        "Bearer $token",
                        mapOf("houseId" to houseId, "dateTime" to dateTime, "message" to message)
                    )
                    if (res.isSuccessful) {
                        Toast.makeText(this@RoomDetailsActivity,
                            "Visit request submitted! The owner will review your request.",
                            Toast.LENGTH_LONG).show()
                        dialog.dismiss()
                    } else {
                        Toast.makeText(this@RoomDetailsActivity,
                            "Failed to submit request.", Toast.LENGTH_SHORT).show()
                    }
                } catch (e: Exception) {
                    Toast.makeText(this@RoomDetailsActivity,
                        "Error: ${e.message}", Toast.LENGTH_SHORT).show()
                } finally {
                    btnSubmit.isEnabled = true
                    btnSubmit.text = "Submit Request"
                }
            }
        }
        dialog.show()
    }

    // ── BILLING MODAL ─────────────────────────────────────────────────
    private fun showBillingModal(room: RoomDetail, token: String) {
        val view = LayoutInflater.from(this).inflate(R.layout.modal_billing, null)

        val tvRoomNumber    = view.findViewById<TextView>(R.id.tvRoomNumber)
        val tvRoomType      = view.findViewById<TextView>(R.id.tvRoomType)
        val tvMonthlyRent   = view.findViewById<TextView>(R.id.tvMonthlyRent)
        val tvBillingDate   = view.findViewById<TextView>(R.id.tvBillingDate)
        val tvTotal         = view.findViewById<TextView>(R.id.tvTotal)
        val tvPayStatus     = view.findViewById<TextView>(R.id.tvPayStatus)
        val layoutInclusions= view.findViewById<LinearLayout>(R.id.layoutInclusions)
        val btnClose        = view.findViewById<Button>(R.id.btnCloseBilling)
        val rvReceipts      = view.findViewById<androidx.recyclerview.widget.RecyclerView>(R.id.rvReceipts)

        tvRoomNumber.text  = room.roomNumber ?: "-"
        tvRoomType.text    = room.type ?: "-"
        tvMonthlyRent.text = room.price ?: "-"
        tvBillingDate.text = formatDate(room.billingMonth)

        // Inclusions breakdown
        val inclusions = parseInclusions(room.inclusions)
        if (inclusions.isNotEmpty()) {
            layoutInclusions.visibility = View.VISIBLE
            inclusions.forEach { (name, price) ->
                val row = LinearLayout(this).apply {
                    orientation = LinearLayout.HORIZONTAL
                    layoutParams = LinearLayout.LayoutParams(
                        LinearLayout.LayoutParams.MATCH_PARENT,
                        LinearLayout.LayoutParams.WRAP_CONTENT
                    ).apply { bottomMargin = 8 }
                }
                row.addView(TextView(this).apply {
                    text = name
                    textSize = 13f
                    setTextColor(Color.parseColor("#475569"))
                    layoutParams = LinearLayout.LayoutParams(0,
                        LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
                })
                row.addView(TextView(this).apply {
                    text = "₱$price"
                    textSize = 13f
                    setTextColor(Color.parseColor("#1E3A8A"))
                })
                layoutInclusions.addView(row)
            }
        }

        // Total
        val rentAmount = room.price?.replace(Regex("[^0-9]"), "")?.toIntOrNull() ?: 0
        val inclusionsTotal = inclusions.sumOf { it.second.replace(Regex("[^0-9]"), "").toIntOrNull() ?: 0 }
        tvTotal.text = "₱${(rentAmount + inclusionsTotal).toString().replace(Regex("\\B(?=(\\d{3})+(?!\\d))"), ",")}"

        // Payment status
        val isPaid = room.paymentStatus?.lowercase() == "paid"
        tvPayStatus.text = if (isPaid) "PAID" else "NOT PAID"
        tvPayStatus.setTextColor(if (isPaid) Color.parseColor("#059669") else Color.parseColor("#DC2626"))
        tvPayStatus.setBackgroundResource(if (isPaid) R.drawable.badge_approved_bg else R.drawable.badge_rejected_bg)

        val dialog = AlertDialog.Builder(this)
            .setView(view)
            .setCancelable(true)
            .create()
        dialog.window?.setBackgroundDrawableResource(android.R.color.transparent)

        btnClose.setOnClickListener { dialog.dismiss() }

        // Fetch receipts
        activityScope.launch {
            try {
                val res = RetrofitClient.instance.getReceipts(room.id.toIdString(), "Bearer $token")
                if (res.isSuccessful) {
                    val receipts = res.body()
                        ?.sortedByDescending { it.billingDate }
                        ?: emptyList()
                    if (receipts.isNotEmpty()) {
                        rvReceipts.visibility = View.VISIBLE
                        rvReceipts.layoutManager =
                            androidx.recyclerview.widget.LinearLayoutManager(this@RoomDetailsActivity)
                        rvReceipts.adapter = ReceiptAdapter(receipts) { receipt ->
                            dialog.dismiss()
                            showReceiptModal(receipt)
                        }
                    }
                }
            } catch (e: Exception) { /* ignore */ }
        }

        dialog.show()
    }

    // ── RECEIPT MODAL ─────────────────────────────────────────────────
    private fun showReceiptModal(receipt: com.example.boardmatemobile.data.model.ReceiptResponse) {
        val view = LayoutInflater.from(this).inflate(R.layout.modal_receipt, null)

        view.findViewById<TextView>(R.id.tvReceiptId).text =
            receipt.id?.toString()?.padStart(6, '0') ?: "000000"
        view.findViewById<TextView>(R.id.tvReceiptDate).text =
            formatDate(receipt.createdAt)
        view.findViewById<TextView>(R.id.tvReceiptRoom).text =
            receipt.roomNumber ?: "-"
        view.findViewById<TextView>(R.id.tvReceiptBillingPeriod).text =
            formatDate(receipt.billingDate)
        view.findViewById<TextView>(R.id.tvReceiptTotal).text =
            receipt.totalAmount ?: "-"

        val layoutReceiptItems = view.findViewById<LinearLayout>(R.id.layoutReceiptItems)
        layoutReceiptItems.addView(TextView(this).apply {
            text = "Monthly Rent: ${receipt.price}"
            textSize = 13f
            setTextColor(Color.parseColor("#334155"))
        })
        parseInclusions(receipt.inclusions).forEach { (name, price) ->
            layoutReceiptItems.addView(TextView(this).apply {
                text = "$name: ₱$price"
                textSize = 13f
                setTextColor(Color.parseColor("#334155"))
            })
        }

        val dialog = AlertDialog.Builder(this)
            .setView(view)
            .setCancelable(true)
            .create()
        dialog.window?.setBackgroundDrawableResource(android.R.color.transparent)

        view.findViewById<Button>(R.id.btnCloseReceipt).setOnClickListener { dialog.dismiss() }
        view.findViewById<Button>(R.id.btnPrintReceipt).setOnClickListener {
            Toast.makeText(this, "Printing is not supported on mobile.", Toast.LENGTH_SHORT).show()
        }

        dialog.show()
    }

    // ── RATING ────────────────────────────────────────────────────────
    private fun submitRating(score: Int, token: String, houseId: String) {
        activityScope.launch {
            try {
                val res = RetrofitClient.instance.rateHouse(houseId, score, "Bearer $token")
                if (res.isSuccessful) {
                    userRating = score
                    updateStars(score)
                    Toast.makeText(this@RoomDetailsActivity,
                        "Thank you for your rating!", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@RoomDetailsActivity,
                    "Failed to submit rating.", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun updateStars(rating: Int) {
        stars.forEachIndexed { index, star ->
            star.setTextColor(
                if (index < rating) Color.parseColor("#FBBF24")
                else Color.parseColor("#D1D5DB")
            )
        }
    }

    // ── HELPERS ───────────────────────────────────────────────────────
    private fun loadImage(iv: ImageView, images: List<String>, index: Int) {
        Glide.with(this).load(images.getOrNull(index)).placeholder(R.drawable.bh1).into(iv)
    }

    private fun parseInclusions(str: String?): List<Pair<String, String>> {
        if (str.isNullOrEmpty()) return emptyList()
        return str.split(",").mapNotNull {
            val parts = it.split(":")
            if (parts.size >= 2) Pair(parts[0].trim(), parts[1].trim()) else null
        }
    }

    private fun formatDate(dateStr: String?): String {
        if (dateStr.isNullOrEmpty()) return "-"
        return try {
            val sdf = java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.getDefault())
            val out = java.text.SimpleDateFormat("MMMM dd, yyyy", java.util.Locale.getDefault())
            out.format(sdf.parse(dateStr) ?: return dateStr)
        } catch (e: Exception) { dateStr }
    }

    override fun onDestroy() {
        super.onDestroy()
        activityScope.cancel()
    }
}