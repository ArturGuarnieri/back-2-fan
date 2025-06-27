
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// English translations
import enCommon from './locales/en/common.json';
import enAuth from './locales/en/auth.json';
import enStaking from './locales/en/staking.json';
import enPartners from './locales/en/partners.json';
import enTokens from './locales/en/tokens.json';
import enDashboard from './locales/en/dashboard.json';
import enNavigation from './locales/en/navigation.json';
import enAdmin from './locales/en/admin.json';
import enSettings from './locales/en/settings.json';
import enLanding from './locales/en/landing.json';
import enCountries from './locales/en/countries.json';

// Portuguese translations
import ptCommon from './locales/pt/common.json';
import ptAuth from './locales/pt/auth.json';
import ptStaking from './locales/pt/staking.json';
import ptPartners from './locales/pt/partners.json';
import ptTokens from './locales/pt/tokens.json';
import ptDashboard from './locales/pt/dashboard.json';
import ptNavigation from './locales/pt/navigation.json';
import ptAdmin from './locales/pt/admin.json';
import ptSettings from './locales/pt/settings.json';
import ptLanding from './locales/pt/landing.json';
import ptCountries from './locales/pt/countries.json';

// Spanish translations
import esCommon from './locales/es/common.json';
import esAuth from './locales/es/auth.json';
import esStaking from './locales/es/staking.json';
import esPartners from './locales/es/partners.json';
import esTokens from './locales/es/tokens.json';
import esDashboard from './locales/es/dashboard.json';
import esNavigation from './locales/es/navigation.json';
import esAdmin from './locales/es/admin.json';
import esSettings from './locales/es/settings.json';
import esLanding from './locales/es/landing.json';
import esCountries from './locales/es/countries.json';

// Italian translations
import itCommon from './locales/it/common.json';
import itAuth from './locales/it/auth.json';
import itStaking from './locales/it/staking.json';
import itPartners from './locales/it/partners.json';
import itTokens from './locales/it/tokens.json';
import itDashboard from './locales/it/dashboard.json';
import itNavigation from './locales/it/navigation.json';
import itAdmin from './locales/it/admin.json';
import itSettings from './locales/it/settings.json';
import itLanding from './locales/it/landing.json';
import itCountries from './locales/it/countries.json';

// French translations
import frCommon from './locales/fr/common.json';
import frAuth from './locales/fr/auth.json';
import frStaking from './locales/fr/staking.json';
import frPartners from './locales/fr/partners.json';
import frTokens from './locales/fr/tokens.json';
import frDashboard from './locales/fr/dashboard.json';
import frNavigation from './locales/fr/navigation.json';
import frAdmin from './locales/fr/admin.json';
import frSettings from './locales/fr/settings.json';
import frLanding from './locales/fr/landing.json';
import frCountries from './locales/fr/countries.json';

// German translations
import deCommon from './locales/de/common.json';
import deAuth from './locales/de/auth.json';
import deStaking from './locales/de/staking.json';
import dePartners from './locales/de/partners.json';
import deTokens from './locales/de/tokens.json';
import deDashboard from './locales/de/dashboard.json';
import deNavigation from './locales/de/navigation.json';
import deAdmin from './locales/de/admin.json';
import deSettings from './locales/de/settings.json';
import deLanding from './locales/de/landing.json';
import deCountries from './locales/de/countries.json';

const resources = {
  en: {
    translation: {
      ...enCommon,
      ...enAuth,
      ...enStaking,
      ...enPartners,
      ...enTokens,
      ...enDashboard,
      ...enNavigation,
      ...enAdmin,
      ...enSettings,
      ...enLanding,
      ...enCountries,
    },
  },
  pt: {
    translation: {
      ...ptCommon,
      ...ptAuth,
      ...ptStaking,
      ...ptPartners,
      ...ptTokens,
      ...ptDashboard,
      ...ptNavigation,
      ...ptAdmin,
      ...ptSettings,
      ...ptLanding,
      ...ptCountries,
    },
  },
  es: {
    translation: {
      ...esCommon,
      ...esAuth,
      ...esStaking,
      ...esPartners,
      ...esTokens,
      ...esDashboard,
      ...esNavigation,
      ...esAdmin,
      ...esSettings,
      ...esLanding,
      ...esCountries,
    },
  },
  it: {
    translation: {
      ...itCommon,
      ...itAuth,
      ...itStaking,
      ...itPartners,
      ...itTokens,
      ...itDashboard,
      ...itNavigation,
      ...itAdmin,
      ...itSettings,
      ...itLanding,
      ...itCountries,
    },
  },
  fr: {
    translation: {
      ...frCommon,
      ...frAuth,
      ...frStaking,
      ...frPartners,
      ...frTokens,
      ...frDashboard,
      ...frNavigation,
      ...frAdmin,
      ...frSettings,
      ...frLanding,
      ...frCountries,
    },
  },
  de: {
    translation: {
      ...deCommon,
      ...deAuth,
      ...deStaking,
      ...dePartners,
      ...deTokens,
      ...deDashboard,
      ...deNavigation,
      ...deAdmin,
      ...deSettings,
      ...deLanding,
      ...deCountries,
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'cookie', 'navigator', 'querystring', 'sessionStorage'],
      caches: ['localStorage', 'cookie'],
      lookupLocalStorage: 'i18nextLng',
      lookupCookie: 'i18next',
      lookupQuerystring: 'lng',
      lookupSessionStorage: 'i18nextLng',
      excludeCacheFor: ['cimode'],
    },
    supportedLngs: ['en', 'pt', 'es', 'it', 'fr', 'de', 'cimode'],
    nonExplicitSupportedLngs: true,
    react: {
      useSuspense: false,
    },
  });

export default i18n;
