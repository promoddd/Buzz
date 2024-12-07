import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Settings as SettingsIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { auth, db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import ColorInput from './settings/ColorInput';
import { THEME_COLORS, isValidColor } from '@/utils/colors';

interface SettingsProps {
  userData: {
    name: string;
    nameColor: string;
    titleColor?: string;
    lastNameChange?: string;
    badge?: {
      text: string;
      color: string;
    };
  };
}

const Settings = ({ userData }: SettingsProps) => {
  const [newName, setNewName] = useState(userData.name);
  const [nameColor, setNameColor] = useState(userData.nameColor || THEME_COLORS.DEFAULT_TITLE_COLOR);
  const [titleColor, setTitleColor] = useState(userData.titleColor || THEME_COLORS.DEFAULT_TITLE_COLOR);
  const [badgeText, setBadgeText] = useState(userData.badge?.text || '');
  const [badgeColor, setBadgeColor] = useState(userData.badge?.color || THEME_COLORS.DEFAULT_TITLE_COLOR);
  const { toast } = useToast();

  const handleSaveSettings = async () => {
    if (!auth.currentUser) return;

    const now = new Date();
    const lastChange = userData.lastNameChange ? new Date(userData.lastNameChange) : new Date(0);
    const daysSinceLastChange = Math.floor((now.getTime() - lastChange.getTime()) / (1000 * 60 * 60 * 24));

    if (newName !== userData.name && daysSinceLastChange < 6) {
      toast({
        title: "Error",
        description: `You can only change your name once every 6 days. ${6 - daysSinceLastChange} days remaining.`,
        variant: "destructive"
      });
      return;
    }

    if (newName.length < 3 || newName.length > 15) {
      toast({
        title: "Error",
        description: "Name must be between 3 and 15 characters",
        variant: "destructive"
      });
      return;
    }

    if (!isValidColor(nameColor) || !isValidColor(titleColor) || !isValidColor(badgeColor)) {
      toast({
        title: "Error",
        description: "Pure black and white colors are not allowed",
        variant: "destructive"
      });
      return;
    }

    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        name: newName,
        nameColor,
        titleColor,
        lastNameChange: newName !== userData.name ? now.toISOString() : userData.lastNameChange,
        badge: {
          text: badgeText,
          color: badgeColor
        }
      });

      toast({
        title: "Success",
        description: "Settings updated successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleResetTitleColor = () => {
    setTitleColor(THEME_COLORS.DEFAULT_TITLE_COLOR);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="transition-transform duration-200 hover:scale-110"
        >
          <SettingsIcon className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Display Name</label>
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              maxLength={15}
              minLength={3}
              className="transition-all duration-200 focus:scale-[1.02]"
            />
            <p className="text-xs text-muted-foreground">
              Can be changed once every 6 days (3-15 characters)
            </p>
          </div>

          <ColorInput label="Name Color" value={nameColor} onChange={setNameColor} />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Title Color</label>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleResetTitleColor}
                className="text-xs"
              >
                Reset
              </Button>
            </div>
            <div className="flex gap-2">
              <ColorInput label="" value={titleColor} onChange={setTitleColor} />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTitleColor(THEME_COLORS.THEME_GRAY)}
                className="h-10 transition-all duration-200 hover:scale-105"
                title="Use theme gray"
              >
                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: THEME_COLORS.THEME_GRAY }} />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Badge Text</label>
            <Input
              value={badgeText}
              onChange={(e) => setBadgeText(e.target.value)}
              maxLength={10}
              placeholder="Optional badge text"
              className="transition-all duration-200 focus:scale-[1.02]"
            />
          </div>

          <ColorInput label="Badge Color" value={badgeColor} onChange={setBadgeColor} />

          <div className="space-y-2">
            <label className="text-sm font-medium">Preview</label>
            <div className="flex items-center gap-2 p-3 bg-secondary rounded-lg">
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
          >
            Save Settings
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Settings;