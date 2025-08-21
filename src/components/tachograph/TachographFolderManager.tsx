import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Folder, FolderPlus, Trash2, FileText, Calendar, Users, SortAsc, SortDesc } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TachographFolder {
  id: string;
  name: string;
  parent_folder_id: string | null;
  created_at: string;
  created_by: string;
  organization_id: string;
  file_count: number;
  subfolders?: TachographFolder[];
}

const TachographFolderManager: React.FC = () => {
  const [folders, setFolders] = useState<TachographFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedParentFolder, setSelectedParentFolder] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'files'>('name');
  const { toast } = useToast();
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  // Fetch real folders data from backend
  const { data: foldersData = [], isLoading } = useQuery({
    queryKey: ['tachograph-folders', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from('tachograph_folders')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('name');

      if (error) {
        console.error('Error fetching folders:', error);
        toast({
          title: "Error",
          description: "Failed to load folders",
          variant: "destructive"
        });
        return [];
      }

      return data || [];
    },
    enabled: !!profile?.organization_id
  });

  // Transform flat data to hierarchical structure
  useEffect(() => {
    const buildHierarchy = (items: any[], parentId: string | null = null): TachographFolder[] => {
      return items
        .filter(item => item.parent_folder_id === parentId)
        .map(item => ({
          ...item,
          subfolders: buildHierarchy(items, item.id)
        }));
    };

    setFolders(buildHierarchy(foldersData));
    setLoading(false);
  }, [foldersData]);

  const createFolderMutation = useMutation({
    mutationFn: async (folderData: { name: string; parent_folder_id: string | null }) => {
      const { data, error } = await supabase
        .from('tachograph_folders')
        .insert({
          name: folderData.name,
          parent_folder_id: folderData.parent_folder_id,
          created_by: profile?.id,
          organization_id: profile?.organization_id,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tachograph-folders'] });
      toast({
        title: "Success",
        description: `Folder "${newFolderName}" created successfully.`
      });
      setNewFolderName('');
      setSelectedParentFolder(null);
      setFolderDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create folder",
        variant: "destructive"
      });
    }
  });

  const deleteFolderMutation = useMutation({
    mutationFn: async (folderId: string) => {
      const { error } = await supabase
        .from('tachograph_folders')
        .delete()
        .eq('id', folderId);

      if (error) throw error;
    },
    onSuccess: (_, folderName) => {
      queryClient.invalidateQueries({ queryKey: ['tachograph-folders'] });
      toast({
        title: "Success",
        description: `Folder "${folderName}" deleted successfully.`
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete folder",
        variant: "destructive"
      });
    }
  });

  const createFolder = async () => {
    if (!newFolderName.trim()) return;
    createFolderMutation.mutate({
      name: newFolderName.trim(),
      parent_folder_id: selectedParentFolder
    });
  };

  const deleteFolder = async (folderId: string, folderName: string) => {
    if (!confirm(`Are you sure you want to delete the folder "${folderName}"? This action cannot be undone.`)) {
      return;
    }
    deleteFolderMutation.mutate(folderId);
  };

  const renderFolder = (folder: TachographFolder, level: number = 0) => {
    const paddingLeft = level * 20;

    return (
      <div key={folder.id} className="space-y-2">
        <div 
          className="flex items-center justify-between p-3 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
          style={{ paddingLeft: `${paddingLeft + 12}px` }}
        >
          <div className="flex items-center space-x-3">
            <Folder className="w-5 h-5 text-blue-500" />
            <div>
              <div className="font-medium">{folder.name}</div>
              <div className="text-sm text-gray-500">
                {new Date(folder.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Badge variant="secondary">
              {folder.file_count} files
            </Badge>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedParentFolder(folder.id);
                setFolderDialogOpen(true);
              }}
            >
              <FolderPlus className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteFolder(folder.id, folder.name)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {folder.subfolders && folder.subfolders.length > 0 && (
          <div className="ml-4">
            {folder.subfolders.map(subfolder => renderFolder(subfolder, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Folder className="w-6 h-6" />
              <span>Tachograph Folders</span>
            </CardTitle>
            <CardDescription>
              Organize and manage tachograph data files
            </CardDescription>
          </div>
          
          <div className="flex items-center space-x-2">
            <Select value={sortBy} onValueChange={(value: 'name' | 'date' | 'files') => setSortBy(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="files">Files</SelectItem>
              </SelectContent>
            </Select>
            
            <Button onClick={() => setFolderDialogOpen(true)}>
              <FolderPlus className="w-4 h-4 mr-2" />
              New Folder
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {folders.length === 0 ? (
            <div className="text-center py-8">
              <Folder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No folders found</p>
              <Button 
                onClick={() => setFolderDialogOpen(true)} 
                className="mt-4"
                variant="outline"
              >
                Create First Folder
              </Button>
            </div>
          ) : (
            folders.map(folder => renderFolder(folder))
          )}
        </div>
      </CardContent>

      <Dialog open={folderDialogOpen} onOpenChange={setFolderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              Create a new folder to organize tachograph files
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="folder-name">Folder Name</Label>
              <Input
                id="folder-name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Enter folder name"
              />
            </div>
            
            {folders.length > 0 && (
              <div>
                <Label htmlFor="parent-folder">Parent Folder (Optional)</Label>
                <Select value={selectedParentFolder || ''} onValueChange={(value) => setSelectedParentFolder(value || null)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent folder" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No parent folder</SelectItem>
                    {folders.map(folder => (
                      <SelectItem key={folder.id} value={folder.id}>
                        {folder.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setFolderDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={createFolder}
              disabled={!newFolderName.trim() || createFolderMutation.isPending}
            >
              {createFolderMutation.isPending ? 'Creating...' : 'Create Folder'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default TachographFolderManager;