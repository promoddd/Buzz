import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Settings as SettingsIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import SettingsForm from './settings/SettingsForm';

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
  const { t } = useTranslation();

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
          <SheetTitle>{t('settings.title')}</SheetTitle>
        </SheetHeader>
        <div className="mt-4">
          <SettingsForm userData={userData} />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Settings;