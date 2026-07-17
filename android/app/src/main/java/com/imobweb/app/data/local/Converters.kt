package com.imobweb.app.data.local

import androidx.room.TypeConverter
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import com.imobweb.app.model.PhotoAnnotation
import com.imobweb.app.model.PhotoData
import com.imobweb.app.model.RoomData

class Converters {
    private val gson = Gson()

    @TypeConverter
    fun fromRoomList(value: List<RoomData>): String = gson.toJson(value)

    @TypeConverter
    fun toRoomList(value: String): List<RoomData> {
        val type = object : TypeToken<List<RoomData>>() {}.type
        return gson.fromJson(value, type) ?: emptyList()
    }

    @TypeConverter
    fun fromPhotoList(value: List<PhotoData>): String = gson.toJson(value)

    @TypeConverter
    fun toPhotoList(value: String): List<PhotoData> {
        val type = object : TypeToken<List<PhotoData>>() {}.type
        return gson.fromJson(value, type) ?: emptyList()
    }

    @TypeConverter
    fun fromAnnotationList(value: List<PhotoAnnotation>): String = gson.toJson(value)

    @TypeConverter
    fun toAnnotationList(value: String): List<PhotoAnnotation> {
        val type = object : TypeToken<List<PhotoAnnotation>>() {}.type
        return gson.fromJson(value, type) ?: emptyList()
    }
}
