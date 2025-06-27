
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const languages = [
  { code: 'en', name: 'EN', flag: '🇺🇸' },
  { code: 'pt', name: 'PT', flag: '🇧🇷' },
  { code: 'es', name: 'ES', flag: '🇪🇸' },
  { code: 'it', name: 'IT', flag: '🇮🇹' },
  { code: 'fr', name: 'FR', flag: '🇫🇷' },
  { code: 'de', name: 'DE', flag: '🇩🇪' },
];

type Props = {
  language?: string;
  setLanguage?: (code: string) => void;
};

const LanguageSwitcher: React.FC<Props> = ({ language, setLanguage }) => {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng: string) => {
    if (setLanguage) setLanguage(lng);
    i18n.changeLanguage(lng);
  };

  const currentLangCode = (language || i18n.language).split('-')[0];
  const selectedLang = languages.find(l => l.code === currentLangCode) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="default"
          className="flex items-center justify-center px-3 py-2 min-w-[44px] min-h-[44px] font-medium w-[70px]"
        >
          <span className="text-base font-medium text-gray-900">{selectedLang?.name}</span>
          <span className="sr-only">{t('change_language')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="z-50 min-w-[100px]">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className="flex items-center justify-start gap-2 cursor-pointer"
          >
            <span className="text-lg">{lang.flag}</span>
            <span>{lang.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
