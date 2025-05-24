'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Loader2, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { NewTraining } from '@/types';
import TrainingFormDialog from '@/components/trainings/TrainingFormDialog';
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

export default function TrainingsPage() {
  const [trainings, setTrainings] = useState<NewTraining[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<NewTraining | undefined>();
  const [trainingToDelete, setTrainingToDelete] = useState<NewTraining | null>(null);
  const { toast } = useToast();

  const fetchTrainings = async () => {
    try {
      const { data, error } = await supabase
        .from('new_trainings')
        .select('*')
        .order('start_date', { ascending: false });

      if (error) throw error;
      setTrainings(data || []);
    } catch (error) {
      console.error('Error fetching trainings:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch trainings',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainings();
  }, []);

  const handleAddTraining = () => {
    setSelectedTraining(undefined);
    setIsDialogOpen(true);
  };

  const handleEditTraining = (training: NewTraining) => {
    setSelectedTraining(training);
    setIsDialogOpen(true);
  };

  const handleDeleteTraining = (training: NewTraining) => {
    setTrainingToDelete(training);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (data: Omit<NewTraining, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (selectedTraining) {
        const { error } = await supabase
          .from('new_trainings')
          .update(data)
          .eq('id', selectedTraining.id);

        if (error) throw error;
        toast({
          title: 'Success',
          description: 'Training updated successfully',
        });
      } else {
        const { error } = await supabase
          .from('new_trainings')
          .insert([data]);

        if (error) throw error;
        toast({
          title: 'Success',
          description: 'Training added successfully',
        });
      }
      setIsDialogOpen(false);
      fetchTrainings();
    } catch (error) {
      console.error('Error saving training:', error);
      toast({
        title: 'Error',
        description: 'Failed to save training',
        variant: 'destructive',
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!trainingToDelete) return;

    try {
      const { error } = await supabase
        .from('new_trainings')
        .delete()
        .eq('id', trainingToDelete.id);

      if (error) throw error;
      toast({
        title: 'Success',
        description: 'Training deleted successfully',
      });
      setIsDeleteDialogOpen(false);
      fetchTrainings();
    } catch (error) {
      console.error('Error deleting training:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete training',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Training Updates</h1>
        <Button onClick={handleAddTraining}>
          <Plus className="mr-2 h-4 w-4" />
          Add Training
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : trainings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <p className="text-muted-foreground">No trainings found</p>
            <Button onClick={handleAddTraining} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Training
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trainings.map((training) => (
            <Card key={training.id}>
              <CardHeader className="relative">
                <div className="flex justify-end space-x-2 mb-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditTraining(training)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteTraining(training)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {training.image_url && (
                  <div className="relative w-full h-48">
                    <img
                      src={training.image_url}
                      alt={training.title}
                      className="w-full h-full object-cover rounded-md"
                    />
                  </div>
                )}
                <CardTitle className="line-clamp-2 mt-4">{training.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {training.description}
                  </p>
                  <div className="flex items-center text-sm">
                    <span className="font-medium">Mode:</span>
                    <span className="ml-2">{training.mode}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="font-medium">Start Date:</span>
                    <span className="ml-2">{formatDate(training.start_date)}</span>
                  </div>
                  {training.end_date && (
                    <div className="flex items-center text-sm">
                      <span className="font-medium">End Date:</span>
                      <span className="ml-2">{formatDate(training.end_date)}</span>
                    </div>
                  )}
                  {training.location && (
                    <div className="flex items-center text-sm">
                      <span className="font-medium">Location:</span>
                      <span className="ml-2">{training.location}</span>
                    </div>
                  )}
                  {training.registration_link && (
                    <a
                      href={training.registration_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Register Now
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <TrainingFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSubmit}
        training={selectedTraining}
        isLoading={false}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the training
              and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 