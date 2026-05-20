package com.example.boardmatemobile.data.model

data class VisitResponse(
    val id: String,
    val status: String,
    val requestedDateTime: String,
    val message: String?,
    val createdAt: String,
    val house: HouseSummary?
)

data class HouseSummary(
    val name: String,
    val location: String
)