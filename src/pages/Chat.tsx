import { useEffect, useState, useRef } from 'react';
import { auth, db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Moon, Sun, ArrowDown } from 'lucide-react';
import { useTheme } from 'next-themes';
import Settings from '@/components/chat/Settings';
import MessageList from '@/components/chat/MessageList';
import MessageInput from '@/components/chat/MessageInput';

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

interface UserData {
  name: string;
  nameColor: string;
  lastNameChange?: string;
  badge?: {
    text: string;
    color: string;
  };
  online: boolean;
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const currentUser = auth.currentUser;
  const { theme, setTheme } = useTheme();
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
      return;
    }

    // Update online status when user joins
    const userRef = doc(db, 'users', currentUser.uid);
    updateDoc(userRef, { online: true });

    // Set up presence system and listen for user data changes
    const unsubscribeUser = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data() as UserData;
        setUserData(data);
        if (!data.online) {
          updateDoc(userRef, { online: true });
        }
      }
    });

    // Listen for messages
    const q = query(collection(db, 'messages'), orderBy('timestamp', 'asc'));
    const unsubscribeMessages = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Message));
      setMessages(newMessages);
    });

    // Handle user going offline
    const handleOffline = () => {
      if (currentUser) {
        updateDoc(userRef, { online: false });
      }
    };

    window.addEventListener('beforeunload', handleOffline);

    return () => {
      unsubscribeMessages();
      unsubscribeUser();
      handleOffline();
      window.removeEventListener('beforeunload', handleOffline);
    };
  }, [currentUser, navigate]);

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop } = messagesContainerRef.current;
      setShowScrollButton(scrollTop < -100); // Show button when scrolled up more than 100px
    }
  };

  const scrollToBottom = () => {
    messagesContainerRef.current?.scrollTo({
      top: messagesContainerRef.current.scrollHeight,
      behavior: 'smooth'
    });
  };

  const handleSendMessage = async (newMessage: string) => {
    if (!userData) return;
    
    setLoading(true);
    try {
      await addDoc(collection(db, 'messages'), {
        text: newMessage,
        uid: currentUser?.uid,
        email: currentUser?.email,
        name: userData.name,
        nameColor: userData.nameColor,
        badge: userData.badge,
        timestamp: serverTimestamp(),
      });
      scrollToBottom();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = async (messageId: string, messageUid: string) => {
    if (currentUser?.uid !== messageUid) return;
    
    try {
      await deleteDoc(doc(db, 'messages', messageId));
      toast({
        title: "Success",
        description: "Message deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleSignOut = () => {
    auth.signOut();
    navigate('/');
  };

  if (!userData) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/20 page-transition">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-10 flex justify-between items-center p-4 backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-b">
        <h1 className="text-xl font-semibold">Chat Room</h1>
        <div className="flex items-center gap-4">
          <Settings userData={userData} />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <Button variant="outline" onClick={handleSignOut}>Sign Out</Button>
        </div>
      </div>

      {/* Scrollable Message Container */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto mt-16 mb-20"
        onScroll={handleScroll}
      >
        <MessageList 
          messages={messages} 
          onDeleteMessage={handleDeleteMessage}
        />
      </div>

      {/* Scroll to Bottom Button */}
      {showScrollButton && (
        <Button
          className="fixed bottom-24 right-4 rounded-full p-2"
          onClick={scrollToBottom}
          variant="secondary"
        >
          <ArrowDown className="h-5 w-5" />
        </Button>
      )}

      {/* Fixed Message Input */}
      <div className="fixed bottom-0 left-0 right-0">
        <MessageInput 
          onSendMessage={handleSendMessage}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default Chat;