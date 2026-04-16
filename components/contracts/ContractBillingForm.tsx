import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
    SelectLabel,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

type PaymentMethod = 'boleto' | 'transferencia' | 'dinheiro' | 'pix';

type ContractBillingFormProps = {
    onSubmit: (data: {
        amount: number;
        dueDate: string;
        paymentMethod: PaymentMethod;
        description: string;
    }) => void;
};

export default function ContractBillingForm({ onSubmit }: ContractBillingFormProps) {
    const [amount, setAmount] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('boleto');
    const [description, setDescription] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            amount: parseFloat(amount) || 0,
            dueDate,
            paymentMethod,
            description,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="amount">Valor</Label>
                    <Input
                        id="amount"
                        type="number"
                        placeholder="Digite o valor"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full"
                    />
                </div>
                <div>
                    <Label htmlFor="dueDate">Data de Vencimento</Label>
                    <Input
                        id="dueDate"
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="paymentMethod">Forma de Pagamento</Label>
                    <Select
                        value={paymentMethod}
                        onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                    >
                        <SelectTrigger id="paymentMethod" className="w-full">
                            <SelectValue placeholder="Selecione uma opção" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="boleto">Boleto</SelectItem>
                            <SelectItem value="transferencia">Transferência</SelectItem>
                            <SelectItem value="dinheiro">Dinheiro</SelectItem>
                            <SelectItem value="pix">PIX</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Input
                        id="description"
                        type="text"
                        placeholder="Descrição da cobrança"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full"
                    />
                </div>
            </div>

            <Button type="submit" variant="default">
                Salvar Cobrança
            </Button>
        </form>
    );
}