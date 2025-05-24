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
import { Testimonial } from '@/types';
import ImageUploadField from '@/components/common/ImageUploadField';
import { supabase } from '@/integrations/supabase/client';

interface TestimonialFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<Testimonial, 'id' | 'created_at' | 'updated_at'>) => void;
  testimonial?: Testimonial;
  isLoading: boolean;
}

export default function TestimonialFormDialog({
  open,
  onOpenChange,
  onSubmit,
  testimonial,
  isLoading
}: TestimonialFormDialogProps) {
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<Omit<Testimonial, 'id' | 'created_at' | 'updated_at'>>({
    defaultValues: testimonial
      ? { name: testimonial.name, content: testimonial.content, image_url: testimonial.image_url }
      : { name: '', content: '', image_url: '' }
  });

  useEffect(() => {
    if (open) {
      reset(testimonial
        ? { 
            name: testimonial.name, 
            company: testimonial.company || '', 
            content: testimonial.content,
            rating: testimonial.rating || 5,
            image_url: testimonial.image_url || ''
          }
        : { 
            name: '', 
            company: '', 
            content: '',
            rating: 5,
            image_url: ''
          }
      );
    } else {
      // Reset form when dialog closes
      reset({
        name: '',
        company: '',
        content: '',
        rating: 5,
        image_url: ''
      });
    }
  }, [open, testimonial, reset]);

  const handleFormSubmit = async (data: Omit<Testimonial, 'id' | 'created_at' | 'updated_at'>) => {
    // If there's a previous image and it's different from the new one, delete the old image
    if (testimonial?.image_url && testimonial.image_url !== data.image_url) {
      try {
        const imagePath = testimonial.image_url.split('/').pop();
        if (imagePath) {
          const { error } = await supabase.storage
            .from('testimonial_images')
            .remove([`testimonials/${imagePath}`]);
          
          if (error) {
            console.error('Error deleting old image:', error);
          }
        }
      } catch (error) {
        console.error('Error deleting old image:', error);
      }
    }
    
    onSubmit(data);
  };

  const imageUrl = watch('image_url');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{testimonial ? 'Edit Testimonial' : 'Add Testimonial'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                {...register('name', { required: 'Name is required' })}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                {...register('company')}
                placeholder="Optional"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="content">Testimonial</Label>
              <Textarea
                id="content"
                rows={4}
                {...register('content', { required: 'Testimonial content is required' })}
              />
              {errors.content && (
                <p className="text-sm text-red-500">{errors.content.message}</p>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="rating">Rating (1-5)</Label>
              <Input
                id="rating"
                type="number"
                min="1"
                max="5"
                {...register('rating', { 
                  required: 'Rating is required',
                  min: { value: 1, message: 'Minimum rating is 1' },
                  max: { value: 5, message: 'Maximum rating is 5' },
                  valueAsNumber: true
                })}
              />
              {errors.rating && (
                <p className="text-sm text-red-500">{errors.rating.message}</p>
              )}
            </div>
            
            <ImageUploadField
              id="testimonial-image"
              label="Profile Image"
              value={imageUrl}
              onChange={(url) => setValue('image_url', url)}
              folderPath="testimonials"
              bucketName="testimonial_images"
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
                'Save Testimonial'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
