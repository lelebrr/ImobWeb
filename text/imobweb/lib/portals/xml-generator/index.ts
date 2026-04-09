import type { PortalId, PortalFieldMapping, PropertyStatus } from '@/types/portals';

export interface PropertyData {
  id?: string;
  title: string;
  description: string;
  price: number;
  transactionType: 'sale' | 'rent';
  propertyType: 'apartment' | 'house' | 'commercial' | 'land' | 'industrial';
  address: {
    street: string;
    number?: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode?: string;
  };
  features?: {
    bedrooms?: number;
    bathrooms?: number;
    parkingSpaces?: number;
    area?: number;
    totalArea?: number;
    builtArea?: number;
    floor?: string;
    age?: number;
  };
  photos: string[];
  videos?: string[];
  owner?: {
    name: string;
    phone?: string;
    email?: string;
  };
  status: PropertyStatus;
  highlightPackage?: string;
  observations?: string;
}

export class XmlGenerator {
  generate(property: PropertyData, portalId: PortalId): string {
    switch (portalId) {
      case 'zap':
        return this.generateZapXml(property);
      case 'viva':
        return this.generateVivaXml(property);
      case 'olx':
        return this.generateOlxXml(property);
      case 'imovelweb':
        return this.generateImovelWebXml(property);
      case 'chaves':
        return this.generateChavesXml(property);
      default:
        throw new Error(`Unsupported portal: ${portalId}`);
    }
  }

  private generateZapXml(property: PropertyData): string {
    const xml = this.createXmlDeclaration();
    const tipoImovel = this.mapPropertyType(property.propertyType, 'zap');
    const tipoNegocio = property.transactionType === 'sale' ? 'Venda' : 'Locação';

    const xmlContent = `<Imoveis>
  <Imovel>
    <CodigoImovel>${this.escapeXml(property.id || '')}</CodigoImovel>
    <TipoImovel>${tipoImovel}</TipoImovel>
    <TipoNegocio>${tipoNegocio}</TipoNegocio>
    <Titulo>${this.escapeXml(property.title)}</Titulo>
    <Descricao>${this.escapeXml(property.description)}</Descricao>
    <Valor>${property.price}</Valor>
    <Endereco>
      <Logradouro>${this.escapeXml(property.address.street)}</Logradouro>
      <Numero>${this.escapeXml(property.address.number || '')}</Numero>
      <Complemento>${this.escapeXml(property.address.complement || '')}</Complemento>
      <Bairro>${this.escapeXml(property.address.neighborhood)}</Bairro>
      <Cidade>${this.escapeXml(property.address.city)}</Cidade>
      <Estado>${property.address.state}</Estado>
      <CEP>${this.escapeXml(property.address.zipCode || '')}</CEP>
    </Endereco>
    <Caracteristicas>
      <AreaTotal>${property.features?.area || ''}</AreaTotal>
      <AreaUtil>${property.features?.builtArea || property.features?.area || ''}</AreaUtil>
      <Quartos>${property.features?.bedrooms || ''}</Quartos>
      <Banheiros>${property.features?.bathrooms || ''}</Banheiros>
      <Vagas>${property.features?.parkingSpaces || ''}</Vagas>
      <Pavimento>${this.escapeXml(property.features?.floor || '')}</Pavimento>
      <AnoConstrucao>${property.features?.age ? new Date().getFullYear() - property.features.age : ''}</AnoConstrucao>
    </Caracteristicas>
    <Fotos>${property.photos.map((url, i) => `
      <Foto>
        <Ordem>${i + 1}</Ordem>
        <URL>${this.escapeXml(url)}</URL>
      </Foto>`).join('')}
    </Fotos>
    ${property.videos ? `<Videos>${property.videos.map(v => `
      <Video>
        <URL>${this.escapeXml(v)}</URL>
      </Video>`).join('')}
    </Videos>` : ''}
    <Contato>
      <Nome>${this.escapeXml(property.owner?.name || '')}</Nome>
      <Telefone>${this.escapeXml(property.owner?.phone || '')}</Telefone>
      <Email>${this.escapeXml(property.owner?.email || '')}</Email>
    </Contato>
    ${property.highlightPackage ? `<Destaque>
      <Tipo>${property.highlightPackage}</Tipo>
    </Destaque>` : ''}
  </Imovel>
</Imoveis>`;

    return xml + xmlContent;
  }

  private generateVivaXml(property: PropertyData): string {
    const xml = this.createXmlDeclaration();
    const tipoImovel = this.mapPropertyType(property.propertyType, 'viva');
    const tipoNegocio = property.transactionType === 'sale' ? 'Venda' : 'Locação';

    const xmlContent = `<RealEstateListing>
  <ListingID>${this.escapeXml(property.id || '')}</ListingID>
  <TransactionType>${tipoNegocio}</TransactionType>
  <PropertyType>${tipoImovel}</PropertyType>
  <Title>${this.escapeXml(property.title)}</Title>
  <Description>${this.escapeXml(property.description)}</Description>
  <Price currency="BRL">${property.price}</Price>
  <Address>
    <Street>${this.escapeXml(property.address.street)}</Street>
    <StreetNumber>${this.escapeXml(property.address.number || '')}</StreetNumber>
    <Complement>${this.escapeXml(property.address.complement || '')}</Complement>
    <District>${this.escapeXml(property.address.neighborhood)}</District>
    <City>${this.escapeXml(property.address.city)}</City>
    <State>${property.address.state}</State>
    <ZipCode>${this.escapeXml(property.address.zipCode || '')}</ZipCode>
  </Address>
  <Details>
    <TotalArea unit="m2">${property.features?.area || ''}</TotalArea>
    <UsefulArea unit="m2">${property.features?.builtArea || ''}</UsefulArea>
    <Bedrooms>${property.features?.bedrooms || ''}</Bedrooms>
    <Bathrooms>${property.features?.bathrooms || ''}</Bathrooms>
    <ParkingSpaces>${property.features?.parkingSpaces || ''}</ParkingSpaces>
    <Floor>${this.escapeXml(property.features?.floor || '')}</Floor>
    <ConstructionYear>${property.features?.age ? new Date().getFullYear() - property.features.age : ''}</ConstructionYear>
  </Details>
  <Media>
    ${property.photos.map((url, i) => `<Image>
      <Order>${i + 1}</Order>
      <URL>${this.escapeXml(url)}</URL>
    </Image>`).join('')}
  </Media>
  <Contact>
    <Name>${this.escapeXml(property.owner?.name || '')}</Name>
    <Phone>${this.escapeXml(property.owner?.phone || '')}</Phone>
    <Email>${this.escapeXml(property.owner?.email || '')}</Email>
  </Contact>
</RealEstateListing>`;

    return xml + xmlContent;
  }

  private generateOlxXml(property: PropertyData): string {
    const xml = this.createXmlDeclaration();
    const category = property.transactionType === 'sale' ? 'imoveis-venda' : 'imoveis-aluguel';

    const xmlContent = `<ads>
  <ad>
    <id>${this.escapeXml(property.id || '')}</id>
    <category>${category}</category>
    <title>${this.escapeXml(property.title)}</title>
    <description>${this.escapeXml(property.description)}</description>
    <price>${property.price}</price>
    <currency>BRL</currency>
    <location>
      <city>${this.escapeXml(property.address.city)}</city>
      <region>${property.address.state}</region>
      <neighborhood>${this.escapeXml(property.address.neighborhood)}</neighborhood>
    </location>
    ${property.features?.bedrooms ? `<attributes>
        <attr name="bedrooms">${property.features.bedrooms}</attr>
        <attr name="bathrooms">${property.features.bathrooms || ''}</attr>
        <attr name="area">${property.features.area || ''}</attr>
      </attributes>` : ''}
    <images>
      ${property.photos.map(url => `<image>${this.escapeXml(url)}</image>`).join('')}
    </images>
    <contact>
      <name>${this.escapeXml(property.owner?.name || '')}</name>
      <phone>${this.escapeXml(property.owner?.phone || '')}</phone>
    </contact>
  </ad>
</ads>`;

    return xml + xmlContent;
  }

  private generateImovelWebXml(property: PropertyData): string {
    const xml = this.createXmlDeclaration();
    const tipoImovel = this.mapPropertyType(property.propertyType, 'imovelweb');

    const xmlContent = `<Imoveis>
  <Imovel>
    <Codigo>${this.escapeXml(property.id || '')}</Codigo>
    <Tipo>${tipoImovel}</Tipo>
    <Operacao>${property.transactionType === 'sale' ? 'Venda' : 'Locacao'}</Operacao>
    <Titulo>${this.escapeXml(property.title)}</Titulo>
    <Texto>${this.escapeXml(property.description)}</Texto>
    <Preco unit="BRL">${property.price}</Preco>
    <Endereco>
      <Rua>${this.escapeXml(property.address.street)}</Rua>
      <Numero>${this.escapeXml(property.address.number || '')}</Numero>
      <Bairro>${this.escapeXml(property.address.neighborhood)}</Bairro>
      <Cidade>${this.escapeXml(property.address.city)}</Cidade>
      <UF>${property.address.state}</UF>
      <CEP>${this.escapeXml(property.address.zipCode || '')}</CEP>
    </Endereco>
    <Caracteristicas>
      <Area>${property.features?.area || ''}</Area>
      <AreaConstruida>${property.features?.builtArea || ''}</AreaConstruida>
      <Quartos>${property.features?.bedrooms || ''}</Quartos>
      <Banheiros>${property.features?.bathrooms || ''}</Banheiros>
      <Vagas>${property.features?.parkingSpaces || ''}</Vagas>
    </Caracteristicas>
    <Imagens>${property.photos.map(url => `<Imagem url="${this.escapeXml(url)}" />`).join('')}</Imagens>
  </Imovel>
</Imoveis>`;

    return xml + xmlContent;
  }

  private generateChavesXml(property: PropertyData): string {
    const xml = this.createXmlDeclaration();
    const tipo = this.mapPropertyType(property.propertyType, 'chaves');

    const xmlContent = `<imovel>
  <codigo>${this.escapeXml(property.id || '')}</codigo>
  <tipo>${tipo}</tipo>
  <acao>${property.transactionType === 'sale' ? 'venda' : 'aluguel'}</acao>
  <titulo>${this.escapeXml(property.title)}</titulo>
  <descricao><![CDATA[${property.description}]]></descricao>
  <preco>${property.price}</preco>
  <endereco>
    <logradouro>${this.escapeXml(property.address.street)}</logradouro>
    <numero>${this.escapeXml(property.address.number || '')}</numero>
    <bairro>${this.escapeXml(property.address.neighborhood)}</bairro>
    <cidade>${this.escapeXml(property.address.city)}</cidade>
    <estado>${property.address.state}</estado>
  </endereco>
  <dados>
    <area>${property.features?.area || ''}</area>
    <quartos>${property.features?.bedrooms || ''}</quartos>
    <banheiros>${property.features?.bathrooms || ''}</banheiros>
    <vagas>${property.features?.parkingSpaces || ''}</vagas>
  </dados>
  <fotos>${property.photos.map(url => `<foto url="${this.escapeXml(url)}" />`).join('')}</fotos>
</imovel>`;

    return xml + xmlContent;
  }

  private createXmlDeclaration(): string {
    return '<?xml version="1.0" encoding="UTF-8"?>\n';
  }

  private escapeXml(str: string): string {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  private mapPropertyType(type: PropertyData['propertyType'], portal: PortalId): string {
    const mappings: Record<PortalId, Record<PropertyData['propertyType'], string>> = {
      zap: {
        apartment: 'Apartamento',
        house: 'Casa',
        commercial: 'Comercial',
        land: 'Terreno',
        industrial: 'Galpão'
      },
      viva: {
        apartment: 'Apartamento',
        house: 'Casa',
        commercial: 'Comercial',
        land: 'Terreno',
        industrial: 'Galpão'
      },
      olx: {
        apartment: 'apartments',
        house: 'houses',
        commercial: 'commercial',
        land: 'lands',
        industrial: 'industrial'
      },
      imovelweb: {
        apartment: 'Apartamento',
        house: 'Casa',
        commercial: 'Comercial',
        land: 'Terreno',
        industrial: 'Galpão'
      },
      chaves: {
        apartment: 'apartamento',
        house: 'casa',
        commercial: 'comercial',
        land: 'terreno',
        industrial: 'galpao'
      },
      meta: {},
      vrsync: {}
    };

    return mappings[portal]?.[type] || type;
  }
}

export const xmlGenerator = new XmlGenerator();

export function generateXml(property: PropertyData, portalId: PortalId): string {
  return xmlGenerator.generate(property, portalId);
}