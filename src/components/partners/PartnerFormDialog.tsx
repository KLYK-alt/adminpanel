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
import { Partner } from '@/types';
import ImageUploadField from '@/components/common/ImageUploadField';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PartnerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<Partner, 'id' | 'created_at' | 'updated_at'>) => void;
  partner?: Partner;
  isLoading: boolean;
}

export default function PartnerFormDialog({
  open,
  onOpenChange,
  onSubmit,
  partner,
  isLoading
}: PartnerFormDialogProps) {
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<Omit<Partner, 'id' | 'created_at' | 'updated_at'>>({
    defaultValues: partner
      ? { name: partner.name, website: partner.website, logo_url: partner.logo_url }
      : { name: '', website: '', logo_url: '' }
  });

  // Reset form when partner prop changes or dialog opens
  useEffect(() => {
    if (open) {
      reset(partner 
        ? { name: partner.name, website: partner.website, logo_url: partner.logo_url }
        : { name: '', website: '', logo_url: '' }
      );
    } else {
      // Reset form when dialog closes
      reset({
        name: '',
        website: '',
        logo_url: ''
      });
    }
  }, [open, partner, reset]);

  const handleFormSubmit = async (data: Omit<Partner, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // If there's a previous logo and it's different from the new one, delete the old logo
      if (partner?.logo_url && partner.logo_url !== data.logo_url) {
        try {
          const logoPath = partner.logo_url.split('/').pop();
          if (logoPath) {
            const { error } = await supabase.storage
              .from('partner_logos')
              .remove([`partners/${logoPath}`]);
            
            if (error) {
              console.error('Error deleting old logo:', error);
              toast.error('Failed to delete old logo');
            }
          }
        } catch (error) {
          console.error('Error deleting old logo:', error);
          toast.error('Failed to delete old logo');
        }
      }
      
    onSubmit(data);
    } catch (error) {
      console.error('Error submitting partner form:', error);
      toast.error('Failed to save partner');
    }
  };

  const logoUrl = watch('logo_url');

  const handleLogoChange = (url: string) => {
    setValue('logo_url', url, { shouldValidate: true });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{partner ? 'Edit Partner' : 'Add New Partner'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Partner Name</Label>
              <Input
                id="name"
                {...register('name', { required: 'Partner name is required' })}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="website">Website URL</Label>
              <Input
                id="website"
                type="url"
                placeholder="https://example.com"
                {...register('website', {
                  pattern: {
                    value: /^https?:\/\/.+/,
                    message: 'Please enter a valid URL starting with http:// or https://'
                  }
                })}
              />
              {errors.website && (
                <p className="text-sm text-red-500">{errors.website.message}</p>
              )}
            </div>
            <ImageUploadField
              id="partner-logo"
              label="Partner Logo"
              value={logoUrl}
              onChange={handleLogoChange}
              folderPath="partners"
              bucketName="partner_logos"
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
                'Save Partner'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
