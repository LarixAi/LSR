import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Folder, 
  FolderPlus, 
  FolderOpen, 
  Trash2, 
  Search,
  FileText,
  Calendar,
  Truck,
  User,
  ArrowUpDown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface TachographFolder {
  id: string;
  name: string;
  parent_folder_id: string | null;
  created_at: string;
  created_by: string;
  organization_id: string;
  file_count?: number;
  subfolders?: TachographFolder[];
}

const TachographFolderManager = () => {
  const [folders, setFolders] = useState<TachographFolder[]>([]);
  const [loading, setLoading] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedParentFolder, setSelectedParentFolder] = useState<string | null>(null);
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'files'>('name');
  const { toast } = useToast();
  const { profile } = useAuth();

  // Mock folders for demonstration - will be replaced with real database calls once types are updated
  const mockFolders: TachographFolder[] = [
    {
      id: '1',
      name: '2024',
      parent_folder_id: null,
      created_at: new Date().toISOString(),
      created_by: profile?.id || '',
      organization_id: profile?.organization_id || '',
      file_count: 15,
      subfolders: [
        {
          id: '2',
          name: 'Q1',
          parent_folder_id: '1',
          created_at: new Date().toISOString(),
          created_by: profile?.id || '',
          organization_id: profile?.organization_id || '',
          file_count: 8
        },
        {
          id: '3',
          name: 'Q2',
          parent_folder_id: '1',
          created_at: new Date().toISOString(),
          created_by: profile?.id || '',
          organization_id: profile?.organization_id || '',
          file_count: 7
        }
      ]
    },
    {
      id: '4',
      name: 'Vehicles',
      parent_folder_id: null,
      created_at: new Date().toISOString(),
      created_by: profile?.id || '',
      organization_id: profile?.organization_id || '',
      file_count: 23,
      subfolders: []
    }
  ];

  useEffect(() => {
    // Use mock data for now - will be replaced with real API calls once types are updated
    setFolders(mockFolders);
    setLoading(false);
  }, [profile]);

  const createFolder = async () => {
    if (!newFolderName.trim()) return;

    // Mock creation for now - will be replaced with real database calls once types are updated
    const newFolder: TachographFolder = {
      id: Date.now().toString(),
      name: newFolderName.trim(),
      parent_folder_id: selectedParentFolder,
      created_at: new Date().toISOString(),
      created_by: profile?.id || '',
      organization_id: profile?.organization_id || '',
      file_count: 0,
      subfolders: []
    };

    setFolders(prev => [...prev, newFolder]);

    toast({
      title: "Success",
      description: `Folder "${newFolderName}" created successfully.`
    });

    setNewFolderName('');
    setSelectedParentFolder(null);
    setFolderDialogOpen(false);
  };

  const deleteFolder = async (folderId: string, folderName: string) => {
    if (!confirm(`Are you sure you want to delete the folder "${folderName}"? This action cannot be undone.`)) {
      return;
    }

    // Mock deletion for now - will be replaced with real database calls once types are updated
    setFolders(prev => prev.filter(f => f.id !== folderId));

    toast({
      title: "Success",
      description: `Folder "${folderName}" deleted successfully.`
    });
  };

  const renderFolder = (folder: TachographFolder, level: number = 0) => {
    const paddingLeft = level * 20;

    return (
      <div key={folder.id} className="space-y-2">
        <div 
          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
          style={{ paddingLeft: `${paddingLeft + 12}px` }}
        >
          <div className="flex items-center gap-3">
            {folder.subfolders && folder.subfolders.length > 0 ? (
              <FolderOpen className="h-4 w-4 text-blue-600" />
            ) : (
              <Folder className="h-4 w-4 text-blue-600" />
            )}
            <div>
              <p className="font-medium">{folder.name}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(folder.created_at).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {folder.file_count || 0} files
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedParentFolder(folder.id)}
            >
              <FolderPlus className="h-3 w-3 mr-1" />
              Add Subfolder
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => deleteFolder(folder.id, folder.name)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        {folder.subfolders?.map(subfolder => 
          renderFolder(subfolder, level + 1)
        )}
      </div>
    );
  };

  const filteredFolders = folders.filter(folder =>
    folder.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-8">Loading folders...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Folder Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Folder Management</h2>
          <p className="text-muted-foreground">Organize your tachograph files into folders</p>
        </div>
        <Dialog open={folderDialogOpen} onOpenChange={setFolderDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <FolderPlus className="h-4 w-4 mr-2" />
              Create Folder
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Folder</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="folderName">Folder Name</Label>
                <Input
                  id="folderName"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Enter folder name..."
                  className="mt-1"
                />
              </div>
              
              {selectedParentFolder && (
                <div>
                  <Label>Parent Folder</Label>
                  <div className="mt-1 p-2 bg-muted rounded border">
                    Selected parent folder ID: {selectedParentFolder}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => setSelectedParentFolder(null)}
                  >
                    Clear Parent
                  </Button>
                </div>
              )}
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setFolderDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createFolder} disabled={!newFolderName.trim()}>
                  Create Folder
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Sort */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Browse Folders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search folders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline" onClick={() => setSortBy(sortBy === 'name' ? 'date' : 'name')}>
              <ArrowUpDown className="h-4 w-4 mr-2" />
              Sort by {sortBy === 'name' ? 'Date' : 'Name'}
            </Button>
          </div>

          {/* Folder List */}
          <div className="space-y-2">
            {filteredFolders.length === 0 ? (
              <div className="text-center py-8">
                <Folder className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">No Folders</h3>
                <p className="text-sm text-muted-foreground">
                  Create your first folder to organize tachograph files
                </p>
              </div>
            ) : (
              filteredFolders.map(folder => renderFolder(folder))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Folder Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start"
              onClick={() => {
                setNewFolderName(new Date().getFullYear().toString());
                setFolderDialogOpen(true);
              }}
            >
              <Calendar className="h-6 w-6 mb-2 text-blue-600" />
              <span className="font-medium">By Year</span>
              <span className="text-sm text-muted-foreground">Create year-based folders</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start"
              onClick={() => {
                setNewFolderName('Vehicles');
                setFolderDialogOpen(true);
              }}
            >
              <Truck className="h-6 w-6 mb-2 text-green-600" />
              <span className="font-medium">By Vehicle</span>
              <span className="text-sm text-muted-foreground">Organize by vehicle type</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start"
              onClick={() => {
                setNewFolderName('Drivers');
                setFolderDialogOpen(true);
              }}
            >
              <User className="h-6 w-6 mb-2 text-purple-600" />
              <span className="font-medium">By Driver</span>
              <span className="text-sm text-muted-foreground">Group by driver assignments</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TachographFolderManager;