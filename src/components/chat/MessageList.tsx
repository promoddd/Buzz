import { useRef, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { auth, db } from '@/lib/firebase';
import { useIsMobile } from '@/hooks/use-mobile';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";

interface Message {
  id: string;
  text: string;
  uid: string;
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
  const isMobile = useIsMobile();
  const [reportDialog, setReportDialog] = useState({ isOpen: false, user: null as Message | null });
  const { toast } = useToast();
  let lastTap = 0;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleDoubleTap = (message: Message) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    
    if (now - lastTap < DOUBLE_TAP_DELAY) {
      setReportDialog({ isOpen: true, user: message });
    }
    
    lastTap = now;
  };

  const handleReport = async () => {
    if (!reportDialog.user || !auth.currentUser) return;

    try {
      await addDoc(collection(db, 'reports'), {
        reportedUser: reportDialog.user.uid,
        reportedUserName: reportDialog.user.name,
        reportedBy: auth.currentUser.uid,
        reportedByEmail: auth.currentUser.email,
        timestamp: serverTimestamp(),
      });

      toast({
        title: "Report Submitted",
        description: "Thank you for helping keep the community safe.",
      });
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Error",
        description: "Failed to submit report. Please try again.",
        variant: "destructive"
      });
    }

    setReportDialog({ isOpen: false, user: null });
  };

  const getYouTubeVideoId = (url: string) => {
    try {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return match && match[2].length === 11 ? match[2] : null;
    } catch (error) {
      console.error('Error parsing YouTube URL:', error);
      return null;
    }
  };

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
    <>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.uid === auth.currentUser?.uid ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg shadow-message transition-all duration-300 hover:shadow-message-hover ${
                message.uid === auth.currentUser?.uid
                  ? 'bg-primary text-primary-foreground ml-auto'
                  : 'bg-secondary text-secondary-foreground'
              }`}
            >
              <div 
                className="flex items-center gap-2 mb-1"
                onTouchStart={() => handleDoubleTap(message)}
              >
                <span style={{ color: message.nameColor }} className="font-medium">
                  {message.name}
                </span>
                {message.badge?.text && (
                  <Badge style={{ backgroundColor: message.badge.color }}>
                    {message.badge.text}
                  </Badge>
                )}
                {message.uid === auth.currentUser?.uid && (
                  <button
                    onClick={() => onDeleteMessage(message.id, message.uid)}
                    className="text-xs opacity-50 hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                )}
              </div>
              <div className="break-words">{renderMessageText(message.text)}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <Dialog open={reportDialog.isOpen} onOpenChange={(open) => !open && setReportDialog({ isOpen: false, user: null })}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Report User</DialogTitle>
            <DialogDescription>
              Do you want to report: {reportDialog.user?.name}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportDialog({ isOpen: false, user: null })}>
              No
            </Button>
            <Button onClick={handleReport}>
              Yes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MessageList;