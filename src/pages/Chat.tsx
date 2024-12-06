import { useEffect, useState, useRef } from 'react';
import { auth, db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, deleteDoc, where } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Moon, Sun, Trash2, Settings } from 'lucide-react';
import { useTheme } from 'next-themes';

interface Message {
  id: string;
  text: string;
  uid: string;
  timestamp: any;
  email: string;
  name: string;
  nameColor: string;
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUser = auth.currentUser;
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
      return;
    }

    // Update online status when user joins
    const userRef = doc(db, 'users', currentUser.uid);
    updateDoc(userRef, { online: true });

    // Set up presence system
    const presenceRef = doc(db, 'users', currentUser.uid);
    const unsubscribePresence = onSnapshot(presenceRef, (doc) => {
      if (doc.exists() && !doc.data().online) {
        updateDoc(presenceRef, { online: true });
      }
    });

    // Listen for messages
    const q = query(collection(db, 'messages'), orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Message));
      setMessages(newMessages);
      scrollToBottom();
    });

    // Handle user going offline
    const handleOffline = () => {
      if (currentUser) {
        updateDoc(userRef, { online: false });
      }
    };

    window.addEventListener('beforeunload', handleOffline);

    return () => {
      unsubscribe();
      unsubscribePresence();
      handleOffline();
      window.removeEventListener('beforeunload', handleOffline);
    };
  }, [currentUser, navigate]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    setLoading(true);
    try {
      const userDoc = await doc(db, 'users', currentUser!.uid);
      const userSnap = await onSnapshot(userDoc, (doc) => {
        if (doc.exists()) {
          const userData = doc.data();
          addDoc(collection(db, 'messages'), {
            text: newMessage,
            uid: currentUser?.uid,
            email: currentUser?.email,
            name: userData.name,
            nameColor: userData.nameColor,
            timestamp: serverTimestamp(),
          });
        }
      });
      setNewMessage('');
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

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/20 page-transition">
      <div className="flex justify-between items-center p-4 backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-b">
        <h1 className="text-xl font-semibold">Chat Room</h1>
        <div className="flex items-center gap-4">
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

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.uid === currentUser?.uid ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg message-enter message-enter-active ${
                message.uid === currentUser?.uid
                  ? 'bg-primary text-primary-foreground ml-auto'
                  : 'bg-secondary text-secondary-foreground'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span 
                  className="text-sm font-medium"
                  style={{ color: message.nameColor }}
                >
                  {message.name}
                </span>
                {message.uid === currentUser?.uid && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleDeleteMessage(message.id, message.uid)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div>{message.text}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-t">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={loading}
          />
          <Button type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Chat;