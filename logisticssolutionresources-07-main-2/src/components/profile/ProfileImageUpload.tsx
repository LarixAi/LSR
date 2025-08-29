import React, { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import avatarMale1 from '@/assets/avatar-male-1.png';
import avatarMale2 from '@/assets/avatar-male-2.png';

interface ProfileImageUploadProps {
  currentAvatarUrl?: string | null;
  onUploadComplete?: (url: string) => void;
}

const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({
  currentAvatarUrl,
  onUploadComplete,
}) => {
  const { user, profile } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  // Select a random male avatar as placeholder (will add female avatars later)
  const placeholderAvatar = useMemo(() => {
    const avatars = [avatarMale1, avatarMale2];
    return avatars[Math.floor(Math.random() * avatars.length)];
  }, []);

  const getUserInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
    }
    return user?.email?.[0].toUpperCase() || 'U';
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
      setShowDialog(true);
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async (file: File) => {
    if (!user) return;

    setUploading(true);
    try {
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile with avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      toast.success('Profile image updated successfully');
      onUploadComplete?.(publicUrl);
      setShowDialog(false);
      setPreviewUrl(null);

      // Reset file input
      const input = document.getElementById('avatar-upload') as HTMLInputElement;
      if (input) input.value = '';
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!user || !currentAvatarUrl) return;

    setUploading(true);
    try {
      // Extract file path from URL
      const urlParts = currentAvatarUrl.split('/');
      const filePath = `${user.id}/${urlParts[urlParts.length - 1]}`;

      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from('avatars')
        .remove([filePath]);

      if (deleteError) {
        console.error('Error deleting file:', deleteError);
      }

      // Update profile to remove avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      toast.success('Profile image removed');
      onUploadComplete?.('');
    } catch (error: any) {
      console.error('Error removing image:', error);
      toast.error(error.message || 'Failed to remove image');
    } finally {
      setUploading(false);
    }
  };

  const handleConfirmUpload = async () => {
    const input = document.getElementById('avatar-upload') as HTMLInputElement;
    const file = input?.files?.[0];
    if (file) {
      await uploadImage(file);
    }
  };

  return (
    <>
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Avatar className="h-20 w-20" key={(currentAvatarUrl || placeholderAvatar) as string}>
            <AvatarImage
              src={currentAvatarUrl || placeholderAvatar}
              alt="Profile avatar"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = placeholderAvatar;
              }}
            />
            <AvatarFallback className="text-lg">{getUserInitials()}</AvatarFallback>
          </Avatar>
          <label
            htmlFor="avatar-upload"
            className="absolute bottom-0 right-0 p-1.5 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
          >
            <Camera className="h-4 w-4" />
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
              disabled={uploading}
            />
          </label>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Upload a profile picture
          </p>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('avatar-upload')?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Camera className="mr-2 h-4 w-4" />
                  Choose Image
                </>
              )}
            </Button>
            {currentAvatarUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemoveImage}
                disabled={uploading}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remove
              </Button>
            )}
          </div>
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Profile Image</DialogTitle>
            <DialogDescription>
              Preview your new profile image before uploading
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4 py-4">
            {previewUrl && (
              <Avatar className="h-32 w-32">
                <AvatarImage src={previewUrl} alt="Preview" />
                <AvatarFallback>{getUserInitials()}</AvatarFallback>
              </Avatar>
            )}
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDialog(false);
                  setPreviewUrl(null);
                }}
                disabled={uploading}
              >
                Cancel
              </Button>
              <Button onClick={handleConfirmUpload} disabled={uploading}>
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Upload'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProfileImageUpload;