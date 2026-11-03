package com.imobweb.app

import android.app.Application
import com.imobweb.app.data.local.AppDatabase
import com.imobweb.app.data.repository.SessionManager
import com.imobweb.app.data.repository.SyncWorker
import com.imobweb.app.data.repository.VistoriaRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

class ImobWebApp : Application() {
    lateinit var database: AppDatabase
    lateinit var sessionManager: SessionManager
    lateinit var repository: VistoriaRepository

    /** Escopo que sobrevive às telas: usado para gravar a vistoria ao sair do editor. */
    val appScope = CoroutineScope(SupervisorJob() + Dispatchers.Default)

    override fun onCreate() {
        super.onCreate()
        database = AppDatabase.getInstance(this)
        sessionManager = SessionManager(this)
        repository = VistoriaRepository(this, database, sessionManager)
        SyncWorker.schedule(this)
        appScope.launch { runCatching { repository.cleanupOrphanPhotos() } }
    }
}
