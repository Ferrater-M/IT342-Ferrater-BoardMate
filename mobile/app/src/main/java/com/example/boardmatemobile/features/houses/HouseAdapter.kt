package com.example.boardmatemobile.features.houses

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.RecyclerView
import com.example.boardmatemobile.R
import com.example.boardmatemobile.data.model.HouseResponse

class HouseAdapter(
    private val onHouseClick: (HouseResponse) -> Unit
) : ListAdapter<HouseResponse, HouseAdapter.HouseViewHolder>(HouseDiffCallback()) {

    inner class HouseViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val tvName = itemView.findViewById<TextView>(R.id.tvHouseName)
        private val tvLocation = itemView.findViewById<TextView>(R.id.tvHouseLocation)
        private val tvPrice = itemView.findViewById<TextView>(R.id.tvHousePrice)
        private val tvRating = itemView.findViewById<TextView>(R.id.tvHouseRating)

        fun bind(house: HouseResponse) {
            tvName.text = house.name
            tvLocation.text = house.location
            tvPrice.text = "₱${house.price}"
            tvRating.text = "⭐ ${house.rating ?: "N/A"}"
            itemView.setOnClickListener { onHouseClick(house) }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): HouseViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_house, parent, false)
        return HouseViewHolder(view)
    }

    override fun onBindViewHolder(holder: HouseViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    class HouseDiffCallback : DiffUtil.ItemCallback<HouseResponse>() {
        override fun areItemsTheSame(oldItem: HouseResponse, newItem: HouseResponse): Boolean {
            return oldItem.id == newItem.id
        }

        override fun areContentsTheSame(oldItem: HouseResponse, newItem: HouseResponse): Boolean {
            return oldItem == newItem
        }
    }
}
