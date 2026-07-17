package com.imobweb.app

import android.app.Application
import com.imobweb.app.data.local.AppDatabase
import com.imobweb.app.data.repository.SessionManager
import com.imobweb.app.data.repository.SyncWorker
import com.imobweb.app.data.repository.VistoriaRepository

class ImobWebApp : Application() {
    lateinit var database: AppDatabase
    lateinit var sessionManager: SessionManager
    lateinit var repository: VistoriaRepository

    override fun onCreate() {
        super.onCreate()
        database = AppDatabase.getInstance(this)
        sessionManager = SessionManager(this)
        repository = VistoriaRepository(database, sessionManager)
        SyncWorker.schedule(this)
    }
}
