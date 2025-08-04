
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const TherapistProfileImageUpload = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select a valid image file');
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const allowedTypes = ['jpg', 'jpeg', 'png', 'webp'];
      
      if (!fileExt || !allowedTypes.includes(fileExt)) {
        throw new Error('Please select a JPG, PNG, or WebP image');
      }

      const fileName = `${user?.id}/avatar-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      // Delete old avatar if exists
      try {
        const { data: existingFiles } = await supabase.storage
          .from('avatars')
          .list(user?.id || '', { limit: 100 });
        
        if (existingFiles && existingFiles.length > 0) {
          const filesToDelete = existingFiles.map(file => `${user?.id}/${file.name}`);
          await supabase.storage
            .from('avatars')
            .remove(filesToDelete);
        }
      } catch (cleanupError) {
        console.warn('Could not clean up old files:', cleanupError);
      }

      // Upload new file
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { 
          cacheControl: '3600',
          upsert: false 
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with image URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_image_url: data.publicUrl })
        .eq('id', user?.id);

      if (updateError) {
        throw updateError;
      }

      await refreshProfile();

      toast({
        title: "Success",
        description: "Profile image updated successfully!",
      });
    } catch (error: any) {
      console.error('Image upload error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Picture</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={profile?.profile_image_url} />
            <AvatarFallback>
              <User className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
          <div>
            <Button
              variant="outline"
              disabled={uploading}
              onClick={() => document.getElementById('therapist-profile-image-upload')?.click()}
              className="relative"
            >
              {uploading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Image
                </>
              )}
            </Button>
            <input
              id="therapist-profile-image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Upload a professional photo to help clients connect with you. Max size: 5MB. Formats: JPG, PNG, WebP.
        </p>
      </CardContent>
    </Card>
  );
};

export default TherapistProfileImageUpload;
