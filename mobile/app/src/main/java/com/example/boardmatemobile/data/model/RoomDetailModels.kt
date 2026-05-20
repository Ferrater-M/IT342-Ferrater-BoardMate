package com.example.boardmatemobile.data.model

data class HouseDetailResponse(
    val id: Any,
    val name: String,
    val location: String,
    val description: String,
    val price: String,
    val rating: Double?,
    val roomsLeft: Int?,
    val imageUrl: String?,
    val imageUrls: List<String>?,
    val rooms: List<RoomDetail>?
)

data class RoomDetail(
    val id: Any?,
    val roomNumber: String?,
    val type: String?,
    val price: String?,
    val inclusions: String?,
    val status: String?,
    val billingMonth: String?,
    val paymentStatus: String?,
    val occupantId: Any?,
    val occupantName: String?
)

data class ReceiptResponse(
    val id: Any?,
    val roomNumber: String?,
    val billingDate: String?,
    val totalAmount: String?,
    val price: String?,
    val inclusions: String?,
    val createdAt: String?
)

data class ReceiptRequest(
    val roomNumber: String,
    val billingDate: String,
    val price: String,
    val inclusions: String,
    val totalAmount: String,
    val paymentStatus: String
)