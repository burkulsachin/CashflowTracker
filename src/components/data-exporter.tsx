'use client';

import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { Download, Upload, AlertTriangle, FileJson, FileCsv, Loader2 } from 'lucide-react';
import { useStore } from '@/hooks/use-store';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { AppData } from '@/lib/types';

function downloadFile(content: string, fileName: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function DataExporter() {
  const { transactions, categories, budgets, goals, user, importData } = useStore();
  const { toast } = useToast();
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [isRestoreAlertOpen, setIsRestoreAlertOpen] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const handleExportCsv = () => {
    const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
    const headers = 'Date,Type,Category,Amount,Note,Merchant\n';
    const rows = transactions
      .map((tx) => {
        const row = [
          new Date(tx.dateISO).toLocaleDateString(),
          tx.type,
          categoryMap.get(tx.categoryId) || 'Uncategorized',
          (tx.amountMinor / 100).toFixed(2),
          `"${tx.note?.replace(/"/g, '""') || ''}"`,
          `"${tx.merchant?.replace(/"/g, '""') || ''}"`,
        ];
        return row.join(',');
      })
      .join('\n');
    
    downloadFile(headers + rows, `cashflow-transactions-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
    toast({ title: "CSV Exported", description: "Your transactions have been downloaded." });
  };

  const handleExportJson = () => {
    const appData: AppData = {
      user,
      categories,
      transactions,
      budgets,
      goals,
    };
    const jsonString = JSON.stringify(appData, null, 2);
    downloadFile(jsonString, `cashflow-backup-${new Date().toISOString()}.json`, 'application/json');
    toast({ title: "Backup Exported", description: "Your full data backup has been downloaded." });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setRestoreFile(e.target.files[0]);
    } else {
        setRestoreFile(null);
    }
  };

  const handleRestoreClick = () => {
    if (!restoreFile) {
        toast({ title: "No file selected", description: "Please select a JSON backup file to restore.", variant: "destructive" });
        return;
    }
    setIsRestoreAlertOpen(true);
  };

  const handleConfirmRestore = () => {
    if (!restoreFile) return;
    setIsRestoring(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text) as AppData;
        
        // Basic validation
        if (data.user && data.categories && data.transactions && data.budgets && data.goals) {
          importData(data);
          toast({ title: "Restore Successful", description: "Your data has been restored from the backup." });
        } else {
          throw new Error("Invalid backup file structure.");
        }
      } catch (error) {
        toast({ title: "Restore Failed", description: "The selected file is not a valid backup file.", variant: "destructive" });
        console.error("Restore error:", error);
      } finally {
        setIsRestoring(false);
        setRestoreFile(null);
        // Reset file input
        const fileInput = document.getElementById('json-restore-file') as HTMLInputElement;
        if(fileInput) fileInput.value = '';
      }
    };
    reader.readAsText(restoreFile);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Export Data</CardTitle>
          <CardDescription>
            Download your data in different formats for safekeeping or use in other applications.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-start gap-4 sm:flex-row">
          <Button onClick={handleExportCsv} variant="outline">
            <FileCsv className="mr-2" />
            Export Transactions (CSV)
          </Button>
          <Button onClick={handleExportJson}>
            <FileJson className="mr-2" />
            Export Full Backup (JSON)
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Restore from Backup</CardTitle>
          <CardDescription className="flex items-start gap-2">
            <AlertTriangle className="mt-1 h-4 w-4 flex-shrink-0 text-destructive" />
            <span>
              Restoring from a backup will
              <b className="text-destructive"> completely overwrite all your current data</b>. This action cannot be undone.
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className='flex flex-col items-start gap-4 sm:flex-row'>
                <Input id="json-restore-file" type="file" accept=".json" onChange={handleFileChange} className='max-w-xs' />
                <Button onClick={handleRestoreClick} disabled={!restoreFile || isRestoring}>
                    {isRestoring ? <Loader2 className="mr-2 animate-spin" /> : <Upload className="mr-2" />}
                    Restore from Backup
                </Button>
            </div>
        </CardContent>
      </Card>

      <AlertDialog open={isRestoreAlertOpen} onOpenChange={setIsRestoreAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all your current data and replace it with the data from{' '}
              <b>{restoreFile?.name}</b>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRestore} className="bg-destructive hover:bg-destructive/90">
              Yes, Overwrite My Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
