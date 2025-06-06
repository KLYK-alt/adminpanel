import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { FAQ } from '@/types';
import { getFAQs, createFAQ, updateFAQ, deleteFAQ } from '@/services/supabaseService';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function FAQsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
  });

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  const queryClient = useQueryClient();

  const { data: faqs, isLoading } = useQuery({
    queryKey: ['faqs'],
    queryFn: getFAQs,
  });

  // Filtered FAQs
  const filteredFAQs = faqs?.filter((faq) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      faq.question.toLowerCase().includes(searchLower) ||
      faq.answer.toLowerCase().includes(searchLower)
    );
  });

  const createMutation = useMutation({
    mutationFn: createFAQ,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
      toast.success('FAQ created successfully');
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error('Failed to create FAQ');
      console.error(error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FAQ> }) =>
      updateFAQ(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
      toast.success('FAQ updated successfully');
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error('Failed to update FAQ');
      console.error(error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFAQ,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
      toast.success('FAQ deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete FAQ');
      console.error(error);
    },
  });

  const resetForm = () => {
    setFormData({
      question: '',
      answer: '',
    });
    setEditingFAQ(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingFAQ) {
      updateMutation.mutate({
        id: editingFAQ.id,
        data: formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (faq: FAQ) => {
    setEditingFAQ(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this FAQ?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">FAQs Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" />
              Add FAQ
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingFAQ ? 'Edit FAQ' : 'Add New FAQ'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Question</label>
                <Input
                  value={formData.question}
                  onChange={(e) =>
                    setFormData({ ...formData, question: e.target.value })
                  }
                  placeholder="Enter question"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Answer</label>
                <Textarea
                  value={formData.answer}
                  onChange={(e) =>
                    setFormData({ ...formData, answer: e.target.value })
                  }
                  placeholder="Enter answer"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                {editingFAQ ? 'Update FAQ' : 'Create FAQ'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Section */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </div>
        {searchQuery && (
          <div className="text-sm text-muted-foreground">
            Showing {filteredFAQs?.length} of {faqs?.length} FAQs
          </div>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Question</TableHead>
            <TableHead>Answer</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredFAQs?.map((faq) => (
            <TableRow key={faq.id}>
              <TableCell className="font-medium">{faq.question}</TableCell>
              <TableCell className="max-w-md">{faq.answer}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(faq)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(faq.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {filteredFAQs?.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-gray-500">
                {faqs?.length === 0
                  ? 'No FAQs added yet'
                  : 'No FAQs match your search'}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
} 