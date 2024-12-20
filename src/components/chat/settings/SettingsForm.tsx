import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { auth, db, initializeMessaging } from '@/lib/firebase';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import ColorPickerInput from './ColorPickerInput';
import LanguageSelect from './LanguageSelect';
import { THEME_COLORS, isValidColor } from '@/utils/colors';

interface SettingsFormProps {
  userData: {
    name: string;
    nameColor: string;
    titleColor?: string;
    lastNameChange?: string;
    badge?: {
      text: string;
      color: string;
    };
    notificationsEnabled?: boolean;
  };
}

const SettingsForm = ({ userData }: SettingsFormProps) => {
  const [newName, setNewName] = useState(userData.name);
  const [nameColor, setNameColor] = useState(userData.nameColor || THEME_COLORS.DEFAULT_TITLE_COLOR);
  const [titleColor, setTitleColor] = useState(userData.titleColor || THEME_COLORS.DEFAULT_TITLE_COLOR);
  const [badgeText, setBadgeText] = useState(userData.badge?.text || '');
  const [badgeColor, setBadgeColor] = useState(userData.badge?.color || THEME_COLORS.DEFAULT_TITLE_COLOR);
  const [isCheckingName, setIsCheckingName] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(userData.notificationsEnabled || false);
  const [notificationsBlocked, setNotificationsBlocked] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    const checkNotificationPermission = async () => {
      const permission = await Notification.permission;
      setNotificationsBlocked(permission === 'denied');
      
      // If notifications are enabled but permission is not granted, try to request it
      if (notificationsEnabled && permission === 'default') {
        const token = await initializeMessaging();
        if (!token) {
          setNotificationsEnabled(false);
          setNotificationsBlocked(true);
        }
      }
    };
    checkNotificationPermission();
  }, [notificationsEnabled]);

  const handleNotificationToggle = async () => {
    try {
      if (!notificationsEnabled) {
        console.log('Attempting to enable notifications...');
        const token = await initializeMessaging();
        if (token) {
          console.log('Successfully obtained FCM token');
          setNotificationsEnabled(true);
          const userRef = doc(db, 'users', auth.currentUser!.uid);
          await updateDoc(userRef, { 
            notificationsEnabled: true,
            fcmToken: token
          });
          toast({
            title: "Success",
            description: "Notifications enabled successfully"
          });
        } else {
          console.log('Failed to obtain FCM token');
          setNotificationsBlocked(true);
          toast({
            title: "Error",
            description: t('settings.notificationsBlocked'),
            variant: "destructive"
          });
        }
      } else {
        console.log('Disabling notifications...');
        setNotificationsEnabled(false);
        const userRef = doc(db, 'users', auth.currentUser!.uid);
        await updateDoc(userRef, { 
          notificationsEnabled: false,
          fcmToken: null
        });
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
      toast({
        title: "Error",
        description: "Failed to update notification settings",
        variant: "destructive"
      });
    }
  };

  const checkNameAvailability = async (name: string) => {
    if (!auth.currentUser || name === userData.name) return true;
    
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('name', '==', name));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty;
  };

  const handleSaveSettings = async () => {
    if (!auth.currentUser) return;

    setIsCheckingName(true);
    try {
      const now = new Date();
      const lastChange = userData.lastNameChange ? new Date(userData.lastNameChange) : new Date(0);
      const daysSinceLastChange = Math.floor((now.getTime() - lastChange.getTime()) / (1000 * 60 * 60 * 24));

      if (newName !== userData.name) {
        if (daysSinceLastChange < 6) {
          toast({
            title: "Error",
            description: t('errors.nameChangeLimit', { days: 6 - daysSinceLastChange }),
            variant: "destructive"
          });
          return;
        }

        const isNameAvailable = await checkNameAvailability(newName);
        if (!isNameAvailable) {
          toast({
            title: "Error",
            description: t('errors.nameTaken'),
            variant: "destructive"
          });
          return;
        }
      }

      if (newName.length < 3 || newName.length > 15) {
        toast({
          title: "Error",
          description: t('errors.nameRequired'),
          variant: "destructive"
        });
        return;
      }

      if (!isValidColor(nameColor) || !isValidColor(titleColor) || !isValidColor(badgeColor)) {
        toast({
          title: "Error",
          description: t('errors.colorInvalid'),
          variant: "destructive"
        });
        return;
      }

      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        name: newName,
        nameColor,
        titleColor,
        lastNameChange: newName !== userData.name ? now.toISOString() : userData.lastNameChange,
        badge: {
          text: badgeText,
          color: badgeColor
        },
        notificationsEnabled
      });

      toast({
        title: "Success",
        description: t('success.settingsUpdated')
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsCheckingName(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">{t('settings.displayName')}</label>
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          maxLength={15}
          minLength={3}
          className="transition-all duration-200 focus:scale-[1.02]"
        />
        <p className="text-xs text-muted-foreground">
          {t('settings.nameChangeInfo')}
        </p>
      </div>

      <ColorPickerInput 
        label={t('settings.nameColor')} 
        value={nameColor} 
        onChange={setNameColor}
      />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">{t('settings.titleColor')}</label>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setTitleColor(THEME_COLORS.DEFAULT_TITLE_COLOR)}
            className="text-xs hover:bg-secondary transition-colors"
          >
            {t('settings.reset')}
          </Button>
        </div>
        <ColorPickerInput 
          label="" 
          value={titleColor} 
          onChange={setTitleColor}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">{t('settings.badgeText')}</label>
        <Input
          value={badgeText}
          onChange={(e) => setBadgeText(e.target.value)}
          maxLength={10}
          placeholder="Optional badge text"
          className="transition-all duration-200 focus:scale-[1.02]"
        />
      </div>

      <ColorPickerInput 
        label={t('settings.badgeColor')} 
        value={badgeColor} 
        onChange={setBadgeColor}
      />

      <div className="space-y-2">
        <label className="text-sm font-medium">{t('settings.notifications')}</label>
        {notificationsBlocked ? (
          <p className="text-sm text-destructive">
            {t('settings.notificationsBlocked')}
          </p>
        ) : (
          <div className="flex items-center space-x-2">
            <Switch
              checked={notificationsEnabled}
              onCheckedChange={handleNotificationToggle}
              id="notifications"
            />
            <label htmlFor="notifications" className="text-sm">
              {t('settings.notificationsEnabled')}
            </label>
          </div>
        )}
      </div>

      <LanguageSelect />

      <div className="space-y-2">
        <label className="text-sm font-medium">{t('settings.preview')}</label>
        <div className="flex items-center gap-2 p-3 bg-secondary/50 backdrop-blur-sm rounded-lg border border-border/50">
          <span style={{ color: nameColor }}>{newName}</span>
          {badgeText && (
            <Badge 
              style={{ backgroundColor: badgeColor }}
              className="animate-badge-pop"
            >
              {badgeText}
            </Badge>
          )}
        </div>
      </div>

      <Button 
        onClick={handleSaveSettings} 
        className="w-full transition-all duration-200 hover:scale-[1.02]"
        disabled={isCheckingName}
      >
        {isCheckingName ? t('settings.checking') : t('settings.save')}
      </Button>
    </div>
  );
};

export default SettingsForm;
