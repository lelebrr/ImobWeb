import { NextRequest, NextResponse } from 'next/server'
import { backupEngine } from '@/lib/backup/backup-engine'

export const dynamic = 'force-dynamic'

/**
 * Endpoint para Trigger de Backup Manual ou via CRON externo
 * Segurança: Requer autenticação de sistema (Service Role)
 */

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    // Verificação de token de segurança (ex: do GitHub Actions ou Vercel Cron)
    if (authHeader !== `Bearer ${process.env.BACKUP_CRON_SECRET}`) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Executa backup em background
    const result = await backupEngine.runFullBackup()

    return NextResponse.json({
      status: 'success',
      backupId: result.backupId,
      duration: `${result.duration}ms`
    })
  } catch (error) {
    console.error('[API Backup] Erro ao executar trigger:', error)
    return NextResponse.json({ 
      status: 'error', 
      message: error instanceof Error ? error.message : 'Internal Server Error' 
    }, { status: 500 })
  }
}
