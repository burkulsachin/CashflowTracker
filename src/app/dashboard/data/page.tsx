'use client';

import { CsvImporter } from '@/components/csv-importer';
import { DataExporter } from '@/components/data-exporter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function DataManagementPage() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="import" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="import">Import Data</TabsTrigger>
          <TabsTrigger value="export">Export & Backup</TabsTrigger>
        </TabsList>
        <TabsContent value="import">
          <Card>
            <CardHeader>
              <CardTitle>Import from CSV</CardTitle>
              <CardDescription>
                Upload a bank statement to import transactions. This tool supports
                simple CSV files.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CsvImporter />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="export">
          <DataExporter />
        </TabsContent>
      </Tabs>
    </div>
  );
}
