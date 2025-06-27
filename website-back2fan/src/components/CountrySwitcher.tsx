
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Flag, Lock } from 'lucide-react';
import ReactCountryFlag from "react-country-flag";
import { useTranslation } from 'react-i18next';

// Lista dos principais países, nomeados em suas línguas nativas
const countries = [
  { code: 'BR', name: 'Brasil' },
  { code: 'US', name: 'United States' },
  { code: 'DE', name: 'Deutschland' },
  { code: 'FR', name: 'France' },
  { code: 'ES', name: 'España' },
  { code: 'IT', name: 'Italia' },
  { code: 'PT', name: 'Portugal' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'NL', name: 'Nederland' },
];

type Props = {
  country: string;
  setCountry: (code: string) => void;
};

const CountrySwitcher: React.FC<Props> = ({ country, setCountry }) => {
  const { t } = useTranslation();
  const selectedCountry = countries.find((c) => c.code === country);

  const renderFlag = (countryObj: typeof countries[number]) => (
    <ReactCountryFlag
      countryCode={countryObj.code}
      svg
      style={{
        width: "2em",
        height: "2em",
        borderRadius: "0.375rem",
        objectFit: "cover",
      }}
      title={countryObj.name}
    />
  );

  const handleCountryClick = (countryCode: string) => {
    // Só permite mudança para Brasil
    if (countryCode === 'BR') {
      setCountry(countryCode);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="default"
          className="flex items-center px-3 py-2 min-w-[44px] min-h-[44px] gap-2 font-medium"
        >
          <span className="flex items-center justify-center">
            {selectedCountry ? renderFlag(selectedCountry) : <Flag className="h-5 w-5" />}
          </span>
          <span className="text-base font-medium text-gray-900 hidden sm:inline">{selectedCountry?.name}</span>
          <span className="sr-only">Mudar país</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="z-50">
        {countries.map((c) => (
          <DropdownMenuItem
            key={c.code}
            onClick={() => handleCountryClick(c.code)}
            className={`flex items-center gap-2 ${
              c.code === 'BR' ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
            }`}
            disabled={c.code !== 'BR'}
          >
            <span className="flex items-center justify-center">
              {renderFlag(c)}
            </span>
            <span>{c.name}</span>
            {c.code !== 'BR' && (
              <div className="flex items-center gap-1 ml-auto">
                <Lock className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-400">{t('coming_soon')}</span>
              </div>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CountrySwitcher;
