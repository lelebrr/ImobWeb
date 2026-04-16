import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';

type Contract = {
    id: number;
    numero: string;
    cliente: string;
    imovel: string;
    valor: number;
    status: string;
};

type ContractListComponentProps = {
    contracts: Contract[];
    columns: { accessorKey: keyof Contract; header: string }[];
};

export default function ContractListComponent({ contracts, columns }: ContractListComponentProps) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const filteredContracts = contracts.filter((contract) => {
        const matchesSearch = contract.numero.toLowerCase().includes(search.toLowerCase()) ||
            contract.cliente.toLowerCase().includes(search.toLowerCase()) ||
            contract.imovel.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter ? contract.status === statusFilter : true;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold">Lista de Contratos</h2>
                </div>
                <Button variant="default">
                    Novo Contrato
                </Button>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4">
                <Input
                    placeholder="Buscar por número, cliente ou imóvel..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1"
                />
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border rounded-md px-3 py-2 bg-background text-foreground"
                >
                    <option value="">Todos os status</option>
                    <option value="ativo">Ativo</option>
                    <option value="pendente">Pendente</option>
                    <option value="cancelado">Cancelado</option>
                </select>
            </div>

            {/* Contracts Table */}
            <DataTable
                columns={columns}
                data={filteredContracts}
                searchKey="numero"
            />
        </div>
    );
}