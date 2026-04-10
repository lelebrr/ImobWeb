import { Locale } from './settings';

interface WhatsAppMessage {
  text: string;
  templateId?: string;
}

/**
 * Intelligent WhatsApp Flow Assistant.
 * Adapts messages and call-to-actions based on the user's culture and language.
 */
export class WhatsAppFlowAssistant {
  private locale: Locale;

  constructor(locale: Locale = 'pt-BR') {
    this.locale = locale;
  }

  /**
   * Generates a greeting based on time of day and locale.
   */
  getGreeting(): string {
    const hour = new Date().getHours();
    
    if (this.locale === 'pt-BR') {
      if (hour < 12) return 'Bom dia';
      if (hour < 18) return 'Boa tarde';
      return 'Boa noite';
    }

    if (this.locale === 'es-ES' || this.locale === 'es-LA') {
      if (hour < 12) return 'Buenos días';
      if (hour < 20) return 'Buenas tardes';
      return 'Buenas noches';
    }

    // Default English
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  /**
   * Formats a message for a lead follow-up.
   */
  getLeadFollowUp(clientName: string, propertyTitle: string): string {
    const greeting = this.getGreeting();
    
    const templates: Record<string, string> = {
      'pt-BR': `${greeting}, ${clientName}! Vi seu interesse no imóvel ${propertyTitle}. Gostaria de agendar uma visita?`,
      'en-US': `${greeting}, ${clientName}! I saw your interest in the property ${propertyTitle}. Would you like to schedule a viewing?`,
      'es-LA': `${greeting}, ${clientName}. Vi su interés en la propiedad ${propertyTitle}. ¿Le gustaría programar una visita?`
    };

    return templates[this.locale] || templates['en-US'];
  }

  /**
   * Generates a link for WhatsApp with the pre-filled message.
   */
  getWhatsAppUrl(phone: string, message: string): string {
    const cleanedPhone = phone.replace(/\D/g, '');
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${cleanedPhone}?text=${encodedMessage}`;
  }
}
