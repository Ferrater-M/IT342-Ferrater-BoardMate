package com.example.boardmatemobile.features.main

import android.content.Intent
import android.content.SharedPreferences
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.boardmatemobile.features.auth.LoginActivity
import com.example.boardmatemobile.shared.ui.theme.BoardMateMobileTheme

class MainActivity : ComponentActivity() {

    private lateinit var sharedPrefs: SharedPreferences

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        sharedPrefs = getSharedPreferences("BoardMatePrefs", MODE_PRIVATE)

        // Check if user is NOT logged in
        if (!sharedPrefs.contains("token")) {
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
            return
        }

        setContent {
            BoardMateMobileTheme {
                MainScreen(
                    sharedPrefs = sharedPrefs,
                    onLogout = {
                        with(sharedPrefs.edit()) {
                            clear()
                            apply()
                        }
                        startActivity(Intent(this, LoginActivity::class.java))
                        finish()
                    }
                )
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen(
    sharedPrefs: SharedPreferences,
    onLogout: () -> Unit
) {
    val userName = sharedPrefs.getString("name", "User") ?: "User"
    val userRole = sharedPrefs.getString("role", "ROLE_USER") ?: "ROLE_USER"

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("BoardMate") },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    titleContentColor = MaterialTheme.colorScheme.onPrimary
                )
            )
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues),
            contentAlignment = Alignment.Center
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Text(
                    text = "Welcome, $userName!",
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = when (userRole) {
                        "ROLE_USER" -> "Boarder"
                        "ROLE_ADMIN" -> "Owner"
                        else -> "Admin"
                    },
                    fontSize = 16.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Button(onClick = onLogout) {
                    Text("Logout")
                }
            }
        }
    }
}
