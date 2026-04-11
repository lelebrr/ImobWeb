import { create } from 'xmlbuilder2';
import { Property, PropertyPhoto } from '@prisma/client';

/**
 * Processador de XML para Portais (VRSync / Zap / VivaReal)
 * Gera feeds compatíveis com os maiores portais do Brasil.
 */
export class XmlGenerator {
  /**
   * Gera o XML no formato VivaReal / Zap (VRSync)
   */
  generateVRSync(properties: (Property & { photos: PropertyPhoto[] })[]): string {
    const root = create({ version: '1.0', encoding: 'UTF-8' })
      .ele('ListingDataFeed', { 
        'xmlns': 'http://www.viva-real.com/schemas/1.0/VRSync',
        'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance'
      });

    const header = root.ele('Header');
    header.ele('Provider').txt('imobWeb CRM');
    header.ele('Email').txt('integracao@imobweb.com.br');
    header.ele('ContactName').txt('Suporte imobWeb');
    header.ele('PublishDate').txt(new Date().toISOString());

    const listings = root.ele('Listings');

    properties.forEach(property => {
      const listing = listings.ele('Listing');
      
      listing.ele('ListingID').txt(property.code || property.id);
      listing.ele('Title').txt(property.title);
      listing.ele('TransactionType').txt(property.businessType === 'VENDA' ? 'For Sale' : 'For Rent');
      listing.ele('PropertyType').txt(this.mapPropertyType(property.type));
      
      const detail = listing.ele('Details');
      if (property.description) detail.ele('Description').txt(property.description);
      if (property.price) detail.ele('ListPrice', { currency: 'BRL' }).txt(property.price.toString());
      if (property.priceRent) detail.ele('RentalPrice', { currency: 'BRL' }).txt(property.priceRent.toString());
      if (property.areaPrivate) detail.ele('LivingArea', { unit: 'square meters' }).txt(property.areaPrivate.toString());
      if (property.bedrooms) detail.ele('Bedrooms').txt(property.bedrooms.toString());
      if (property.bathrooms) detail.ele('Bathrooms').txt(property.bathrooms.toString());
      if (property.garages) detail.ele('Garage', { type: 'Parking Space' }).txt(property.garages.toString());

      const location = listing.ele('Location', { displayAddress: 'All' });
      location.ele('Country').txt('Brasil');
      if (property.state) location.ele('State').txt(property.state);
      if (property.city) location.ele('City').txt(property.city);
      if (property.neighborhood) location.ele('Neighborhood').txt(property.neighborhood);
      if (property.address) location.ele('Address').txt(property.address);
      if (property.cep) location.ele('PostalCode').txt(property.cep);

      const media = listing.ele('Media');
      property.photos.sort((a, b) => a.order - b.order).forEach(photo => {
        media.ele('Item', { medium: 'image', caption: photo.caption || '' }).txt(photo.url);
      });

      const contact = listing.ele('ContactInfo');
      contact.ele('Email').txt('comercial@imobiliaria.com.br'); // Idealmente via Organization
      contact.ele('Name').txt('Setor de Vendas');
    });

    return root.end({ prettyPrint: true });
  }

  /**
   * Mapeia tipos internos do imobWeb para padrões de portais
   */
  private mapPropertyType(type: string): string {
    const mapping: Record<string, string> = {
      'APARTAMENTO': 'Residential / Apartment',
      'CASA': 'Residential / Home',
      'TERRENO': 'Land / Residential Lot',
      'COMERCIAL': 'Commercial / Office',
      'CHACARA': 'Residential / Farm House',
      'SITIO': 'Residential / Farm House',
      'FAZENDA': 'Residential / Farm House',
    };
    return mapping[type] || 'Residential / Other';
  }
}

export const xmlGenerator = new XmlGenerator();
