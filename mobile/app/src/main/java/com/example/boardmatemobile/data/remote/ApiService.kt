package com.example.boardmatemobile.data.remote

import com.example.boardmatemobile.data.model.*
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Header
import retrofit2.http.Path
import retrofit2.http.Query

interface ApiService {

    @GET("api/auth/health")
    suspend fun checkHealth(): Response<HealthResponse>

    @POST("api/auth/login")
    suspend fun login(@Body request: LoginRequest): Response<LoginResponse>

    @POST("api/auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<RegisterResponse>

    // Example authenticated endpoint — pass JWT token
    @GET("api/houses")
    suspend fun getHouses(@Header("Authorization") token: String): Response<List<HouseResponse>>

    @GET("api/houses/my-houses")
    suspend fun getMyHouses(@Header("Authorization") token: String): Response<List<HouseResponse>>

    @GET("api/visits/my-requests")
    suspend fun getMyVisits(@Header("Authorization") token: String): Response<List<VisitResponse>>

    @GET("api/houses/{id}")
    suspend fun getHouseById(
        @Path("id") id: String,
        @Header("Authorization") token: String
    ): Response<HouseDetailResponse>

    @GET("api/houses/{id}/my-rating")
    suspend fun getMyRating(
        @Path("id") id: String,
        @Header("Authorization") token: String
    ): Response<Int>

    @POST("api/houses/{id}/rate")
    suspend fun rateHouse(
        @Path("id") id: String,
        @Query("score") score: Int,
        @Header("Authorization") token: String
    ): Response<Unit>

    @POST("api/visits/request")
    suspend fun requestVisit(
        @Header("Authorization") token: String,
        @Body body: Map<String, String>
    ): Response<Unit>

    @GET("api/houses/rooms/{roomId}/receipts")
    suspend fun getReceipts(
        @Path("roomId") roomId: String,
        @Header("Authorization") token: String
    ): Response<List<ReceiptResponse>>

    @POST("api/houses/rooms/{roomId}/receipts")
    suspend fun addReceipt(
        @Path("roomId") roomId: String,
        @Header("Authorization") token: String,
        @Body receipt: ReceiptRequest
    ): Response<ReceiptResponse>

    @GET("api/owner/application/status")
    suspend fun getApplicationStatus(@Header("Authorization") token: String): Response<ApplicationStatusResponse>

    @GET("api/auth/applications")
    suspend fun getApplications(@Header("Authorization") token: String): Response<List<Application>>

    @GET("api/auth/applications/history")
    suspend fun getApplicationsHistory(@Header("Authorization") token: String): Response<List<Application>>

    @POST("api/auth/upgrade")
    suspend fun approveApplication(
        @Header("Authorization") token: String,
        @Body body: Map<String, String>
    ): Response<Unit>

    @POST("api/auth/reject")
    suspend fun rejectApplication(
        @Header("Authorization") token: String,
        @Body body: Map<String, String>
    ): Response<Unit>

    @POST("api/auth/apply")
    suspend fun applyOwner(
        @Header("Authorization") token: String,
        @Body body: Map<String, String>
    ): Response<Unit>

    @PUT("api/houses/{id}")
    suspend fun updateHouse(
        @Path("id") id: String,
        @Header("Authorization") token: String,
        @Body house: HouseResponse
    ): Response<HouseResponse>

    @DELETE("api/houses/{id}")
    suspend fun deleteHouse(
        @Path("id") id: String,
        @Header("Authorization") token: String
    ): Response<Unit>

    @PUT("api/houses/rooms/{roomId}")
    suspend fun updateRoom(
        @Path("roomId") roomId: String,
        @Header("Authorization") token: String,
        @Body room: RoomResponse
    ): Response<RoomResponse>

    @DELETE("api/houses/rooms/{roomId}")
    suspend fun deleteRoom(
        @Path("roomId") roomId: String,
        @Header("Authorization") token: String
    ): Response<Unit>

    @POST("api/houses/{houseId}/rooms")
    suspend fun addRoom(
        @Path("houseId") houseId: String,
        @Header("Authorization") token: String,
        @Body room: RoomResponse
    ): Response<RoomResponse>
}