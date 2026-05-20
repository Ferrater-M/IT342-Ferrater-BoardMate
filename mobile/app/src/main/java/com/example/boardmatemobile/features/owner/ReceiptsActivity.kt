package com.example.boardmatemobile.features.owner

import android.app.Activity
import android.os.Bundle
import android.view.LayoutInflater
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import com.example.boardmatemobile.R
import com.example.boardmatemobile.data.model.ReceiptResponse
import com.example.boardmatemobile.data.remote.RetrofitClient
import com.example.boardmatemobile.utils.toIdString
import kotlinx.coroutines.MainScope
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch

class ReceiptsActivity : Activity() {
    private val activityScope = MainScope()
    private lateinit var tvTitle: TextView
    private lateinit var btnBack: Button
    private lateinit var tvEmpty: TextView
    private lateinit var llReceiptsContainer: LinearLayout

    private var roomId: String? = null
    private var roomNumber: String? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_receipts)

        android.util.Log.d("Receipts", "onCreate() called")
        android.util.Log.d("Receipts", "Intent extras: ${intent.extras}")
        android.util.Log.d("Receipts", "roomId from intent: ${intent.getStringExtra("roomId")}")
        android.util.Log.d("Receipts", "roomNumber from intent: ${intent.getStringExtra("roomNumber")}")

        roomId = intent.getStringExtra("roomId")
        roomNumber = intent.getStringExtra("roomNumber")

        try {
            tvTitle = findViewById(R.id.tvTitle)
            btnBack = findViewById(R.id.btnBack)
            tvEmpty = findViewById(R.id.tvEmpty)
            llReceiptsContainer = findViewById(R.id.llReceiptsContainer)
        } catch (e: Exception) {
            android.util.Log.e("Receipts", "Error finding views", e)
        }

        tvTitle.text = "Receipt History - $roomNumber"

        btnBack.setOnClickListener {
            finish()
        }

        loadReceipts()
    }

    private fun loadReceipts() {
        android.util.Log.d("Receipts", "loadReceipts() called")
        val prefs = getSharedPreferences("boardmate_prefs", MODE_PRIVATE)
        val token = prefs.getString("token", "") ?: ""

        val localRoomId = roomId
        android.util.Log.d("Receipts", "localRoomId: $localRoomId")
        if (localRoomId.isNullOrEmpty()) {
            android.util.Log.e("Receipts", "roomId is null or empty, finishing activity")
            finish()
            return
        }

        activityScope.launch {
            try {
                android.util.Log.d("Receipts", "Calling getReceipts API with roomId: $localRoomId")
                val res = RetrofitClient.instance.getReceipts(
                    localRoomId,
                    "Bearer $token"
                )
                android.util.Log.d("Receipts", "Response code: ${res.code()}")
                android.util.Log.d("Receipts", "Response successful: ${res.isSuccessful}")

                if (res.isSuccessful && res.body() != null) {
                    val receipts = res.body()!!
                    android.util.Log.d("Receipts", "Number of receipts: ${receipts.size}")
                    try {
                        displayReceipts(receipts)
                    } catch (e: Exception) {
                        android.util.Log.e("Receipts", "Error in displayReceipts", e)
                        Toast.makeText(this@ReceiptsActivity, "Error displaying receipts: ${e.javaClass.simpleName}", Toast.LENGTH_LONG).show()
                    }
                } else {
                    val errorBody = res.errorBody()?.string()
                    android.util.Log.e("Receipts", "Error loading receipts: $errorBody")
                    tvEmpty.visibility = android.view.View.VISIBLE
                    llReceiptsContainer.visibility = android.view.View.GONE
                }
            } catch (e: Exception) {
                android.util.Log.e("Receipts", "Exception loading receipts", e)
                Toast.makeText(this@ReceiptsActivity, "Error: ${e.javaClass.simpleName} - ${e.message}", Toast.LENGTH_LONG).show()
                tvEmpty.visibility = android.view.View.VISIBLE
                llReceiptsContainer.visibility = android.view.View.GONE
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        activityScope.cancel()
    }

    private fun displayReceipts(receipts: List<ReceiptResponse>) {
        android.util.Log.d("Receipts", "displayReceipts called with ${receipts.size} receipts")
        llReceiptsContainer.removeAllViews()

        if (receipts.isEmpty()) {
            android.util.Log.d("Receipts", "No receipts to display")
            Toast.makeText(this@ReceiptsActivity, "No receipts found for this room", Toast.LENGTH_LONG).show()
            tvEmpty.visibility = android.view.View.VISIBLE
            llReceiptsContainer.visibility = android.view.View.GONE
            return
        }

        android.util.Log.d("Receipts", "Displaying ${receipts.size} receipts")
        tvEmpty.visibility = android.view.View.GONE
        llReceiptsContainer.visibility = android.view.View.VISIBLE

        receipts.forEachIndexed { index, receipt ->
            android.util.Log.d("Receipts", "Adding receipt $index: $receipt")
            val itemView = LayoutInflater.from(this)
                .inflate(R.layout.item_receipt, llReceiptsContainer, false)

            val tvBillingDate = itemView.findViewById<TextView>(R.id.tvBillingDate)
            val tvTotalAmount = itemView.findViewById<TextView>(R.id.tvTotalAmount)

            tvBillingDate.text = receipt.billingDate ?: "-"
            tvTotalAmount.text = "Total: ${receipt.totalAmount ?: "-"}"

            llReceiptsContainer.addView(itemView)
        }
    }
}
