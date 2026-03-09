'use client';

import { useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { PlusCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/transactions/data-table';
import { getColumns } from '@/components/transactions/columns';
import { useStore } from '@/hooks/use-store';
import TransactionForm from '@/components/transactions/transaction-form';
import type { Transaction } from '@/lib/types';

export default function TransactionsPage() {
  const searchParams = useSearchParams();
  const { transactions } = useStore();
  const [isTransactionFormOpen, setIsTransactionFormOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<
    Transaction | undefined
  >(undefined);

  const handleNewTransaction = () => {
    setSelectedTransaction(undefined);
    setIsTransactionFormOpen(true);
  };

  const handleEditTransaction = useCallback((transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsTransactionFormOpen(true);
  }, []);

  const columns = useMemo(
    () => getColumns({ onEdit: handleEditTransaction }),
    [handleEditTransaction]
  );

  const filteredTransactions = useMemo(() => {
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const month = searchParams.get('month');

    let filtered = transactions;

    if (type) {
      filtered = filtered.filter((t) => t.type === type);
    }

    if (category) {
      filtered = filtered.filter((t) => t.categoryId === category);
    }

    if (month) {
      filtered = filtered.filter((t) => t.dateISO.startsWith(month as string));
    }

    return filtered;
  }, [transactions, searchParams]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
            All Transactions
          </h1>
          <p className="text-muted-foreground">
            View and manage all your recorded transactions.
          </p>
        </div>
        <Button onClick={handleNewTransaction}>
          <PlusCircle />
          <span className="hidden md:inline">New Transaction</span>
        </Button>
      </div>

      <DataTable columns={columns} data={filteredTransactions} />

      <TransactionForm
        open={isTransactionFormOpen}
        onOpenChange={setIsTransactionFormOpen}
        transaction={selectedTransaction}
      />
    </div>
  );
}
