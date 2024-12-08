import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface MessageInputProps {
  onSendMessage: (message: string) => Promise<void>;
  loading: boolean;
  placeholder: string;
  buttonText: string;
}

const MessageInput = ({ onSendMessage, loading, placeholder, buttonText }: MessageInputProps) => {
  const [newMessage, setNewMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    try {
      await onSendMessage(newMessage);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-t">
      <div className="flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={placeholder}
          disabled={loading}
        />
        <Button type="submit" disabled={loading}>
          {loading ? '...' : buttonText}
        </Button>
      </div>
    </form>
  );
};

export default MessageInput;