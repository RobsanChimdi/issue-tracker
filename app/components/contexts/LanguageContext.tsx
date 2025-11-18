"use client";

import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

interface LanguageContextProps {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextProps | null>(null);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState("English");
  const [translations, setTranslations] = useState<any>({});

  useEffect(() => {
    async function loadFromDB() {
      try {
        const res = await axios.get("/api/settings");
        const lang = res.data?.language || "English";

        setLanguage(lang);
      } catch {}
    }
    loadFromDB();
  }, []);

  useEffect(() => {
    loadTranslations(language);
  }, [language]);

  const loadTranslations = async (lang: string) => {
    const file =
      lang === "A/Oromoo"
        ? "/lang/or.json"
        : lang === "Amharic"
        ? "/lang/am.json"
        : "/lang/en.json";

    const res = await fetch(file);
    const json = await res.json();
    setTranslations(json);
  };

  const t = (key: string) => translations[key] || key;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext)!;
