// lib/importer/csv-importer.ts

import * as XLSX from 'xlsx';
import * as csvParser from 'csv-parser';
import { Readable } from 'stream';
import { validateCep, validateCpfCnpj, validatePhone, validateEmail } from '../fiscal-rules';
import { PropertyData, ImportError, ImportResult } from '../../types/migration';
import { Buffer } from 'buffer';

/**
 * Processador principal de importação de arquivos CSV e Excel
 * Suporta múltiplos formatos e validação inteligente de dados imobiliários
 */
export class CSVImporter {
    /**
     * Carrega e processa um arquivo CSV ou Excel
     * @param file Buffer ou stream do arquivo
     * @param options Opções de processamento
     * @returns Resultado do processamento com dados e erros
     */
    public static async processFile(
        file: Buffer | Readable,
        options: {
            fileType: 'csv' | 'xlsx';
            chunkSize?: number;
            onProgress?: (progress: { processed: number; total: number; errors: number }) => void;
        }
    ): Promise<ImportResult> {
        const result: ImportResult = {
            data: [],
            errors: [],
            warnings: [],
            metadata: {
                totalRows: 0,
                processedRows: 0,
                validRows: 0,
                invalidRows: 0,
                duplicateRows: 0,
            }
        };

        try {
            // Verificar tipo de arquivo
            if (options.fileType === 'xlsx') {
                return this.processExcel(file, options);
            } else {
                return this.processCSV(file, options);
            }
        } catch (error) {
            result.errors.push({
                message: `Erro ao processar arquivo: ${error instanceof Error ? error.message : String(error)}`,
                row: 0,
                type: 'system'
            });
            return result;
        }
    }

    /**
     * Processa arquivo Excel (.xlsx)
     */
    private static async processExcel(
        file: Buffer | Readable,
        options: { chunkSize?: number; onProgress?: (progress: any) => void }
    ): Promise<ImportResult> {
        const workbook = XLSX.read(file, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (data.length === 0) {
            return {
                data: [],
                errors: [{ message: 'Arquivo vazio ou sem dados', row: 0, type: 'validation' }],
                warnings: [],
                metadata: { totalRows: 0, processedRows: 0, validRows: 0, invalidRows: 0, duplicateRows: 0 }
            };
        }

        const headers = data[0];
        const processedData: PropertyData[] = [];
        const errors: ImportError[] = [];
        const warnings: ImportError[] = [];

        let processedRows = 0;
        let validRows = 0;
        let invalidRows = 0;
        let duplicateRows = 0;

        // Processar linhas em chunks para performance
        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            if (!row || !Array.isArray(row) || row.length === 0) continue;

            const processedRow: PropertyData = {};

            // Mapear colunas para campos de imóvel
            const mapping: Record<string, string> = {
                'Código': 'id',
                'Endereço': 'address',
                'Bairro': 'neighborhood',
                'CEP': 'cep',
                'Número': 'number',
                'Complemento': 'complement',
                'Tipo': 'propertyType',
                'Valor': 'price',
                'Vagas': 'parkingSpaces',
                'Quartos': 'bedrooms',
                'Banheiros': 'bathrooms',
                'Telefone': 'phone',
                'Email': 'email',
                'Imóvel': 'title',
                'Descrição': 'description',
                'Imagem': 'image',
                'Status': 'status',
                'Data de Entrada': 'entryDate',
                'Vendedor': 'seller',
                'CPF/CNPJ': 'sellerCpfCnpj',
                'Comissão': 'commission',
                'Histórico': 'history'
            };

            // Mapear campos
            (headers as string[]).forEach((header: string, index: number) => {
                const mappedField = mapping[header.toLowerCase()];
                if (mappedField) {
                    processedRow[mappedField] = row[index] || '';
                }
            });

            // Validar campos obrigatórios
            const requiredFields = ['address', 'price', 'bedrooms', 'bathrooms', 'phone', 'title'];
            const missingFields = requiredFields.filter(field => !processedRow[field]);

            if (missingFields.length > 0) {
                errors.push({
                    message: `Campos obrigatórios faltando: ${missingFields.join(', ')}`,
                    row: i + 1,
                    type: 'validation',
                    field: missingFields
                });
                invalidRows++;
                continue;
            }

            // Validar campos específicos
            try {
                // Validar CEP
                if (processedRow.cep && !validateCep(processedRow.cep)) {
                    warnings.push({
                        message: `CEP inválido: ${processedRow.cep}`,
                        row: i + 1,
                        type: 'warning',
                        field: 'cep'
                    });
                }

                // Validar CPF/CNPJ
                if (processedRow.sellerCpfCnpj && !validateCpfCnpj(processedRow.sellerCpfCnpj)) {
                    warnings.push({
                        message: `CPF/CNPJ inválido: ${processedRow.sellerCpfCnpj}`,
                        row: i + 1,
                        type: 'warning',
                        field: 'sellerCpfCnpj'
                    });
                }

                // Validar telefone
                if (processedRow.phone && !validatePhone(processedRow.phone)) {
                    warnings.push({
                        message: `Telefone inválido: ${processedRow.phone}`,
                        row: i + 1,
                        type: 'warning',
                        field: 'phone'
                    });
                }

                // Validar email
                if (processedRow.email && !validateEmail(processedRow.email)) {
                    warnings.push({
                        message: `Email inválido: ${processedRow.email}`,
                        row: i + 1,
                        type: 'warning',
                        field: 'email'
                    });
                }

                // Validar preço
                if (processedRow.price && !/^\d+(\.\d{2})?$/.test(processedRow.price)) {
                    warnings.push({
                        message: `Preço inválido: ${processedRow.price}`,
                        row: i + 1,
                        type: 'warning',
                        field: 'price'
                    });
                }

                // Validar quartos e vagas
                const bedrooms = parseInt(String(processedRow.bedrooms || '0'), 10);
                const parkingSpaces = parseInt(String(processedRow.parkingSpaces || '0'), 10);
                if (bedrooms < 0 || parkingSpaces < 0) {
                    warnings.push({
                        message: `Número de quartos ou vagas inválidos`,
                        row: i + 1,
                        type: 'warning'
                    });
                }

                // Adicionar dados válidos
                processedData.push(processedRow);
                validRows++;
            } catch (validationError) {
                errors.push({
                    message: `Erro de validação: ${validationError instanceof Error ? validationError.message : String(validationError)}`,
                    row: i + 1,
                    type: 'validation'
                });
                invalidRows++;
            }

            processedRows++;

            // Atualizar progresso
            options.onProgress?.({
                processed: processedRows,
                total: data.length - 1,
                errors: errors.length
            });

            // Detectar duplicados (baseado em título e endereço)
            const key = `${processedRow.title || ''}-${processedRow.address || ''}`;
            if (processedData.some(d => d.title === processedRow.title && d.address === processedRow.address)) {
                duplicateRows++;
            }
        }

        const finalResult: ImportResult = {
            data: processedData,
            errors,
            warnings,
            metadata: {
                totalRows: data.length - 1,
                processedRows,
                validRows,
                invalidRows,
                duplicateRows
            }
        };

        return finalResult;
    }

    /**
     * Processa arquivo CSV
     */
    private static async processCSV(
        file: Buffer | Readable,
        options: { chunkSize?: number; onProgress?: (progress: any) => void }
    ): Promise<ImportResult> {
        const result: ImportResult = {
            data: [],
            errors: [],
            warnings: [],
            metadata: {
                totalRows: 0,
                processedRows: 0,
                validRows: 0,
                invalidRows: 0,
                duplicateRows: 0
            }
        };

        if (file instanceof Readable) {
            const stream = file;
            const parser = csvParser.default();

            stream.pipe(parser);

            parser.on('data', (row: Record<string, string>) => {
                result.metadata.processedRows++;

                // Processar cada linha
                const processedRow: PropertyData = {};
                const headers = result.data.length === 0 ? Object.keys(row) : result.data[0];

                headers.forEach((header: string, index: number) => {
                    const mappedField = header.toLowerCase().replace(/[^a-z0-9]/g, '_');
                    processedRow[mappedField] = row[header] || '';
                });

                // Validar campos obrigatórios
                const requiredFields = ['address', 'price', 'bedrooms', 'bathrooms', 'phone', 'title'];
                const missingFields = requiredFields.filter(field => !processedRow[field]);

                if (missingFields.length > 0) {
                    result.errors.push({
                        message: `Campos obrigatórios faltando: ${missingFields.join(', ')}`,
                        row: result.metadata.processedRows,
                        type: 'validation',
                        field: missingFields
                    });
                    result.metadata.invalidRows++;
                    return;
                }

                // Validar campos específicos
                try {
                    // Validar CEP
                    if (processedRow.cep && !validateCep(processedRow.cep)) {
                        result.warnings.push({
                            message: `CEP inválido: ${processedRow.cep}`,
                            row: result.metadata.processedRows,
                            type: 'warning',
                            field: 'cep'
                        });
                    }

                    // Validar CPF/CNPJ
                    if (processedRow.sellerCpfCnpj && !validateCpfCnpj(processedRow.sellerCpfCnpj)) {
                        result.warnings.push({
                            message: `CPF/CNPJ inválido: ${processedRow.sellerCpfCnpj}`,
                            row: result.metadata.processedRows,
                            type: 'warning',
                            field: 'sellerCpfCnpj'
                        });
                    }

                    // Validar telefone
                    if (processedRow.phone && !validatePhone(processedRow.phone)) {
                        result.warnings.push({
                            message: `Telefone inválido: ${processedRow.phone}`,
                            row: result.metadata.processedRows,
                            type: 'warning',
                            field: 'phone'
                        });
                    }

                    // Validar email
                    if (processedRow.email && !validateEmail(processedRow.email)) {
                        result.warnings.push({
                            message: `Email inválido: ${processedRow.email}`,
                            row: result.metadata.processedRows,
                            type: 'warning',
                            field: 'email'
                        });
                    }

                    // Validar preço
                    if (processedRow.price && !/^\d+(\.\d{2})?$/.test(processedRow.price)) {
                        result.warnings.push({
                            message: `Preço inválido: ${processedRow.price}`,
                            row: result.metadata.processedRows,
                            type: 'warning',
                            field: 'price'
                        });
                    }

                    // Validar quartos e vagas
                    const bedrooms = parseInt(String(processedRow.bedrooms || '0'), 10);
                    const parkingSpaces = parseInt(String(processedRow.parkingSpaces || '0'), 10);
                    if (bedrooms < 0 || parkingSpaces < 0) {
                        result.warnings.push({
                            message: `Número de quartos ou vagas inválidos`,
                            row: result.metadata.processedRows,
                            type: 'warning'
                        });
                    }

                    result.data.push(processedRow);
                    result.metadata.validRows++;
                } catch (validationError) {
                    result.errors.push({
                        message: `Erro de validação: ${validationError instanceof Error ? validationError.message : String(validationError)}`,
                        row: result.metadata.processedRows,
                        type: 'validation'
                    });
                    result.metadata.invalidRows++;
                }
            });

            parser.on('end', () => {
                result.metadata.totalRows = result.metadata.processedRows;
                options.onProgress?.({
                    processed: result.metadata.processedRows,
                    total: result.metadata.totalRows,
                    errors: result.errors.length
                });
            });

            parser.on('error', (error: Error) => {
                result.errors.push({
                    message: `Erro ao processar CSV: ${error.message}`,
                    row: 0,
                    type: 'system'
                });
            });
        } else {
            // Processar buffer
            const data = file.toString('utf8');
            const rows = data.split('\n');

            for (let i = 1; i < rows.length; i++) {
                const row = rows[i];
                if (!row.trim()) continue;

                const processedRow: PropertyData = {};
                const parts = row.split(',');

                // Mapear colunas
                const headers = rows[0].split(',');
                headers.forEach((header: string, index: number) => {
                    const mappedField = header.toLowerCase().replace(/[^a-z0-9]/g, '_');
                    processedRow[mappedField] = parts[index] || '';
                });

                // Validar campos obrigatórios
                const requiredFields = ['address', 'price', 'bedrooms', 'bathrooms', 'phone', 'title'];
                const missingFields = requiredFields.filter(field => !processedRow[field]);

                if (missingFields.length > 0) {
                    result.errors.push({
                        message: `Campos obrigatórios faltando: ${missingFields.join(', ')}`,
                        row: i + 1,
                        type: 'validation',
                        field: missingFields
                    });
                    result.metadata.invalidRows++;
                    continue;
                }

                // Validar campos específicos
                try {
                    // Validar CEP
                    if (processedRow.cep && !validateCep(processedRow.cep)) {
                        result.warnings.push({
                            message: `CEP inválido: ${processedRow.cep}`,
                            row: i + 1,
                            type: 'warning',
                            field: 'cep'
                        });
                    }

                    // Validar CPF/CNPJ
                    if (processedRow.sellerCpfCnpj && !validateCpfCnpj(processedRow.sellerCpfCnpj)) {
                        result.warnings.push({
                            message: `CPF/CNPJ inválido: ${processedRow.sellerCpfCnpj}`,
                            row: i + 1,
                            type: 'warning',
                            field: 'sellerCpfCnpj'
                        });
                    }

                    // Validar telefone
                    if (processedRow.phone && !validatePhone(processedRow.phone)) {
                        result.warnings.push({
                            message: `Telefone inválido: ${processedRow.phone}`,
                            row: i + 1,
                            type: 'warning',
                            field: 'phone'
                        });
                    }

                    // Validar email
                    if (processedRow.email && !validateEmail(processedRow.email)) {
                        result.warnings.push({
                            message: `Email inválido: ${processedRow.email}`,
                            row: i + 1,
                            type: 'warning',
                            field: 'email'
                        });
                    }

                    // Validar preço
                    if (processedRow.price && !/^\d+(\.\d{2})?$/.test(processedRow.price)) {
                        result.warnings.push({
                            message: `Preço inválido: ${processedRow.price}`,
                            row: i + 1,
                            type: 'warning',
                            field: 'price'
                        });
                    }

                    // Validar quartos e vagas
                    const bedrooms = parseInt(String(processedRow.bedrooms || '0'), 10);
                    const parkingSpaces = parseInt(String(processedRow.parkingSpaces || '0'), 10);
                    if (bedrooms < 0 || parkingSpaces < 0) {
                        result.warnings.push({
                            message: `Número de quartos ou vagas inválidos`,
                            row: i + 1,
                            type: 'warning'
                        });
                    }

                    result.data.push(processedRow);
                    result.metadata.validRows++;
                } catch (validationError) {
                    result.errors.push({
                        message: `Erro de validação: ${validationError instanceof Error ? validationError.message : String(validationError)}`,
                        row: i + 1,
                        type: 'validation'
                    });
                    result.metadata.invalidRows++;
                }

                result.metadata.processedRows++;
                options.onProgress?.({
                    processed: result.metadata.processedRows,
                    total: rows.length - 1,
                    errors: result.errors.length
                });
            }
        }

        return result;
    }
}

// Exportar tipos
export type { PropertyData, ImportError, ImportResult };