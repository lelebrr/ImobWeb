package com.imobweb.app.data.local

import androidx.room.*
import com.imobweb.app.model.Vistoria
import kotlinx.coroutines.flow.Flow

@Dao
interface VistoriaDao {
    @Query("SELECT * FROM vistorias ORDER BY updatedAt DESC")
    fun getAllVistorias(): Flow<List<Vistoria>>

    @Query("SELECT * FROM vistorias WHERE id = :id")
    suspend fun getVistoriaById(id: Long): Vistoria?

    @Query("SELECT * FROM vistorias WHERE status = :status ORDER BY updatedAt DESC")
    fun getVistoriasByStatus(status: String): Flow<List<Vistoria>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertVistoria(vistoria: Vistoria): Long

    @Update
    suspend fun updateVistoria(vistoria: Vistoria)

    @Delete
    suspend fun deleteVistoria(vistoria: Vistoria)

    @Query("SELECT * FROM vistorias WHERE status = 'pending_sync' ORDER BY updatedAt ASC")
    suspend fun getPendingSyncVistorias(): List<Vistoria>

    @Query("UPDATE vistorias SET status = :status, syncedAt = :syncedAt WHERE id = :id")
    suspend fun markSynced(id: Long, status: String = "synced", syncedAt: Long = System.currentTimeMillis())

    @Query("SELECT COUNT(*) FROM vistorias WHERE status = 'pending_sync'")
    fun getPendingSyncCount(): Flow<Int>
}
