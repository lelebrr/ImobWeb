// lib/migration/migration-engine.ts

import { CSVImporter, ImportResult } from '../importer/csv-importer';
import { PropertyData, ImportOptions, MigrationStatus, FieldMapping } from '../../types/migration';
import { PrismaClient } from '@prisma/client';
import { Buffer } from 'buffer';

const prisma = new PrismaClient();

/**
 * Motor de migração e importação em massa
 * Gerencia processamento assíncrono, filas e validação
 */
export class MigrationEngine {
    private queue: Array<{
        id: string;
        userId: string;
        data: PropertyData[];
        options: ImportOptions;
        createdAt: Date;
    }> = [];

    private processing: Map<string, Promise<ImportResult>> = new Map();
    private activeJobs: Map<string, MigrationStatus> = new Map();

    /**
     * Inicia o processamento de um arquivo de importação
     * @param file Buffer do arquivo
     * @param options Opções de importação
     * @returns ID do job de importação
     */
    public async startImport(
        file: any,
        options: ImportOptions
    ): Promise<string> {
        const jobId = this.generateJobId();
        const startTime = new Date();

        // Iniciar processamento em background
        const processJob = this.processImport(file, options, jobId, startTime);
        this.processing.set(jobId, processJob);
        this.activeJobs.set(jobId, 'processing');

        // Executar processamento
        processJob
            .then((result) => {
                this.activeJobs.set(jobId, 'completed');
                options.onComplete?.(result);
            })
            .catch((error) => {
                this.activeJobs.set(jobId, 'failed');
                options.onError?.(error);
            });

        return jobId;
    }

    /**
     * Processa a importação de dados
     */
    private async processImport(
        file: any,
        options: ImportOptions,
        jobId: string,
        startTime: Date
    ): Promise<ImportResult> {
        try {
            // Validar arquivo
            if (options.validateBeforeImport) {
                await this.validateFile(file, options);
            }

            // Processar arquivo
            const result = await CSVImporter.processFile(file, {
                fileType: this.detectFileType(file),
                chunkSize: options.chunkSize,
                onProgress: (progress) => {
                    options.onProgress?.({
                        ...progress,
                        currentStatus: 'processing',
                    });
                },
            });

            // Salvar resultado no banco de dados
            await this.saveImportResult(jobId, result, options);

            // Executar importação se não for dry-run
            if (!options.dryRun) {
                await this.executeImport(result, options);
            }

            // Atualizar metadados
            result.metadata.duration = Date.now() - startTime.getTime();
            result.metadata.startTime = startTime;

            return result;
        } catch (error) {
            throw new Error(
                `Erro na importação: ${error instanceof Error ? error.message : String(error)}`
            );
        }
    }

    /**
     * Valida o arquivo antes da importação
     */
    private async validateFile(
        file: any,
        options: ImportOptions
    ): Promise<void> {
        const fileType = this.detectFileType(file);

        if (fileType === 'csv') {
            // Validar estrutura do CSV
            const result = await CSVImporter.processFile(file, {
                fileType: 'csv',
            });

            if (result.errors.length > 0) {
                throw new Error(
                    `Arquivo possui ${result.errors.length} erro(s) de validação`
                );
            }
        }
    }

    /**
     * Detecta o tipo de arquivo
     */
    private detectFileType(file: any): 'csv' | 'xlsx' {
        if (file instanceof Buffer) {
            const buffer = Buffer.from(file);
            if (buffer[0] === 0x50 && buffer[1] === 0x4B) {
                return 'xlsx';
            }
            return 'csv';
        }
        return 'csv';
    }

    /**
     * Executa a importação dos dados
     */
    private async executeImport(
        result: ImportResult,
        options: ImportOptions
    ): Promise<void> {
        const { data, metadata } = result;
        let importedCount = 0;
        let updatedCount = 0;
        let skippedCount = 0;

        for (const propertyData of data) {
            try {
                // Verificar duplicados
                const existingProperty = await prisma.property.findFirst({
                    where: {
                        title: propertyData.title,
                        address: propertyData.address,
                    },
                });

                if (existingProperty) {
                    if (options.mode === 'overwrite') {
                        // Atualizar propriedade existente
                        await prisma.property.update({
                            where: { id: existingProperty.id },
                            data: this.mapPropertyData(propertyData),
                        });
                        updatedCount++;
                    } else if (options.mode === 'merge') {
                        // Mesclar dados
                        await this.mergePropertyData(existingProperty.id, propertyData);
                        updatedCount++;
                    } else {
                        // Shadow mode - não sobrescrever
                        skippedCount++;
                    }
                } else {
                    // Criar nova propriedade
                    await prisma.property.create({
                        data: this.mapPropertyData(propertyData),
                    });
                    importedCount++;
                }
            } catch (error) {
                console.error(`Erro ao importar propriedade:`, error);
                // Continuar com próxima propriedade
            }
        }

        // Log do resultado
        await this.logImportResult(
            metadata.totalRows,
            importedCount,
            updatedCount,
            skippedCount,
            result.errors.length
        );
    }

    /**
     * Mapeia dados do arquivo para o schema do banco de dados
     */
    private mapPropertyData(propertyData: PropertyData): any {
        return {
            title: propertyData.title,
            address: propertyData.address,
            neighborhood: propertyData.neighborhood,
            city: propertyData.city,
            state: propertyData.state,
            cep: propertyData.cep,
            number: propertyData.number,
            complement: propertyData.complement,
            propertyType: propertyData.propertyType,
            bedrooms: this.parseNumber(propertyData.bedrooms),
            bathrooms: this.parseNumber(propertyData.bathrooms),
            parkingSpaces: this.parseNumber(propertyData.parkingSpaces),
            area: this.parseNumber(propertyData.area),
            price: this.parsePrice(propertyData.price),
            currency: propertyData.currency || 'BRL',
            phone: propertyData.phone,
            email: propertyData.email,
            seller: propertyData.seller,
            sellerCpfCnpj: propertyData.sellerCpfCnpj,
            sellerEmail: propertyData.sellerEmail,
            sellerPhone: propertyData.sellerPhone,
            status: propertyData.status || 'active',
            entryDate: propertyData.entryDate ? new Date(propertyData.entryDate) : new Date(),
            description: propertyData.description,
            image: propertyData.image,
            images: propertyData.images ? JSON.stringify(propertyData.images) : null,
            history: propertyData.history,
            commission: this.parseNumber(propertyData.commission),
            notes: propertyData.notes,
            tags: propertyData.tags ? JSON.stringify(propertyData.tags) : null,
        };
    }

    /**
     * Mescla dados de uma propriedade existente com novos dados
     */
    private async mergePropertyData(
        propertyId: string,
        propertyData: PropertyData
    ): Promise<void> {
        const existing = await prisma.property.findUnique({
            where: { id: propertyId },
        });

        if (!existing) return;

        await prisma.property.update({
            where: { id: propertyId },
            data: {
                ...this.mapPropertyData(propertyData),
                // Manter dados existentes que não foram atualizados
                title: propertyData.title || existing.title,
                address: propertyData.address || existing.address,
                neighborhood: propertyData.neighborhood || existing.neighborhood,
                city: propertyData.city || existing.city,
                state: propertyData.state || existing.state,
                cep: propertyData.cep || existing.cep,
                number: propertyData.number || existing.number,
                complement: propertyData.complement || existing.complement,
                propertyType: propertyData.propertyType || existing.propertyType,
                bedrooms: propertyData.bedrooms !== undefined ? this.parseNumber(propertyData.bedrooms) : existing.bedrooms,
                bathrooms: propertyData.bathrooms !== undefined ? this.parseNumber(propertyData.bathrooms) : existing.bathrooms,
                parkingSpaces: propertyData.parkingSpaces !== undefined ? this.parseNumber(propertyData.parkingSpaces) : existing.parkingSpaces,
                area: propertyData.area !== undefined ? this.parseNumber(propertyData.area) : existing.area,
                price: propertyData.price || existing.price,
                currency: propertyData.currency || existing.currency,
                phone: propertyData.phone || existing.phone,
                email: propertyData.email || existing.email,
                seller: propertyData.seller || existing.seller,
                sellerCpfCnpj: propertyData.sellerCpfCnpj || existing.sellerCpfCnpj,
                sellerEmail: propertyData.sellerEmail || existing.sellerEmail,
                sellerPhone: propertyData.sellerPhone || existing.sellerPhone,
                status: propertyData.status || existing.status,
                entryDate: propertyData.entryDate ? new Date(propertyData.entryDate) : existing.entryDate,
                description: propertyData.description || existing.description,
                image: propertyData.image || existing.image,
                images: propertyData.images ? JSON.stringify(propertyData.images) : existing.images,
                history: propertyData.history || existing.history,
                commission: propertyData.commission !== undefined ? this.parseNumber(propertyData.commission) : existing.commission,
                notes: propertyData.notes || existing.notes,
                tags: propertyData.tags ? JSON.stringify(propertyData.tags) : existing.tags,
            },
        });
    }

    /**
     * Converte string para número
     */
    private parseNumber(value: string | number | undefined): number | null {
        if (value === undefined || value === null || value === '') {
            return null;
        }
        const num = typeof value === 'string' ? parseFloat(value) : value;
        return isNaN(num) ? null : num;
    }

    /**
     * Converte preço para formato decimal
     */
    private parsePrice(value: string | number | undefined): number | null {
        if (value === undefined || value === null || value === '') {
            return null;
        }
        const num = typeof value === 'string' ? parseFloat(value.replace(/[^\d.,-]/g, '')) : value;
        return isNaN(num) ? null : num;
    }

    /**
     * Salva o resultado da importação no banco de dados
     */
    private async saveImportResult(
        jobId: string,
        result: ImportResult,
        options: ImportOptions
    ): Promise<void> {
        await prisma.importResult.create({
            data: {
                id: jobId,
                userId: options.userId || 'anonymous',
                fileName: options.fileName || 'unknown',
                fileSize: options.fileSize || 0,
                fileType: this.detectFileType(options.file),
                status: result.errors.length === 0 ? 'completed' : 'failed',
                result: JSON.stringify(result),
                options: JSON.stringify(options),
                createdAt: new Date(),
            },
        });
    }

    /**
     * Loga o resultado da importação
     */
    private async logImportResult(
        totalRows: number,
        imported: number,
        updated: number,
        skipped: number,
        errors: number
    ): Promise<void> {
        await prisma.importLog.create({
            data: {
                totalRows,
                imported,
                updated,
                skipped,
                errors,
                createdAt: new Date(),
            },
        });
    }

    /**
     * Gera um ID único para o job
     */
    private generateJobId(): string {
        return `import_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    }

    /**
     * Obtém o status de um job de importação
     */
    public async getJobStatus(jobId: string): Promise<MigrationStatus | null> {
        return this.activeJobs.get(jobId) || null;
    }

    /**
     * Obtém o resultado de um job de importação
     */
    public async getJobResult(jobId: string): Promise<ImportResult | null> {
        const job = await prisma.importResult.findUnique({
            where: { id: jobId },
        });

        if (!job) return null;

        return JSON.parse(job.result);
    }

    /**
     * Cancela um job de importação em execução
     */
    public async cancelJob(jobId: string): Promise<boolean> {
        const job = this.processing.get(jobId);
        if (!job) return false;

        // Marcar como cancelado
        this.activeJobs.set(jobId, 'cancelled');

        // Se for um Promise, podemos tentar cancelar (depende da implementação)
        if (job instanceof Promise) {
            // Nota: não há forma padrão de cancelar promises assíncronas
            // em JavaScript, mas podemos limpar referências
            this.processing.delete(jobId);
        }

        return true;
    }

    /**
     * Limpa o engine e remove jobs antigos
     */
    public async cleanup(): Promise<void> {
        // Remover jobs mais antigos que 30 dias
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        await prisma.importResult.deleteMany({
            where: {
                createdAt: {
                    lt: thirtyDaysAgo,
                },
            },
        });
    }

    /**
     * Obtém estatísticas de importação
     */
    public async getImportStats(): Promise<{
        totalImports: number;
        successfulImports: number;
        failedImports: number;
        averageDuration: number;
    }> {
        const stats = await prisma.importLog.groupBy({
            by: ['status'],
            _count: true,
        });

        const totalImports = await prisma.importLog.count();
        const successfulImports = stats.find((s: any) => s.status === 'completed')?._count || 0;
        const failedImports = stats.find((s: any) => s.status === 'failed')?._count || 0;

        const results = await prisma.importResult.findMany({
            where: {
                createdAt: {
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                },
            },
            orderBy: {
                createdAt: 'asc',
            },
        });

        const durations = results
            .map((r) => r.result ? JSON.parse(r.result).metadata.duration : 0)
            .filter((d: number) => d > 0);

        const averageDuration = durations.length > 0
            ? durations.reduce((a, b) => a + b, 0) / durations.length
            : 0;

        return {
            totalImports,
            successfulImports,
            failedImports,
            averageDuration,
        };
    }

    /**
     * Obtém logs de importação
     */
    public async getImportLogs(limit: number = 50): Promise<any[]> {
        return prisma.importLog.findMany({
            orderBy: {
                createdAt: 'desc',
            },
            take: limit,
        });
    }
}

// Exportar instância singleton
export const migrationEngine = new MigrationEngine();

/**
 * Função helper para iniciar importação
 */
export async function startImport(
    file: any,
    options: ImportOptions
): Promise<string> {
    return migrationEngine.startImport(file, options);
}

/**
 * Função helper para obter status de importação
 */
export async function getImportStatus(jobId: string): Promise<MigrationStatus | null> {
    return migrationEngine.getJobStatus(jobId);
}

/**
 * Função helper para obter resultado de importação
 */
export async function getImportResult(jobId: string): Promise<ImportResult | null> {
    return migrationEngine.getJobResult(jobId);
}

/**
 * Função helper para cancelar importação
 */
export async function cancelImport(jobId: string): Promise<boolean> {
    return migrationEngine.cancelJob(jobId);
}

/**
 * Função helper para obter estatísticas de importação
 */
export async function getImportStats(): Promise<{
    totalImports: number;
    successfulImports: number;
    failedImports: number;
    averageDuration: number;
}> {
    return migrationEngine.getImportStats();
}