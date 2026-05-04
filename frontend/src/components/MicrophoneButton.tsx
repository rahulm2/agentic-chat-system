import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import MicIcon from '@mui/icons-material/MicRounded';
import MicOffIcon from '@mui/icons-material/MicOffRounded';
import {
  colorSemantics,
  borderSemantics,
} from '../design-system';

interface MicrophoneButtonProps {
  isListening: boolean;
  isSupported: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export default function MicrophoneButton({
  isListening,
  isSupported,
  onToggle,
  disabled = false,
}: MicrophoneButtonProps) {
  if (!isSupported) return null;

  return (
    <Tooltip title={isListening ? 'Stop listening' : 'Voice input'}>
      <IconButton
        onClick={onToggle}
        disabled={disabled}
        size="small"
        aria-label={isListening ? 'Stop listening' : 'Voice input'}
        sx={{
          width: 32,
          height: 32,
          borderRadius: `${borderSemantics.radius.input}px`,
          flexShrink: 0,
          backgroundColor: isListening
            ? colorSemantics.status.error.lightest
            : 'transparent',
          color: isListening
            ? colorSemantics.status.error.main
            : colorSemantics.text.secondary,
          transition: 'all 0.15s',
          animation: isListening ? 'pulse 1.5s infinite' : 'none',
          '&:hover': {
            backgroundColor: isListening
              ? colorSemantics.status.error.lightest
              : colorSemantics.background.muted,
            color: isListening
              ? colorSemantics.status.error.main
              : colorSemantics.text.primary,
          },
          '&.Mui-disabled': {
            color: colorSemantics.text.disabled,
          },
          '@keyframes pulse': {
            '0%, 100%': { opacity: 1 },
            '50%': { opacity: 0.6 },
          },
        }}
      >
        {isListening ? <MicOffIcon sx={{ fontSize: 18 }} /> : <MicIcon sx={{ fontSize: 18 }} />}
      </IconButton>
    </Tooltip>
  );
}
