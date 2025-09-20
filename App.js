import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import ChatInterface from './components/ChatInterface';
import Navigation from './components/Navigation';
import Profile from './components/Profile';
import Alerts from './components/Alerts';
import VaccinationSchedule from './components/VaccinationSchedule';
import PreventiveCare from './components/PreventiveCare';
import LanguageSelector from './components/LanguageSelector';
import VoiceControls from './components/VoiceControls';
import OfflineIndicator from './components/OfflineIndicator';
import './App.css';

// Create theme with healthcare-friendly colors
const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3', // Blue for trust and reliability
      light: '#64b5f6',
      dark: '#1976d2',
    },
    secondary: {
      main: '#4caf50', // Green for health and growth
      light: '#81c784',
      dark: '#388e3c',
    },
    error: {
      main: '#f44336', // Red for alerts and warnings
    },
    warning: {
      main: '#ff9800', // Orange for cautions
    },
    info: {
      main: '#2196f3', // Blue for information
    },
    success: {
      main: '#4caf50', // Green for success messages
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
      color: '#1976d2',
    },
    h5: {
      fontWeight: 500,
      color: '#1976d2',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 20,
          padding: '10px 20px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

function App() {
  const [userId, setUserId] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    // Generate or retrieve user ID
    let storedUserId = localStorage.getItem('healthcare_bot_user_id');
    if (!storedUserId) {
      storedUserId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('healthcare_bot_user_id', storedUserId);
    }
    setUserId(storedUserId);

    // Load user profile
    const profile = localStorage.getItem('healthcare_bot_profile');
    if (profile) {
      setUserProfile(JSON.parse(profile));
    }

    // Monitor online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleLanguageChange = (language) => {
    setCurrentLanguage(language);
    localStorage.setItem('healthcare_bot_language', language);
  };

  const handleProfileUpdate = (profile) => {
    setUserProfile(profile);
    localStorage.setItem('healthcare_bot_profile', JSON.stringify(profile));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          {/* Header with language selector and voice controls */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            p: 2,
            backgroundColor: 'primary.main',
            color: 'white'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <img 
                src="/logo192.png" 
                alt="Healthcare Bot" 
                style={{ width: 40, height: 40 }}
              />
              <Box>
                <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Healthcare Assistant</h2>
                <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.8 }}>
                  Your trusted health companion
                </p>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <VoiceControls />
              <LanguageSelector 
                currentLanguage={currentLanguage}
                onLanguageChange={handleLanguageChange}
              />
              <OfflineIndicator isOnline={isOnline} />
            </Box>
          </Box>

          {/* Main content area */}
          <Box sx={{ flex: 1, display: 'flex' }}>
            <Routes>
              <Route 
                path="/" 
                element={
                  <ChatInterface 
                    userId={userId}
                    currentLanguage={currentLanguage}
                    userProfile={userProfile}
                    isOnline={isOnline}
                  />
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <Profile 
                    userId={userId}
                    userProfile={userProfile}
                    onProfileUpdate={handleProfileUpdate}
                    currentLanguage={currentLanguage}
                  />
                } 
              />
              <Route 
                path="/alerts" 
                element={
                  <Alerts 
                    userId={userId}
                    currentLanguage={currentLanguage}
                    userProfile={userProfile}
                  />
                } 
              />
              <Route 
                path="/vaccination" 
                element={
                  <VaccinationSchedule 
                    userId={userId}
                    userProfile={userProfile}
                    currentLanguage={currentLanguage}
                  />
                } 
              />
              <Route 
                path="/preventive-care" 
                element={
                  <PreventiveCare 
                    currentLanguage={currentLanguage}
                  />
                } 
              />
            </Routes>
          </Box>

          {/* Bottom Navigation */}
          <Navigation />
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App; 