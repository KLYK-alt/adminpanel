import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { NewTraining } from '@/types';
import ImageUploadField from '@/components/common/ImageUploadField';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TrainingFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<NewTraining, 'id' | 'created_at' | 'updated_at'>) => void;
  training?: NewTraining;
  isLoading: boolean;
}

export default function TrainingFormDialog({
  open,
  onOpenChange,
  onSubmit,
  training,
  isLoading
}: TrainingFormDialogProps) {
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<Omit<NewTraining, 'id' | 'created_at' | 'updated_at'>>({
    defaultValues: training
      ? { 
          title: training.title,
          description: training.description || '',
          start_date: training.start_date,
          end_date: training.end_date || '',
          location: training.location || '',
          mode: training.mode,
          image_url: training.image_url || '',
          registration_link: training.registration_link || ''
        }
      : { 
          title: '',
          description: '',
          start_date: '',
          end_date: '',
          location: '',
          mode: 'Online',
          image_url: '',
          registration_link: ''
        }
  });

  useEffect(() => {
    if (open) {
      reset(training
        ? { 
            title: training.title,
            description: training.description || '',
            start_date: training.start_date,
            end_date: training.end_date || '',
            location: training.location || '',
            mode: training.mode,
            image_url: training.image_url || '',
            registration_link: training.registration_link || ''
          }
        : { 
            title: '',
            description: '',
            start_date: '',
            end_date: '',
            location: '',
            mode: 'Online',
            image_url: '',
            registration_link: ''
          }
      );
    } else {
      // Reset form when dialog closes
      reset({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        location: '',
        mode: 'Online',
        image_url: '',
        registration_link: ''
      });
    }
  }, [open, training, reset]);

  const handleFormSubmit = async (data: Omit<NewTraining, 'id' | 'created_at' | 'updated_at'>) => {
    try {
    onSubmit(data);
    } catch (error) {
      console.error('Error submitting training:', error);
      toast.error('Failed to save training');
    }
  };

  const imageUrl = watch('image_url');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{training ? 'Edit Training' : 'Add New Training'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                {...register('title', { required: 'Title is required' })}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={3}
                {...register('description')}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  {...register('start_date', { required: 'Start date is required' })}
                />
                {errors.start_date && (
                  <p className="text-sm text-red-500">{errors.start_date.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  {...register('end_date')}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                {...register('location')}
                placeholder="Enter location or leave empty for online trainings"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="mode">Mode</Label>
              <Select
                defaultValue={watch('mode')}
                onValueChange={(value) => setValue('mode', value as 'Online' | 'Offline' | 'Hybrid')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Online">Online</SelectItem>
                  <SelectItem value="Offline">Offline</SelectItem>
                  <SelectItem value="Hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="registration_link">Registration Link</Label>
              <Input
                id="registration_link"
                type="url"
                placeholder="https://example.com/register"
                {...register('registration_link', {
                  pattern: {
                    value: /^https?:\/\/.+/,
                    message: 'Please enter a valid URL starting with http:// or https://'
                  }
                })}
              />
              {errors.registration_link && (
                <p className="text-sm text-red-500">{errors.registration_link.message}</p>
              )}
            </div>

            <ImageUploadField
              id="training-image"
              label="Training Image"
              value={imageUrl}
              onChange={(url) => setValue('image_url', url)}
              folderPath="trainings"
              bucketName="training_images"
              accept="image/png,image/jpeg,image/webp"
            />
          </div>

          <DialogFooter className="pt-4 border-t">
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Training'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 