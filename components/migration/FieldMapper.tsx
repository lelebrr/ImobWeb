// components/migration/FieldMapper.tsx

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { PropertyData, FieldMapping, CRMTemplate } from '@/types/migration';

/**
 * Campos disponíveis no sistema de importação
 */
const SYSTEM_FIELDS = [
    { key: 'id', label: 'Código do Imóvel', required: false },
    { key: 'title', label: 'Título do Imóvel', required: true },
    { key: 'address', label: 'Endereço Completo', required: true },
    { key: 'neighborhood', label: 'Bairro', required: false },
    { key: 'city', label: 'Cidade', required: false },
    { key: 'state', label: 'Estado', required: false },
    { key: 'cep', label: 'CEP', required: true },
    { key: 'number', label: 'Número', required: false },
    { key: 'complement', label: 'Complemento', required: false },
    { key: 'propertyType', label: 'Tipo de Imóvel', required: false },
    { key: 'bedrooms', label: 'Quartos', required: true },
    { key: 'bathrooms', label: 'Banheiros', required: true },
    { key: 'parkingSpaces', label: 'Vagas de Garagem', required: false },
    { key: 'area', label: 'Área (m²)', required: false },
    { key: 'areaUnit', label: 'Unidade de Área', required: false },
    { key: 'price', label: 'Preço', required: true },
    { key: 'currency', label: 'Moeda', required: false },
    { key: 'phone', label: 'Telefone', required: true },
    { key: 'email', label: 'Email', required: false },
    { key: 'seller', label: 'Vendedor', required: false },
    { key: 'sellerCpfCnpj', label: 'CPF/CNPJ do Vendedor', required: false },
    { key: 'sellerEmail', label: 'Email do Vendedor', required: false },
    { key: 'sellerPhone', label: 'Telefone do Vendedor', required: false },
    { key: 'status', label: 'Status', required: false },
    { key: 'entryDate', label: 'Data de Entrada', required: false },
    { key: 'description', label: 'Descrição', required: false },
    { key: 'image', label: 'Imagem Principal', required: false },
    { key: 'images', label: 'Imagens Adicionais', required: false },
    { key: 'history', label: 'Histórico', required: false },
    { key: 'commission', label: 'Comissão', required: false },
    { key: 'notes', label: 'Notas', required: false },
    { key: 'tags', label: 'Tags', required: false },
];

/**
 * Mapeamentos pré-definidos para CRMs populares
 */
const CRM_MAPPINGS: Record<string, FieldMapping[]> = {
    'Tecimob': [
        { sourceField: 'Código', targetField: 'id', required: false, dataType: 'string' },
        { sourceField: 'Título', targetField: 'title', required: true, dataType: 'string' },
        { sourceField: 'Endereço', targetField: 'address', required: true, dataType: 'string' },
        { sourceField: 'Bairro', targetField: 'neighborhood', required: false, dataType: 'string' },
        { sourceField: 'CEP', targetField: 'cep', required: true, dataType: 'string' },
        { sourceField: 'Número', targetField: 'number', required: false, dataType: 'string' },
        { sourceField: 'Quartos', targetField: 'bedrooms', required: true, dataType: 'string' },
        { sourceField: 'Banheiros', targetField: 'bathrooms', required: true, dataType: 'string' },
        { sourceField: 'Vagas', targetField: 'parkingSpaces', required: false, dataType: 'string' },
        { sourceField: 'Área', targetField: 'area', required: false, dataType: 'string' },
        { sourceField: 'Preço', targetField: 'price', required: true, dataType: 'string' },
        { sourceField: 'Telefone', targetField: 'phone', required: true, dataType: 'string' },
        { sourceField: 'Email', targetField: 'email', required: false, dataType: 'string' },
        { sourceField: 'Descrição', targetField: 'description', required: false, dataType: 'string' },
        { sourceField: 'Status', targetField: 'status', required: false, dataType: 'string' },
        { sourceField: 'Vendedor', targetField: 'seller', required: false, dataType: 'string' },
        { sourceField: 'CPF/CNPJ', targetField: 'sellerCpfCnpj', required: false, dataType: 'string' },
    ],
    'ImobTotal': [
        { sourceField: 'Código', targetField: 'id', required: false, dataType: 'string' },
        { sourceField: 'Título', targetField: 'title', required: true, dataType: 'string' },
        { sourceField: 'Endereço', targetField: 'address', required: true, dataType: 'string' },
        { sourceField: 'Bairro', targetField: 'neighborhood', required: false, dataType: 'string' },
        { sourceField: 'CEP', targetField: 'cep', required: true, dataType: 'string' },
        { sourceField: 'Número', targetField: 'number', required: false, dataType: 'string' },
        { sourceField: 'Quartos', targetField: 'bedrooms', required: true, dataType: 'number' },
        { sourceField: 'Banheiros', targetField: 'bathrooms', required: true, dataType: 'number' },
        { sourceField: 'Vagas', targetField: 'parkingSpaces', required: false, dataType: 'number' },
        { sourceField: 'Área', targetField: 'area', required: false, dataType: 'number' },
        { sourceField: 'Preço', targetField: 'price', required: true, dataType: 'number' },
        { sourceField: 'Telefone', targetField: 'phone', required: true, dataType: 'string' },
        { sourceField: 'Email', targetField: 'email', required: false, dataType: 'string' },
        { sourceField: 'Descrição', targetField: 'description', required: false, dataType: 'string' },
        { sourceField: 'Status', targetField: 'status', required: false, dataType: 'string' },
        { sourceField: 'Vendedor', targetField: 'seller', required: false, dataType: 'string' },
        { sourceField: 'CPF/CNPJ', targetField: 'sellerCpfCnpj', required: false, dataType: 'string' },
    ],
    'Imobisoft': [
        { sourceField: 'Código', targetField: 'id', required: false, dataType: 'string' },
        { sourceField: 'Título', targetField: 'title', required: true, dataType: 'string' },
        { sourceField: 'Endereço', targetField: 'address', required: true, dataType: 'string' },
        { sourceField: 'Bairro', targetField: 'neighborhood', required: false, dataType: 'string' },
        { sourceField: 'CEP', targetField: 'cep', required: true, dataType: 'string' },
        { sourceField: 'Número', targetField: 'number', required: false, dataType: 'string' },
        { sourceField: 'Quartos', targetField: 'bedrooms', required: true, dataType: 'string' },
        { sourceField: 'Banheiros', targetField: 'bathrooms', required: true, dataType: 'string' },
        { sourceField: 'Vagas', targetField: 'parkingSpaces', required: false, dataType: 'string' },
        { sourceField: 'Área', targetField: 'area', required: false, dataType: 'string' },
        { sourceField: 'Preço', targetField: 'price', required: true, dataType: 'string' },
        { sourceField: 'Telefone', targetField: 'phone', required: true, dataType: 'string' },
        { sourceField: 'Email', targetField: 'email', required: false, dataType: 'string' },
        { sourceField: 'Descrição', targetField: 'description', required: false, dataType: 'string' },
        { sourceField: 'Status', targetField: 'status', required: false, dataType: 'string' },
        { sourceField: 'Vendedor', targetField: 'seller', required: false, dataType: 'string' },
        { sourceField: 'CPF/CNPJ', targetField: 'sellerCpfCnpj', required: false, dataType: 'string' },
    ],
    'Jetimob': [
        { sourceField: 'Código', targetField: 'id', required: false, dataType: 'string' },
        { sourceField: 'Título', targetField: 'title', required: true, dataType: 'string' },
        { sourceField: 'Endereço', targetField: 'address', required: true, dataType: 'string' },
        { sourceField: 'Bairro', targetField: 'neighborhood', required: false, dataType: 'string' },
        { sourceField: 'CEP', targetField: 'cep', required: true, dataType: 'string' },
        { sourceField: 'Número', targetField: 'number', required: false, dataType: 'string' },
        { sourceField: 'Quartos', targetField: 'bedrooms', required: true, dataType: 'string' },
        { sourceField: 'Banheiros', targetField: 'bathrooms', required: true, dataType: 'string' },
        { sourceField: 'Vagas', targetField: 'parkingSpaces', required: false, dataType: 'string' },
        { sourceField: 'Área', targetField: 'area', required: false, dataType: 'string' },
        { sourceField: 'Preço', targetField: 'price', required: true, dataType: 'string' },
        { sourceField: 'Telefone', targetField: 'phone', required: true, dataType: 'string' },
        { sourceField: 'Email', targetField: 'email', required: false, dataType: 'string' },
        { sourceField: 'Descrição', targetField: 'description', required: false, dataType: 'string' },
        { sourceField: 'Status', targetField: 'status', required: false, dataType: 'string' },
        { sourceField: 'Vendedor', targetField: 'seller', required: false, dataType: 'string' },
        { sourceField: 'CPF/CNPJ', targetField: 'sellerCpfCnpj', required: false, dataType: 'string' },
    ],
    'InGaia': [
        { sourceField: 'Código', targetField: 'id', required: false, dataType: 'string' },
        { sourceField: 'Título', targetField: 'title', required: true, dataType: 'string' },
        { sourceField: 'Endereço', targetField: 'address', required: true, dataType: 'string' },
        { sourceField: 'Bairro', targetField: 'neighborhood', required: false, dataType: 'string' },
        { sourceField: 'CEP', targetField: 'cep', required: true, dataType: 'string' },
        { sourceField: 'Número', targetField: 'number', required: false, dataType: 'string' },
        { sourceField: 'Quartos', targetField: 'bedrooms', required: true, dataType: 'string' },
        { sourceField: 'Banheiros', targetField: 'bathrooms', required: true, dataType: 'string' },
        { sourceField: 'Vagas', targetField: 'parkingSpaces', required: false, dataType: 'string' },
        { sourceField: 'Área', targetField: 'area', required: false, dataType: 'string' },
        { sourceField: 'Preço', targetField: 'price', required: true, dataType: 'string' },
        { sourceField: 'Telefone', targetField: 'phone', required: true, dataType: 'string' },
        { sourceField: 'Email', targetField: 'email', required: false, dataType: 'string' },
        { sourceField: 'Descrição', targetField: 'description', required: false, dataType: 'string' },
        { sourceField: 'Status', targetField: 'status', required: false, dataType: 'string' },
        { sourceField: 'Vendedor', targetField: 'seller', required: false, dataType: 'string' },
        { sourceField: 'CPF/CNPJ', targetField: 'sellerCpfCnpj', required: false, dataType: 'string' },
    ],
};

interface FieldMapperProps {
    onMappingComplete: (mappings: FieldMapping[]) => void;
    initialMappings?: FieldMapping[];
    crmName?: string;
    sampleData?: PropertyData[];
}

export const FieldMapper: React.FC<FieldMapperProps> = ({
    onMappingComplete,
    initialMappings = [],
    crmName,
    sampleData = [],
}) => {
    const [sourceFields, setSourceFields] = useState<string[]>([]);
    const [targetFields, setTargetFields] = useState<string[]>([]);
    const [mappings, setMappings] = useState<FieldMapping[]>(initialMappings);
    const [draggedSource, setDraggedSource] = useState<string | null>(null);
    const [draggedTarget, setDraggedTarget] = useState<string | null>(null);
    const [autoDetected, setAutoDetected] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    // Extrair campos do arquivo de exemplo
    useEffect(() => {
        if (sampleData.length > 0) {
            const firstRow = sampleData[0];
            const fields = Object.keys(firstRow).filter(
                (key) => key !== 'id' && key !== '__parsed'
            );
            setSourceFields(fields);
            setTargetFields(SYSTEM_FIELDS.map((f) => f.key));

            // Tentar detectar mapeamento automático
            detectAutoMapping(fields);
        }
    }, [sampleData]);

    // Detectar mapeamento automático baseado em nomes de campos
    const detectAutoMapping = useCallback((fields: string[]) => {
        const detected: FieldMapping[] = [];

        fields.forEach((sourceField) => {
            const lowerField = sourceField.toLowerCase();

            // Mapeamentos de detecção automática
            const mapping = SYSTEM_FIELDS.find((systemField) => {
                const systemKey = systemField.key.toLowerCase();
                return (
                    lowerField.includes(systemKey) ||
                    systemKey.includes(lowerField) ||
                    (lowerField === 'valor' && systemKey === 'price') ||
                    (lowerField === 'preco' && systemKey === 'price') ||
                    (lowerField === 'quartos' && systemKey === 'bedrooms') ||
                    (lowerField === 'banheiros' && systemKey === 'bathrooms') ||
                    (lowerField === 'vagas' && systemKey === 'parkingSpaces') ||
                    (lowerField === 'cep' && systemKey === 'cep') ||
                    (lowerField === 'email' && systemKey === 'email') ||
                    (lowerField === 'telefone' && systemKey === 'phone') ||
                    (lowerField === 'cpf' && systemKey === 'sellerCpfCnpj') ||
                    (lowerField === 'cnpj' && systemKey === 'sellerCpfCnpj') ||
                    (lowerField === 'vendedor' && systemKey === 'seller') ||
                    (lowerField === 'endereco' && systemKey === 'address') ||
                    (lowerField === 'titulo' && systemKey === 'title') ||
                    (lowerField === 'descricao' && systemKey === 'description') ||
                    (lowerField === 'status' && systemKey === 'status') ||
                    (lowerField === 'area' && systemKey === 'area')
                );
            });

            if (mapping) {
                detected.push({
                    sourceField,
                    targetField: mapping.key,
                    required: mapping.required,
                    dataType: 'string',
                });
            }
        });

        // Adicionar campos sem mapeamento
        fields.forEach((sourceField) => {
            if (!detected.find((d) => d.sourceField === sourceField)) {
                detected.push({
                    sourceField,
                    targetField: '',
                    required: false,
                    dataType: 'string',
                });
            }
        });

        setMappings(detected);
        setAutoDetected(true);
    }, []);

    // Carregar mapeamento pré-definido para CRM específico
    useEffect(() => {
        if (crmName && CRM_MAPPINGS[crmName]) {
            const crmMapping = CRM_MAPPINGS[crmName];
            const detected: FieldMapping[] = crmMapping.map((mapping) => ({
                ...mapping,
                dataType: 'string',
            }));
            setMappings(detected);
            setAutoDetected(true);
        }
    }, [crmName]);

    // Mover campo de origem para destino
    const handleSourceDrop = (targetField: string) => {
        if (!draggedSource) return;

        setMappings((prev) =>
            prev.map((mapping) =>
                mapping.sourceField === draggedSource
                    ? { ...mapping, targetField, required: false }
                    : mapping
            )
        );
        setDraggedSource(null);
        setDraggedTarget(null);
    };

    // Mover campo de destino para origem
    const handleTargetDrop = (sourceField: string) => {
        if (!draggedTarget) return;

        setMappings((prev) =>
            prev.map((mapping) =>
                mapping.targetField === draggedTarget
                    ? { ...mapping, sourceField, required: false }
                    : mapping
            )
        );
        setDraggedTarget(null);
        setDraggedSource(null);
    };

    // Remover mapeamento
    const handleRemoveMapping = (sourceField: string) => {
        setMappings((prev) => prev.filter((m) => m.sourceField !== sourceField));
    };

    // Atualizar campo obrigatório
    const handleToggleRequired = (sourceField: string) => {
        setMappings((prev) =>
            prev.map((mapping) =>
                mapping.sourceField === sourceField
                    ? { ...mapping, required: !mapping.required }
                    : mapping
            )
        );
    };

    // Verificar se há campos obrigatórios sem mapeamento
    const hasMissingRequired = SYSTEM_FIELDS.some(
        (field) => field.required && !mappings.find((m) => m.targetField === field.key)
    );

    // Verificar se há campos sem mapeamento
    const hasUnmappedFields = sourceFields.some(
        (field) => !mappings.find((m) => m.sourceField === field)
    );

    // Verificar se há campos sem destino
    const hasEmptyTargets = mappings.some((m) => !m.targetField);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Mapeador de Campos</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Arraste os campos do seu arquivo para os campos do sistema
                    </p>
                </div>
                {crmName && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">CRM:</span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                            {crmName}
                        </span>
                    </div>
                )}
            </div>

            {/* Auto-detect button */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => detectAutoMapping(sourceFields)}
                    disabled={sourceFields.length === 0 || autoDetected}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                    {autoDetected ? '✓ Mapeamento Detectado' : '🔍 Detectar Mapeamento Automático'}
                </button>
                {showPreview && sampleData.length > 0 && (
                    <button
                        onClick={() => setShowPreview(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Fechar Preview
                    </button>
                )}
                {!showPreview && sampleData.length > 0 && (
                    <button
                        onClick={() => setShowPreview(true)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        👁️ Ver Preview dos Dados
                    </button>
                )}
            </div>

            {/* Preview dos dados */}
            {showPreview && sampleData.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
                    <h3 className="font-semibold text-gray-700 mb-2">Preview dos Primeiros 5 Registros</h3>
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="border-b">
                                {Object.keys(sampleData[0]).map((key) => (
                                    <th key={key} className="px-3 py-2 text-left font-medium text-gray-600">
                                        {key}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {sampleData.slice(0, 5).map((row, rowIndex) => (
                                <tr key={rowIndex} className="border-b border-gray-100">
                                    {Object.values(row).map((value, colIndex) => (
                                        <td key={colIndex} className="px-3 py-2 text-gray-600">
                                            {String(value).substring(0, 30)}
                                            {String(value).length > 30 ? '...' : ''}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Alertas */}
            {hasMissingRequired && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <svg
                            className="w-5 h-5 text-red-500 mt-0.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                        <div>
                            <h4 className="font-medium text-red-800">Campos Obrigatórios Sem Mapeamento</h4>
                            <p className="text-sm text-red-700 mt-1">
                                Os seguintes campos obrigatórios não têm destino definido:
                            </p>
                            <ul className="text-sm text-red-700 mt-2 list-disc list-inside">
                                {SYSTEM_FIELDS
                                    .filter((f) => f.required && !mappings.find((m) => m.targetField === f.key))
                                    .map((f) => (
                                        <li key={f.key}>{f.label}</li>
                                    ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {hasUnmappedFields && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <svg
                            className="w-5 h-5 text-yellow-500 mt-0.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                        <div>
                            <h4 className="font-medium text-yellow-800">Campos Sem Mapeamento</h4>
                            <p className="text-sm text-yellow-700 mt-1">
                                Os seguintes campos do seu arquivo não foram mapeados:
                            </p>
                            <ul className="text-sm text-yellow-700 mt-2 list-disc list-inside">
                                {sourceFields
                                    .filter((f) => !mappings.find((m) => m.sourceField === f))
                                    .map((f) => (
                                        <li key={f}>{f}</li>
                                    ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Mapeador de Campos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Coluna de Campos de Origem */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <span className="text-blue-600">←</span> Campos do Arquivo
                    </h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {sourceFields.length === 0 ? (
                            <p className="text-gray-500 text-sm italic">Carregue um arquivo para ver os campos</p>
                        ) : (
                            sourceFields.map((sourceField) => {
                                const mapping = mappings.find((m) => m.sourceField === sourceField);
                                return (
                                    <div
                                        key={sourceField}
                                        draggable
                                        onDragStart={() => setDraggedSource(sourceField)}
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={() => handleSourceDrop('')}
                                        className={`p-3 border rounded-lg cursor-move transition-all ${mapping?.targetField
                                                ? 'bg-green-50 border-green-200'
                                                : 'bg-gray-50 border-gray-200 hover:border-blue-300'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-gray-800">{sourceField}</span>
                                            {mapping?.targetField && (
                                                <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                                                    {mapping.targetField}
                                                </span>
                                            )}
                                        </div>
                                        {mapping?.targetField && (
                                            <button
                                                onClick={() => handleRemoveMapping(sourceField)}
                                                className="mt-2 text-xs text-red-500 hover:text-red-700"
                                            >
                                                Remover mapeamento
                                            </button>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Coluna de Campos de Destino */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <span className="text-green-600">→</span> Campos do Sistema
                    </h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {SYSTEM_FIELDS.map((systemField) => {
                            const mapping = mappings.find((m) => m.targetField === systemField.key);
                            return (
                                <div
                                    key={systemField.key}
                                    draggable
                                    onDragStart={() => setDraggedTarget(systemField.key)}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={() => handleTargetDrop('')}
                                    className={`p-3 border rounded-lg cursor-move transition-all ${mapping?.sourceField
                                            ? 'bg-green-50 border-green-200'
                                            : 'bg-gray-50 border-gray-200 hover:border-blue-300'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-800">{systemField.label}</span>
                                            {systemField.required && (
                                                <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-800 rounded">
                                                    *
                                                </span>
                                            )}
                                        </div>
                                        {mapping?.sourceField && (
                                            <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                                                {mapping.sourceField}
                                            </span>
                                        )}
                                    </div>
                                    {mapping?.sourceField && (
                                        <button
                                            onClick={() => handleRemoveMapping(mapping.sourceField)}
                                            className="mt-2 text-xs text-red-500 hover:text-red-700"
                                        >
                                            Remover mapeamento
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Botão de Conclusão */}
            <div className="flex items-center justify-end gap-4 pt-4 border-t">
                <button
                    onClick={() => onMappingComplete(mappings)}
                    disabled={hasMissingRequired || hasEmptyTargets}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                >
                    Concluir Mapeamento
                </button>
            </div>

            {/* Resumo do Mapeamento */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">Resumo do Mapeamento</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">
                            {mappings.filter((m) => m.targetField).length}
                        </p>
                        <p className="text-blue-700">Mapeados</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-gray-600">{mappings.length}</p>
                        <p className="text-gray-700">Total</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-orange-600">
                            {mappings.filter((m) => !m.targetField).length}
                        </p>
                        <p className="text-orange-700">Sem Destino</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Hook personalizado para usar o FieldMapper
export const useFieldMapper = (crmName?: string, sampleData?: PropertyData[]) => {
    const [mappings, setMappings] = useState<FieldMapping[]>([]);
    const [isComplete, setIsComplete] = useState(false);

    const handleMappingComplete = useCallback((newMappings: FieldMapping[]) => {
        setMappings(newMappings);
        setIsComplete(true);
    }, []);

    const resetMapping = useCallback(() => {
        setMappings([]);
        setIsComplete(false);
    }, []);

    return {
        mappings,
        isComplete,
        handleMappingComplete,
        resetMapping,
    };
};
