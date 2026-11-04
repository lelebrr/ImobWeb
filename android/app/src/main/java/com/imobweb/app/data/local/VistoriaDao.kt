package com.imobweb.app.data.local

import androidx.room.*
import com.imobweb.app.model.Vistoria
import kotlinx.coroutines.flow.Flow

@Dao
interface VistoriaDao {
    @Query("SELECT * FROM vistorias ORDER BY updatedAt DESC")
    fun getAllVistorias(): Flow<List<Vistoria>>

    @Query("SELECT * FROM vistorias")
    suspend fun getAllOnce(): List<Vistoria>

    @Query("SELECT * FROM vistorias WHERE id = :id")
    suspend fun getVistoriaById(id: Long): Vistoria?

    @Query("SELECT * FROM vistorias WHERE remoteId = :remoteId LIMIT 1")
    suspend fun getByRemoteId(remoteId: String): Vistoria?

    /** Vistorias de saída criadas a partir da entrada [entradaId]. */
    @Query("SELECT * FROM vistorias WHERE linkedId = :entradaId ORDER BY createdAt DESC")
    suspend fun getExitsFor(entradaId: Long): List<Vistoria>

    @Query("SELECT remoteId FROM vistorias WHERE remoteId IS NOT NULL")
    suspend fun getRemoteIds(): List<String>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertVistoria(vistoria: Vistoria): Long

    @Update
    suspend fun updateVistoria(vistoria: Vistoria)

    @Query("DELETE FROM vistorias WHERE id = :id")
    suspend fun deleteVistoriaById(id: Long)

    @Query("DELETE FROM vistorias")
    suspend fun deleteAll()

    @Query("SELECT * FROM vistorias WHERE status IN ('pending_sync', 'pending_force') ORDER BY updatedAt ASC")
    suspend fun getPendingSyncVistorias(): List<Vistoria>

    @Query("UPDATE vistorias SET status = :status WHERE id = :id")
    suspend fun setStatus(id: Long, status: String)

    /** Vistorias de outra conta (ou de conta desconhecida já enviadas ao servidor). */
    @Query("SELECT COUNT(*) FROM vistorias WHERE (ownerOrg IS NOT NULL AND ownerOrg != :org) OR (ownerOrg IS NULL AND remoteId IS NOT NULL)")
    suspend fun countForeign(org: String): Int

    @Query("SELECT * FROM vistorias WHERE (ownerOrg IS NOT NULL AND ownerOrg != :org) OR (ownerOrg IS NULL AND remoteId IS NOT NULL)")
    suspend fun getForeign(org: String): List<Vistoria>

    @Query("UPDATE vistorias SET ownerOrg = :org WHERE ownerOrg IS NULL AND remoteId IS NULL")
    suspend fun adoptUnowned(org: String)

    /**
     * Marca como sincronizada só se a vistoria não foi editada durante o envio
     * (mesmo updatedAt). Se foi, ela continua pendente e sobe de novo depois.
     */
    @Query(
        "UPDATE vistorias SET status = 'synced', syncedAt = :syncedAt, remoteId = :remoteId, ownerOrg = :org " +
            "WHERE id = :id AND updatedAt = :updatedAt"
    )
    suspend fun markSyncedIfUnchanged(id: Long, remoteId: String, updatedAt: Long, syncedAt: Long, org: String?): Int

    @Query("UPDATE vistorias SET remoteId = :remoteId, ownerOrg = :org WHERE id = :id")
    suspend fun setRemoteId(id: Long, remoteId: String, org: String?)

    @Query("SELECT COUNT(*) FROM vistorias WHERE status = 'conflict'")
    fun getConflictCount(): Flow<Int>

    @Query("SELECT COUNT(*) FROM vistorias WHERE status = 'pending_sync'")
    fun getPendingSyncCount(): Flow<Int>
}
