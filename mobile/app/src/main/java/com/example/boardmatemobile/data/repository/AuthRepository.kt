package com.example.boardmatemobile.data.repository

import com.example.boardmatemobile.data.model.*
import com.example.boardmatemobile.data.remote.RetrofitClient
import org.json.JSONObject

object AuthRepository {

    suspend fun checkHealth(): Boolean {
        val res = RetrofitClient.instance.checkHealth()
        return res.isSuccessful && res.body()?.status == "UP"
    }

    suspend fun login(email: String, password: String): LoginResponse {
        val res = RetrofitClient.instance.login(LoginRequest(email, password))
        if (res.isSuccessful) return res.body()!!

        // Read the actual error message from Spring Boot
        val errorBody = res.errorBody()?.string()
        val message = try {
            JSONObject(errorBody ?: "").getString("error")
        } catch (e: Exception) {
            errorBody ?: "Login failed: ${res.code()}"
        }
        throw Exception(message)
    }

    suspend fun register(
        firstName: String,
        lastName: String,
        email: String,
        password: String,
        role: String
    ): RegisterResponse {
        val res = RetrofitClient.instance.register(
            RegisterRequest(email, password, firstName, lastName, role)
        )
        if (res.isSuccessful) return res.body()!!

        // Read the actual error message from Spring Boot
        val errorBody = res.errorBody()?.string()
        val message = try {
            JSONObject(errorBody ?: "").getString("error")
        } catch (e: Exception) {
            errorBody ?: "Registration failed: ${res.code()}"
        }
        throw Exception(message)
    }
}