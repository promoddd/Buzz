import { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { auth } from '@/lib/firebase';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getYouTubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const renderMessageText = (text: string) => {
    // Split the text into parts
    const parts = text.split(/\s+/);
    
    return parts.map((part, index) => {
      // Check for YouTube URLs
      const videoId = getYouTubeVideoId(part);
      if (videoId) {
        return (
          <div key={index} className="relative w-full mt-2 pb-[56.25%]">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full rounded-lg"
              style={{ maxWidth: isMobile ? '100%' : '2000px', maxHeight: isMobile ? '1125px' : '1125px' }}
            />
          </div>
        );
      }
      
      // Handle regular URLs
      if (part.match(/(https?:\/\/[^\s]+)/g)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-600 underline"
          >
            {part}
          </a>
        );
      }
      
      // Regular text
      return <span key={index}>{part} </span>;
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message, index) => (
        <div
          key={message.id}
          className={`flex ${message.uid === auth.currentUser?.uid ? 'justify-end' : 'justify-start'}`}
          style={{
            animationDelay: `${index * 0.1}s`,
            opacity: 0,
            animation: 'message-slide-in 0.5s ease-out forwards'
          }}
        >
          <div
            className={`max-w-[95%] p-3 rounded-lg shadow-message transition-all duration-300 hover:shadow-message-hover ${
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
                  title={t('chat.deleteMessage')}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="break-words">
              {renderMessageText(message.text)}
            </div>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;