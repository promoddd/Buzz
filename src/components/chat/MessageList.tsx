import { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { auth } from '@/lib/firebase';

interface Message {
  id: string;
  text: string;
  uid: string;
  timestamp: any;
  email: string;
  name: string;
  nameColor: string;
  badge?: {
    text: string;
    color: string;
  };
}

interface MessageListProps {
  messages: Message[];
  onDeleteMessage: (messageId: string, messageUid: string) => void;
}

const MessageList = ({ messages, onDeleteMessage }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.uid === auth.currentUser?.uid ? 'justify-end' : 'justify-start'} animate-message-slide-in`}
        >
          <div
            className={`max-w-[80%] p-3 rounded-lg shadow-message transition-all duration-300 hover:shadow-message-hover ${
              message.uid === auth.currentUser?.uid
                ? 'bg-primary text-primary-foreground ml-auto animate-message-slide-left'
                : 'bg-secondary text-secondary-foreground animate-message-slide-right'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span 
                style={{ color: message.nameColor }}
                className="font-medium transition-colors duration-200 hover:opacity-80"
              >
                {message.name}
              </span>
              {message.badge?.text && (
                <Badge 
                  style={{ backgroundColor: message.badge.color }}
                  className="animate-badge-pop"
                >
                  {message.badge.text}
                </Badge>
              )}
              {message.uid === auth.currentUser?.uid && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 transition-transform duration-200 hover:scale-110"
                  onClick={() => onDeleteMessage(message.id, message.uid)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="break-words">{message.text}</div>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;