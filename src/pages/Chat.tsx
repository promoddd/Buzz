import { useEffect, useState } from 'react';
import { auth, db, initializeMessaging } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from 'react-i18next';
import MessageList from '@/components/chat/MessageList';
import MessageInput from '@/components/chat/MessageInput';
import Header from '@/components/chat/Header';

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
  titleColor?: string;
  lastNameChange?: string;
  badge?: {
    text: string;
    color: string;
  };
  online: boolean;
  fcmToken?: string;
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const currentUser = auth.currentUser;
  const isAdmin = currentUser?.email === 'albansula1978@gmail.com';

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
      return;
    }

    // Initialize FCM
    const setupMessaging = async () => {
      console.log('Setting up messaging...');
      const fcmToken = await initializeMessaging();
      if (fcmToken) {
        console.log('Updating user document with FCM token');
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, { fcmToken });
      }
    };

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

    // Set up messaging
    setupMessaging();

    return () => {
      unsubscribeMessages();
      unsubscribeUser();
      handleOffline();
      window.removeEventListener('beforeunload', handleOffline);
    };
  }, [currentUser, navigate]);

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
    // Allow deletion if user is admin or message owner
    if (!currentUser || (!isAdmin && currentUser.uid !== messageUid)) return;
    
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
      <Header userData={userData} onSignOut={handleSignOut} />
      
      <div className="flex-1 overflow-y-auto mt-16 mb-20">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            {t('chat.loading')}
          </div>
        ) : (
          <MessageList 
            messages={messages} 
            onDeleteMessage={handleDeleteMessage}
          />
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0">
        <MessageInput 
          onSendMessage={handleSendMessage}
          loading={loading}
          placeholder={t('chat.typeMessage')}
          buttonText={t('chat.sendMessage')}
        />
      </div>
    </div>
  );
};

export default Chat;