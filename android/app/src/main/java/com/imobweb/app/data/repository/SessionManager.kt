package com.imobweb.app.data.repository

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.core.stringSetPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "session")

class SessionManager(private val context: Context) {
    companion object {
        private val TOKEN_KEY = stringPreferencesKey("auth_token")
        private val EMAIL_KEY = stringPreferencesKey("user_email")
        private val USER_ID_KEY = stringPreferencesKey("user_id")
        private val USER_ROLE_KEY = stringPreferencesKey("user_role")
        private val BASE_URL_KEY = stringPreferencesKey("base_url")
        private val GEMINI_KEY = stringPreferencesKey("gemini_api_key")
        private val DELETED_REMOTE_IDS_KEY = stringSetPreferencesKey("deleted_remote_ids")
        private val PENDING_DELETES_KEY = stringSetPreferencesKey("pending_remote_deletes")
    }

    val authToken: Flow<String?> = context.dataStore.data.map { it[TOKEN_KEY] }
    val userEmail: Flow<String?> = context.dataStore.data.map { it[EMAIL_KEY] }
    val userRole: Flow<String?> = context.dataStore.data.map { it[USER_ROLE_KEY] }

    suspend fun saveSession(token: String, email: String, userId: String, role: String) {
        context.dataStore.edit {
            it[TOKEN_KEY] = token
            it[EMAIL_KEY] = email
            it[USER_ID_KEY] = userId
            it[USER_ROLE_KEY] = role
        }
    }

    suspend fun getToken(): String? = context.dataStore.data.first()[TOKEN_KEY]

    suspend fun getBaseUrl(): String {
        return context.dataStore.data.first()[BASE_URL_KEY] ?: com.imobweb.app.BuildConfig.BASE_URL
    }

    suspend fun setBaseUrl(url: String) {
        val cleanUrl = url.trim().removeSuffix("/")
        context.dataStore.edit {
            if (cleanUrl.isNotBlank()) {
                it[BASE_URL_KEY] = cleanUrl
            } else {
                it.remove(BASE_URL_KEY)
            }
        }
    }

    suspend fun getGeminiKey(): String? = context.dataStore.data.first()[GEMINI_KEY]

    suspend fun setGeminiKey(key: String) {
        val clean = key.trim()
        context.dataStore.edit {
            if (clean.isNotBlank()) {
                it[GEMINI_KEY] = clean
            } else {
                it.remove(GEMINI_KEY)
            }
        }
    }

    /** Sai da conta: remove credenciais, mas mantém servidor, chave Gemini e controle de exclusões. */
    suspend fun clearSession() {
        context.dataStore.edit {
            it.remove(TOKEN_KEY)
            it.remove(EMAIL_KEY)
            it.remove(USER_ID_KEY)
            it.remove(USER_ROLE_KEY)
        }
    }

    /** Token expirado/recusado pelo servidor (401). */
    suspend fun clearToken() {
        context.dataStore.edit { it.remove(TOKEN_KEY) }
    }

    suspend fun getPendingDeletes(): Set<String> =
        context.dataStore.data.first()[PENDING_DELETES_KEY] ?: emptySet()

    suspend fun removePendingDelete(remoteId: String) {
        context.dataStore.edit { prefs ->
            prefs[PENDING_DELETES_KEY] = (prefs[PENDING_DELETES_KEY] ?: emptySet()) - remoteId
        }
    }

    suspend fun markRemoteIdDeleted(remoteId: String) {
        if (remoteId.isBlank()) return
        context.dataStore.edit { prefs ->
            val current = prefs[DELETED_REMOTE_IDS_KEY] ?: emptySet()
            prefs[DELETED_REMOTE_IDS_KEY] = current + remoteId
            prefs[PENDING_DELETES_KEY] = (prefs[PENDING_DELETES_KEY] ?: emptySet()) + remoteId
        }
    }

    suspend fun isRemoteIdDeleted(remoteId: String): Boolean {
        if (remoteId.isBlank()) return false
        val deleted = context.dataStore.data.first()[DELETED_REMOTE_IDS_KEY] ?: emptySet()
        return remoteId in deleted
    }

    suspend fun isLoggedIn(): Boolean {
        return !context.dataStore.data.first()[TOKEN_KEY].isNullOrBlank()
    }

    suspend fun getEmail(): String? = context.dataStore.data.first()[EMAIL_KEY]
}
