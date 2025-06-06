import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Service } from '@/types';
import { getServices, createService, updateService, deleteService } from '@/services/supabaseService';
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

export default function ServicesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    short_description: '',
    bullet_points: [] as string[],
    keywords: [] as string[],
    image_url: '',
  });

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  const queryClient = useQueryClient();

  const { data: services, isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: getServices,
  });

  // Filtered services
  const filteredServices = services?.filter((service) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      service.title.toLowerCase().includes(searchLower) ||
      service.short_description.toLowerCase().includes(searchLower) ||
      (service.bullet_points?.some(point => point.toLowerCase().includes(searchLower)) ?? false) ||
      (service.keywords?.some(keyword => keyword.toLowerCase().includes(searchLower)) ?? false)
    );
  });

  const createMutation = useMutation({
    mutationFn: createService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Service created successfully');
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error('Failed to create service');
      console.error(error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Service> }) =>
      updateService(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Service updated successfully');
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error('Failed to update service');
      console.error(error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Service deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete service');
      console.error(error);
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      short_description: '',
      bullet_points: [],
      keywords: [],
      image_url: '',
    });
    setEditingService(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingService) {
      updateMutation.mutate({
        id: editingService.id,
        data: formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      title: service.title,
      short_description: service.short_description,
      bullet_points: service.bullet_points || [],
      keywords: service.keywords || [],
      image_url: service.image_url || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Services Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingService ? 'Edit Service' : 'Add New Service'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Enter service title"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Short Description</label>
                <Textarea
                  value={formData.short_description}
                  onChange={(e) =>
                    setFormData({ ...formData, short_description: e.target.value })
                  }
                  placeholder="Enter short description"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Bullet Points (one per line)</label>
                <Textarea
                  value={formData.bullet_points.join('\n')}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bullet_points: e.target.value.split('\n').filter(Boolean),
                    })
                  }
                  placeholder="Enter bullet points (one per line)"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Keywords (comma-separated)</label>
                <Input
                  value={formData.keywords.join(', ')}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      keywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean),
                    })
                  }
                  placeholder="Enter keywords (comma-separated)"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Image URL</label>
                <Input
                  value={formData.image_url}
                  onChange={(e) =>
                    setFormData({ ...formData, image_url: e.target.value })
                  }
                  placeholder="Enter image URL (optional)"
                />
              </div>
              <Button type="submit" className="w-full">
                {editingService ? 'Update Service' : 'Create Service'}
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
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </div>
        {searchQuery && (
          <div className="text-sm text-muted-foreground">
            Showing {filteredServices?.length} of {services?.length} services
          </div>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Keywords</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredServices?.map((service) => (
            <TableRow key={service.id}>
              <TableCell className="font-medium">{service.title}</TableCell>
              <TableCell className="max-w-md truncate">{service.short_description}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {service.keywords?.map((keyword) => (
                    <span
                      key={keyword}
                      className="px-2 py-1 bg-secondary text-secondary-foreground rounded-full text-xs"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(service)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(service.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {filteredServices?.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-gray-500">
                {services?.length === 0
                  ? 'No services added yet'
                  : 'No services match your search'}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
} 