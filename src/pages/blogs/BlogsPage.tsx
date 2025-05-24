
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusCircle, Search, Filter, Eye, EyeOff, Edit, Trash, Loader2 } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { BlogPost } from '@/types';
import { getBlogPosts, createBlogPost, updateBlogPost, deleteBlogPost } from '@/services/supabaseService';
import { toast } from 'sonner';
import BlogFormDialog from '@/components/blogs/BlogFormDialog';
import DeleteConfirmDialog from '@/components/partners/DeleteConfirmDialog';

export default function BlogsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);

  // Fetch blog posts from Supabase
  const { data: blogs = [], isLoading, error } = useQuery({
    queryKey: ['blogs'],
    queryFn: getBlogPosts
  });

  // Create blog post mutation
  const createMutation = useMutation({
    mutationFn: (data: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>) => createBlogPost(data),
    onSuccess: () => {
      toast.success('Blog post created successfully');
      setIsAddDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
    },
    onError: (error) => {
      toast.error(`Error creating blog post: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  // Update blog post mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<BlogPost> }) => updateBlogPost(id, data),
    onSuccess: () => {
      toast.success('Blog post updated successfully');
      setSelectedBlog(null);
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
    },
    onError: (error) => {
      toast.error(`Error updating blog post: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  // Delete blog post mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteBlogPost(id),
    onSuccess: () => {
      toast.success('Blog post deleted successfully');
      setIsDeleteDialogOpen(false);
      setSelectedBlog(null);
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
    },
    onError: (error) => {
      toast.error(`Error deleting blog post: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  // Filter blogs based on search term
  const filteredBlogs = blogs.filter(blog => 
    blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddBlog = (data: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>) => {
    createMutation.mutate(data);
  };

  const handleUpdateBlog = (data: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>) => {
    if (selectedBlog) {
      updateMutation.mutate({ id: selectedBlog.id, data });
    }
  };

  const handleDeleteBlog = () => {
    if (selectedBlog) {
      deleteMutation.mutate(selectedBlog.id);
    }
  };

  const togglePublishStatus = (blog: BlogPost) => {
    updateMutation.mutate({ 
      id: blog.id, 
      data: { published: !blog.published } 
    });
  };

  const openEditDialog = (blog: BlogPost) => {
    setSelectedBlog(blog);
  };

  const openDeleteDialog = (blog: BlogPost) => {
    setSelectedBlog(blog);
    setIsDeleteDialogOpen(true);
  };

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <h3 className="text-lg font-medium text-red-800">Error loading blog posts</h3>
        <p className="text-sm text-red-600">
          {error instanceof Error ? error.message : 'An unknown error occurred'}
        </p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader 
        title="Blog Posts" 
        description="Manage your EV technology blog content."
        actions={
          <Button 
            className="bg-admin-primary hover:bg-blue-600"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            New Blog Post
          </Button>
        }
      />

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search blog posts..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="sm:w-auto">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 text-admin-primary animate-spin" />
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBlogs.length > 0 ? (
                filteredBlogs.map((blog) => (
                  <TableRow key={blog.id}>
                    <TableCell className="font-medium">{blog.title}</TableCell>
                    <TableCell>{blog.author}</TableCell>
                    <TableCell>
                      {new Date(blog.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={blog.published ? "default" : "outline"}>
                        {blog.published ? "Published" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => togglePublishStatus(blog)}
                        title={blog.published ? "Unpublish" : "Publish"}
                        disabled={updateMutation.isPending}
                      >
                        {updateMutation.isPending && selectedBlog?.id === blog.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : blog.published ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openEditDialog(blog)}
                      >
                        <Edit className="h-4 w-4 mr-1" /> Edit
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => openDeleteDialog(blog)}
                      >
                        <Trash className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No blog posts found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add/Edit Blog Dialog */}
      <BlogFormDialog 
        open={isAddDialogOpen || !!selectedBlog}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddDialogOpen(false);
            setSelectedBlog(null);
          }
        }}
        onSubmit={selectedBlog ? handleUpdateBlog : handleAddBlog}
        blogPost={selectedBlog || undefined}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog 
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteBlog}
        isLoading={deleteMutation.isPending}
        title="Delete Blog Post"
        description={`Are you sure you want to delete "${selectedBlog?.title}"? This action cannot be undone.`}
      />
    </div>
  );
}
