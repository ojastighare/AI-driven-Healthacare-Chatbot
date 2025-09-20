import React from 'react';
import {
  Chip,
  Tooltip
} from '@mui/material';
import {
  CloudOff as OfflineIcon,
  Cloud as OnlineIcon
} from '@mui/icons-material';

const OfflineIndicator = ({ isOnline }) => {
  if (isOnline) {
    return (
      <Tooltip title="Online - Full features available">
        <Chip
          icon={<OnlineIcon />}
          label="Online"
          size="small"
          color="success"
          variant="outlined"
          sx={{
            backgroundColor: 'rgba(255,255,255,0.1)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.3)',
            '& .MuiChip-icon': {
              color: 'white'
            }
          }}
        />
      </Tooltip>
    );
  }

  return (
    <Tooltip title="Offline - Limited features available">
      <Chip
        icon={<OfflineIcon />}
        label="Offline"
        size="small"
        color="warning"
        sx={{
          backgroundColor: 'rgba(255,152,0,0.2)',
          color: 'white',
          border: '1px solid rgba(255,152,0,0.5)',
          '& .MuiChip-icon': {
            color: 'white'
          }
        }}
      />
    </Tooltip>
  );
};

export default OfflineIndicator; 