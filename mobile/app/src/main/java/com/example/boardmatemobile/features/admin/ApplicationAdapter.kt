package com.example.boardmatemobile.features.admin

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.TextView
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.RecyclerView
import com.example.boardmatemobile.R
import com.example.boardmatemobile.data.model.Application

class ApplicationAdapter(
    private val onViewClick: (Application) -> Unit,
    private val onApproveClick: (Application) -> Unit,
    private val onRejectClick: (Application) -> Unit
) : ListAdapter<Application, ApplicationAdapter.ApplicationViewHolder>(ApplicationDiffCallback()) {

    inner class ApplicationViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val tvApplicantName = itemView.findViewById<TextView>(R.id.tvApplicantName)
        private val tvEmail = itemView.findViewById<TextView>(R.id.tvEmail)
        private val tvHouseName = itemView.findViewById<TextView>(R.id.tvHouseName)
        private val tvHouseAddress = itemView.findViewById<TextView>(R.id.tvHouseAddress)
        private val tvStatus = itemView.findViewById<TextView>(R.id.tvStatus)
        private val btnView = itemView.findViewById<Button>(R.id.btnView)
        private val btnApprove = itemView.findViewById<Button>(R.id.btnApprove)
        private val btnReject = itemView.findViewById<Button>(R.id.btnReject)

        fun bind(app: Application) {
            tvApplicantName.text = app.fullName ?: "N/A"
            tvEmail.text = app.email ?: "N/A"
            tvHouseName.text = app.houseName ?: "N/A"
            tvHouseAddress.text = app.houseAddress ?: "N/A"

            if (app.status == "PENDING") {
                tvStatus.visibility = View.GONE
                btnApprove.visibility = View.VISIBLE
                btnReject.visibility = View.VISIBLE
            } else {
                tvStatus.visibility = View.VISIBLE
                tvStatus.text = app.status
                if (app.status == "APPROVED") {
                    tvStatus.setBackgroundColor(0xFFD1FAE5.toInt())
                    tvStatus.setTextColor(0xFF065F46.toInt())
                } else {
                    tvStatus.setBackgroundColor(0xFFFEE2E2.toInt())
                    tvStatus.setTextColor(0xFF991B1B.toInt())
                }
                btnApprove.visibility = View.GONE
                btnReject.visibility = View.GONE
            }

            btnView.setOnClickListener { onViewClick(app) }
            btnApprove.setOnClickListener { onApproveClick(app) }
            btnReject.setOnClickListener { onRejectClick(app) }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ApplicationViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_application, parent, false)
        return ApplicationViewHolder(view)
    }

    override fun onBindViewHolder(holder: ApplicationViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    class ApplicationDiffCallback : DiffUtil.ItemCallback<Application>() {
        override fun areItemsTheSame(oldItem: Application, newItem: Application): Boolean {
            return oldItem.email == newItem.email
        }

        override fun areContentsTheSame(oldItem: Application, newItem: Application): Boolean {
            return oldItem == newItem
        }
    }
}
