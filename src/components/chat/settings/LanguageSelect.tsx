import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

const languages = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'sq', name: 'Shqip' },
  { code: 'zh', name: '中文' },
  { code: 'ja', name: '日本語' },
  { code: 'ru', name: 'Русский' }
];

const LanguageSelect = () => {
  const { i18n, t } = useTranslation();

  useEffect(() => {
    // Load saved language from localStorage on component mount
    const savedLang = localStorage.getItem('i18nextLng');
    if (savedLang && savedLang !== i18n.language) {
      i18n.changeLanguage(savedLang);
    }
  }, [i18n]);

  const handleLanguageChange = (value: string) => {
    i18n.changeLanguage(value);
    localStorage.setItem('i18nextLng', value);
    console.log('Language changed to:', value);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {t('settings.language')}
      </label>
      <Select 
        onValueChange={handleLanguageChange} 
        defaultValue={localStorage.getItem('i18nextLng') || 'en'}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select language" />
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              {lang.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSelect;