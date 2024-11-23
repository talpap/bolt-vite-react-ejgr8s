import { useState, useEffect } from 'react';

export const useDarkMode = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  return [darkMode, setDarkMode] as const;
};

export const useLanguage = () => {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    document.documentElement.dir = language === 'he' ? 'rtl' : 'ltr';
  }, [language]);

  return [language, setLanguage] as const;
};