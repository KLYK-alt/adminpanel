import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusCircle, Edit, Trash, Loader2, Search } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { TeamMember } from '@/types';
import { getTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember } from '@/services/supabaseService';
import { toast } from 'sonner';
import TeamFormDialog from '@/components/team/TeamFormDialog';
import DeleteConfirmDialog from '@/components/partners/DeleteConfirmDialog';

export default function TeamPage() {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch team members from Supabase
  const { data: team = [], isLoading, error } = useQuery({
    queryKey: ['team'],
    queryFn: getTeamMembers
  });

  // Filter team members based on search query
  const filteredTeam = team.filter(member => 
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (member.bio && member.bio.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Create team member mutation
  const createMutation = useMutation({
    mutationFn: (data: Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>) => createTeamMember(data),
    onSuccess: () => {
      toast.success('Team member added successfully');
      setIsAddDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['team'] });
    },
    onError: (error) => {
      toast.error(`Error adding team member: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  // Update team member mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TeamMember> }) => updateTeamMember(id, data),
    onSuccess: () => {
      toast.success('Team member updated successfully');
      setSelectedMember(null);
      queryClient.invalidateQueries({ queryKey: ['team'] });
    },
    onError: (error) => {
      toast.error(`Error updating team member: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  // Delete team member mutation
  const deleteMutation = useMutation({
    mutationFn: deleteTeamMember,
    onSuccess: () => {
      toast.success('Team member deleted successfully');
      setIsDeleteDialogOpen(false);
      setSelectedMember(null);
      queryClient.invalidateQueries({ queryKey: ['team'] });
    },
    onError: (error) => {
      toast.error(`Error deleting team member: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  const handleAddMember = (data: Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>) => {
    createMutation.mutate(data);
  };

  const handleUpdateMember = (data: Partial<TeamMember>) => {
    if (selectedMember) {
      updateMutation.mutate({ id: selectedMember.id, data });
    }
  };

  const handleDeleteMember = () => {
    if (selectedMember) {
      deleteMutation.mutate(selectedMember.id);
    }
  };

  const openEditDialog = (member: TeamMember) => {
    setSelectedMember(member);
  };

  const openDeleteDialog = (member: TeamMember) => {
    setSelectedMember(member);
    setIsDeleteDialogOpen(true);
  };

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <h3 className="text-lg font-medium text-red-800">Error loading team data</h3>
        <p className="text-sm text-red-600">
          {error instanceof Error ? error.message : 'An unknown error occurred'}
        </p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader 
        title="Our Team" 
        description="Manage team member profiles displayed on your website."
        actions={
          <Button 
            className="bg-admin-primary hover:bg-blue-600"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Team Member
          </Button>
        }
      />

      {/* Search Section */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search team members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 text-admin-primary animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeam.length > 0 ? (
            filteredTeam.map((member) => (
              <Card key={member.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    {member.image_url ? (
                      <div className="h-16 w-16 rounded-full overflow-hidden flex-shrink-0">
                        <img 
                          src={member.image_url} 
                          alt={member.name} 
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                        {member.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium">{member.name}</h3>
                      <p className="text-sm text-slate-500">{member.designation}</p>
                    </div>
                  </div>
                  {member.bio && (
                    <p className="mt-4 text-sm text-slate-600">{member.bio}</p>
                  )}
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(member)}
                  >
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => openDeleteDialog(member)}
                  >
                    <Trash className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full p-8 text-center border rounded-md bg-slate-50">
              <p className="text-slate-500">
                {searchQuery ? 'No team members found matching your search.' : 'No team members found. Add your first team member to get started.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Add Team Member Dialog */}
      <TeamFormDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleAddMember}
        isLoading={createMutation.isPending}
      />

      {/* Edit Team Member Dialog */}
      <TeamFormDialog
        open={!!selectedMember}
        onOpenChange={() => setSelectedMember(null)}
        member={selectedMember || undefined}
        onSubmit={handleUpdateMember}
        isLoading={updateMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteMember}
        isLoading={deleteMutation.isPending}
        title="Delete Team Member"
        description={`Are you sure you want to delete ${selectedMember?.name}? This action cannot be undone.`}
      />
    </div>
  );
}
