import { zapConfig } from '../portal-configs/zap';
import { vivaRealConfig } from '../portal-configs/vivareal';
import { olxConfig } from '../portal-configs/olx';
import { imovelwebConfig } from '../portal-configs/imovelweb';
import { PortalType } from '../../types/portals';

/**
 * Validador Unificado de Regras de Portais
 * Garante que cada imóvel atenda às exigências específicas do portal antes do envio.
 */
export class PortalValidator {
  validate(property: any, portalType: PortalType) {
    switch (portalType) {
      case 'ZAP':
        return this.validateZap(property);
      case 'VIVAREAL':
        return this.validateVivaReal(property);
      case 'OLX':
        return this.validateOLX(property);
      case 'IMOVELWEB':
        return this.validateImovelweb(property);
      default:
        return { valid: true, errors: [] };
    }
  }

  private validateZap(property: any) {
    const errors: string[] = [];
    if (!property.photos || property.photos.length < zapConfig.rules.minPhotos) {
      errors.push(`Zap exige no mínimo ${zapConfig.rules.minPhotos} fotos.`);
    }
    if (property.title?.length > zapConfig.rules.maxTitleLength) {
      errors.push(`Título muito longo para o Zap (Máx: ${zapConfig.rules.maxTitleLength} caracteres).`);
    }
    return { valid: errors.length === 0, errors };
  }

  private validateVivaReal(property: any) {
    const errors: string[] = [];
    if (!property.priceRent && property.businessType === 'LOCAÇÃO') {
      errors.push('Viva Real exige valor de aluguel para locações.');
    }
    return { valid: errors.length === 0, errors };
  }

  private validateOLX(property: any) {
    const errors: string[] = [];
    if (!property.city || !property.neighborhood) {
      errors.push('OLX exige cidade e bairro completos.');
    }
    return { valid: errors.length === 0, errors };
  }

  private validateImovelweb(property: any) {
    const errors: string[] = [];
    if (!property.description || property.description.length < 20) {
      errors.push('ImovelWeb exige uma descrição detalhada (min 20 caracteres).');
    }
    return { valid: errors.length === 0, errors };
  }
}

export const portalValidator = new PortalValidator();
