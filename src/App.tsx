import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

// Common components
import Header from './components/Header';
import Footer from './components/Footer';

// Auth components
import Login from './components/Login';
import Signup from './components/Signup';

// Main pages
import MainPage from './components/MainPage';

// Feature components
import ElectricalWorksPage from './components/ElectricalWorksPage';
import CommunicationPage from './features/communication/components/CommunicationPage';
import CommunicationWorksPage from './features/communication/components/CommunicationWorksPage';
import UnitPlumbingPage from './features/plumbing/components/unit/UnitPlumbingPage';
import UnitPlumbingProjectPage from './features/plumbing/components/unit/UnitPlumbingProjectPage';
import UnitPlumbingInspectionPage from './features/plumbing/components/unit/UnitPlumbingInspectionPage';
import CommonPlumbingPage from './components/CommonPlumbingPage';
import CommonPlumbingWorksPage from './components/CommonPlumbingWorksPage';
import WorkLogsPage from './components/WorkLogsPage';
import WorkArrangementsPage from './components/WorkArrangementsPage';
import FinishingWorksPage from './components/FinishingWorksPage';
import ApartmentFinishingWorks from './components/ApartmentFinishingWorks';

// Admin components
import AdminZonePage from './components/AdminZonePage';
import AdminGuard from './components/AdminGuard';

// Additional features
import ChatSystem from './components/ChatSystem';
import ReportingSystem from './components/ReportingSystem';

import './i18n';

function App() {
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    localStorage.setItem('darkMode', JSON.stringify(darkMode));

    return () => unsubscribe();
  }, [darkMode]);

  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode);
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
        <Header darkMode={darkMode} setDarkMode={handleDarkModeToggle} user={user} />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            {/* Main Routes */}
            <Route path="/" element={user ? <MainPage /> : <Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Communication Routes */}
            <Route path="/communication" element={user ? <CommunicationPage /> : <Navigate to="/login" />} />
            <Route path="/communication/:projectId/work-report" element={user ? <CommunicationWorksPage /> : <Navigate to="/login" />} />
            
            {/* Plumbing Routes */}
            <Route path="/unit-plumbing" element={user ? <UnitPlumbingPage /> : <Navigate to="/login" />} />
            <Route path="/unit-plumbing/:projectId" element={user ? <UnitPlumbingProjectPage /> : <Navigate to="/login" />} />
            <Route path="/unit-plumbing/:projectId/building/:buildingNumber/apartment/:apartmentNumber" element={user ? <UnitPlumbingInspectionPage /> : <Navigate to="/login" />} />
            <Route path="/common-plumbing" element={user ? <CommonPlumbingPage /> : <Navigate to="/login" />} />
            <Route path="/common-plumbing/:projectId" element={user ? <CommonPlumbingWorksPage /> : <Navigate to="/login" />} />

            {/* Electrical Routes */}
            <Route path="/electrical-works" element={user ? <ElectricalWorksPage /> : <Navigate to="/login" />} />
            <Route path="/electrical-works/:projectId" element={user ? <ElectricalWorksPage /> : <Navigate to="/login" />} />
            <Route path="/electrical-works/:projectId/building/:buildingNumber/apartment/:apartmentNumber" element={user ? <ElectricalWorksPage /> : <Navigate to="/login" />} />

            {/* Work Management Routes */}
            <Route path="/work-logs" element={user ? <WorkLogsPage /> : <Navigate to="/login" />} />
            <Route path="/work-arrangements" element={user ? <WorkArrangementsPage /> : <Navigate to="/login" />} />

            {/* Finishing Works Routes */}
            <Route path="/finishing-works" element={user ? <FinishingWorksPage /> : <Navigate to="/login" />} />
            <Route path="/finishing-works/:projectId" element={user ? <ApartmentFinishingWorks /> : <Navigate to="/login" />} />
            <Route path="/finishing-works/:projectId/building/:buildingNumber/apartment/:apartmentNumber" element={user ? <ApartmentFinishingWorks /> : <Navigate to="/login" />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminGuard><AdminZonePage /></AdminGuard>} />

            {/* Additional Feature Routes */}
            <Route path="/chat" element={user ? <ChatSystem /> : <Navigate to="/login" />} />
            <Route path="/reports" element={user ? <ReportingSystem /> : <Navigate to="/login" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;