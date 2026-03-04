'use client';

import { useState, useMemo, ChangeEvent } from 'react';
import {
  ArrowRight,
  ChevronLeft,
  FileUp,
  ListChecks,
  Loader2,
  Undo2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useStore } from '@/hooks/use-store';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import type { Transaction } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from './ui/badge';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

type Step = 'UPLOAD' | 'MAP_COLUMNS' | 'REVIEW' | 'COMPLETE';

interface Mapping {
  date: string | null;
  description: string | null;
  amount: string | null;
}

const REQUIRED_FIELDS: (keyof Mapping)[] = ['date', 'description', 'amount'];

// A simple but effective CSV row parser that handles quoted fields.
const parseCsvRow = (row: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuote = false;
  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    const nextChar = row[i + 1];

    if (char === '"' && !inQuote && current === '') {
      inQuote = true;
      continue;
    }

    if (char === '"' && inQuote && nextChar === '"') {
      current += '"';
      i++; // skip next quote
      continue;
    }

    if (char === '"' && inQuote) {
      inQuote = false;
      continue;
    }

    if (char === ',' && !inQuote) {
      result.push(current);
      current = '';
      continue;
    }

    current += char;
  }
  result.push(current);
  return result;
};


export function CsvImporter() {
  const { addTransaction, transactions, categories } = useStore();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>('UPLOAD');
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Mapping>({
    date: null,
    description: null,
    amount: null,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<{
    importedCount: number;
    skippedCount: number;
  } | null>(null);

  const existingTxKeys = useMemo(() => {
    const keys = new Set<string>();
    transactions.forEach((tx) => {
      const datePart = new Date(tx.dateISO).toISOString().split('T')[0];
      const key = `${datePart}|${tx.amountMinor}|${tx.note}`;
      keys.add(key);
    });
    return keys;
  }, [transactions]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) {
      toast({
        title: 'No file selected',
        description: 'Please select a CSV file to upload.',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = text
        .split('\n')
        .map((row) => row.trim())
        .filter(Boolean)
        .map(parseCsvRow);

      if (rows.length > 1) {
        setHeaders(rows[0]);
        setCsvData(rows.slice(1));
        setStep('MAP_COLUMNS');
      } else {
        toast({
          title: 'Invalid CSV',
          description: 'The CSV file is empty or has only a header row.',
          variant: 'destructive',
        });
      }
    };
    reader.readAsText(file);
  };

  const handleMappingChange = (field: keyof Mapping, value: string) => {
    setMapping((prev) => ({ ...prev, [field]: value }));
  };

  const isMappingComplete = useMemo(() => {
    return REQUIRED_FIELDS.every((field) => mapping[field] !== null);
  }, [mapping]);

  const processedTransactions = useMemo(() => {
    if (!isMappingComplete) return [];

    return csvData
      .map((row) => {
        try {
          const dateIndex = headers.indexOf(mapping.date!);
          const descriptionIndex = headers.indexOf(mapping.description!);
          const amountIndex = headers.indexOf(mapping.amount!);

          const dateStr = row[dateIndex];
          const amountStr = row[amountIndex];
          const description = row[descriptionIndex];

          if (!dateStr || !amountStr || !description) return null;
          
          const date = new Date(dateStr);
          if (isNaN(date.getTime())) return null;

          const amount = parseFloat(amountStr.replace(/[^0-9.-]+/g, ''));
          if(isNaN(amount)) return null;

          const amountMinor = Math.round(amount * 100);

          return {
            date,
            description,
            amount,
            amountMinor,
            type: amountMinor >= 0 ? 'income' : 'expense',
          };
        } catch (error) {
          console.error("Error processing row:", row, error);
          return null;
        }
      })
      .filter(Boolean) as {
      date: Date;
      description: string;
      amount: number;
      amountMinor: number;
      type: 'income' | 'expense';
    }[];
  }, [csvData, headers, mapping, isMappingComplete]);

  const transactionsToImport = useMemo(() => {
    return processedTransactions.filter(tx => {
      const datePart = tx.date.toISOString().split('T')[0];
      const key = `${datePart}|${tx.amountMinor}|${tx.description}`;
      return !existingTxKeys.has(key);
    });
  }, [processedTransactions, existingTxKeys]);


  const handleConfirmImport = async () => {
    setIsProcessing(true);
    
    const defaultCategory = categories.find(c => c.id === 'cat-9' && c.kind === 'expense' && !c.isArchived) || categories.find(c => c.kind === 'expense' && !c.isArchived);

    if (!defaultCategory) {
        toast({
            title: 'Import Failed',
            description: 'No suitable default expense category found. Please ensure you have at least one active expense category.',
            variant: 'destructive'
        });
        setIsProcessing(false);
        return;
    }
    
    let importedCount = 0;
    for (const tx of transactionsToImport) {
        addTransaction({
            dateISO: tx.date.toISOString(),
            note: tx.description,
            amountMinor: Math.abs(tx.amountMinor),
            type: tx.type,
            categoryId: defaultCategory.id,
            category: defaultCategory.name,
        });
        importedCount++;
    }

    setImportResult({
      importedCount,
      skippedCount: processedTransactions.length - importedCount,
    });
    setStep('COMPLETE');
    setIsProcessing(false);
  };

  const resetImporter = () => {
    setStep('UPLOAD');
    setFile(null);
    setCsvData([]);
    setHeaders([]);
    setMapping({ date: null, description: null, amount: null });
    setImportResult(null);
  };

  if (step === 'UPLOAD') {
    return (
      <div className="space-y-4">
        <Label htmlFor="csv-file">CSV File</Label>
        <Input
          id="csv-file"
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="max-w-sm"
        />
        <Button onClick={handleUpload} disabled={!file}>
          <FileUp className="mr-2" />
          Upload and Continue
        </Button>
      </div>
    );
  }

  if (step === 'MAP_COLUMNS') {
    return (
      <div className="space-y-6">
        <h3 className="font-semibold">Map Columns</h3>
        <p className="text-sm text-muted-foreground">
          Match the columns from your CSV file to the required transaction
          fields. We currently support a single column for amount (positive for income, negative for expenses).
        </p>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {REQUIRED_FIELDS.map((field) => (
            <div key={field} className="space-y-2">
              <Label className="capitalize">{field}</Label>
              <Select
                onValueChange={(value) => handleMappingChange(field, value)}
                value={mapping[field] ?? undefined}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select CSV column" />
                </SelectTrigger>
                <SelectContent>
                  {headers.map((header) => (
                    <SelectItem key={header} value={header}>
                      {header}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>

        <h4 className="text-sm font-medium">CSV Data Preview</h4>
        <div className="h-48 overflow-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {headers.map((header) => (
                  <TableHead key={header}>{header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {csvData.slice(0, 5).map((row, i) => (
                <TableRow key={i}>
                  {row.map((cell, j) => (
                    <TableCell key={j} className="truncate max-w-[150px]">{cell}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => resetImporter()}>
            <ChevronLeft className="mr-2" /> Cancel
          </Button>
          <Button
            onClick={() => setStep('REVIEW')}
            disabled={!isMappingComplete}
          >
            Review Transactions <ArrowRight className="ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  if (step === 'REVIEW') {
    return (
      <div className="space-y-6">
        <h3 className="font-semibold">Review Import</h3>
        <Alert>
          <ListChecks className="h-4 w-4" />
          <AlertTitle>Ready to Import</AlertTitle>
          <AlertDescription>
            Found {processedTransactions.length} transactions in your file. We will import {' '}
            <b>{transactionsToImport.length} new transactions</b> and skip {' '}
            <b>{processedTransactions.length - transactionsToImport.length} duplicates</b>.
          </AlertDescription>
        </Alert>

        <h4 className="text-sm font-medium">Transactions to be Imported</h4>
        <div className="h-64 overflow-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactionsToImport.length > 0 ? transactionsToImport.map((tx, i) => (
                <TableRow key={i}>
                  <TableCell>{tx.date.toLocaleDateString()}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{tx.description}</TableCell>
                  <TableCell>{formatCurrency(Math.abs(tx.amountMinor))}</TableCell>
                  <TableCell>
                    <Badge variant={tx.type === 'income' ? 'default' : 'secondary'}>
                      {tx.type}
                    </Badge>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No new transactions to import.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setStep('MAP_COLUMNS')}>
            <ChevronLeft className="mr-2" /> Back to Mapping
          </Button>
          <Button onClick={handleConfirmImport} disabled={isProcessing || transactionsToImport.length === 0}>
            {isProcessing && <Loader2 className="mr-2 animate-spin" />}
            Confirm Import
          </Button>
        </div>
      </div>
    );
  }

  if (step === 'COMPLETE') {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-green-100 p-4 dark:bg-green-900/50">
            <ListChecks className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <h3 className="text-2xl font-semibold">Import Complete</h3>
        <p className="text-muted-foreground">
          Successfully imported{' '}
          <b>{importResult?.importedCount ?? 0} new transactions</b>.
        </p>
        <p className="text-sm text-muted-foreground">
          Skipped {importResult?.skippedCount ?? 0} duplicate transactions.
        </p>
        <Button onClick={resetImporter}>
          <Undo2 className="mr-2" /> Import Another File
        </Button>
      </div>
    );
  }

  return null;
}
