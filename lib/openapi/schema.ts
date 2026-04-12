import { generateOpenApiDocument } from 'trpc-openapi';
import { publicApiRouter } from '../api-public/router';

/**
 * Gera o documento OpenAPI para a API Pública v1
 */
export const openApiDocument = generateOpenApiDocument(publicApiRouter, {
  title: 'imobWeb Public API',
  description: 'API completa para gestão imobiliária, portais e CRM.',
  version: '1.0.0',
  baseUrl: 'https://api.imobweb.app/api/v1',
  docsUrl: 'https://developers.imobweb.app/docs',
  tags: ['Properties', 'Leads', 'WhatsApp'],
});

/**
 * Exporta como JSON string para ser servido via API
 */
export function getOpenApiSpec() {
  return JSON.stringify(openApiDocument, null, 2);
}
