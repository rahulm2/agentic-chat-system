import { memo, useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import {
  colorSemantics,
  spacing,
  typographyPresets,
  borderSemantics,
} from '../design-system';

interface ReasoningPanelProps {
  reasoning: string;
  defaultExpanded?: boolean;
  isStreaming?: boolean;
}

const ReasoningPanel = memo(function ReasoningPanel({
  reasoning,
  defaultExpanded = false,
  isStreaming = false,
}: ReasoningPanelProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  // Auto-expand when streaming starts, collapse when done
  useEffect(() => {
    if (isStreaming) setExpanded(true);
  }, [isStreaming]);

  return (
    <Box
      sx={{
        backgroundColor: colorSemantics.ai.reasoningBg,
        border: `1px solid ${colorSemantics.ai.reasoningBorder}`,
        borderRadius: `${borderSemantics.radius.card}px`,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: `${spacing.gap.sm}px`,
          px: `${spacing.component.md}px`,
          py: `${spacing.component.sm}px`,
          cursor: 'pointer',
          userSelect: 'none',
        }}
        onClick={() => setExpanded((prev) => !prev)}
      >
        <LightbulbOutlinedIcon
          sx={{ fontSize: 16, color: isStreaming ? colorSemantics.ai.stream : colorSemantics.icon.secondary, flexShrink: 0 }}
        />
        <Typography
          sx={{
            ...typographyPresets.label.md,
            color: colorSemantics.text.secondary,
            flex: 1,
          }}
        >
          Reasoning
        </Typography>

        {/* Pulsing dot while actively streaming */}
        {isStreaming && (
          <Box
            sx={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: colorSemantics.ai.stream,
              animation: 'reasoningPulse 1.2s ease-in-out infinite',
              mr: `${spacing.gap.xs}px`,
              '@keyframes reasoningPulse': {
                '0%, 100%': { opacity: 0.3, transform: 'scale(0.8)' },
                '50%': { opacity: 1, transform: 'scale(1)' },
              },
            }}
          />
        )}

        <IconButton size="small" sx={{ p: 0, color: colorSemantics.icon.secondary }}>
          {expanded ? (
            <ExpandLessIcon sx={{ fontSize: 16 }} />
          ) : (
            <ExpandMoreIcon sx={{ fontSize: 16 }} />
          )}
        </IconButton>
      </Box>

      {/* Collapsible content */}
      <Collapse in={expanded}>
        <Box
          sx={{
            px: `${spacing.component.md}px`,
            pb: `${spacing.component.md}px`,
            borderTop: `1px solid ${colorSemantics.ai.reasoningBorder}`,
            pt: `${spacing.component.sm}px`,
          }}
        >
          <Typography
            sx={{
              ...typographyPresets.body.sm,
              color: colorSemantics.text.secondary,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {reasoning}
          </Typography>
        </Box>
      </Collapse>
    </Box>
  );
});

export default ReasoningPanel;
