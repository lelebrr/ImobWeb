import type { 
  SigningMethod, 
  SigningStatus, 
  SignatureRequest, 
  SigningResult,
  SigningProvider 
} from '@/types/contracts';

export class SigningService {
  private providers: Map<string, SigningProvider> = new Map();
  private activeRequests: Map<string, SignatureRequest> = new Map();

  registerProvider(provider: SigningProvider): void {
    this.providers.set(provider.id, provider);
  }

  getProvider(providerId: string): SigningProvider | undefined {
    return this.providers.get(providerId);
  }

  getActiveProviders(): SigningProvider[] {
    return Array.from(this.providers.values()).filter(p => p.enabled);
  }

  async sendForSignature(
    providerId: string,
    contractId: string,
    partyId: string,
    method: SigningMethod,
    documentUrl: string,
    signerEmail: string,
    signerName: string,
    expiresInDays: number = 30
  ): Promise<SigningResult> {
    const provider = this.providers.get(providerId);
    if (!provider) {
      return { success: false, requestId: '', error: 'Provedor não encontrado' };
    }

    const request: SignatureRequest = {
      id: `sig-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      contractId,
      partyId,
      method,
      status: 'sent',
      sentAt: new Date(),
      expiresAt: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000),
      signingUrl: ''
    };

    try {
      switch (provider.type) {
        case 'docusign':
          await this.sendViaDocuSign(provider, documentUrl, signerEmail, signerName, request);
          break;
        case 'clicksign':
          await this.sendViaClickSign(provider, documentUrl, signerEmail, signerName, request);
          break;
        case 'assine_bem':
          await this.sendViaAssineBem(provider, documentUrl, signerEmail, signerName, request);
          break;
        case 'autentique':
          await this.sendViaAutentique(provider, documentUrl, signerEmail, signerName, request);
          break;
        default:
          request.signingUrl = `${documentUrl}?sign=true&request=${request.id}`;
      }

      this.activeRequests.set(request.id, request);
      return {
        success: true,
        requestId: request.id,
        signingUrl: request.signingUrl
      };
    } catch (error) {
      return {
        success: false,
        requestId: request.id,
        error: error instanceof Error ? error.message : 'Erro ao enviar para assinatura'
      };
    }
  }

  private async sendViaDocuSign(
    provider: SigningProvider,
    documentUrl: string,
    email: string,
    name: string,
    request: SignatureRequest
  ): Promise<void> {
    const apiKey = provider.credentials['apiKey'];
    const accountId = provider.credentials['accountId'];
    
    console.log(`[DocuSign] Sending to ${email}, name: ${name}`);
    
    request.signingUrl = `https://app.docusign.net/Signing/StartInSession.aspx?t=${request.id}`;
  }

  private async sendViaClickSign(
    provider: SigningProvider,
    documentUrl: string,
    email: string,
    name: string,
    request: SignatureRequest
  ): Promise<void> {
    const apiKey = provider.credentials['apiKey'];
    
    console.log(`[ClickSign] Sending to ${email}, name: ${name}`);
    
    request.signingUrl = `https://app.clicksign.com/sign/${request.id}`;
  }

  private async sendViaAssineBem(
    provider: SigningProvider,
    documentUrl: string,
    email: string,
    name: string,
    request: SignatureRequest
  ): Promise<void> {
    const cnpj = provider.credentials['cnpj'];
    
    console.log(`[Assine Bem] Sending to ${email}, name: ${name}`);
    
    request.signingUrl = `https://www.assinebem.com.br/assinar/${request.id}`;
  }

  private async sendViaAutentique(
    provider: SigningProvider,
    documentUrl: string,
    email: string,
    name: string,
    request: SignatureRequest
  ): Promise<void> {
    const token = provider.credentials['token'];
    
    console.log(`[Autentique] Sending to ${email}, name: ${name}`);
    
    request.signingUrl = `https://autentique.com.br/sign/${request.id}`;
  }

  async getSignatureStatus(requestId: string): Promise<SigningStatus> {
    const request = this.activeRequests.get(requestId);
    if (!request) return 'pending';

    return request.status;
  }

  async updateSignatureStatus(requestId: string, status: SigningStatus): Promise<void> {
    const request = this.activeRequests.get(requestId);
    if (request) {
      request.status = status;
      if (status === 'signed') {
        request.signedAt = new Date();
      }
    }
  }

  getSignatureRequest(requestId: string): SignatureRequest | undefined {
    return this.activeRequests.get(requestId);
  }

  async sendReminder(requestId: string): Promise<boolean> {
    const request = this.activeRequests.get(requestId);
    if (!request) return false;

    console.log(`[Signing] Sending reminder for request ${requestId}`);
    return true;
  }

  async cancelSignature(requestId: string): Promise<boolean> {
    const request = this.activeRequests.get(requestId);
    if (!request) return false;

    request.status = 'expired';
    console.log(`[Signing] Cancelled request ${requestId}`);
    return true;
  }

  async signWithCertificate(
    contractId: string,
    partyId: string,
    certificateData: string
  ): Promise<SigningResult> {
    console.log(`[Certificate] Signing contract ${contractId} for party ${partyId}`);

    const request: SignatureRequest = {
      id: `sig-cert-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      contractId,
      partyId,
      method: 'certificate',
      status: 'signed',
      sentAt: new Date(),
      signedAt: new Date()
    };

    this.activeRequests.set(request.id, request);

    return {
      success: true,
      requestId: request.id
    };
  }

  async sendViaWhatsApp(
    contractId: string,
    partyId: string,
    phoneNumber: string,
    documentUrl: string,
    signerName: string
  ): Promise<SigningResult> {
    console.log(`[WhatsApp] Sending contract ${contractId} to ${phoneNumber}`);

    const request: SignatureRequest = {
      id: `sig-wa-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      contractId,
      partyId,
      method: 'whatsapp',
      status: 'sent',
      sentAt: new Date()
    };

    this.activeRequests.set(request.id, request);

    return {
      success: true,
      requestId: request.id,
      signingUrl: documentUrl
    };
  }

  async sendViaEmail(
    contractId: string,
    partyId: string,
    email: string,
    documentUrl: string,
    signerName: string,
    subject?: string
  ): Promise<SigningResult> {
    console.log(`[Email] Sending contract ${contractId} to ${email}`);

    const request: SignatureRequest = {
      id: `sig-email-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      contractId,
      partyId,
      method: 'email',
      status: 'sent',
      sentAt: new Date()
    };

    this.activeRequests.set(request.id, request);

    return {
      success: true,
      requestId: request.id,
      signingUrl: documentUrl
    };
  }

  getActiveRequests(contractId?: string): SignatureRequest[] {
    return Array.from(this.activeRequests.values()).filter(
      r => !contractId || r.contractId === contractId
    );
  }

  getPendingSignatures(contractId: string): SignatureRequest[] {
    return this.getActiveRequests(contractId).filter(
      r => r.status !== 'signed' && r.status !== 'rejected'
    );
  }
}

export const signingService = new SigningService();

export function initSigningProviders(): void {
  signingService.registerProvider({
    id: 'docusign',
    name: 'DocuSign',
    type: 'docusign',
    enabled: false,
    credentials: {}
  });

  signingService.registerProvider({
    id: 'clicksign',
    name: 'ClickSign',
    type: 'clicksign',
    enabled: true,
    credentials: { apiKey: '' }
  });

  signingService.registerProvider({
    id: 'assine_bem',
    name: 'Assine Bem',
    type: 'assine_bem',
    enabled: false,
    credentials: { cnpj: '' }
  });

  signingService.registerProvider({
    id: 'autentique',
    name: 'Autentique',
    type: 'autentique',
    enabled: false,
    credentials: { token: '' }
  });
}

initSigningProviders();
