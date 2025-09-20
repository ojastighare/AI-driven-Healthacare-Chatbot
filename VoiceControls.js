import React, { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Switch,
  Typography,
  Tooltip,
  Box
} from '@mui/material';
import {
  RecordVoiceOver as VoiceIcon,
  Mic as MicIcon,
  VolumeUp as SpeakerIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

const VoiceControls = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [voiceSettings, setVoiceSettings] = useState({
    speechToText: true,
    textToSpeech: true,
    autoSpeak: false
  });
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSettingChange = (setting) => (event) => {
    const newSettings = {
      ...voiceSettings,
      [setting]: event.target.checked
    };
    setVoiceSettings(newSettings);
    localStorage.setItem('voice_settings', JSON.stringify(newSettings));
  };

  return (
    <>
      <Tooltip title="Voice Settings">
        <IconButton
          onClick={handleClick}
          size="small"
          sx={{ 
            color: 'white',
            backgroundColor: 'rgba(255,255,255,0.1)',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.2)'
            }
          }}
        >
          <VoiceIcon />
        </IconButton>
      </Tooltip>
      
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 280,
            p: 1
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: 2, color: 'primary.main' }}>
            Voice Accessibility Settings
          </Typography>
          
          <MenuItem sx={{ px: 0 }}>
            <ListItemIcon>
              <MicIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Speech to Text"
              secondary="Enable voice input for messages"
            />
            <Switch
              checked={voiceSettings.speechToText}
              onChange={handleSettingChange('speechToText')}
              size="small"
            />
          </MenuItem>
          
          <MenuItem sx={{ px: 0 }}>
            <ListItemIcon>
              <SpeakerIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Text to Speech"
              secondary="Read bot responses aloud"
            />
            <Switch
              checked={voiceSettings.textToSpeech}
              onChange={handleSettingChange('textToSpeech')}
              size="small"
            />
          </MenuItem>
          
          <MenuItem sx={{ px: 0 }}>
            <ListItemIcon>
              <SettingsIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Auto Speak"
              secondary="Automatically read all responses"
            />
            <Switch
              checked={voiceSettings.autoSpeak}
              onChange={handleSettingChange('autoSpeak')}
              size="small"
            />
          </MenuItem>
        </Box>
      </Menu>
    </>
  );
};

export default VoiceControls; 