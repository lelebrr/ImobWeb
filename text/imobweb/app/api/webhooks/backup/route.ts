import { NextRequest, NextResponse } from 'next/server'
import { backupAlertService } from '@/lib/backup/alert-service'
import { auditBackupTask } from '@/lib/audit-backup'

/**
 * Webhook de Status de Backup
 * Recebe notificações de serviços externos sobre o resultado de jobs de backup
 */

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    const { backupId, status, error, size, duration } = payload

    console.info(`[Webhook Backup] Recebido status para ${backupId}: ${status}`)

    // 1. Auditar o resultado recebido
    await auditBackupTask({
      id: backupId,
      status: status === 'completed' ? 'SUCCESS' : 'FAILED',
      size,
      duration,
      error,
      type: 'FULL'
    })

    // 2. Se falhar, disparar alertas imediatos
    if (status !== 'completed') {
      await backupAlertService.sendAlert({
        title: 'Falha em Backup Automatizado',
        message: `O backup ${backupId} falhou com o erro: ${error || 'Erro desconhecido'}`,
        severity: 'critical',
        metadata: { backupId, error }
      })
    } else {
        // Alerta info de sucesso para monitoramento
        await backupAlertService.sendAlert({
            title: 'Backup Concluído',
            message: `O backup ${backupId} foi finalizado com sucesso (${size} bytes).`,
            severity: 'info'
        })
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('[Webhook Backup] Erro ao processar payload:', err)
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }
}
