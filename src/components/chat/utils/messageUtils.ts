import { getAuth } from 'firebase/auth';

export interface Message {
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

export const getYouTubeVideoId = (url: string): string | null => {
  try {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  } catch (error) {
    console.error('Error parsing YouTube URL:', error);
    return null;
  }
};

export const isCurrentUser = (messageUid: string): boolean => {
  const auth = getAuth();
  return messageUid === auth.currentUser?.uid;
};