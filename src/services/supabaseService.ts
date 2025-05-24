import { supabase } from '@/integrations/supabase/client';
import { BlogPost, TeamMember, Testimonial, Partner, Statistics, NewTraining, Contact } from '@/types';

// Blog post services
export const getBlogPosts = async (): Promise<BlogPost[]> => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching blog posts:', error);
    throw error;
  }

  return data || [];
};

export const createBlogPost = async (blogPost: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>): Promise<BlogPost> => {
  const { data, error } = await supabase
    .from('blog_posts')
    .insert([{ ...blogPost }])
    .select()
    .single();

  if (error) {
    console.error('Error creating blog post:', error);
    throw error;
  }

  return data;
};

export const updateBlogPost = async (id: string, blogPost: Partial<BlogPost>): Promise<BlogPost> => {
  // First get the existing blog post to check for image changes
  const { data: existingPost, error: fetchError } = await supabase
    .from('blog_posts')
    .select('image_url')
    .eq('id', id)
    .single();

  if (fetchError) {
    console.error('Error fetching blog post:', fetchError);
    throw fetchError;
  }

  // If there's a previous image and it's different from the new one, delete the old image
  if (existingPost?.image_url && existingPost.image_url !== blogPost.image_url) {
    await deleteImageFromStorage(existingPost.image_url, 'blog_images', 'blog');
  }

  // Update the blog post
  const { data, error } = await supabase
    .from('blog_posts')
    .update({ ...blogPost, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating blog post:', error);
    throw error;
  }

  return data;
};

export const deleteBlogPost = async (id: string): Promise<void> => {
  // First get the blog post to get its image URL
  const { data: blogPost, error: fetchError } = await supabase
    .from('blog_posts')
    .select('image_url')
    .eq('id', id)
    .single();

  if (fetchError) {
    console.error('Error fetching blog post:', fetchError);
    throw fetchError;
  }

  // Delete the image from storage
  await deleteImageFromStorage(blogPost?.image_url, 'blog_images', 'blog');

  // Delete the blog post
  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting blog post:', error);
    throw error;
  }
};

// Team member services
export const getTeamMembers = async (): Promise<TeamMember[]> => {
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching team members:', error);
    throw error;
  }

  return data || [];
};

export const createTeamMember = async (member: Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>): Promise<TeamMember> => {
  const { data, error } = await supabase
    .from('team_members')
    .insert([{ ...member }])
    .select()
    .single();

  if (error) {
    console.error('Error creating team member:', error);
    throw error;
  }

  return data;
};

export const updateTeamMember = async (id: string, member: Partial<TeamMember>): Promise<TeamMember> => {
  const { data, error } = await supabase
    .from('team_members')
    .update({ ...member, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating team member:', error);
    throw error;
  }

  return data;
};

export const deleteTeamMember = async (id: string): Promise<void> => {
  // First get the team member to get their image URL
  const { data: teamMember, error: fetchError } = await supabase
    .from('team_members')
    .select('image_url')
    .eq('id', id)
    .single();

  if (fetchError) {
    console.error('Error fetching team member:', fetchError);
    throw fetchError;
  }

  // Delete the image from storage
  await deleteImageFromStorage(teamMember?.image_url, 'team_images', 'team');

  // Delete the team member
  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting team member:', error);
    throw error;
  }
};

// Testimonial services
export const getTestimonials = async (): Promise<Testimonial[]> => {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching testimonials:', error);
    throw error;
  }

  return data || [];
};

export const createTestimonial = async (testimonial: Omit<Testimonial, 'id' | 'created_at' | 'updated_at'>): Promise<Testimonial> => {
  const { data, error } = await supabase
    .from('testimonials')
    .insert([{ ...testimonial }])
    .select()
    .single();

  if (error) {
    console.error('Error creating testimonial:', error);
    throw error;
  }

  return data;
};

export const updateTestimonial = async (id: string, testimonial: Partial<Testimonial>): Promise<Testimonial> => {
  const { data, error } = await supabase
    .from('testimonials')
    .update({ ...testimonial, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating testimonial:', error);
    throw error;
  }

  return data;
};

export const deleteTestimonial = async (id: string): Promise<void> => {
  // First get the testimonial to get its image URL
  const { data: testimonial, error: fetchError } = await supabase
    .from('testimonials')
    .select('image_url')
    .eq('id', id)
    .single();

  if (fetchError) {
    console.error('Error fetching testimonial:', fetchError);
    throw fetchError;
  }

  // Delete the image from storage
  await deleteImageFromStorage(testimonial?.image_url, 'testimonial_images', 'testimonials');

  // Delete the testimonial
  const { error } = await supabase
    .from('testimonials')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting testimonial:', error);
    throw error;
  }
};

// Partner services
export const getPartners = async (): Promise<Partner[]> => {
  const { data, error } = await supabase
    .from('partners')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching partners:', error);
    throw error;
  }

  return data || [];
};

export const createPartner = async (partner: Omit<Partner, 'id' | 'created_at' | 'updated_at'>): Promise<Partner> => {
  const { data, error } = await supabase
    .from('partners')
    .insert([{ ...partner }])
    .select()
    .single();

  if (error) {
    console.error('Error creating partner:', error);
    throw error;
  }

  return data;
};

export const updatePartner = async (id: string, partner: Partial<Partner>): Promise<Partner> => {
  // First get the existing partner to check for logo changes
  const { data: existingPartner, error: fetchError } = await supabase
    .from('partners')
    .select('logo_url')
    .eq('id', id)
    .single();

  if (fetchError) {
    console.error('Error fetching partner:', fetchError);
    throw fetchError;
  }

  // If there's a previous logo and it's different from the new one, delete the old logo
  if (existingPartner?.logo_url && existingPartner.logo_url !== partner.logo_url) {
    await deleteImageFromStorage(existingPartner.logo_url, 'partner_logos', 'partners');
  }

  // Update the partner
  const { data, error } = await supabase
    .from('partners')
    .update({ ...partner, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating partner:', error);
    throw error;
  }

  return data;
};

export const deletePartner = async (id: string): Promise<void> => {
  // First get the partner to get their logo URL
  const { data: partner, error: fetchError } = await supabase
    .from('partners')
    .select('logo_url')
    .eq('id', id)
    .single();

  if (fetchError) {
    console.error('Error fetching partner:', fetchError);
    throw fetchError;
  }

  // Delete the logo from storage
  await deleteImageFromStorage(partner?.logo_url, 'partner_logos', 'partners');

  // Delete the partner
  const { error } = await supabase
    .from('partners')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting partner:', error);
    throw error;
  }
};

// Statistics services
export const getStatistics = async (): Promise<Statistics> => {
  const { data, error } = await supabase
    .from('statistics')
    .select('*')
    .single();

  if (error) {
    console.error('Error fetching statistics:', error);
    throw error;
  }

  return data;
};

export const updateStatistics = async (stats: Partial<Statistics>): Promise<Statistics> => {
  const { data: existingStats } = await supabase
    .from('statistics')
    .select('id')
    .single();

  if (!existingStats) {
    throw new Error('No statistics record found to update');
  }

  const { data, error } = await supabase
    .from('statistics')
    .update({ ...stats, updated_at: new Date().toISOString() })
    .eq('id', existingStats.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating statistics:', error);
    throw error;
  }

  return data;
};

// Training services
export const getTrainings = async (): Promise<NewTraining[]> => {
  const { data, error } = await supabase
    .from('new_trainings')
    .select('*')
    .order('start_date', { ascending: true });

  if (error) {
    console.error('Error fetching trainings:', error);
    throw error;
  }

  return data || [];
};

export const createTraining = async (training: Omit<NewTraining, 'id' | 'created_at' | 'updated_at'>): Promise<NewTraining> => {
  const { data, error } = await supabase
    .from('new_trainings')
    .insert([{ ...training }])
    .select()
    .single();

  if (error) {
    console.error('Error creating training:', error);
    throw error;
  }

  return data;
};

export const updateTraining = async (id: string, training: Partial<NewTraining>): Promise<NewTraining> => {
  // First get the existing training to check for image changes
  const { data: existingTraining, error: fetchError } = await supabase
    .from('new_trainings')
    .select('image_url')
    .eq('id', id)
    .single();

  if (fetchError) {
    console.error('Error fetching training:', fetchError);
    throw fetchError;
  }

  // If there's a previous image and it's different from the new one, delete the old image
  if (existingTraining?.image_url && existingTraining.image_url !== training.image_url) {
    await deleteImageFromStorage(existingTraining.image_url, 'training_images', 'trainings');
  }

  // Update the training
  const { data, error } = await supabase
    .from('new_trainings')
    .update({ ...training, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating training:', error);
    throw error;
  }

  return data;
};

export const deleteTraining = async (id: string): Promise<void> => {
  // First get the training to get its image URL
  const { data: training, error: fetchError } = await supabase
    .from('new_trainings')
    .select('image_url')
    .eq('id', id)
    .single();

  if (fetchError) {
    console.error('Error fetching training:', fetchError);
    throw fetchError;
  }

  // Delete the image from storage
  await deleteImageFromStorage(training?.image_url, 'training_images', 'trainings');

  // Delete the training
  const { error } = await supabase
    .from('new_trainings')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting training:', error);
    throw error;
  }
};

// Define valid bucket names
export type StorageBucket = 'team_images' | 'blog_images' | 'testimonial_images' | 'partner_logos' | 'training_images';

// File upload service for images
export const uploadImage = async (file: File, bucket: StorageBucket, folderPath: string = ''): Promise<string> => {
  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.');
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error('File size too large. Maximum size is 5MB.');
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
  const filePath = folderPath ? `${folderPath}/${fileName}` : fileName;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('Error uploading image:', error);
    throw error;
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return publicUrl;
};

// Delete image from storage
export const deleteImage = async (bucket: StorageBucket, path: string): Promise<void> => {
  // Extract path from URL if full URL is provided
  if (path.includes(bucket)) {
    const url = new URL(path);
    path = url.pathname.split('/').slice(2).join('/');
  }

  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

// Helper function to delete image from Supabase storage
const deleteImageFromStorage = async (imageUrl: string | null, bucketName: string, folderPath: string) => {
  if (!imageUrl) return;
  
  try {
    // Extract the path from the URL
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    const fileName = pathParts[pathParts.length - 1];
    
    if (fileName) {
      // Remove any query parameters from the filename
      const cleanFileName = fileName.split('?')[0];
      const { error } = await supabase.storage
        .from(bucketName)
        .remove([`${folderPath}/${cleanFileName}`]);
      
      if (error) {
        console.error(`Error deleting image from ${bucketName}:`, error);
        throw error;
      }
    }
  } catch (error) {
    console.error(`Error deleting image from ${bucketName}:`, error);
    throw error;
  }
};

// Contact services
export const getContacts = async (): Promise<Contact[]> => {
  const { data, error } = await supabase
    .from('contact_us')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching contacts:', error);
    throw error;
  }

  return data || [];
};

export const deleteContact = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('contact_us')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting contact:', error);
    throw error;
  }
};
