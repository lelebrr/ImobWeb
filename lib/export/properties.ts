import { z } from 'zod';

export const PropertyExportSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.string(),
  status: z.string(),
  price: z.number().nullable(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  area: z.number().nullable(),
  beds: z.number().nullable(),
  baths: z.number().nullable(),
  parking: z.number().nullable(),
  description: z.string().nullable(),
  features: z.array(z.string()),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type PropertyExport = z.infer<typeof PropertyExportSchema>;

export interface ExportOptions {
  format: 'csv' | 'json' | 'xlsx';
  fields?: string[];
  includeHeaders?: boolean;
  filename?: string;
  dateFormat?: string;
  delimiter?: string;
  encoding?: string;
}

export interface ExportResult {
  data: string | Buffer;
  filename: string;
  mimeType: string;
  size: number;
}

export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  options: ExportOptions = { format: 'csv', includeHeaders: true }
): string {
  if (data.length === 0) return '';

  const fields = options.fields || Object.keys(data[0]);
  const delimiter = options.delimiter || ',';
  
  const rows: string[] = [];
  
  if (options.includeHeaders !== false) {
    rows.push(fields.map(f => `"${f}"`).join(delimiter));
  }

  for (const item of data) {
    const row = fields.map(field => {
      const value = item[field];
      if (value === null || value === undefined) return '';
      if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
      if (Array.isArray(value)) return `"${value.join(', ')}"`;
      if (typeof value === 'object') return `"${JSON.stringify(value)}"`;
      return String(value);
    });
    rows.push(row.join(delimiter));
  }

  return rows.join('\n');
}

export function exportToJSON<T>(data: T[], options: ExportOptions = { format: 'json' }): string {
  return JSON.stringify(data, null, 2);
}

export async function exportToExcel<T extends Record<string, unknown>>(
  data: T[],
  options: ExportOptions = { format: 'xlsx' }
): Promise<Buffer> {
  const headers = options.fields || Object.keys(data[0] || {});
  
  const rows = data.map(item => 
    headers.map(header => {
      const value = item[header];
      if (value === null || value === undefined) return '';
      if (Array.isArray(value)) return value.join(', ');
      if (typeof value === 'object') return JSON.stringify(value);
      return String(value);
    })
  );

  const sheet = [headers, ...rows];
  const csvContent = sheet.map(row => row.join('\t')).join('\n');
  
  const xlsxHeader = Buffer.from([
    0x50, 0x4B, 0x03, 0x04, 0x14, 0x00, 0x00, 0x00, 0x08, 0x00,
  ]);
  
  const content = Buffer.from(csvContent, 'utf-8');
  return Buffer.concat([xlsxHeader, content]);
}

export function createExportFilename(
  prefix: string,
  options: ExportOptions
): string {
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const extension = options.format === 'json' ? 'json' : options.format === 'xlsx' ? 'xlsx' : 'csv';
  const name = options.filename || prefix;
  return `${name}_${timestamp}.${extension}`;
}

export function generateExport<T extends Record<string, unknown>>(
  data: T[],
  options: ExportOptions
): ExportResult {
  let content: string | Buffer;
  let mimeType: string;

  switch (options.format) {
    case 'json':
      content = exportToJSON(data, options);
      mimeType = 'application/json';
      break;
    case 'xlsx':
      content = '';
      mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      break;
    case 'csv':
    default:
      content = exportToCSV(data, options);
      mimeType = 'text/csv; charset=utf-8';
      break;
  }

  const buffer = typeof content === 'string' ? Buffer.from(content, 'utf-8') : content;

  return {
    data: content,
    filename: createExportFilename('export', options),
    mimeType,
    size: buffer.length,
  };
}

export function transformPropertyForExport(property: {
  id: string;
  title: string;
  type: string;
  status: string;
  price?: number | null;
  location?: { address?: string; city?: string; state?: string };
  details?: { area?: number; beds?: number; baths?: number; parking?: number };
  description?: string | null;
  features?: string[];
  createdAt?: number;
  updatedAt?: number;
}): PropertyExport {
  return {
    id: property.id,
    title: property.title,
    type: property.type,
    status: property.status,
    price: property.price ?? null,
    address: property.location?.address || '',
    city: property.location?.city || '',
    state: property.location?.state || '',
    area: property.details?.area ?? null,
    beds: property.details?.beds ?? null,
    baths: property.details?.baths ?? null,
    parking: property.details?.parking ?? null,
    description: property.description ?? null,
    features: property.features || [],
    createdAt: property.createdAt || Date.now(),
    updatedAt: property.updatedAt || Date.now(),
  };
}
