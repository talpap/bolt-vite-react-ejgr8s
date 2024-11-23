import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          login: 'Login',
          signup: 'Sign Up',
          email: 'Email',
          password: 'Password',
          rememberMe: 'Remember Me',
          loginWithGoogle: 'Login with Google',
          "Don't have an account?": "Don't have an account?",
          "Already have an account?": "Already have an account?",
          phoneNumber: 'Phone Number',
          signupWithGoogle: 'Sign Up with Google',
          logout: 'Logout',
          viewProfile: 'View Profile',
          settings: 'Settings',
          help: 'Help',
          back: 'Back',
          electricalWorks: 'Electrical Works',
          communication: 'Communication',
          unitPlumbing: 'Unit Plumbing',
          commonPlumbing: 'Common Plumbing',
          workLogs: 'Work Logs',
          workArrangements: 'Work Arrangements',
          finishingWorks: 'Finishing Works',
          adminZone: 'Admin Zone',
          // Add more translations as needed
        },
      },
      he: {
        translation: {
          login: 'התחברות',
          signup: 'הרשמה',
          email: 'אימייל',
          password: 'סיסמה',
          rememberMe: 'זכור אותי',
          loginWithGoogle: 'התחבר עם Google',
          "Don't have an account?": "אין לך חשבון?",
          "Already have an account?": "כבר יש לך חשבון?",
          phoneNumber: 'מספר טלפון',
          signupWithGoogle: 'הירשם עם Google',
          logout: 'התנתקות',
          viewProfile: 'צפה בפרופיל',
          settings: 'הגדרות',
          help: 'עזרה',
          back: 'חזרה',
          electricalWorks: 'עבודות חשמל',
          communication: 'תקשורת',
          unitPlumbing: 'אינסטלציה ביחידה',
          commonPlumbing: 'אינסטלציה משותפת',
          workLogs: 'יומני עבודה',
          workArrangements: 'הסדרי עבודה',
          finishingWorks: 'עבודות גמר',
          adminZone: 'אזור מנהל',
          // Add more translations as needed
        },
      },
    },
    lng: 'en', // Set default language to English
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;