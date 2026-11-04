package com.imobweb.app.util

import org.junit.Assert.*
import org.junit.Test

class PhotoQualityTest {
    @Test
    fun `luminancia media do plano Y`() {
        val y = ByteArray(64 * 64) { 200.toByte() }
        assertEquals(200.0, PhotoQuality.meanLuma(y, 64, 64), 0.01)
    }

    @Test
    fun `imagem com bordas nitidas tem mais variancia que imagem lisa`() {
        val w = 64; val h = 64
        val flat = IntArray(w * h) { 128 }
        val sharp = IntArray(w * h) { i -> if ((i % w / 4 + i / w / 4) % 2 == 0) 20 else 230 }
        assertEquals(0.0, PhotoQuality.laplacianVariance(flat, w, h), 0.001)
        assertTrue(PhotoQuality.laplacianVariance(sharp, w, h) > PhotoQuality.BLUR)
    }

    @Test
    fun `classifica os problemas`() {
        assertEquals("Foto escura", PhotoQuality.Result(30.0, 500.0).issue()?.first)
        assertEquals("Luz estourada", PhotoQuality.Result(240.0, 500.0).issue()?.first)
        assertEquals("Foto tremida ou desfocada", PhotoQuality.Result(120.0, 10.0).issue()?.first)
        assertNull(PhotoQuality.Result(120.0, 300.0).issue())
    }
}
