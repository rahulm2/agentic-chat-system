import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import LogoutIcon from '@mui/icons-material/LogoutRounded';
import AddIcon from '@mui/icons-material/AddRounded';
import {
  colorSemantics,
  spacing,
  typographyPresets,
  shadowSemantics,
  borderSemantics,
} from '../design-system';

interface ChatHeaderProps {
  onLogout: () => void;
  onNewChat: () => void;
}

export default function ChatHeader({ onLogout, onNewChat }: ChatHeaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: `${spacing.component.xl}px`,
        py: `${spacing.component.sm}px`,
        backgroundColor: colorSemantics.background.default,
        borderBottom: `1px solid ${colorSemantics.border.subtle}`,
        boxShadow: shadowSemantics.nav,
        minHeight: 56,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: `${spacing.gap.sm}px` }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: `${borderSemantics.radius.button}px`,
            backgroundColor: colorSemantics.interactive.primary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography sx={{ ...typographyPresets.label.lg, color: colorSemantics.text.inverse }}>
            A
          </Typography>
        </Box>
        <Typography
          component="h1"
          sx={{
            ...typographyPresets.heading.xs,
            color: colorSemantics.text.primary,
            letterSpacing: '-0.01em',
          }}
        >
          Agentic Chat
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: `${spacing.gap.xs}px` }}>
        <Tooltip title="New chat">
          <IconButton
            onClick={onNewChat}
            size="small"
            aria-label="New chat"
            sx={{
              color: colorSemantics.text.secondary,
              '&:hover': {
                backgroundColor: colorSemantics.background.muted,
                color: colorSemantics.text.primary,
              },
            }}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Log out">
          <IconButton
            onClick={onLogout}
            size="small"
            aria-label="Log out"
            sx={{
              color: colorSemantics.text.secondary,
              '&:hover': {
                backgroundColor: colorSemantics.status.error.lightest,
                color: colorSemantics.status.error.main,
              },
            }}
          >
            <LogoutIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}
