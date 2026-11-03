package com.imobweb.app.data.repository

import android.content.Context
import androidx.work.*
import com.imobweb.app.ImobWebApp
import java.io.IOException
import java.util.concurrent.TimeUnit

class SyncWorker(
    context: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(context, workerParams) {

    override suspend fun doWork(): Result {
        // Usa o mesmo repositório do app (mesmos locks de gravação/sincronização)
        val repository = (applicationContext as ImobWebApp).repository
        return try {
            val report = repository.syncAll()
            if (report.errors.isNotEmpty() && runAttemptCount < 3) Result.retry() else Result.success()
        } catch (e: AuthExpiredException) {
            Result.success() // precisa de novo login; não adianta tentar de novo
        } catch (e: IOException) {
            if (runAttemptCount < 5) Result.retry() else Result.failure()
        } catch (e: Exception) {
            if (runAttemptCount < 3) Result.retry() else Result.failure()
        }
    }

    companion object {
        const val WORK_NAME = "vistoria_sync_worker"
        private const val WORK_NOW = "vistoria_sync_now"

        private val constraints = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build()

        fun schedule(context: Context) {
            val request = PeriodicWorkRequestBuilder<SyncWorker>(15, TimeUnit.MINUTES)
                .setConstraints(constraints)
                .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 1, TimeUnit.MINUTES)
                .build()
            WorkManager.getInstance(context).enqueueUniquePeriodicWork(
                WORK_NAME, ExistingPeriodicWorkPolicy.KEEP, request
            )
        }

        /** Sincroniza assim que houver rede. Chamadas repetidas não empilham trabalhos. */
        fun syncNow(context: Context) {
            val request = OneTimeWorkRequestBuilder<SyncWorker>()
                .setConstraints(constraints)
                .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 30, TimeUnit.SECONDS)
                .build()
            WorkManager.getInstance(context).enqueueUniqueWork(WORK_NOW, ExistingWorkPolicy.REPLACE, request)
        }
    }
}
