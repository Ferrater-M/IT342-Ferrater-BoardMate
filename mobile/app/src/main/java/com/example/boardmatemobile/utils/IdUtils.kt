package com.example.boardmatemobile.utils

fun Any?.toIdString(): String {
    return when (this) {
        is Number -> this.toLong().toString()
        else -> this?.toString() ?: ""
    }
}
