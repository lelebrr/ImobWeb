import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type BankReconciliationComponentProps = {
    onStatementUpload: (file: File) => void;
    onMatchPayment: (statementId: string, paymentId: string) => void;
};

export default function BankReconciliationComponent({
    onStatementUpload,
    onMatchPayment
}: BankReconciliationComponentProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [statementId, setStatementId] = useState<string>('');
    const [paymentId, setPaymentId] = useState<string>('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUpload = () => {
        if (selectedFile) {
            onStatementUpload(selectedFile);
        }
    };

    const handleMatch = () => {
        if (statementId && paymentId) {
            onMatchPayment(statementId, paymentId);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold">Conciliação Bancária</h2>

            {/* Upload Bank Statement */}
            <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2">Upload de Extrato Bancário</h3>
                <input
                    type="file"
                    accept=".csv,.ofx,.pdf"
                    onChange={handleFileChange}
                    className="mb-4 w-full"
                />
                {selectedFile && (
                    <p className="text-sm text-muted-foreground">
                        Arquivo selecionado: {selectedFile.name}
                    </p>
                )}
                <Button onClick={handleUpload} variant="default">
                    Fazer Upload
                </Button>
            </div>

            {/* Match Payments */}
            <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2">Conciliar Pagamentos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="statementId" className="block text-sm font-medium mb-1">
                            ID do Extrato
                        </label>
                        <Input
                            id="statementId"
                            placeholder="Digite o ID do extrato"
                            value={statementId}
                            onChange={(e) => setStatementId(e.target.value)}
                            className="w-full"
                        />
                    </div>
                    <div>
                        <label htmlFor="paymentId" className="block text-sm font-medium mb-1">
                            ID do Pagamento Esperado
                        </label>
                        <Input
                            id="paymentId"
                            placeholder="Digite o ID do pagamento"
                            value={paymentId}
                            onChange={(e) => setPaymentId(e.target.value)}
                            className="w-full"
                        />
                    </div>
                </div>
                <Button onClick={handleMatch} variant="default" className="mt-4">
                    Conciliar Pagamento
                </Button>
            </div>
        </div>
    );
}