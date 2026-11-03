package com.imobweb.app.data.local

import android.content.ContentValues
import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.util.Log
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import androidx.room.migration.Migration
import androidx.sqlite.db.SupportSQLiteDatabase
import com.imobweb.app.model.Vistoria
import com.imobweb.app.util.PhotoStore

@Database(entities = [Vistoria::class], version = 3, exportSchema = false)
@TypeConverters(Converters::class)
abstract class AppDatabase : RoomDatabase() {
    abstract fun vistoriaDao(): VistoriaDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getInstance(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                INSTANCE ?: Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "imobweb_database"
                )
                    // Nunca apagar os laudos do usuário numa atualização do app:
                    // toda mudança de schema precisa de uma Migration explícita.
                    .addMigrations(PhotosToFilesMigration(context.applicationContext), ExtrasMigration)
                    .build()
                    .also { INSTANCE = it }
            }
        }
    }
}

/**
 * v1 → v2: as fotos saem de dentro do JSON da coluna `rooms` (base64) e passam a
 * ser arquivos em `filesDir/photos`. O schema da tabela não muda.
 *
 * A coluna é lida em pedaços com substr() porque uma linha com várias fotos em
 * base64 não cabe no CursorWindow (2 MB) e quebraria uma leitura normal.
 */
class PhotosToFilesMigration(private val context: Context) : Migration(1, 2) {

    private val converters = Converters()
    private val MAX_ROW_CHARS = 1_500_000

    override fun migrate(db: SupportSQLiteDatabase) {
        val rows = mutableListOf<Pair<Long, Long>>()
        db.query("SELECT id, length(rooms) FROM vistorias").use { c ->
            while (c.moveToNext()) rows += c.getLong(0) to c.getLong(1)
        }
        for ((id, length) in rows) {
            try {
                val json = readInChunks(db, id, length)
                val rooms = converters.toRoomList(json)
                var migrated = rooms.map { room ->
                    room.copy(analyzing = false, photos = room.photos.map { PhotoStore.persisted(context, it) })
                }
                var out = converters.fromRoomList(migrated)
                if (out.length > MAX_ROW_CHARS) {
                    // Sobrou base64 que não pôde ser convertido em arquivo (imagem corrompida):
                    // sem remover, a linha continuaria grande demais e o app não abriria a lista.
                    Log.w("PhotosToFilesMigration", "Vistoria $id: removendo fotos ilegíveis que não couberam no banco")
                    migrated = migrated.map { room ->
                        room.copy(photos = room.photos.map { p -> if (p.dataUrl.isNotEmpty()) p.copy(dataUrl = "") else p })
                    }
                    out = converters.fromRoomList(migrated)
                }
                val values = ContentValues().apply { put("rooms", out) }
                db.update("vistorias", SQLiteDatabase.CONFLICT_NONE, values, "id = ?", arrayOf(id))
            } catch (e: Throwable) {
                Log.e("PhotosToFilesMigration", "Falha ao migrar vistoria $id", e)
            }
        }
    }

    private fun readInChunks(db: SupportSQLiteDatabase, id: Long, length: Long): String {
        val chunk = 400_000L
        val sb = StringBuilder(length.coerceAtMost(Int.MAX_VALUE.toLong()).toInt())
        var start = 1L
        while (start <= length) {
            db.query("SELECT substr(rooms, ?, ?) FROM vistorias WHERE id = ?", arrayOf<Any>(start, chunk, id)).use { c ->
                if (c.moveToFirst()) sb.append(c.getString(0) ?: "")
            }
            start += chunk
        }
        return sb.toString()
    }
}

/**
 * v2 → v3: tipo de vistoria, vínculo entrada/saída, medidores, chaves e assinaturas.
 * Os padrões das colunas precisam ser iguais aos @ColumnInfo(defaultValue) da entidade.
 */
object ExtrasMigration : Migration(2, 3) {
    override fun migrate(db: SupportSQLiteDatabase) {
        db.execSQL("ALTER TABLE vistorias ADD COLUMN tipoVistoria TEXT NOT NULL DEFAULT 'ENTRADA'")
        db.execSQL("ALTER TABLE vistorias ADD COLUMN linkedId INTEGER")
        db.execSQL("ALTER TABLE vistorias ADD COLUMN linkedRemoteId TEXT")
        db.execSQL("ALTER TABLE vistorias ADD COLUMN medidores TEXT NOT NULL DEFAULT '{}'")
        db.execSQL("ALTER TABLE vistorias ADD COLUMN medidoresEntrada TEXT")
        db.execSQL("ALTER TABLE vistorias ADD COLUMN chaves TEXT NOT NULL DEFAULT '[]'")
        db.execSQL("ALTER TABLE vistorias ADD COLUMN signatures TEXT NOT NULL DEFAULT '{}'")
    }
}
