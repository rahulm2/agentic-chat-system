import { memo } from 'react';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import {
  colorSemantics,
  spacing,
  typographyPresets,
} from '../design-system';
import type { MessageMetadata } from '../context/types';

interface MetadataBarProps {
  metadata: MessageMetadata;
}

interface MetadataItem {
  label: string;
  tooltip: string;
}

const MetadataBar = memo(function MetadataBar({ metadata }: MetadataBarProps) {
  const items: MetadataItem[] = [];

  if (metadata.model) {
    items.push({
      label: metadata.model,
      tooltip: 'AI model used to generate this response',
    });
  }
  if (metadata.inputTokens !== undefined && metadata.outputTokens !== undefined) {
    items.push({
      label: `${metadata.inputTokens}↑ ${metadata.outputTokens}↓`,
      tooltip: `${metadata.inputTokens} input tokens sent · ${metadata.outputTokens} output tokens received`,
    });
  }
  if (metadata.latencyMs !== undefined) {
    items.push({
      label: `${metadata.latencyMs}ms`,
      tooltip: `Total response latency: ${metadata.latencyMs} milliseconds from request to completion`,
    });
  }
  if (metadata.estimatedCost !== undefined) {
    items.push({
      label: `$${metadata.estimatedCost.toFixed(4)}`,
      tooltip: `Estimated API cost for this response based on token usage`,
    });
  }

  if (items.length === 0) return null;

  return (
    <Box>
      <Divider sx={{ borderColor: colorSemantics.border.subtle, mb: `${spacing.gap.sm}px` }} />
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: `${spacing.gap.sm}px`,
          alignItems: 'center',
        }}
      >
        {items.map((item) => (
          <Tooltip key={item.label} title={item.tooltip} placement="top" arrow>
            <Typography
              sx={{
                ...typographyPresets.label.xs,
                color: colorSemantics.text.secondary,
                backgroundColor: colorSemantics.background.subtle,
                border: `1px solid ${colorSemantics.border.subtle}`,
                borderRadius: '4px',
                px: `${spacing.component.xs}px`,
                py: '2px',
                cursor: 'default',
                '&:hover': {
                  backgroundColor: colorSemantics.background.muted,
                  borderColor: colorSemantics.border.default,
                },
                transition: 'background-color 0.15s ease, border-color 0.15s ease',
              }}
            >
              {item.label}
            </Typography>
          </Tooltip>
        ))}
      </Box>
    </Box>
  );
});

export default MetadataBar;
