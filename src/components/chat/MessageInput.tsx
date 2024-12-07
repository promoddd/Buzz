import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ImageIcon } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (message: string, imageUrl?: string) => Promise<void>;
  loading: boolean;
}

const MessageInput = ({ onSendMessage, loading }: MessageInputProps) => {
  const [newMessage, setNewMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() && !selectedImage) return;
    
    if (selectedImage) {
      // For now, we'll use a placeholder image URL since we don't have actual file storage
      const placeholderUrl = 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7';
      await onSendMessage(newMessage, placeholderUrl);
    } else {
      await onSendMessage(newMessage);
    }
    
    setNewMessage('');
    setSelectedImage(null);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type.startsWith('image/jpeg') || file.type.startsWith('image/png'))) {
      setSelectedImage(file);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-t">
      <div className="flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={loading}
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
          disabled={loading}
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send'}
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