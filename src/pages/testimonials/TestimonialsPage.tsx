import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusCircle, Pencil, Trash, Loader2, Search } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Statistics, Testimonial } from '@/types';
import { 
  getTestimonials, 
  createTestimonial, 
  updateTestimonial, 
  deleteTestimonial,
  getStatistics,
  updateStatistics
} from '@/services/supabaseService';
import { toast } from 'sonner';
import TestimonialFormDialog from '@/components/testimonials/TestimonialFormDialog';
import DeleteConfirmDialog from '@/components/partners/DeleteConfirmDialog';
import StatisticsForm from '@/components/testimonials/StatisticsForm';

// Star rating component
interface StarProps {
  filled: boolean;
}

const Star = ({ filled }: StarProps) => (
  <svg
    className={`w-4 h-4 ${filled ? 'text-yellow-400' : 'text-gray-300'}`}
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

export default function TestimonialsPage() {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);

  // Fetch testimonials from Supabase
  const { data: testimonials = [], isLoading: isLoadingTestimonials, error: testimonialsError } = useQuery({
    queryKey: ['testimonials'],
    queryFn: getTestimonials
  });

  // Fetch statistics from Supabase
  const { data: statistics, isLoading: isLoadingStats, error: statsError } = useQuery({
    queryKey: ['statistics'],
    queryFn: getStatistics
  });

  // Filter testimonials based on search query and rating filter
  const filteredTestimonials = testimonials.filter(testimonial => {
    const matchesSearch = 
      testimonial.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (testimonial.company && testimonial.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
      testimonial.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRating = ratingFilter === null || testimonial.rating === ratingFilter;
    
    return matchesSearch && matchesRating;
  });

  // Create testimonial mutation
  const createMutation = useMutation({
    mutationFn: (data: Omit<Testimonial, 'id' | 'created_at' | 'updated_at'>) => createTestimonial(data),
    onSuccess: () => {
      toast.success('Testimonial added successfully');
      setIsAddDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
    },
    onError: (error) => {
      toast.error(`Error adding testimonial: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  // Update testimonial mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Testimonial> }) => updateTestimonial(id, data),
    onSuccess: () => {
      toast.success('Testimonial updated successfully');
      setSelectedTestimonial(null);
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
    },
    onError: (error) => {
      toast.error(`Error updating testimonial: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  // Delete testimonial mutation
  const deleteMutation = useMutation({
    mutationFn: deleteTestimonial,
    onSuccess: () => {
      toast.success('Testimonial deleted successfully');
      setIsDeleteDialogOpen(false);
      setSelectedTestimonial(null);
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
    },
    onError: (error) => {
      toast.error(`Error deleting testimonial: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  // Update statistics mutation
  const updateStatsMutation = useMutation({
    mutationFn: updateStatistics,
    onSuccess: () => {
      toast.success('Statistics updated successfully');
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
    },
    onError: (error) => {
      toast.error(`Error updating statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  const handleAddTestimonial = (data: Omit<Testimonial, 'id' | 'created_at' | 'updated_at'>) => {
    createMutation.mutate(data);
  };

  const handleUpdateTestimonial = (data: Partial<Testimonial>) => {
    if (selectedTestimonial) {
      updateMutation.mutate({ id: selectedTestimonial.id, data });
    }
  };

  const handleDeleteTestimonial = () => {
    if (selectedTestimonial) {
      deleteMutation.mutate(selectedTestimonial.id);
    }
  };

  const handleUpdateStats = (data: Partial<Statistics>) => {
    updateStatsMutation.mutate(data);
  };

  const openEditDialog = (testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial);
  };

  const openDeleteDialog = (testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial);
    setIsDeleteDialogOpen(true);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setRatingFilter(null);
  };

  if (testimonialsError || statsError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <h3 className="text-lg font-medium text-red-800">Error loading data</h3>
        <p className="text-sm text-red-600">
          {testimonialsError instanceof Error ? testimonialsError.message : 'An unknown error occurred'}
        </p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader 
        title="Testimonials" 
        description="Manage testimonials and statistics displayed on your website."
      />

      <Tabs defaultValue="testimonials" className="mt-6">
        <TabsList>
          <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="testimonials" className="pt-4">
          <div className="flex justify-between items-center mb-4">
            <Button 
              className="bg-admin-primary hover:bg-blue-600"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Testimonial
            </Button>
          </div>

          {/* Search and Filter Section */}
          <div className="mb-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search testimonials..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={ratingFilter === null ? '' : ratingFilter}
                  onChange={(e) => setRatingFilter(e.target.value ? Number(e.target.value) : null)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="">All Ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
          
          {isLoadingTestimonials ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 text-admin-primary animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredTestimonials.length > 0 ? (
                filteredTestimonials.map((testimonial) => (
                  <Card key={testimonial.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        {testimonial.image_url ? (
                          <div className="h-12 w-12 rounded-full overflow-hidden flex-shrink-0">
                            <img 
                              src={testimonial.image_url} 
                              alt={testimonial.name} 
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                            {testimonial.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <h3 className="font-medium">{testimonial.name}</h3>
                          {testimonial.company && (
                            <p className="text-sm text-slate-500">{testimonial.company}</p>
                          )}
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              filled={i < (testimonial.rating || 0)}
                            />
                          ))}
                        </div>
                        <p className="mt-2 text-slate-600">"{testimonial.content}"</p>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(testimonial)}
                      >
                        <Pencil className="h-4 w-4 mr-1" /> Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => openDeleteDialog(testimonial)}
                      >
                        <Trash className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-full p-8 text-center border rounded-md bg-slate-50">
                  <p className="text-slate-500">
                    {searchQuery || ratingFilter !== null 
                      ? 'No testimonials found matching your filters.' 
                      : 'No testimonials found. Add your first testimonial to get started.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="statistics" className="pt-4">
          {isLoadingStats ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 text-admin-primary animate-spin" />
            </div>
          ) : statistics ? (
            <StatisticsForm
              statistics={statistics}
              onSave={handleUpdateStats}
              isLoading={updateStatsMutation.isPending}
            />
          ) : (
            <div className="p-8 text-center border rounded-md bg-slate-50">
              <p className="text-slate-500">No statistics found.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Testimonial Dialog */}
      <TestimonialFormDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleAddTestimonial}
        isLoading={createMutation.isPending}
      />

      {/* Edit Testimonial Dialog */}
      <TestimonialFormDialog
        open={!!selectedTestimonial}
        onOpenChange={() => setSelectedTestimonial(null)}
        testimonial={selectedTestimonial || undefined}
        onSubmit={handleUpdateTestimonial}
        isLoading={updateMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteTestimonial}
        isLoading={deleteMutation.isPending}
        title="Delete Testimonial"
        description={`Are you sure you want to delete the testimonial from ${selectedTestimonial?.name}? This action cannot be undone.`}
      />
    </div>
  );
}
