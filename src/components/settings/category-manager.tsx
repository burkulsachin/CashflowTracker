'use client';

import { useState, useMemo } from 'react';
import { PlusCircle, Archive, ArchiveRestore, Edit, GripVertical } from 'lucide-react';
import { useStore } from '@/hooks/use-store';
import type { Category } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import CategoryForm from '@/components/settings/category-form';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';

export function CategoryManager() {
  const { categories, upsertCategory } = useStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>();
  const [archiveAlert, setArchiveAlert] = useState<{isOpen: boolean, category?: Category}>({isOpen: false});

  const { income, expense } = useMemo(() => {
    return categories.reduce(
      (acc, cat) => {
        if (cat.kind === 'income') acc.income.push(cat);
        else acc.expense.push(cat);
        return acc;
      },
      { income: [] as Category[], expense: [] as Category[] }
    );
  }, [categories]);

  const handleNewCategory = () => {
    setSelectedCategory(undefined);
    setIsFormOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsFormOpen(true);
  };

  const handleArchiveToggle = (category: Category) => {
    upsertCategory({ ...category, isArchived: !category.isArchived });
    setArchiveAlert({ isOpen: false });
  };
  
  const openArchiveAlert = (category: Category) => {
      setArchiveAlert({ isOpen: true, category });
  }

  return (
    <>
      <Card>
        <CardHeader className='flex-row items-center justify-between'>
          <div>
            <CardTitle>Categories</CardTitle>
            <CardDescription>
              Organize your transactions by grouping them into categories.
            </CardDescription>
          </div>
          <Button onClick={handleNewCategory}>
            <PlusCircle /> New Category
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="expense">
            <TabsList className='mb-4'>
              <TabsTrigger value="expense">Expense</TabsTrigger>
              <TabsTrigger value="income">Income</TabsTrigger>
            </TabsList>
            <TabsContent value="expense">
              <CategoryList categories={expense} onEdit={handleEditCategory} onArchive={openArchiveAlert} />
            </TabsContent>
            <TabsContent value="income">
              <CategoryList categories={income} onEdit={handleEditCategory} onArchive={openArchiveAlert} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <CategoryForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        category={selectedCategory}
      />
      
      <AlertDialog open={archiveAlert.isOpen} onOpenChange={(isOpen) => setArchiveAlert({isOpen, category: undefined})}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {archiveAlert.category?.isArchived ? 'Restoring' : 'Archiving'} this category will make it {' '}
              {archiveAlert.category?.isArchived ? 'available' : 'unavailable'} for new transactions, but won't affect existing ones.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => archiveAlert.category && handleArchiveToggle(archiveAlert.category)}>
                {archiveAlert.category?.isArchived ? 'Restore' : 'Archive'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

interface CategoryListProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onArchive: (category: Category) => void;
}

function CategoryList({ categories, onEdit, onArchive }: CategoryListProps) {
  if (categories.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-8">
        No categories found.
      </div>
    );
  }
  return (
    <div className="space-y-2 rounded-md border">
      {categories.map((category) => (
        <div key={category.id} className="flex items-center p-3 gap-2 border-b last:border-b-0">
          <GripVertical className="h-5 w-5 text-muted-foreground" />
          <span className="flex-1 font-medium">{category.name}</span>
          {category.isArchived && <Badge variant="outline">Archived</Badge>}
          <div className='flex gap-2'>
            <Button variant="ghost" size="icon" className='h-8 w-8' onClick={() => onEdit(category)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className='h-8 w-8' onClick={() => onArchive(category)}>
              {category.isArchived ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
