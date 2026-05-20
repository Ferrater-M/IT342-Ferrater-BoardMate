package com.example.boardmatemobile.features.houses

import android.graphics.Color
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.LinearLayout
import android.widget.TextView
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.example.boardmatemobile.R
import com.example.boardmatemobile.data.model.VisitResponse
import java.text.SimpleDateFormat
import java.util.*

class VisitAdapter : ListAdapter<VisitResponse, VisitAdapter.VisitViewHolder>(DiffCallback()) {

    inner class VisitViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val tvHouseName    = view.findViewById<TextView>(R.id.tvHouseName)
        val tvStatus       = view.findViewById<TextView>(R.id.tvStatus)
        val tvLocation     = view.findViewById<TextView>(R.id.tvLocation)
        val tvDateTime     = view.findViewById<TextView>(R.id.tvDateTime)
        val layoutMessage  = view.findViewById<LinearLayout>(R.id.layoutMessage)
        val tvMessage      = view.findViewById<TextView>(R.id.tvMessage)
        val tvRequestedOn  = view.findViewById<TextView>(R.id.tvRequestedOn)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VisitViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_visit, parent, false)
        return VisitViewHolder(view)
    }

    override fun onBindViewHolder(holder: VisitViewHolder, position: Int) {
        val visit = getItem(position)

        holder.tvHouseName.text = visit.house?.name ?: "Unknown House"
        holder.tvLocation.text  = visit.house?.location ?: "—"
        holder.tvStatus.text    = visit.status

        // Status badge color
        when (visit.status) {
            "PENDING" -> {
                holder.tvStatus.setBackgroundResource(R.drawable.badge_pending_bg)
                holder.tvStatus.setTextColor(Color.parseColor("#92400E"))
            }
            "APPROVED" -> {
                holder.tvStatus.setBackgroundResource(R.drawable.badge_approved_bg)
                holder.tvStatus.setTextColor(Color.parseColor("#065F46"))
            }
            "REJECTED" -> {
                holder.tvStatus.setBackgroundResource(R.drawable.badge_rejected_bg)
                holder.tvStatus.setTextColor(Color.parseColor("#991B1B"))
            }
            else -> {
                holder.tvStatus.setBackgroundResource(R.drawable.badge_pending_bg)
                holder.tvStatus.setTextColor(Color.parseColor("#475569"))
            }
        }

        // Format dates
        val inputFormat  = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault())
        val dateFormat   = SimpleDateFormat("MMM dd, yyyy hh:mm a", Locale.getDefault())
        val shortFormat  = SimpleDateFormat("MMM dd, yyyy", Locale.getDefault())

        try {
            val dateTime = inputFormat.parse(visit.requestedDateTime)
            holder.tvDateTime.text = dateTime?.let { dateFormat.format(it) } ?: visit.requestedDateTime
        } catch (e: Exception) {
            holder.tvDateTime.text = visit.requestedDateTime
        }

        try {
            val createdAt = inputFormat.parse(visit.createdAt)
            holder.tvRequestedOn.text = "Requested on ${createdAt?.let { shortFormat.format(it) } ?: visit.createdAt}"
        } catch (e: Exception) {
            holder.tvRequestedOn.text = "Requested on ${visit.createdAt}"
        }

        // Message box
        if (!visit.message.isNullOrEmpty()) {
            holder.layoutMessage.visibility = View.VISIBLE
            holder.tvMessage.text = "\"${visit.message}\""
        } else {
            holder.layoutMessage.visibility = View.GONE
        }
    }

    class DiffCallback : DiffUtil.ItemCallback<VisitResponse>() {
        override fun areItemsTheSame(a: VisitResponse, b: VisitResponse) = a.id == b.id
        override fun areContentsTheSame(a: VisitResponse, b: VisitResponse) = a == b
    }
}