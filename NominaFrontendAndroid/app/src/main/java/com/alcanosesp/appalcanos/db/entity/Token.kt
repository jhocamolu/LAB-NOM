package com.alcanosesp.appalcanos.db.entity

import android.util.Log
import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey
import org.json.JSONObject

@Entity(tableName = "Token")
class Token {
    @PrimaryKey
    @ColumnInfo(name = "Token")
    var token: String = ""

    @ColumnInfo(name = "RefreshToken")
    var refreshToken: String? = ""

    @ColumnInfo(name = "Vencimiento")
    var vencimiento: String? = ""

    @ColumnInfo(name = "Aplicaciones")
    var aplicaciones: String? = ""

    @ColumnInfo(name = "Error")
    var error: String? = ""

    constructor(json: JSONObject) {
        try {
            this.token = json.getString("token")
            this.refreshToken = json.getString("refreshToken")
            this.vencimiento = json.getString("vencimiento")
            this.aplicaciones = json.getString("aplicaciones")
            this.error = json.getString("error")
        } catch (e: Exception) {
            Log.e("errorTokenModelo", e.message!!)
        }
    }

    constructor()
}