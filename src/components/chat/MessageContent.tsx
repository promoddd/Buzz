import { useIsMobile } from '@/hooks/use-mobile';
import { Message } from './utils/messageUtils';
import { getYouTubeVideoId, isCurrentUser } from './utils/messageUtils';
import { Badge } from "@/components/ui/badge";
import { Crown, Sparkles, Trash2 } from "lucide-react";

interface MessageContentProps {
  message: Message;
  onDelete: (messageId: string, messageUid: string) => void;
  onReport: (message: Message) => void;
}

const MessageContent = ({ message, onDelete, onReport }: MessageContentProps) => {
  const isMobile = useIsMobile();
  const isCreator = message.email === 'albansula1978@gmail.com';

  const isValidUrl = (urlString: string): boolean => {
    try {
      const url = new URL(urlString);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const renderMessageText = (text: string) => {
    try {
      console.log('Rendering message text:', text);
      const parts = text.split(/\s+/);
      
      return parts.map((part, index) => {
        const videoId = getYouTubeVideoId(part);
        if (videoId) {
          console.log('Rendering YouTube video:', videoId);
          return (
            <div key={index} className="relative mt-2 max-w-full">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-lg w-full"
                style={{ 
                  maxWidth: '100%',
                  height: isMobile ? '200px' : '300px'
                }}
              />
              <div className="text-xs text-gray-500 mt-1">
                Posted {new Date(message.timestamp?.toDate()).toLocaleString()}
              </div>
            </div>
          );
        }
        
        if (isValidUrl(part)) {
          console.log('Rendering URL:', part);
          return (
            <a
              key={index}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600 underline break-all"
            >
              {part}
            </a>
          );
        }
        
        return <span key={index}>{part} </span>;
      });
    } catch (error) {
      console.error('Error rendering message:', error);
      return <span>{text}</span>;
    }
  };

  return (
    <div
      className={`max-w-[80%] p-3 rounded-lg shadow-message transition-all duration-300 ${
        isCreator
          ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white border-2 border-yellow-400 animate-pulse shadow-xl'
          : isCurrentUser(message.uid)
          ? 'bg-primary text-primary-foreground ml-auto'
          : 'bg-secondary text-secondary-foreground'
      }`}
    >
      <div 
        className="flex items-center gap-2 mb-1"
        onTouchStart={() => !isCreator && onReport(message)}
      >
        <span 
          style={{ 
            color: isCreator ? '#FFD700' : message.nameColor,
            textShadow: isCreator ? '0 0 10px rgba(255,215,0,0.5)' : 'none'
          }} 
          className={`font-medium ${isCreator ? 'text-lg flex items-center gap-2' : ''}`}
        >
          {message.name}
          {isCreator && (
            <>
              <Crown className="inline w-5 h-5 text-yellow-400 animate-bounce" />
              <Sparkles className="inline w-4 h-4 text-yellow-300 animate-pulse" />
            </>
          )}
        </span>
        {message.badge?.text && (
          <Badge 
            style={{ 
              backgroundColor: isCreator ? '#FFD700' : message.badge.color,
              animation: isCreator ? 'badge-pop 0.3s ease-out' : 'none'
            }}
            className={isCreator ? 'animate-pulse shadow-lg' : ''}
          >
            {isCreator ? '👑 Créateur' : message.badge.text}
          </Badge>
        )}
        {isCurrentUser(message.uid) && !isCreator && (
          <button
            onClick={() => onDelete(message.id, message.uid)}
            className="text-xs opacity-50 hover:opacity-100 transition-opacity"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className={`break-words ${isCreator ? 'text-lg font-medium leading-relaxed' : ''}`}>
        {renderMessageText(message.text)}
      </div>
    </div>
  );
};

export default MessageContent;