'use server';

import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Validates a signature token and returns session data
 */
export async function getSigningSession(token: string) {
  try {
    const party = await prisma.contractParty.findUnique({
      where: { signingToken: token },
      include: {
        contract: {
          include: {
            property: true,
            clauses: { orderBy: { order: 'asc' } }
          }
        }
      }
    });

    if (!party) return { error: 'Link de assinatura inválido ou expirado.' };
    if (party.status === 'signed') return { error: 'Este documento já foi assinado por você.' };

    return { party };
  } catch (error) {
    console.error('Error in getSigningSession:', error);
    return { error: 'Erro ao carregar sessão de assinatura.' };
  }
}

/**
 * Records the signature with biometric data
 */
export async function finalizeSignature(formData: FormData) {
  try {
    const token = formData.get('token') as string;
    const faceBase64 = formData.get('faceImage') as string;
    const signatureBase64 = formData.get('signatureImage') as string;
    const ipAddress = formData.get('ipAddress') as string;
    const userAgent = formData.get('userAgent') as string;

    if (!token) throw new Error('Token missing');

    const party = await prisma.contractParty.findUnique({
      where: { signingToken: token }
    });

    if (!party) throw new Error('Party not found');

    const supabase = await createClient();
    
    // Upload Biometric Face
    let biometricFaceUrl = null;
    if (faceBase64) {
      const faceBuffer = Buffer.from(faceBase64.replace(/^data:image\/\w+;base64,/, ""), 'base64');
      const { data: faceData, error: faceError } = await supabase.storage
        .from('signatures')
        .upload(`${party.id}/face_${Date.now()}.jpg`, faceBuffer, {
          contentType: 'image/jpeg',
          upsert: true
        });
      
      if (faceData) {
        const { data: { publicUrl } } = supabase.storage.from('signatures').getPublicUrl(faceData.path);
        biometricFaceUrl = publicUrl;
      }
    }

    // Upload Signature Image
    let signatureImageUrl = null;
    if (signatureBase64) {
      const signatureBuffer = Buffer.from(signatureBase64.replace(/^data:image\/\w+;base64,/, ""), 'base64');
      const { data: sigData, error: sigError } = await supabase.storage
        .from('signatures')
        .upload(`${party.id}/signature_${Date.now()}.png`, signatureBuffer, {
          contentType: 'image/png',
          upsert: true
        });

      if (sigData) {
        const { data: { publicUrl } } = supabase.storage.from('signatures').getPublicUrl(sigData.path);
        signatureImageUrl = publicUrl;
      }
    }

    // Update Party Status
    await prisma.contractParty.update({
      where: { id: party.id },
      data: {
        status: 'signed',
        signedAt: new Date(),
        biometricFaceUrl,
        signatureImageUrl,
        biometricVerified: !!biometricFaceUrl,
        ipAddress,
        userAgent
      }
    });

    // Check if all parties signed
    const remainingParties = await prisma.contractParty.count({
      where: {
        contractId: party.contractId,
        status: { not: 'signed' }
      }
    });

    if (remainingParties === 0) {
      await prisma.contract.update({
        where: { id: party.contractId },
        data: {
          status: 'signed',
          signedAt: new Date()
        }
      });
    }

    revalidatePath(`/sign/${token}`);
    return { success: true };

  } catch (error) {
    console.error('Error in finalizeSignature:', error);
    return { error: 'Erro ao processar assinatura digital.' };
  }
}

/**
 * Sends signature requests to all pending parties
 */
export async function notifySigners(contractId: string) {
  try {
    const parties = await prisma.contractParty.findMany({
      where: {
        contractId,
        status: 'pending'
      }
    });

    for (const party of parties) {
      const signingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/sign/${party.signingToken}`;
      
      // Here we would integrate with WhatsApp/Email services
      console.log(`Sending signature request to ${party.name} (${party.email}): ${signingUrl}`);
      
      await prisma.contractParty.update({
        where: { id: party.id },
        data: { status: 'sent' }
      });
    }

    return { success: true, count: parties.length };
  } catch (error) {
    console.error('Error in notifySigners:', error);
    return { error: 'Erro ao enviar solicitações.' };
  }
}
