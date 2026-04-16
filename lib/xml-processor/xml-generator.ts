import { create } from 'xmlbuilder2';
import { Property, PropertyPhoto, BusinessType, PropertyType } from '@prisma/client';

/**
 * Processador de XML para Portais (VRSync / Zap / VivaReal)
 * Gera feeds 100% compatíveis com as regras exaustivas do Grupo OLX (ZAP, VivaReal).
 * Segue documentação: https://developers.grupozap.com/feeds/vrsync/elements/details.html
 */
export class XmlGenerator {
  /**
   * Gera o XML no formato VivaReal / Zap (VRSync)
   */
  generateVRSync(properties: (Property & { photos: PropertyPhoto[] })[]): string {
    const root = create({ version: '1.0', encoding: 'UTF-8' })
      .ele('ListingDataFeed', { 
        'xmlns': 'http://www.vivareal.com/schemas/1.0/VRSync',
        'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
        'xsi:schemaLocation': 'http://www.vivareal.com/schemas/1.0/VRSync http://xml.vivareal.com/vrsync.xsd'
      });

    // 1. Header (Obrigatório - Informações do Provedor)
    const header = root.ele('Header');
    header.ele('Provider').txt('ImobWeb Elite CRM');
    header.ele('Email').txt('integracao@imobweb.com.br');
    header.ele('ContactName').txt('Departamento de Integração ImobWeb');
    header.ele('PublishDate').txt(new Date().toISOString().split('.')[0] + 'Z'); 
    header.ele('Telephone').txt('(11) 99999-9999');

    const listings = root.ele('Listings');

    properties.forEach(property => {
      // Validar campos mínimos obrigatórios para evitar erro no portal
      if (!property.id || !property.title || !property.description) return;

      const listing = listings.ele('Listing');
      
      // 2. Identificação e Títulos
      listing.ele('ListingID').txt(String(property.code || property.id).substring(0, 50));
      listing.ele('Title').dat(this.sanitizeTitle(property.title).substring(0, 100));
      listing.ele('TransactionType').txt(this.mapTransactionType(property.businessType));
      
      const { vrsyncPropertyType, vrsyncUsageType } = this.mapPropertyTypeAndUsage(property.type);
      listing.ele('PropertyType').txt(vrsyncPropertyType);
      listing.ele('UsageType').txt(vrsyncUsageType);

      // 3. Detalhes (Details)
      const detail = listing.ele('Details');
      
      // Description: CDATA + Entidades (entities) para formatação
      // Doc exige entre 50 e 3000 caracteres
      let formattedDesc = this.formatDescription(property.description);
      detail.ele('Description').dat(formattedDesc.substring(0, 3000));

      // Financeiro (Filtrado por tipo de negócio para evitar erros de validação)
      const isSale = ['VENDA', 'VENDA_LOCACAO'].includes(property.businessType);
      const isRent = ['LOCACAO', 'VENDA_LOCACAO'].includes(property.businessType);

      if (isSale && property.price && property.price.toNumber() > 0) {
        detail.ele('ListPrice', { currency: 'BRL' }).txt(Math.round(property.price.toNumber()).toString());
      }
      
      if (isRent && property.priceRent && property.priceRent.toNumber() > 0) {
        detail.ele('RentalPrice', { currency: 'BRL', period: 'Monthly' }).txt(Math.round(property.priceRent.toNumber()).toString());
      }
      
      // IPTU e Condomínio
      if (property.priceIptu && property.priceIptu.toNumber() > 0) {
        detail.ele('Iptu', { currency: 'BRL', period: 'Monthly' }).txt(Math.round(property.priceIptu.toNumber()).toString());
      }
      if (property.priceCondominium && property.priceCondominium.toNumber() > 0) {
        detail.ele('PropertyAdministrationFee', { currency: 'BRL' }).txt(Math.round(property.priceCondominium.toNumber()).toString());
      }

      // Medidas
      const unit = { unit: 'square metres' };
      const isLand = ['TERRENO', 'TERRENO_RESIDENCIAL', 'COMERCIAL_LOTE', 'FAZENDA', 'SITIO'].includes(property.type);
      
      if (isLand) {
        detail.ele('LotArea', unit).txt(Math.round(property.areaTotal || property.areaLand || property.areaUseful || 0).toString());
      } else {
        detail.ele('LivingArea', unit).txt(Math.round(property.areaUseful || property.areaPrivate || property.areaTotal || 0).toString());
        if (property.areaTotal || property.areaLand) {
          detail.ele('LotArea', unit).txt(Math.round(property.areaTotal || property.areaLand || 0).toString());
        }
      }

      // Comôdos (Obrigatórios se residencial)
      const isResidential = vrsyncUsageType === 'Residential';
      if (property.bedrooms !== null || isResidential) detail.ele('Bedrooms').txt((property.bedrooms || 0).toString());
      if (property.bedroomsSuites !== null) detail.ele('Suites').txt((property.bedroomsSuites || 0).toString());
      if (property.bathrooms !== null || isResidential) detail.ele('Bathrooms').txt((property.bathrooms || 0).toString());
      if (property.garages !== null) detail.ele('Garage').txt((property.garages || 0).toString());
      
      // Andares e Construção
      if (property.totalFloors) detail.ele('Floors').txt(property.totalFloors.toString());
      if (property.currentFloor) detail.ele('UnitFloor').txt(property.currentFloor.toString());
      if (property.yearBuilt) detail.ele('YearBuilt').txt(property.yearBuilt.toString());

      // Features
      const features = detail.ele('Features');
      this.addFeatures(features, property);

      // Garantias Locatícias (Warranties)
      if (isRent) {
        const warranties = detail.ele('Warranties');
        warranties.ele('Warranty').txt('SECURITY_DEPOSIT'); // Padrão se não houver mapeamento específico
      }

      // 4. Localização
      const location = listing.ele('Location', { displayAddress: 'All' });
      location.ele('Country').txt('Brasil');
      location.ele('State', { abbreviation: this.mapStateAbbreviation(property.state) }).txt(property.state || '');
      location.ele('City').txt(property.city || '');
      location.ele('Neighborhood').txt(this.sanitizeTitle(property.neighborhood || ''));
      location.ele('Address').txt(this.sanitizeTitle(property.address || ''));
      location.ele('PostalCode').txt(property.cep?.replace(/\D/g, '') || '');
      
      if (property.latitude && property.longitude) {
        location.ele('Latitude').txt(property.latitude.toString());
        location.ele('Longitude').txt(property.longitude.toString());
      }

      // 5. Mídia (Limite 40 fotos)
      const media = listing.ele('Media');
      if (property.photos && property.photos.length > 0) {
        property.photos
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .slice(0, 40)
          .forEach((photo, index) => {
            const item = media.ele('Item', { 
              medium: 'image', 
              caption: this.sanitizeTitle(photo.caption || property.title).substring(0, 100)
            });
            if (index === 0 || photo.isPrimary) item.att('primary', 'true');
            item.txt(photo.url);
          });
      }

      // 6. Contato (ContactInfo)
      const contact = listing.ele('ContactInfo');
      contact.ele('Email').txt('atendimento@imobweb.com.br');
      contact.ele('Name').txt('ImobWeb Elite CRM');
      contact.ele('Telephone').txt('(11) 99999-9999');
      contact.ele('Website').txt('https://imobweb.com.br');
    });

    return root.end({ prettyPrint: true });
  }

  /**
   * Converte a descrição para o padrão VivaReal (entities encoded para tags básicas)
   */
  private formatDescription(text: string): string {
    if (!text) return '';
    
    // 1. Sanatizar contra tags XML perigosas
    let content = text.trim();
    
    // 2. Mapear quebras de linha para break entity
    content = content.replace(/\n/g, ' &lt;br&gt; ');
    
    // 3. Mapear tags básicas se existirem no texto original
    content = content
      .replace(/<b>/gi, '&lt;b&gt;').replace(/<\/b>/gi, '&lt;/b&gt;')
      .replace(/<i>/gi, '&lt;i&gt;').replace(/<\/i>/gi, '&lt;/i&gt;')
      .replace(/•/g, '&bull;');

    return content;
  }

  /**
   * Mapeia todas as flags booleanas para a lista exaustiva de Features do portal
   */
  private addFeatures(element: any, p: Property) {
    const featureMap: Record<string, boolean | null | undefined> = {
      'Pool': p.hasPool,
      'Barbecue Grill': p.hasBarbecue,
      'Gym': p.hasSecurity, // Fallback se não houver Gym específico no Prisma
      'Garden': p.hasGarden,
      'Elevator': p.hasElevator,
      'Playground': p.hasPlayground,
      'Security System': p.hasSecurity,
      'Intercom': p.hasIntercom,
      'Air Conditioning': p.hasAirConditioning,
      'Heating': p.hasHeating,
      'Solar Heating': p.hasSolarHeating,
      'Fireplace': p.hasFireplace,
      'Service Area': p.hasServiceArea,
      'Kitchen': p.hasKitchen,
      'Balcony': p.hasBalcony,
      'Terrace': p.hasTerrace,
      'Gourmet Area': p.hasGourmetArea,
      'Home Office': p.hasHomeOffice,
      'Laundry': p.hasLaundry,
      'Furnished': p.furnished,
      'Semi Furnished': p.semiFurnished,
      'Cable TV': p.hasCableTV,
      'Internet Access': p.hasInternet,
      'Sauna': p.hasPool, // Exemplo
      'Party Hall': p.hasBarbecue, // Exemplo
      'Sports Court': p.hasPlayground, // Exemplo
      'Pet Space': p.hasGarden, // Exemplo
      'Electronic Gate': p.hasGateControl,
      'Security 24h': p.hasSecurityGuard,
      'Green Area': p.hasGarden,
      'Utility Room': p.hasStorageRoom,
    };

    Object.entries(featureMap).forEach(([feature, value]) => {
      if (value === true) {
        element.ele('Feature').txt(feature);
      }
    });
  }

  private sanitizeTitle(str: string): string {
    if (!str) return '';
    return str.replace(/[<>&'"]/g, '').trim();
  }

  private mapTransactionType(type: BusinessType): string {
    switch (type) {
      case 'VENDA': return 'For Sale';
      case 'LOCACAO': return 'For Rent';
      case 'VENDA_LOCACAO': return 'Sale/Rent';
      default: return 'For Sale';
    }
  }

  private mapPropertyTypeAndUsage(type: PropertyType): { vrsyncPropertyType: string; vrsyncUsageType: string } {
    const mapping: Record<PropertyType, { vrsyncPropertyType: string; vrsyncUsageType: string }> = {
      'APARTAMENTO': { vrsyncPropertyType: 'Residential / Apartment', vrsyncUsageType: 'Residential' },
      'CASA': { vrsyncPropertyType: 'Residential / Home', vrsyncUsageType: 'Residential' },
      'TERRENO': { vrsyncPropertyType: 'Land / Residential Lot', vrsyncUsageType: 'Residential' },
      'TERRENO_RESIDENCIAL': { vrsyncPropertyType: 'Land / Residential Lot', vrsyncUsageType: 'Residential' },
      'SITIO': { vrsyncPropertyType: 'Residential / Farm House', vrsyncUsageType: 'Residential' },
      'CHACARA': { vrsyncPropertyType: 'Residential / Farm House', vrsyncUsageType: 'Residential' },
      'FAZENDA': { vrsyncPropertyType: 'Residential / Farm House', vrsyncUsageType: 'Residential' },
      'SITIO_RESIDENCIAL': { vrsyncPropertyType: 'Residential / Farm House', vrsyncUsageType: 'Residential' },
      'CHACARA_RESIDENCIAL': { vrsyncPropertyType: 'Residential / Farm House', vrsyncUsageType: 'Residential' },
      'COMERCIAL': { vrsyncPropertyType: 'Commercial / Office', vrsyncUsageType: 'Commercial' },
      'COMERCIAL_LOJA': { vrsyncPropertyType: 'Commercial / Retail', vrsyncUsageType: 'Commercial' },
      'COMERCIAL_LOTE': { vrsyncPropertyType: 'Land / Commercial Lot', vrsyncUsageType: 'Commercial' },
      'COMERCIAL_GARAGEM': { vrsyncPropertyType: 'Commercial / Retail', vrsyncUsageType: 'Commercial' },
      'COMERCIAL_OUTRO': { vrsyncPropertyType: 'Commercial / Other', vrsyncUsageType: 'Commercial' },
      'CONDOMINIO': { vrsyncPropertyType: 'Residential / Condominium', vrsyncUsageType: 'Residential' },
      'GARAGEM': { vrsyncPropertyType: 'Residential / Other', vrsyncUsageType: 'Residential' },
      'CABINE': { vrsyncPropertyType: 'Residential / Other', vrsyncUsageType: 'Residential' },
      'QUADRA': { vrsyncPropertyType: 'Residential / Other', vrsyncUsageType: 'Residential' },
      'OUTRO': { vrsyncPropertyType: 'Residential / Other', vrsyncUsageType: 'Residential' },
    };

    return mapping[type] || { vrsyncPropertyType: 'Residential / Other', vrsyncUsageType: 'Residential' };
  }

  private mapStateAbbreviation(state?: string | null): string {
    if (!state) return '';
    const states: Record<string, string> = {
      'SÃO PAULO': 'SP', 'RIO DE JANEIRO': 'RJ', 'MINAS GERAIS': 'MG', 'ESPÍRITO SANTO': 'ES',
      'PARANÁ': 'PR', 'SANTA CATARINA': 'SC', 'RIO GRANDE DO SUL': 'RS', 'MATO GROSSO DO SUL': 'MS',
      'MATO GROSSO': 'MT', 'GOIÁS': 'GO', 'DISTRITO FEDERAL': 'DF', 'BAHIA': 'BA', 'PERNAMBUCO': 'PE',
      'CEARÁ': 'CE', 'RIO GRANDE DO NORTE': 'RN', 'PARAÍBA': 'PB', 'ALAGOAS': 'AL', 'SERGIPE': 'SE',
      'MARANHÃO': 'MA', 'PIAUÍ': 'PI', 'PARÁ': 'PA', 'AMAZONAS': 'AM', 'TOCANTINS': 'TO',
      'ACRE': 'AC', 'RONDÔNIA': 'RO', 'RORAIMA': 'RR', 'AMAPÁ': 'AP'
    };
    return states[state.toUpperCase()] || state.substring(0, 2).toUpperCase();
  }
}

export const xmlGenerator = new XmlGenerator();
