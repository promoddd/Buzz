import { useRef, useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
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
import { useToast } from "@/components/ui/use-toast";
import MessageContent from './MessageContent';
import { Message } from './utils/messageUtils';

interface MessageListProps {
  messages: Message[];
  onDeleteMessage: (messageId: string, messageUid: string) => void;
}

const MessageList = ({ messages, onDeleteMessage }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [reportDialog, setReportDialog] = useState({ isOpen: false, user: null as Message | null });
  const { toast } = useToast();
  let lastTap = 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleDoubleTap = (message: Message) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    
    if (now - lastTap < DOUBLE_TAP_DELAY) {
      console.log('Double tap detected, opening report dialog for:', message.name);
      setReportDialog({ isOpen: true, user: message });
    }
    
    lastTap = now;
  };

  const handleReport = async () => {
    if (!reportDialog.user || !auth.currentUser) {
      console.log('Cannot submit report: missing user data');
      return;
    }

    try {
      console.log('Submitting report for user:', reportDialog.user.name);
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

  return (
    <>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.uid === auth.currentUser?.uid ? 'justify-end' : 'justify-start'}`}
          >
            <MessageContent
              message={message}
              onDelete={onDeleteMessage}
              onReport={handleDoubleTap}
            />
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <Dialog 
        open={reportDialog.isOpen} 
        onOpenChange={(open) => !open && setReportDialog({ isOpen: false, user: null })}
      >
        <DialogContent>
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