import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'sr', // Default jezik: srpski
    lng: localStorage.getItem('i18nextLng') || 'sr', // Pocetni jezik
    backend: {
      loadPath: '/locales/{{lng}}/translation.json', // Putanja do JSON fajlova u public folderu
    },
    interpolation: {
      escapeValue: false, 
    },
    detection: {
      order: ['localStorage', 'navigator'], // Prvo proverava localStorage, pa browser jezik
      caches: ['localStorage'], // Cuva izabrani jezik u localStorage
    },
  });

export default i18n;