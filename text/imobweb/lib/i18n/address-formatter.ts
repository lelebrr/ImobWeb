import { Locale } from './settings';

interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

/**
 * Localization-aware Address Formatter.
 * Formats addresses according to the standards of each country.
 */
export function formatAddress(
  address: Address,
  locale: Locale = 'pt-BR'
): string {
  const { 
    street, number, complement, neighborhood, 
    city, state, zipCode, country 
  } = address;

  const patterns: Record<string, string> = {
    'pt-BR': `${street}, ${number}${complement ? ` - ${complement}` : ''}, ${neighborhood}, ${city} - ${state}, ${zipCode}, ${country}`,
    'en-US': `${number} ${street}${complement ? `, ${complement}` : ''}, ${city}, ${state} ${zipCode}, ${country}`,
    'en-GB': `${number} ${street}${complement ? `, ${complement}` : ''}, ${city}, ${zipCode}, ${country}`,
    'es-ES': `${street}, ${number}${complement ? `, ${complement}` : ''}, ${zipCode} ${city}, ${state}, ${country}`
  };

  const formatted = patterns[locale] || patterns['pt-BR'];
  return formatted;
}

/**
 * Gets specific address labels per locale (e.g., CEP vs ZIP Code).
 */
export function getAddressLabels(locale: Locale) {
  const labels: Record<string, any> = {
    'pt-BR': {
      zipCode: 'CEP',
      neighborhood: 'Bairro',
      state: 'Estado',
      number: 'Número',
      complement: 'Complemento'
    },
    'en-US': {
      zipCode: 'ZIP Code',
      neighborhood: 'Neighborhood',
      state: 'State',
      number: 'Number',
      complement: 'Suite/Apt'
    },
    'es-ES': {
      zipCode: 'Código Postal',
      neighborhood: 'Barrio',
      state: 'Provincia',
      number: 'Número',
      complement: 'Piso/Puerta'
    }
  };

  return labels[locale] || labels['pt-BR'];
}
