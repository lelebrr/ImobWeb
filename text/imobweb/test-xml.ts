import { xmlGenerator } from './lib/xml-processor/xml-generator';

const mockProperties = [
  {
    id: 'prop1',
    code: 'IMOB001',
    title: 'Apartamento de Luxo no Centro',
    description: 'Belo apartamento com vista para o mar.',
    businessType: 'VENDA',
    type: 'APARTAMENTO',
    price: 1500000,
    area: 120,
    bedrooms: 3,
    bathrooms: 2,
    garages: 2,
    state: 'SP',
    city: 'São Paulo',
    neighborhood: 'Centro',
    address: 'Av. Paulista, 1000',
    cep: '01310-100',
    photos: [
      { url: 'https://example.com/photo1.jpg', caption: 'Sala', order: 1 },
      { url: 'https://example.com/photo2.jpg', caption: 'Quarto', order: 2 }
    ]
  }
];

try {
  const xml = xmlGenerator.generateVRSync(mockProperties as any);
  console.log('XML Generated Successfully:');
  console.log(xml.substring(0, 500) + '...');
} catch (error) {
  console.error('XML Generation Failed:', error);
}
