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
import { BlogPost } from '@/types';
import ImageUploadField from '@/components/common/ImageUploadField';
import { toast } from 'sonner';

interface BlogFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>) => void;
  post?: BlogPost;
  isLoading: boolean;
}

export default function BlogFormDialog({
  open,
  onOpenChange,
  onSubmit,
  post,
  isLoading
}: BlogFormDialogProps) {
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>>({
    defaultValues: post
      ? { title: post.title, content: post.content, image_url: post.image_url }
      : { title: '', content: '', image_url: '' }
  });

  useEffect(() => {
    if (open) {
      reset(post 
        ? { title: post.title, content: post.content, image_url: post.image_url }
        : { title: '', content: '', image_url: '' }
      );
    } else {
      // Reset form when dialog closes
      reset({
        title: '',
        content: '',
        image_url: ''
      });
    }
  }, [open, post, reset]);

  const handleFormSubmit = async (data: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      onSubmit(data);
    } catch (error) {
      console.error('Error submitting blog post:', error);
      toast.error('Failed to save blog post');
    }
  };

  const imageUrl = watch('image_url');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{post ? 'Edit Blog Post' : 'Add Blog Post'}</DialogTitle>
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
              <Label htmlFor="content">Content</Label>
              <Textarea 
                id="content" 
                rows={4}
                {...register('content', { required: 'Content is required' })}
              />
              {errors.content && (
                <p className="text-sm text-red-500">{errors.content.message}</p>
              )}
            </div>

            <ImageUploadField
              id="blog-image"
              label="Blog Image"
              value={imageUrl}
              onChange={(url) => setValue('image_url', url)}
              folderPath="blog"
              bucketName="blog_images"
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
                'Save Blog Post'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 