import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { uploadImage, StorageBucket } from '@/services/supabaseService';

interface ImageUploadFieldProps {
  id: string;
  label: string;
  value: string | null | undefined;
  onChange: (url: string) => void;
  folderPath?: string;
  bucketName: StorageBucket;
  className?: string;
  accept?: string;
}

export default function ImageUploadField({
  id,
  label,
  value,
  onChange,
  folderPath = 'uploads',
  bucketName,
  className,
  accept = 'image/*'
}: ImageUploadFieldProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.');
      return;
    }

    // Validate file size (5MB limit)
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > 5) {
      toast.error('File size exceeds the 5MB limit');
      return;
    }

    try {
      setIsUploading(true);
      // Create object URL for immediate preview
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // Upload to Supabase
      const imageUrl = await uploadImage(file, bucketName, folderPath);
      onChange(imageUrl);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Upload failed:', error);
      setPreviewUrl(value || null); // Revert to previous image if upload fails
      
      // More specific error messages
      if (error instanceof Error) {
        if (error.message.includes('Invalid file type')) {
          toast.error('Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.');
        } else if (error.message.includes('File size too large')) {
          toast.error('File size exceeds the 5MB limit');
        } else {
          toast.error(`Upload failed: ${error.message}`);
        }
      } else {
        toast.error('Failed to upload image. Please try again.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleClearImage = () => {
    setPreviewUrl(null);
    onChange('');
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      <div className="flex flex-col gap-4">
        {previewUrl && (
          <div className="relative">
            <img
              src={previewUrl}
              alt={`${label} preview`}
              className="w-full max-w-[200px] h-auto rounded-md object-cover aspect-square"
            />
            <Button
              type="button"
              size="icon"
              variant="destructive"
              className="absolute top-1 right-1 h-6 w-6"
              onClick={handleClearImage}
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div>
          <Input
            id={id}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            disabled={isUploading}
            className="hidden"
          />
          <Label
            htmlFor={id}
            className={cn(
              "flex items-center justify-center gap-2 h-10 px-4 py-2 rounded-md border cursor-pointer",
              "bg-secondary hover:bg-secondary/80 text-secondary-foreground",
              isUploading && "opacity-50 cursor-not-allowed"
            )}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                {previewUrl ? 'Change image' : 'Upload image'}
              </>
            )}
          </Label>
          <p className="text-xs text-muted-foreground mt-1">
            Supported formats: JPEG, PNG, GIF, WebP. Maximum file size: 5MB
          </p>
        </div>
      </div>
    </div>
  );
}
