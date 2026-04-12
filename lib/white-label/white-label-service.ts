import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * SERVIÇO DE WHITE LABEL EXTREMO - imobWeb 2026
 * Foco: Total invisibilidade, domínios customizados e infraestrutura de e-mail própria.
 */

export interface WhiteLabelConfig {
  tenantId: string;
  customDomain: string | null;
  brandName: string;
  brandSlogan?: string;
  logoUrl: string | null;
  logoDarkUrl?: string | null;
  faviconUrl: string | null;
  supportEmail: string | null;
  supportPhone?: string | null;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  emailConfig: {
    fromName: string;
    fromEmail: string;
    replyTo?: string;
    smtpHost?: string;
    useCustomSmtp: boolean;
  };
  removeImobWebBranding: boolean;
  customCss?: string;
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    linkedin?: string;
  };
}

/**
 * Resolve a configuração de White Label baseada no Host da requisição.
 * Em 2026, usamos um padrão de "Edge-First" com cache em camadas.
 */
export async function resolveWhiteLabelConfig(hostname: string): Promise<WhiteLabelConfig | null> {
  try {
    // 1. Tentar encontrar a organização por domínio customizado ou subdomínio
    // Nota: Em um ambiente real de 2026, o Hostname chegaria via middleware já validado.
    const organization = await prisma.organization.findFirst({
      where: {
        OR: [
          { settings: { path: ["customDomain"], equals: hostname } },
          { subDomain: hostname.split('.')[0] }
        ]
      }
    });

    if (!organization) return null;

    const settings = (organization.settings as any) || {};
    const whitelabel = settings.whiteLabel || {};

    return {
      tenantId: organization.id,
      customDomain: settings.customDomain || null,
      brandName: whitelabel.brandName || organization.name,
      brandSlogan: whitelabel.brandSlogan || "",
      logoUrl: organization.logo || null,
      logoDarkUrl: whitelabel.logoDarkUrl || null,
      faviconUrl: whitelabel.faviconUrl || null,
      supportEmail: whitelabel.supportEmail || organization.email || null,
      supportPhone: whitelabel.supportPhone || organization.phone || null,
      colors: {
        primary: organization.primaryColor || "#3b82f6",
        secondary: organization.secondaryColor || "#1e293b",
        accent: whitelabel.accentColor || "#f59e0b",
      },
      emailConfig: {
        fromName: whitelabel.emailFromName || whitelabel.brandName || organization.name,
        fromEmail: whitelabel.emailFromAddress || `noreply@${hostname}`,
        useCustomSmtp: whitelabel.useCustomSmtp || false,
        smtpHost: whitelabel.smtpHost || "",
      },
      removeImobWebBranding: whitelabel.active || false,
      customCss: whitelabel.customCss || "",
      socialLinks: whitelabel.socialLinks || {},
    };
  } catch (error) {
    console.error(`[WHITE_LABEL_RESOLVE_ERROR] Host: ${hostname}`, error);
    return null;
  }
}

/**
 * Motor de Mascaramento Dinâmico.
 * Garante que qualquer menção à plataforma original seja substituída pela marca do parceiro.
 */
export function maskBranding(content: string, config: WhiteLabelConfig): string {
  if (!config.removeImobWebBranding) return content;
  
  // Lista de termos a serem protegidos/substituídos
  const replacements: Record<string, string> = {
    "imobWeb": config.brandName,
    "imobweb.com.br": config.customDomain || `${config.brandName.toLowerCase()}.com.br`,
    "Equipe imobWeb": `Equipe ${config.brandName}`,
    "Suporte imobWeb": `Suporte ${config.brandName}`,
  };

  let maskedContent = content;
  for (const [key, value] of Object.entries(replacements)) {
    const regex = new RegExp(key, "gi");
    maskedContent = maskedContent.replace(regex, value);
  }

  return maskedContent;
}

/**
 * Validação Avançada de Mapeamento de Domínio (CNAME / SSL).
 * Integração com APIs de infraestrutura edge (ex: Vercel/Cloudflare).
 */
export async function validateDomainMapping(domain: string): Promise<{ valid: boolean; status: 'pending' | 'active' | 'error'; error?: string }> {
  console.log(`[DNS_VALIDATION] Verificando propagação para: ${domain}`);
  
  // Mock de Verificação de Registro CNAME ou Registro A
  // Em 2026, isso consultaria o status do certificado SSL gerenciado automaticamente.
  
  return { 
    valid: true, 
    status: 'active' 
  };
}

/**
 * Helper para gerar credenciais SMTP dinâmicas baseadas no Tenant.
 */
export function getMailTransporterConfig(config: WhiteLabelConfig) {
  if (config.emailConfig.useCustomSmtp && config.emailConfig.smtpHost) {
    return {
      host: config.emailConfig.smtpHost,
      from: `"${config.emailConfig.fromName}" <${config.emailConfig.fromEmail}>`,
    };
  }
  
  // Fallback para o serviço SMTP padrão da plataforma, mas com o "From" mascarado
  return {
    host: process.env.DEFAULT_SMTP_HOST,
    from: `"${config.emailConfig.fromName}" <${config.emailConfig.fromEmail}>`,
  };
}
