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
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import ImageUploadField from '@/components/common/ImageUploadField';

interface BlogFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>) => void;
  blogPost?: BlogPost;
  isLoading: boolean;
}

export default function BlogFormDialog({
  open,
  onOpenChange,
  onSubmit,
  blogPost,
  isLoading
}: BlogFormDialogProps) {
  const form = useForm<Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>>({
    defaultValues: blogPost
      ? { 
          title: blogPost.title, 
          content: blogPost.content, 
          author: blogPost.author, 
          published: blogPost.published ?? false,
          image_url: blogPost.image_url 
        }
      : { 
          title: '', 
          content: '', 
          author: '', 
          published: false,
          image_url: '' 
        }
  });

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = form;

  // Reset form when blogPost prop changes or dialog opens
  useEffect(() => {
    if (open) {
      reset(blogPost
        ? { 
            title: blogPost.title, 
            content: blogPost.content, 
            author: blogPost.author, 
            published: blogPost.published ?? false,
            image_url: blogPost.image_url 
          }
        : { 
            title: '', 
            content: '', 
            author: '', 
            published: false,
            image_url: '' 
          }
      );
    }
  }, [open, blogPost, reset]);

  const handleFormSubmit = (data: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>) => {
    onSubmit(data);
  };

  const imageUrl = watch('image_url');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{blogPost ? 'Edit Blog Post' : 'Create Blog Post'}</DialogTitle>
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
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                {...register('author', { required: 'Author is required' })}
              />
              {errors.author && (
                <p className="text-sm text-red-500">{errors.author.message}</p>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                rows={8}
                {...register('content', { required: 'Content is required' })}
              />
              {errors.content && (
                <p className="text-sm text-red-500">{errors.content.message}</p>
              )}
            </div>
            
            <ImageUploadField
              id="blog-image"
              label="Featured Image"
              value={imageUrl}
              onChange={(url) => setValue('image_url', url)}
              folderPath="blogs"
              bucketName="blog_images"
            />
            
            <div className="flex items-center space-x-2">
              <Switch
                id="published"
                checked={watch('published')}
                onCheckedChange={(checked) => setValue('published', checked)}
              />
              <Label htmlFor="published">Published</Label>
            </div>
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
