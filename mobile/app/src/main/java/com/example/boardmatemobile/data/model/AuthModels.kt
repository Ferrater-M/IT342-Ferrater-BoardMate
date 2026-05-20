package com.example.boardmatemobile.data.model

import java.io.Serializable

data class LoginRequest(
    val email: String,
    val password: String
)

data class LoginResponse(
    val token: String,
    val role: String,
    val name: String,
    val userId: Long,
    val email: String,
    val profilePicture: String?
)

data class RegisterRequest(
    val email: String,
    val password: String,
    val firstName: String,
    val lastName: String,
    val role: String
)

data class RegisterResponse(
    val message: String
)

data class HealthResponse(
    val status: String
)

data class RoomResponse(
    val id: String,
    val roomNumber: String,
    val type: String,
    val price: String,
    val inclusions: String? = null,
    val status: String,
    val paymentStatus: String,
    val billingMonth: String? = null,
    val occupantName: String? = null
) : Serializable

data class HouseResponse(
    val id: Any,
    val name: String,
    val location: String,
    val description: String? = null,
    val price: String,
    val rating: Double?,
    val roomsLeft: Int? = null,
    val calculatedRoomsLeft: Int? = null,
    val imageUrl: String? = null,
    val imageUrls: List<String>? = null,
    val rooms: List<RoomResponse>? = null
) : Serializable

data class ApplicationStatusResponse(
    val status: String
)

data class Application(
    val fullName: String? = null,
    val email: String? = null,
    val phoneNumber: String? = null,
    val hasBusinessPermit: String? = null,
    val houseName: String? = null,
    val houseAddress: String? = null,
    val experience: String? = null,
    val reason: String? = null,
    val status: String? = null
)