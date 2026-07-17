package com.imobweb.app.util

import java.text.NumberFormat
import java.util.Locale
import kotlin.math.pow

object Formatters {

    fun formatCpf(value: String): String {
        val digits = value.filter { it.isDigit() }.take(11)
        return when {
            digits.length <= 3 -> digits
            digits.length <= 6 -> "${digits.take(3)}.${digits.drop(3)}"
            digits.length <= 9 -> "${digits.take(3)}.${digits.drop(3).take(3)}.${digits.drop(6)}"
            else -> "${digits.take(3)}.${digits.drop(3).take(3)}.${digits.drop(6).take(3)}-${digits.drop(9)}"
        }
    }

    fun formatCnpj(value: String): String {
        val digits = value.filter { it.isDigit() }.take(14)
        return when {
            digits.length <= 2 -> digits
            digits.length <= 5 -> "${digits.take(2)}.${digits.drop(2)}"
            digits.length <= 8 -> "${digits.take(2)}.${digits.drop(2).take(3)}.${digits.drop(5)}"
            digits.length <= 12 -> "${digits.take(2)}.${digits.drop(2).take(3)}.${digits.drop(5).take(3)}/${digits.drop(8)}"
            else -> "${digits.take(2)}.${digits.drop(2).take(3)}.${digits.drop(5).take(3)}/${digits.drop(8).take(4)}-${digits.drop(12)}"
        }
    }

    fun formatCep(value: String): String {
        val digits = value.filter { it.isDigit() }.take(8)
        return if (digits.length > 5) "${digits.take(5)}-${digits.drop(5)}" else digits
    }

    fun formatPhone(value: String): String {
        val digits = value.filter { it.isDigit() }.take(11)
        return when {
            digits.length <= 2 -> "($digits"
            digits.length <= 7 -> "(${digits.take(2)}) ${digits.drop(2)}"
            digits.length <= 10 -> "(${digits.take(2)}) ${digits.drop(2).take(4)}-${digits.drop(6)}"
            else -> "(${digits.take(2)}) ${digits.drop(2).take(5)}-${digits.drop(7)}"
        }
    }

    fun isValidCpf(cpf: String): Boolean {
        val digits = cpf.filter { it.isDigit() }
        if (digits.length != 11 || digits.all { it == digits[0] }) return false
        val calc = { d: List<Int> ->
            var s = d.foldIndexed(0) { i, acc, digit -> acc + digit * (d.size + 1 - i) } % 11
            if (s < 2) 0 else 11 - s
        }
        val nums = digits.map { it - '0' }
        return calc(nums.take(9)) == nums[9] && calc(nums.take(10)) == nums[10]
    }

    fun maskCpfOrCnpj(value: String): String {
        val clean = value.filter { it.isDigit() }
        return if (clean.length <= 11) formatCpf(value) else formatCnpj(value)
    }

    fun getDateToday(): String {
        val sdf = java.text.SimpleDateFormat("dd/MM/yyyy", Locale("pt", "BR"))
        return sdf.format(java.util.Date())
    }

    fun getDateTimeNow(): String {
        val sdf = java.text.SimpleDateFormat("dd/MM/yyyy HH:mm", Locale("pt", "BR"))
        return sdf.format(java.util.Date())
    }

    fun formatFileSize(bytes: Long): String {
        if (bytes <= 0) return "0 B"
        val units = arrayOf("B", "KB", "MB", "GB")
        val digitGroups = (kotlin.math.log10(bytes.toDouble()) / kotlin.math.log10(1024.0)).toInt()
        val size = bytes / 1024.0.pow(digitGroups.toDouble())
        return String.format("%.1f %s", size, units[digitGroups.coerceAtMost(units.size - 1)])
    }
}
