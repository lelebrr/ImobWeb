import { create } from 'xmlbuilder2';
import { Property, PropertyPhoto } from '@prisma/client';

/**
 * Gerador de Catálogo para Meta (Facebook/Instagram Ads)
 * Formato específico para Real Estate Listings.
 */
export class MetaCatalogGenerator {
  /**
   * Gera o XML no formato Home Listing do Facebook
   */
  generateFeed(properties: (Property & { photos: PropertyPhoto[] })[]): string {
    const root = create({ version: '1.0', encoding: 'UTF-8' })
      .ele('listings');

    properties.forEach(property => {
      const listing = root.ele('listing');
      
      listing.ele('home_listing_id').txt(property.code || property.id);
      listing.ele('name').txt(property.title);
      listing.ele('description').txt(property.description || '');
      listing.ele('availability').txt(property.status === 'DISPONIVEL' ? 'for_sale' : 'discontinued');
      
      const addr = listing.ele('address', { format: 'simple' });
      addr.ele('component', { name: 'addr1' }).txt(property.address || '');
      addr.ele('component', { name: 'city' }).txt(property.city || '');
      addr.ele('component', { name: 'region' }).txt(property.state || '');
      addr.ele('component', { name: 'country' }).txt('Brazil');
      addr.ele('component', { name: 'postal_code' }).txt(property.cep || '');

      listing.ele('price').txt(`${property.price || property.priceRent} BRL`);
      
      if (property.photos && property.photos.length > 0) {
        const sorted = property.photos.sort((a, b) => a.order - b.order);
        listing.ele('image').ele('url').txt(sorted[0].url);
        
        // Fotos adicionais
        if (sorted.length > 1) {
          sorted.slice(1, 10).forEach(photo => {
            listing.ele('additional_image_link').ele('url').txt(photo.url);
          });
        }
      }

      listing.ele('url').txt(`https://imobiliaria.com.br/imovel/${property.code || property.id}`);
      listing.ele('num_bedrooms').txt((property.bedrooms || 0).toString());
      listing.ele('num_bathrooms').txt((property.bathrooms || 0).toString());
      listing.ele('num_units').txt('1');
      listing.ele('property_type').txt(property.type.toLowerCase());
      listing.ele('listing_type').txt(property.businessType === 'VENDA' ? 'for_sale' : 'for_rent');
    });

    return root.end({ prettyPrint: true });
  }
}

export const metaCatalogGenerator = new MetaCatalogGenerator();
