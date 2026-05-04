import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import VolumeUpIcon from '@mui/icons-material/VolumeUpRounded';
import VolumeOffIcon from '@mui/icons-material/VolumeOffRounded';
import {
  colorSemantics,
} from '../design-system';

interface VoiceToggleProps {
  voiceEnabled: boolean;
  onToggle: () => void;
}

export default function VoiceToggle({ voiceEnabled, onToggle }: VoiceToggleProps) {
  return (
    <Tooltip title={voiceEnabled ? 'Disable voice' : 'Enable voice'}>
      <IconButton
        onClick={onToggle}
        size="small"
        aria-label={voiceEnabled ? 'Disable voice' : 'Enable voice'}
        sx={{
          color: voiceEnabled
            ? colorSemantics.interactive.primary
            : colorSemantics.text.secondary,
          '&:hover': {
            backgroundColor: colorSemantics.background.muted,
            color: voiceEnabled
              ? colorSemantics.interactive.primaryHover
              : colorSemantics.text.primary,
          },
        }}
      >
        {voiceEnabled ? <VolumeUpIcon fontSize="small" /> : <VolumeOffIcon fontSize="small" />}
      </IconButton>
    </Tooltip>
  );
}
