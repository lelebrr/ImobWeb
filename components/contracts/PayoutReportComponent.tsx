import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select';
import { DataTable } from '@/components/ui/data-table';
import { Label } from '@/components/ui/label';

type PayoutReportFilters = {
    startDate: string;
    endDate: string;
    status: string;
};

type PayoutReportRow = {
    id: number;
    contractNumber: string;
    client: string;
    property: string;
    amount: number;
    date: string;
    status: string;
};

type PayoutReportComponentProps = {
    onGenerateReport: (filters: PayoutReportFilters) => void;
};

export default function PayoutReportComponent({ onGenerateReport }: PayoutReportComponentProps) {
    const [filters, setFilters] = useState<PayoutReportFilters>({
        startDate: '',
        endDate: '',
        status: '',
    });
    const [reportData, setReportData] = useState<PayoutReportRow[]>([]);

    const handleGenerate = () => {
        // Call the callback with the current filters
        onGenerateReport(filters);
        // For now, we'll generate some dummy data
        setReportData([
            {
                id: 1,
                contractNumber: 'CTR-2026-001',
                client: 'João Silva',
                property: 'Apartamento Centro',
                amount: 2500.00,
                date: '2026-04-10',
                status: 'pago',
            },
            {
                id: 2,
                contractNumber: 'CTR-2026-002',
                client: 'Maria Oliveira',
                property: 'Casa Vila Nova',
                amount: 3200.00,
                date: '2026-04-11',
                status: 'pendente',
            },
            {
                id: 3,
                contractNumber: 'CTR-2026-003',
                client: 'Pedro Santos',
                property: 'Comercial Jardim',
                amount: 4500.00,
                date: '2026-04-12',
                status: 'pago',
            },
        ]);
    };

    const columns = [
        { accessorKey: 'id', header: 'ID' },
        { accessorKey: 'contractNumber', header: 'Número do Contrato' },
        { accessorKey: 'client', header: 'Cliente' },
        { accessorKey: 'property', header: 'Imóvel' },
        { accessorKey: 'amount', header: 'Valor' },
        { accessorKey: 'date', header: 'Data' },
        { accessorKey: 'status', header: 'Status' },
    ];

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold">Relatório de Pagamentos</h2>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <Label htmlFor="startDate">Data Inicial</Label>
                    <Input
                        id="startDate"
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                        className="w-full"
                    />
                </div>
                <div>
                    <Label htmlFor="endDate">Data Final</Label>
                    <Input
                        id="endDate"
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                        className="w-full"
                    />
                </div>
                <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                        value={filters.status}
                        onValueChange={(value) => setFilters({ ...filters, status: value })}
                    >
                        <SelectTrigger id="status" className="w-full">
                            <SelectValue placeholder="Selecione um status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">Todos</SelectItem>
                            <SelectItem value="pago">Pago</SelectItem>
                            <SelectItem value="pendente">Pendente</SelectItem>
                            <SelectItem value="atrasado">Atrasado</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex justify-end">
                <Button onClick={handleGenerate} variant="default">
                    Gerar Relatório
                </Button>
            </div>

            {/* Report Results */}
            <div className="border rounded-md p-4">
                <h3 className="font-medium mb-4">Resultados</h3>
                {reportData.length > 0 ? (
                    <DataTable
                        columns={columns}
                        data={reportData}
                        searchKey="contractNumber"
                    />
                ) : (
                    <p className="text-muted-foreground">Nenhum resultado encontrado.</p>
                )}
            </div>
        </div>
    );
}