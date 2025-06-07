import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { MissionVision } from '@/types';
import { getMissionVision, createMissionVision, updateMissionVision, deleteMissionVision } from '@/services/supabaseService';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function MissionVisionPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MissionVision | null>(null);
  const [formData, setFormData] = useState({
    type: 'mission' as 'mission' | 'vision' | 'story',
    title: '',
    content: '',
  });

  const queryClient = useQueryClient();

  const { data: items, isLoading } = useQuery({
    queryKey: ['mission-vision'],
    queryFn: getMissionVision,
  });

  const createMutation = useMutation({
    mutationFn: createMissionVision,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mission-vision'] });
      toast.success('Item created successfully');
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error('Failed to create item');
      console.error(error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MissionVision> }) =>
      updateMissionVision(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mission-vision'] });
      toast.success('Item updated successfully');
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error('Failed to update item');
      console.error(error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMissionVision,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mission-vision'] });
      toast.success('Item deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete item');
      console.error(error);
    },
  });

  const resetForm = () => {
    setFormData({
      type: 'mission',
      title: '',
      content: '',
    });
    setEditingItem(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      title: formData.type === 'story' ? null : formData.title,
    };
    
    if (editingItem) {
      updateMutation.mutate({
        id: editingItem.id,
        data,
      });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (item: MissionVision) => {
    setEditingItem(item);
    setFormData({
      type: item.type,
      title: item.title || '',
      content: item.content,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const missions = items?.filter(item => item.type === 'mission') || [];
  const visions = items?.filter(item => item.type === 'vision') || [];
  const stories = items?.filter(item => item.type === 'story') || [];

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mission, Vision & Stories</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Edit Item' : 'Add New Item'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Type</label>
                <Select
                  value={formData.type}
                  onValueChange={(value: 'mission' | 'vision' | 'story') =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mission">Mission</SelectItem>
                    <SelectItem value="vision">Vision</SelectItem>
                    <SelectItem value="story">Story</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.type !== 'story' && (
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder={`Enter ${formData.type} title`}
                    required
                  />
                </div>
              )}
              <div>
                <label className="text-sm font-medium">Content</label>
                <Textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder={`Enter ${formData.type} statement`}
                  required
                  className="min-h-[200px]"
                />
              </div>
              <Button type="submit" className="w-full">
                {editingItem ? 'Update Item' : 'Create Item'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Mission Statements</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Content</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {missions.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell className="whitespace-pre-wrap">{item.content}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(item)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {missions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-gray-500">
                    No mission statements added yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Vision Statements</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Content</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visions.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell className="whitespace-pre-wrap">{item.content}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(item)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {visions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-gray-500">
                    No vision statements added yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Stories</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Content</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stories.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="whitespace-pre-wrap">{item.content}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(item)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {stories.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-gray-500">
                    No stories added yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
} 