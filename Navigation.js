import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper
} from '@mui/material';
import {
  Chat as ChatIcon,
  Person as PersonIcon,
  Warning as AlertIcon,
  Vaccines as VaccineIcon,
  HealthAndSafety as PreventiveIcon
} from '@mui/icons-material';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    { label: 'Chat', icon: <ChatIcon />, path: '/' },
    { label: 'Alerts', icon: <AlertIcon />, path: '/alerts' },
    { label: 'Vaccines', icon: <VaccineIcon />, path: '/vaccination' },
    { label: 'Prevention', icon: <PreventiveIcon />, path: '/preventive-care' },
    { label: 'Profile', icon: <PersonIcon />, path: '/profile' }
  ];

  const getCurrentValue = () => {
    const currentItem = navigationItems.find(item => item.path === location.pathname);
    return currentItem ? navigationItems.indexOf(currentItem) : 0;
  };

  const handleNavigation = (event, newValue) => {
    navigate(navigationItems[newValue].path);
  };

  return (
    <Paper 
      sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }} 
      elevation={8}
    >
      <BottomNavigation
        value={getCurrentValue()}
        onChange={handleNavigation}
        sx={{
          '& .MuiBottomNavigationAction-root': {
            minWidth: 0,
            padding: '6px 0 8px',
          },
          '& .MuiBottomNavigationAction-label': {
            fontSize: '0.7rem',
            '&.Mui-selected': {
              fontSize: '0.7rem',
            },
          },
        }}
      >
        {navigationItems.map((item, index) => (
          <BottomNavigationAction
            key={index}
            label={item.label}
            icon={item.icon}
            sx={{
              color: location.pathname === item.path ? 'primary.main' : 'text.secondary',
            }}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
};

export default Navigation; 