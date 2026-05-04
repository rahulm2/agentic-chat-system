import { memo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {
  colorSemantics,
  spacing,
  typographyPresets,
} from '../design-system';
import type { StreamingStatus } from '../context/types';

interface StreamingIndicatorProps {
  status: StreamingStatus;
}

const StreamingIndicator = memo(function StreamingIndicator({
  status,
}: StreamingIndicatorProps) {
  if (status !== 'connecting' && status !== 'streaming') {
    return null;
  }

  const label = status === 'connecting' ? 'Connecting\u2026' : 'Generating\u2026';

  return (
    <Box
      sx={{
        maxWidth: 768,
        width: '100%',
        mx: 'auto',
        px: `${spacing.layout.sm}px`,
        display: 'flex',
        alignItems: 'center',
        gap: `${spacing.gap.sm}px`,
      }}
    >
      {/* Three bouncing dots */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: colorSemantics.ai.stream,
              animation: 'dotBounce 1.2s ease-in-out infinite',
              animationDelay: `${i * 0.2}s`,
              '@keyframes dotBounce': {
                '0%, 80%, 100%': {
                  transform: 'scale(0.6)',
                  opacity: 0.4,
                },
                '40%': {
                  transform: 'scale(1)',
                  opacity: 1,
                },
              },
            }}
          />
        ))}
      </Box>
      <Typography
        sx={{
          ...typographyPresets.label.sm,
          color: colorSemantics.text.secondary,
        }}
      >
        {label}
      </Typography>
    </Box>
  );
});

export default StreamingIndicator;
