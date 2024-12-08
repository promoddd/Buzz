import { useIsMobile } from '@/hooks/use-mobile';
import { Message } from './utils/messageUtils';
import { getYouTubeVideoId, isCurrentUser } from './utils/messageUtils';
import { Badge } from "@/components/ui/badge";

interface MessageContentProps {
  message: Message;
  onDelete: (messageId: string, messageUid: string) => void;
  onReport: (message: Message) => void;
}

const MessageContent = ({ message, onDelete, onReport }: MessageContentProps) => {
  const isMobile = useIsMobile();

  const renderMessageText = (text: string) => {
    try {
      const parts = text.split(/\s+/);
      
      return parts.map((part, index) => {
        const videoId = getYouTubeVideoId(part);
        if (videoId) {
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
            </div>
          );
        }
        
        if (part.match(/^https?:\/\/[^\s]+$/)) {
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
      className={`max-w-[80%] p-3 rounded-lg shadow-message ${
        isCurrentUser(message.uid)
          ? 'bg-primary text-primary-foreground ml-auto'
          : 'bg-secondary text-secondary-foreground'
      }`}
    >
      <div 
        className="flex items-center gap-2 mb-1"
        onTouchStart={() => onReport(message)}
      >
        <span style={{ color: message.nameColor }} className="font-medium">
          {message.name}
        </span>
        {message.badge?.text && (
          <Badge style={{ backgroundColor: message.badge.color }}>
            {message.badge.text}
          </Badge>
        )}
        {isCurrentUser(message.uid) && (
          <button
            onClick={() => onDelete(message.id, message.uid)}
            className="text-xs opacity-50 hover:opacity-100 transition-opacity"
          >
            ×
          </button>
        )}
      </div>
      <div className="break-words">{renderMessageText(message.text)}</div>
    </div>
  );
};

export default MessageContent;