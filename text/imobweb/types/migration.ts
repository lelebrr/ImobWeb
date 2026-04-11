// text/imobweb/types/migration.ts

/**
 * Tipos para sistema de migração e importação em massa
 */

/**
 * Tipo de dados de um imóvel importado
 */
export interface PropertyData {
    // Identificação
    id?: string;
    title?: string;
    code?: string;

    // Endereço
    address?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    cep?: string;
    number?: string;
    complement?: string;

    // Características
    propertyType?: string;
    bedrooms?: string | number;
    bathrooms?: string | number;
    parkingSpaces?: string | number;
    area?: string | number;
    areaUnit?: string;

    // Preço
    price?: string;
    currency?: string;

    // Contato
    phone?: string;
    email?: string;

    // Vendedor
    seller?: string;
    sellerCpfCnpj?: string;
    sellerEmail?: string;
    sellerPhone?: string;

    // Status
    status?: string;
    entryDate?: string;

    // Outros
    description?: string;
    image?: string;
    images?: string[];
    history?: string;
    commission?: string;
    notes?: string;
    tags?: string[];
}

/**
 * Erro de importação
 */
export interface ImportError {
    message: string;
    row: number;
    type: 'validation' | 'system' | 'duplicate';
    field?: string | string[];
}

/**
 * Resultado da importação
 */
export interface ImportResult {
    data: PropertyData[];
    errors: ImportError[];
    warnings: ImportError[];
    metadata: ImportMetadata;
}

/**
 * Metadados da importação
 */
export interface ImportMetadata {
    totalRows: number;
    processedRows: number;
    validRows: number;
    invalidRows: number;
    duplicateRows: number;
    duration?: number;
    startTime?: Date;
}

/**
 * Configuração de mapeamento de campos
 */
export interface FieldMapping {
    sourceField: string;
    targetField: string;
    required: boolean;
    dataType: 'string' | 'number' | 'date' | 'boolean';
}

/**
 * Template de importação para CRM específico
 */
export interface CRMTemplate {
    id: string;
    name: string;
    description: string;
    fileType: 'csv' | 'xlsx' | 'xml';
    sampleData?: any[];
    fieldMappings: Record<string, string>;
    requiredFields: string[];
    optionalFields: string[];
}

/**
 * Opções de importação
 */
export interface ImportOptions {
    mode: 'overwrite' | 'merge' | 'shadow'; // overwrite, merge, shadow
    dryRun?: boolean;
    validateBeforeImport?: boolean;
    autoFix?: boolean;
    skipDuplicates?: boolean;
    chunkSize?: number;
    onProgress?: (progress: ImportProgress) => void;
    onComplete?: (result: ImportResult) => void;
    onError?: (error: Error) => void;
}

/**
 * Progresso da importação
 */
export interface ImportProgress {
    processed: number;
    total: number;
    errors: number;
    currentStatus: 'uploading' | 'validating' | 'processing' | 'complete';
}

/**
 * Configuração de CRM para migração
 */
export interface CRMConfig {
    id: string;
    name: string;
    logo?: string;
    website: string;
    supportedFileTypes: ('csv' | 'xlsx' | 'xml')[];
    autoDetection: boolean;
    templates: CRMTemplate[];
}

/**
 * Status da migração
 */
export type MigrationStatus = 'idle' | 'uploading' | 'validating' | 'processing' | 'completed' | 'failed' | 'cancelled';

/**
 * Registro de migração
 */
export interface MigrationRecord {
    id: string;
    userId: string;
    crmName: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    status: MigrationStatus;
    result?: ImportResult;
    startedAt: Date;
    completedAt?: Date;
    error?: string;
    retryCount: number;
    options: ImportOptions;
}

/**
 * Tipo de arquivo suportado
 */
export type SupportedFileType = 'csv' | 'xlsx' | 'xml';

/**
 * Configuração de validação
 */
export interface ValidationConfig {
    cep: boolean;
    cpfCnpj: boolean;
    phone: boolean;
    email: boolean;
    price: boolean;
    area: boolean;
    requiredFields: boolean;
    duplicateDetection: boolean;
}

/**
 * Opções de exportação
 */
export interface ExportOptions {
    format: 'csv' | 'xlsx' | 'json' | 'pdf';
    includeImages?: boolean;
    includeHistory?: boolean;
    includeConversations?: boolean;
    branding?: boolean;
    filters?: {
        status?: string[];
        propertyType?: string[];
        dateRange?: {
            start: Date;
            end: Date;
        };
    };
}

/**
 * Relatório de exportação
 */
export interface ExportReport {
    id: string;
    userId: string;
    fileName: string;
    format: SupportedFileType;
    recordCount: number;
    size: number;
    generatedAt: Date;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    downloadUrl?: string;
    error?: string;
}
