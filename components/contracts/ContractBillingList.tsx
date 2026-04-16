import React from 'react';
import { DataTable } from '@/components/ui/data-table';

type Billing = {
    id: number;
    numero: string;
    vencimento: string;
    valor: number;
    status: string;
};

type ContractBillingListProps = {
    billings: Billing[];
};

export default function ContractBillingList({ billings }: ContractBillingListProps) {
    const columns = [
        { accessorKey: 'numero', header: 'Número' },
        { accessorKey: 'vencimento', header: 'Vencimento' },
        { accessorKey: 'valor', header: 'Valor' },
        { accessorKey: 'status', header: 'Status' },
    ];

    return (
        <div>
            <h3 className="text-lg font-medium mb-4">Cobranças</h3>
            <DataTable
                columns={columns}
                data={billings}
                searchKey="numero"
            />
        </div>
    );
}