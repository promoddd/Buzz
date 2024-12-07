import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ImageIcon } from 'lucide-react';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useToast } from '@/components/ui/use-toast';

interface MessageInputProps {
  onSendMessage: (message: string, imageUrl?: string) => Promise<void>;
  loading: boolean;
}

const MessageInput = ({ onSendMessage, loading }: MessageInputProps) => {
  const [newMessage, setNewMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() && !selectedImage) return;
    
    try {
      setUploading(true);
      let imageUrl: string | undefined;
      
      if (selectedImage) {
        // Create a unique filename using timestamp
        const filename = `${Date.now()}-${selectedImage.name}`;
        const storageRef = ref(storage, `images/${filename}`);
        
        // Upload the image
        await uploadBytes(storageRef, selectedImage);
        
        // Get the download URL
        imageUrl = await getDownloadURL(storageRef);
      }
      
      await onSendMessage(newMessage, imageUrl);
      setNewMessage('');
      setSelectedImage(null);
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "Error",
          description: "Image size should be less than 5MB",
          variant: "destructive"
        });
        return;
      }
      if (file.type.startsWith('image/jpeg') || file.type.startsWith('image/png')) {
        setSelectedImage(file);
      } else {
        toast({
          title: "Error",
          description: "Only JPEG and PNG images are supported",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-t">
      <div className="flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={loading || uploading}
        />
        <input
          type="file"
          accept="image/jpeg,image/png"
          className="hidden"
          ref={fileInputRef}
          onChange={handleImageSelect}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading || uploading}
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
        <Button type="submit" disabled={loading || uploading}>
          {uploading ? 'Uploading...' : loading ? 'Sending...' : 'Send'}
        </Button>
      </div>
      {selectedImage && (
        <div className="mt-2 text-sm text-muted-foreground">
          Selected image: {selectedImage.name}
        </div>
      )}
    </form>
  );
};

export default MessageInput;