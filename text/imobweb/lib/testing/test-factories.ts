import { fakerPT_BR as faker } from '@faker-js/faker';

/**
 * Test factories for imobWeb CRM.
 * Provides realistic Brazilian data for E2E and unit tests.
 */

export const UserFactory = {
  create: (overrides = {}) => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    phone: faker.phone.number({ style: 'national' }),
    role: faker.helpers.arrayElement(['ADMIN', 'GERENTE', 'CORRETOR']),
    organizationId: faker.string.uuid(),
    status: 'ATIVO',
    createdAt: new Date(),
    ...overrides,
  }),
};

export const OrganizationFactory = {
  create: (overrides = {}) => ({
    id: faker.string.uuid(),
    name: `${faker.company.name()} Imóveis`,
    cnpj: faker.string.numeric(14),
    email: faker.internet.email().toLowerCase(),
    city: faker.location.city(),
    state: faker.location.state({ abbreviated: true }),
    planType: faker.helpers.arrayElement(['BASICO', 'PREMIUM', 'CORPORATIVO']),
    status: 'ATIVO',
    ...overrides,
  }),
};

export const PropertyFactory = {
  create: (overrides = {}) => {
    const isRent = faker.datatype.boolean();
    return {
      id: faker.string.uuid(),
      title: `${faker.commerce.productAdjective()} ${faker.helpers.arrayElement(['Apartamento', 'Casa', 'Cobertura'])} em ${faker.location.city()}`,
      description: faker.lorem.paragraphs(2),
      code: `IMOB-${faker.string.alphanumeric(6).toUpperCase()}`,
      status: 'DISPONIVEL',
      type: faker.helpers.arrayElement(['APARTAMENTO', 'CASA', 'COMERCIAL', 'TERRENO']),
      businessType: isRent ? 'LOCAÇÃO' : 'VENDA',
      price: isRent ? null : faker.number.int({ min: 150000, max: 5000000 }),
      priceRent: isRent ? faker.number.int({ min: 1000, max: 15000 }) : null,
      area: faker.number.int({ min: 30, max: 500 }),
      bedrooms: faker.number.int({ min: 1, max: 5 }),
      bathrooms: faker.number.int({ min: 1, max: 4 }),
      garages: faker.number.int({ min: 0, max: 3 }),
      address: faker.location.streetAddress(),
      neighborhood: faker.location.county(),
      city: faker.location.city(),
      state: faker.location.state({ abbreviated: true }),
      cep: faker.location.zipCode('########'),
      organizationId: faker.string.uuid(),
      ownerId: faker.string.uuid(),
      ...overrides,
    };
  },
};

export const LeadFactory = {
  create: (overrides = {}) => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    whatsapp: faker.phone.number({ style: 'national' }),
    status: 'NOVO',
    source: faker.helpers.arrayElement(['WEBSITE', 'PORTAL', 'SOCIAL']),
    organizationId: faker.string.uuid(),
    createdAt: new Date(),
    ...overrides,
  }),
};

export const OwnerFactory = {
  create: (overrides = {}) => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    document: faker.string.numeric(11), // CPF
    whatsapp: faker.phone.number({ style: 'national' }),
    status: 'ATIVO',
    ...overrides,
  }),
};
