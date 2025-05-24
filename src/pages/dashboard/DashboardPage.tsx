
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { PlusCircle, Edit, Trash, Loader2 } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { getBlogPosts, getTeamMembers, getPartners, getStatistics } from '@/services/supabaseService';

export default function DashboardPage() {
  const navigate = useNavigate();

  // Fetch data from Supabase
  const { 
    data: blogs = [], 
    isLoading: isLoadingBlogs 
  } = useQuery({
    queryKey: ['dashboardBlogs'],
    queryFn: () => getBlogPosts().then(posts => posts.slice(0, 3)), // Only get latest 3
  });

  const { 
    data: stats,
    isLoading: isLoadingStats
  } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: getStatistics
  });

  const { 
    data: teamCount = 0,
    isLoading: isLoadingTeam
  } = useQuery({
    queryKey: ['dashboardTeam'],
    queryFn: () => getTeamMembers().then(members => members.length)
  });

  const { 
    data: partnerCount = 0,
    isLoading: isLoadingPartners
  } = useQuery({
    queryKey: ['dashboardPartners'],
    queryFn: () => getPartners().then(partners => partners.length)
  });

  const isLoading = isLoadingBlogs || isLoadingStats || isLoadingTeam || isLoadingPartners;

  return (
    <div>
      <PageHeader 
        title="Dashboard" 
        description="Manage your EV technology blog posts and website content."
        actions={
          <Button 
            className="bg-admin-primary hover:bg-blue-600"
            onClick={() => navigate('/blogs')}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            New Blog Post
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 text-admin-primary animate-spin" />
        </div>
      ) : (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Blog Posts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{blogs.length}</div>
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-sm text-blue-600" 
                  onClick={() => navigate('/blogs')}
                >
                  Manage Posts
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Team Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{teamCount}</div>
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-sm text-blue-600" 
                  onClick={() => navigate('/team')}
                >
                  Manage Team
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Partners
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{partnerCount}</div>
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-sm text-blue-600" 
                  onClick={() => navigate('/partners')}
                >
                  Manage Partners
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Satisfaction Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats ? `${stats.satisfaction_rate}%` : 'N/A'}
                </div>
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-sm text-blue-600" 
                  onClick={() => navigate('/testimonials')}
                >
                  Manage Testimonials
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Latest Blog Posts */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Latest in EV Technology</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.length > 0 ? blogs.map((blog) => (
                <Card key={blog.id} className="overflow-hidden flex flex-col">
                  {blog.image_url && (
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={blog.image_url} 
                        alt={blog.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{blog.title}</CardTitle>
                      <Badge variant={blog.published ? "default" : "outline"}>
                        {blog.published ? "Published" : "Draft"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-slate-500 line-clamp-3">
                      {blog.content}
                    </p>
                    <div className="mt-2 flex items-center text-xs text-slate-500">
                      <span>By {blog.author}</span>
                      <span className="mx-1">•</span>
                      <span>
                        {new Date(blog.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-4">
                    <div className="flex justify-between w-full">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate('/blogs')}
                      >
                        <Edit className="h-4 w-4 mr-1" /> Edit
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              )) : (
                <div className="col-span-full p-8 text-center border rounded-md bg-slate-50">
                  <p className="text-slate-500">No blog posts found. Add your first blog post to get started.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
