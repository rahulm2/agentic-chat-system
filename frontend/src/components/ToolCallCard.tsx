import { memo, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import {
  colorSemantics,
  spacing,
  typographyPresets,
  borderSemantics,
} from '../design-system';
import type { ToolCall } from '../context/types';

interface ToolCallCardProps {
  toolCall: ToolCall;
}

const ToolCallCard = memo(function ToolCallCard({ toolCall }: ToolCallCardProps) {
  const [expanded, setExpanded] = useState(false);

  const renderStatusChip = () => {
    switch (toolCall.status) {
      case 'pending':
        return (
          <Chip
            label="Pending"
            size="small"
            sx={{
              ...typographyPresets.label.xs,
              backgroundColor: colorSemantics.background.muted,
              color: colorSemantics.text.secondary,
              height: 20,
            }}
          />
        );
      case 'running':
        return (
          <Chip
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: `${spacing.gap.xs}px` }}>
                <CircularProgress size={12} thickness={4} sx={{ color: colorSemantics.status.info.main }} />
                Running
              </Box>
            }
            size="small"
            sx={{
              ...typographyPresets.label.xs,
              backgroundColor: colorSemantics.status.info.lightest,
              color: colorSemantics.status.info.dark,
              height: 20,
            }}
          />
        );
      case 'success':
        return (
          <Chip
            label="Success"
            size="small"
            sx={{
              ...typographyPresets.label.xs,
              backgroundColor: colorSemantics.status.success.lightest,
              color: colorSemantics.status.success.dark,
              height: 20,
            }}
          />
        );
      case 'error':
        return (
          <Chip
            label="Error"
            size="small"
            sx={{
              ...typographyPresets.label.xs,
              backgroundColor: colorSemantics.status.error.lightest,
              color: colorSemantics.status.error.dark,
              height: 20,
            }}
          />
        );
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: colorSemantics.ai.toolBg,
        border: `1px solid ${colorSemantics.ai.toolBorder}`,
        borderRadius: `${borderSemantics.radius.card}px`,
        overflow: 'hidden',
      }}
    >
      {/* Header — click to toggle */}
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
        <BuildOutlinedIcon
          sx={{ fontSize: 16, color: colorSemantics.icon.secondary, flexShrink: 0 }}
        />
        <Typography
          sx={{
            ...typographyPresets.label.md,
            color: colorSemantics.text.primary,
            flex: 1,
          }}
        >
          {toolCall.toolName}
        </Typography>
        {renderStatusChip()}
        <IconButton size="small" sx={{ p: 0, ml: `${spacing.gap.xs}px`, color: colorSemantics.icon.secondary }} onClick={(e) => { e.stopPropagation(); setExpanded((prev) => !prev); }}>
          {expanded ? (
            <ExpandLessIcon sx={{ fontSize: 16 }} />
          ) : (
            <ExpandMoreIcon sx={{ fontSize: 16 }} />
          )}
        </IconButton>
      </Box>

      {/* Collapsible body: args + result */}
      {expanded && (
        <>
          <Box
            sx={{
              borderTop: `1px solid ${colorSemantics.ai.toolBorder}`,
              px: `${spacing.component.md}px`,
              py: `${spacing.component.xs}px`,
            }}
          >
            <Typography
              sx={{
                ...typographyPresets.label.xs,
                color: colorSemantics.text.secondary,
                mb: `${spacing.gap.sm}px`,
              }}
            >
              Arguments
            </Typography>
            <Box
              component="pre"
              sx={{
                p: `${spacing.component.sm}px`,
                backgroundColor: colorSemantics.background.subtle,
                borderRadius: `${borderSemantics.radius.code}px`,
                border: `1px solid ${colorSemantics.border.subtle}`,
                ...typographyPresets.code.sm,
                color: colorSemantics.text.primary,
                overflowX: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                margin: 0,
                marginBottom: `${spacing.gap.sm}px`,
              }}
            >
              {JSON.stringify(toolCall.args, null, 2)}
            </Box>
          </Box>

          {toolCall.result !== undefined && (
            <Box
              sx={{
                borderTop: `1px solid ${colorSemantics.ai.toolBorder}`,
                px: `${spacing.component.md}px`,
                py: `${spacing.component.xs}px`,
              }}
            >
              <Typography
                sx={{
                  ...typographyPresets.label.xs,
                  color: colorSemantics.text.secondary,
                  mb: `${spacing.gap.sm}px`,
                }}
              >
                Result
              </Typography>
              <Box
                component="pre"
                sx={{
                  p: `${spacing.component.sm}px`,
                  backgroundColor: toolCall.isError
                    ? colorSemantics.status.error.lightest
                    : colorSemantics.background.subtle,
                  borderRadius: `${borderSemantics.radius.code}px`,
                  border: `1px solid ${
                    toolCall.isError
                      ? colorSemantics.status.error.light
                      : colorSemantics.border.subtle
                  }`,
                  ...typographyPresets.code.sm,
                  color: toolCall.isError
                    ? colorSemantics.status.error.dark
                    : colorSemantics.text.primary,
                  overflowX: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                  margin: 0,
                  marginBottom: `${spacing.gap.sm}px`,
                }}
              >
                {typeof toolCall.result === 'string'
                  ? toolCall.result
                  : JSON.stringify(toolCall.result, null, 2)}
              </Box>
            </Box>
          )}
        </>
      )}
    </Box>
  );
});

export default ToolCallCard;
