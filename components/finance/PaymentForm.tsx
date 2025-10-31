import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../common/Button';
import { CurrencyInput } from '../common/CurrencyInput';

export const PaymentForm: React.FC<{
    defaultAmount: number;
    onSubmit: (payload: { amount: number; date: string; description: string }) => void;
    onCancel: () => void;
}> = ({ defaultAmount, onSubmit, onCancel }) => {
    // Correctly initialize with a positive amount or 0
    const [amount, setAmount] = useState(defaultAmount > 0 ? defaultAmount : 0);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const amountInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        amountInputRef.current?.focus();
    }, []);

    // Sync defaultAmount when modal is reopened for a different student
    useEffect(() => {
        setAmount(defaultAmount > 0 ? defaultAmount : 0);
    }, [defaultAmount]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (amount <= 0) {
            // Prevent submission of zero/negative payments
            return;
        }
        onSubmit({
            amount,
            date,
            description: `Thanh toán trực tiếp`,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label>Số tiền thanh toán (VND)</label>
                <CurrencyInput value={amount} onChange={setAmount} className="form-input mt-1" />
            </div>
            <div>
                <label>Ngày thanh toán</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="form-input mt-1" required />
            </div>
            <div className="flex justify-end gap-4 pt-4 border-t dark:border-gray-700">
                <Button type="button" variant="secondary" onClick={onCancel}>Hủy</Button>
                <Button type="submit">Ghi nhận</Button>
            </div>
        </form>
    );
};
