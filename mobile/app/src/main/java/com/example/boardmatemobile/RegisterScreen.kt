package com.example.boardmatemobile

import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

@Composable
fun RegisterScreen() {
    val context = LocalContext.current

    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var role by remember { mutableStateOf("ROLE_USER") }
    var loading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf("") }

    val roleOptions = listOf(
        "Boarder (looking for a room)" to "ROLE_USER",
        "Owner (listing a property)" to "ROLE_ADMIN"
    )
    var expanded by remember { mutableStateOf(false) }

    Box(
        modifier = Modifier
            .fillMaxSize()
    ) {
        // Background image
        Image(
            painter = painterResource(id = R.drawable.bh1), // put bh1.jpg in drawable
            contentDescription = "Background",
            modifier = Modifier.fillMaxSize(),
            contentScale = ContentScale.Crop
        )

        // Form overlay
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .fillMaxHeight()
                .padding(32.dp)
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            // App title
            Text(
                text = "BoardMate",
                fontSize = 32.sp,
                color = Color.White
            )
            Text(
                text = "Join thousands of happy boarders",
                fontSize = 14.sp,
                color = Color.White
            )

            Spacer(modifier = Modifier.height(24.dp))

            // Error message
            if (errorMessage.isNotEmpty()) {
                Text(text = errorMessage, color = Color.Red, modifier = Modifier.padding(bottom = 12.dp))
            }

            // Email
            OutlinedTextField(
                value = email,
                onValueChange = { email = it },
                label = { Text("Email Address") },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(modifier = Modifier.height(12.dp))

            // Password
            OutlinedTextField(
                value = password,
                onValueChange = { password = it },
                label = { Text("Password") },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(modifier = Modifier.height(12.dp))

            // Role dropdown
            Box(modifier = Modifier.fillMaxWidth()) {
                OutlinedTextField(
                    value = roleOptions.first { it.second == role }.first,
                    onValueChange = {},
                    label = { Text("I am a...") },
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { expanded = true },
                    readOnly = true
                )
                DropdownMenu(expanded = expanded, onDismissRequest = { expanded = false }) {
                    roleOptions.forEach { (label, value) ->
                        DropdownMenuItem(
                            text = { Text(label) },
                            onClick = {
                                role = value
                                expanded = false
                            }
                        )
                    }
                }
            }
            Spacer(modifier = Modifier.height(24.dp))

            // Register button
            Button(
                onClick = {
                    loading = true
                    errorMessage = ""
                    CoroutineScope(Dispatchers.IO).launch {
                        try {
                            val url = URL("https://yourbackend.com/api/auth/register")
                            val conn = url.openConnection() as HttpURLConnection
                            conn.requestMethod = "POST"
                            conn.setRequestProperty("Content-Type", "application/json")
                            conn.doOutput = true

                            val body = JSONObject()
                            body.put("email", email)
                            body.put("password", password)
                            body.put("role", role)

                            conn.outputStream.use { os ->
                                os.write(body.toString().toByteArray())
                            }

                            val responseCode = conn.responseCode

                            if (responseCode in 200..299) {
                                (context as ComponentActivity).runOnUiThread {
                                    Toast.makeText(context, "Registration successful!", Toast.LENGTH_SHORT).show()
                                }
                            } else {
                                (context as ComponentActivity).runOnUiThread {
                                    errorMessage = "Registration failed"
                                }
                            }
                        } catch (e: Exception) {
                            (context as ComponentActivity).runOnUiThread {
                                errorMessage = e.message ?: "Error"
                            }
                        } finally {
                            loading = false
                        }
                    }
                },
                modifier = Modifier.fillMaxWidth(),
                enabled = !loading
            ) {
                Text(if (loading) "Creating account..." else "Create Account")
            }
        }
    }
}