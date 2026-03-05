'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { MoreHorizontal, Edit, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { Transaction } from '@/lib/types';
import { useStore } from '@/hooks/use-store';
import { formatCurrency, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';

type TransactionListItemProps = {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
};

function TransactionListItem({ transaction, onEdit }: TransactionListItemProps) {
  const { deleteTransaction, getCategoryById } = useStore();
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const category = getCategoryById(transaction.categoryId);

  const isExpense = transaction.type === 'expense';
  const Icon = isExpense ? TrendingDown : TrendingUp;
  
  return (
    <>
      <div className="flex items-center gap-4 py-4">
        <div className={cn(
            "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full",
            isExpense ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'
        )}>
            <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
            <div className="flex-1 space-y-1">
                <p className="font-medium truncate">{transaction.note}</p>
                <p className="text-sm text-muted-foreground">{format(new Date(transaction.dateISO), 'MMM d, yyyy')}</p>
            </div>
            
            <div className="hidden md:block">
                <Badge variant="outline">{category?.name || 'Uncategorized'}</Badge>
            </div>

            <div className={cn(
                "font-semibold text-right md:text-left",
                isExpense ? 'text-foreground' : 'text-success'
            )}>
                {isExpense ? '-' : '+'}
                {formatCurrency(transaction.amountMinor)}
            </div>
            
            <div className="flex justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(transaction)}>
                      <Edit className="mr-2 h-4 w-4" />
                      <span>Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsDeleteAlertOpen(true)} className="text-destructive focus:text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
      </div>
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this transaction. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTransaction(transaction.id)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default React.memo(TransactionListItem);
