package com.example.boardmatemobile.features.houses

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.boardmatemobile.R
import com.example.boardmatemobile.data.model.ReceiptResponse

class ReceiptAdapter(
    private val receipts: List<ReceiptResponse>,
    private val onReceiptClick: (ReceiptResponse) -> Unit
) : RecyclerView.Adapter<ReceiptAdapter.ReceiptViewHolder>() {

    inner class ReceiptViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val tvBillingDate = itemView.findViewById<TextView>(R.id.tvBillingDate)
        private val tvTotalAmount = itemView.findViewById<TextView>(R.id.tvTotalAmount)

        fun bind(receipt: ReceiptResponse) {
            tvBillingDate.text = receipt.billingDate ?: "-"
            tvTotalAmount.text = receipt.totalAmount ?: "-"
            itemView.setOnClickListener { onReceiptClick(receipt) }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ReceiptViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_receipt, parent, false)
        return ReceiptViewHolder(view)
    }

    override fun onBindViewHolder(holder: ReceiptViewHolder, position: Int) {
        holder.bind(receipts[position])
    }

    override fun getItemCount(): Int = receipts.size
}
