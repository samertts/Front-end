import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Language, translations, Translation } from '../translations';
import { getDir } from '../lib/utils';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translation;
  dir: 'rtl' | 'ltr';
  isRtl: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Sovereign Language Detection Engine (Section 5 compliance)
const getDetectedLanguage = (): Language => {
  if (typeof window === 'undefined') return 'AR';

  // 1. Stored preference (Priority 2)
  const saved = localStorage.getItem('gula_language') as Language | null;
  if (saved && ['EN', 'AR', 'KU', 'TR', 'SY'].includes(saved)) {
    return saved;
  }

  // 2. Browser locale tags (Priority 3)
  const browserLangs = navigator.languages || [navigator.language];
  for (const bLang of browserLangs) {
    const l = bLang.toLowerCase();
    if (l.startsWith('ar')) return 'AR';
    if (l.startsWith('ku') || l.startsWith('ckb')) return 'KU';
    if (l.startsWith('tr') || l.startsWith('tk')) return 'TR';
    if (l.startsWith('syr') || l.includes('syriac')) return 'SY';
  }

  // 3. Geographic/Timezone heuristics (Priority 4)
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && (tz.includes('Baghdad') || tz.includes('Erbil') || tz.includes('Basra') || tz.includes('Kirkuk'))) {
      return 'AR';
    }
  } catch (e) {
    // Fail-safe
  }

  // 4. Default to Arabic (Priority 5 - GULA Sovereign Standard)
  return 'AR';
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getDetectedLanguage);

  useEffect(() => {
    document.documentElement.lang = language.toLowerCase();
    document.documentElement.dir = getDir(language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('gula_language', lang);
  };

  const value = {
    language,
    setLanguage,
    t: translations[language],
    dir: getDir(language),
    isRtl: getDir(language) === 'rtl'
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

