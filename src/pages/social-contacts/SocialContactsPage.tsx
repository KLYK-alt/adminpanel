import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { SocialContact } from '@/types';
import { getSocialContacts, createSocialContact, updateSocialContact, deleteSocialContact } from '@/services/supabaseService';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function SocialContactsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<SocialContact | null>(null);
  const [formData, setFormData] = useState({
    type: 'social' as 'social' | 'email' | 'phone',
    platform: '' as 'LinkedIn' | 'X' | 'Facebook' | 'YouTube' | 'Instagram' | '',
    handle_or_url: '',
    value: '',
  });

  // Filter and search states
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [platformFilter, setPlatformFilter] = useState<string[]>([]);

  const queryClient = useQueryClient();

  const { data: contacts, isLoading } = useQuery({
    queryKey: ['social-contacts'],
    queryFn: getSocialContacts,
  });

  // Filtered contacts
  const filteredContacts = contacts?.filter((contact) => {
    // Search filter
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      contact.type.toLowerCase().includes(searchLower) ||
      (contact.platform?.toLowerCase().includes(searchLower) ?? false) ||
      (contact.handle_or_url?.toLowerCase().includes(searchLower) ?? false) ||
      (contact.value?.toLowerCase().includes(searchLower) ?? false);

    // Type filter
    const matchesType = typeFilter.length === 0 || typeFilter.includes(contact.type);

    // Platform filter
    const matchesPlatform = platformFilter.length === 0 || 
      (contact.platform && platformFilter.includes(contact.platform));

    return matchesSearch && matchesType && matchesPlatform;
  });

  const createMutation = useMutation({
    mutationFn: createSocialContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-contacts'] });
      toast.success('Social contact created successfully');
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error('Failed to create social contact');
      console.error(error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SocialContact> }) =>
      updateSocialContact(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-contacts'] });
      toast.success('Social contact updated successfully');
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error('Failed to update social contact');
      console.error(error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSocialContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-contacts'] });
      toast.success('Social contact deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete social contact');
      console.error(error);
    },
  });

  const resetForm = () => {
    setFormData({
      type: 'social',
      platform: '',
      handle_or_url: '',
      value: '',
    });
    setEditingContact(null);
  };

  const validateForm = () => {
    if (formData.type === 'phone') {
      // Remove any non-digit characters for validation
      const phoneNumber = formData.value.replace(/\D/g, '');
      if (phoneNumber.length !== 10) {
        toast.error('Phone number must be exactly 10 digits');
        return false;
      }
    }
    if (formData.type === 'social' && !formData.platform) {
      toast.error('Please select a platform for social media contact');
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const dataToSubmit = { ...formData };
    
    // Format phone number if type is phone
    if (formData.type === 'phone') {
      const phoneNumber = formData.value.replace(/\D/g, '');
      dataToSubmit.value = `+91${phoneNumber}`;
    }

    // Clear platform for non-social types
    if (formData.type !== 'social') {
      dataToSubmit.platform = null;
    }

    if (editingContact) {
      updateMutation.mutate({
        id: editingContact.id,
        data: dataToSubmit,
      });
    } else {
      createMutation.mutate(dataToSubmit);
    }
  };

  const handleEdit = (contact: SocialContact) => {
    setEditingContact(contact);
    setFormData({
      type: contact.type,
      platform: contact.platform || '',
      handle_or_url: contact.handle_or_url || '',
      value: contact.value || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this social contact?')) {
      deleteMutation.mutate(id);
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setTypeFilter([]);
    setPlatformFilter([]);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Social Contacts Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Contact
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingContact ? 'Edit Contact' : 'Add New Contact'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Contact Type</label>
                <Select
                  value={formData.type}
                  onValueChange={(value: 'social' | 'email' | 'phone') =>
                    setFormData({ ...formData, type: value, platform: value === 'social' ? formData.platform : '' })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select contact type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="social">Social Media</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.type === 'social' && (
                <div>
                  <label className="text-sm font-medium">Platform</label>
                  <Select
                    value={formData.platform}
                    onValueChange={(value: 'LinkedIn' | 'X' | 'Facebook' | 'YouTube' | 'Instagram') =>
                      setFormData({ ...formData, platform: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                      <SelectItem value="X">X (Twitter)</SelectItem>
                      <SelectItem value="Facebook">Facebook</SelectItem>
                      <SelectItem value="YouTube">YouTube</SelectItem>
                      <SelectItem value="Instagram">Instagram</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {formData.type === 'social' && (
                <div>
                  <label className="text-sm font-medium">Handle or URL</label>
                  <Input
                    value={formData.handle_or_url}
                    onChange={(e) =>
                      setFormData({ ...formData, handle_or_url: e.target.value })
                    }
                    placeholder="e.g., @username or https://..."
                    required
                  />
                </div>
              )}

              {(formData.type === 'email' || formData.type === 'phone') && (
                <div>
                  <label className="text-sm font-medium">
                    {formData.type === 'email' ? 'Email Address' : 'Phone Number'}
                  </label>
                  <Input
                    value={formData.value}
                    onChange={(e) =>
                      setFormData({ ...formData, value: e.target.value })
                    }
                    type={formData.type === 'email' ? 'email' : 'tel'}
                    placeholder={
                      formData.type === 'email'
                        ? 'Enter email address'
                        : 'Enter 10-digit phone number (will be prefixed with +91)'
                    }
                    required
                  />
                  {formData.type === 'phone' && (
                    <p className="text-sm text-gray-500 mt-1">
                      Enter 10 digits (e.g., 9876543210). The number will be automatically prefixed with +91
                    </p>
                  )}
                </div>
              )}

              <Button type="submit" className="w-full">
                {editingContact ? 'Update Contact' : 'Create Contact'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Type Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuCheckboxItem
                checked={typeFilter.includes('social')}
                onCheckedChange={(checked) => {
                  setTypeFilter(prev =>
                    checked
                      ? [...prev, 'social']
                      : prev.filter(t => t !== 'social')
                  );
                }}
              >
                Social Media
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={typeFilter.includes('email')}
                onCheckedChange={(checked) => {
                  setTypeFilter(prev =>
                    checked
                      ? [...prev, 'email']
                      : prev.filter(t => t !== 'email')
                  );
                }}
              >
                Email
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={typeFilter.includes('phone')}
                onCheckedChange={(checked) => {
                  setTypeFilter(prev =>
                    checked
                      ? [...prev, 'phone']
                      : prev.filter(t => t !== 'phone')
                  );
                }}
              >
                Phone
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Platform Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {['LinkedIn', 'X', 'Facebook', 'YouTube', 'Instagram'].map((platform) => (
                <DropdownMenuCheckboxItem
                  key={platform}
                  checked={platformFilter.includes(platform)}
                  onCheckedChange={(checked) => {
                    setPlatformFilter(prev =>
                      checked
                        ? [...prev, platform]
                        : prev.filter(p => p !== platform)
                    );
                  }}
                >
                  {platform}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            onClick={resetFilters}
            className="gap-2"
          >
            Reset Filters
          </Button>
        </div>
        {(searchQuery || typeFilter.length > 0 || platformFilter.length > 0) && (
          <div className="text-sm text-muted-foreground">
            Showing {filteredContacts?.length} of {contacts?.length} contacts
          </div>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Platform</TableHead>
            <TableHead>Content</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredContacts?.map((contact) => (
            <TableRow key={contact.id}>
              <TableCell className="capitalize">{contact.type}</TableCell>
              <TableCell>{contact.platform || '-'}</TableCell>
              <TableCell>
                {contact.type === 'social' && contact.handle_or_url ? (
                  <a
                    href={contact.handle_or_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {contact.handle_or_url}
                  </a>
                ) : contact.type === 'phone' ? (
                  <a
                    href={`tel:${contact.value}`}
                    className="text-blue-500 hover:underline"
                  >
                    {contact.value}
                  </a>
                ) : contact.type === 'email' ? (
                  <a
                    href={`mailto:${contact.value}`}
                    className="text-blue-500 hover:underline"
                  >
                    {contact.value}
                  </a>
                ) : (
                  '-'
                )}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(contact)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(contact.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {filteredContacts?.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-gray-500">
                {contacts?.length === 0
                  ? 'No social contacts added yet'
                  : 'No contacts match your filters'}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
} 