import React from 'react'
import { useTranslation } from 'react-i18next'

const Footer = () => {
  const { t } = useTranslation()

  return (
    <footer className="bg-white dark:bg-gray-800 shadow-md mt-8">
      <div className="container mx-auto px-4 py-4 text-center text-gray-600 dark:text-gray-300">
        <p>&copy; 2024 Dimri HaShahar. {t('allRightsReserved')}</p>
      </div>
    </footer>
  )
}

export default Footer