import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the user to find their organization
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { organization: true }
    })

    if (!user?.organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Return the integrations part of the settings
    const settings = user.organization.settings as any
    const integrations = settings?.integrations || {}

    return NextResponse.json({ integrations })
  } catch (err) {
    console.error('[Integrations API] GET error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { integrationId, status, settings: integrationSettings } = await req.json()

    if (!integrationId) {
      return NextResponse.json({ error: 'Integration ID is required' }, { status: 400 })
    }

    // Get the user to find their organization
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user?.organizationId) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Fetch current settings
    const organization = await prisma.organization.findUnique({
      where: { id: user.organizationId },
      select: { settings: true }
    })

    const currentSettings = (organization?.settings as any) || {}
    const currentIntegrations = currentSettings.integrations || {}

    // Update the specific integration
    const updatedIntegrations = {
      ...currentIntegrations,
      [integrationId]: {
        ...(currentIntegrations[integrationId] || {}),
        status,
        ...(integrationSettings ? { config: integrationSettings } : {})
      }
    }

    // Save back to organization
    await prisma.organization.update({
      where: { id: user.organizationId },
      data: {
        settings: {
          ...currentSettings,
          integrations: updatedIntegrations
        }
      }
    })

    return NextResponse.json({ success: true, integrations: updatedIntegrations })
  } catch (err) {
    console.error('[Integrations API] POST error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
