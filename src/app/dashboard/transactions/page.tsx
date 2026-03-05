'use client';

import { useState, useMemo } from 'react';
import { PlusCircle, ListFilter, ArrowUpDown } from 'lucide-react';
import { useStore } from '@/hooks/use-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent } from '@/components/ui/card';
import TransactionForm from '@/components/transactions/transaction-form';
import TransactionListItem from '@/components/transactions/transaction-list-item';
import { Transaction } from '@/lib/types';

type SortKey = 'date' | 'amount';
type SortDirection = 'asc' | 'desc';

export default function TransactionsPage() {
  const { transactions, categories } = useStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | undefined>(undefined);
  const [filter, setFilter] = useState('');
  const [visibleCategories, setVisibleCategories] = useState<Set<string>>(new Set(categories.map(c => c.id)));
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');


  const handleNewTransaction = () => {
    setSelectedTransaction(undefined);
    setIsFormOpen(true);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsFormOpen(true);
  };

  const toggleCategoryVisibility = (categoryId: string) => {
    setVisibleCategories(prev => {
        const newSet = new Set(prev);
        if (newSet.has(categoryId)) {
            newSet.delete(categoryId);
        } else {
            newSet.add(categoryId);
        }
        return newSet;
    });
  };

  const sortedAndFilteredTransactions = useMemo(() => {
    return transactions
      .filter(tx => {
        const searchTerm = filter.toLowerCase();
        const inCategory = visibleCategories.has(tx.categoryId);
        const matchesSearch = tx.note?.toLowerCase().includes(searchTerm) || tx.merchant?.toLowerCase().includes(searchTerm) || tx.category.toLowerCase().includes(searchTerm);
        return inCategory && matchesSearch;
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortKey === 'date') {
          comparison = new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime();
        } else if (sortKey === 'amount') {
          comparison = b.amountMinor - a.amountMinor;
        }
        return sortDirection === 'desc' ? comparison : -comparison;
      });
  }, [transactions, filter, visibleCategories, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  return (
    <div className="space-y-6 flex flex-col h-full">
       <div className="flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
            Transactions
          </h1>
          <p className="text-muted-foreground">
            View and manage all your financial activities.
          </p>
        </div>
        <Button onClick={handleNewTransaction}>
          <PlusCircle />
          <span className="hidden md:inline">New Transaction</span>
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
            <div className="flex items-center gap-4">
                <Input 
                    placeholder="Filter by description, merchant..."
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                    className="max-w-sm"
                />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                            <ListFilter className="mr-2"/>
                            Category ({visibleCategories.size})
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Filter by category</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {categories.filter(c => !c.isArchived).map(category => (
                            <DropdownMenuCheckboxItem
                                key={category.id}
                                checked={visibleCategories.has(category.id)}
                                onCheckedChange={() => toggleCategoryVisibility(category.id)}
                            >
                                {category.name}
                            </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
                 <Button variant="outline" onClick={() => handleSort('date')}>
                    Date
                    {sortKey === 'date' && <ArrowUpDown className="ml-2 h-4 w-4" />}
                </Button>
                 <Button variant="outline" onClick={() => handleSort('amount')}>
                    Amount
                    {sortKey === 'amount' && <ArrowUpDown className="ml-2 h-4 w-4" />}
                </Button>
            </div>
        </CardContent>
      </Card>
      
      <div className="flex-1 overflow-hidden">
        <Card className="h-full flex flex-col">
            <CardContent className="p-0 flex-1 overflow-y-auto">
                <div className="divide-y">
                {sortedAndFilteredTransactions.length > 0 ? (
                    sortedAndFilteredTransactions.map((tx, index) => (
                        <div key={tx.id} className="px-6">
                            <TransactionListItem transaction={tx} onEdit={handleEditTransaction} />
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center p-12 text-center">
                        <h3 className="text-xl font-semibold">No transactions found</h3>
                        <p className="mt-2 text-muted-foreground">
                            Try adjusting your filters or add a new transaction.
                        </p>
                    </div>
                )}
                </div>
            </CardContent>
        </Card>
      </div>


      <TransactionForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        transaction={selectedTransaction}
      />
    </div>
  );
}
