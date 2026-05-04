import { memo, useState } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { colorSemantics, spacing } from '../design-system';

interface MessageActionsProps {
  content: string;
  onRegenerate?: () => void;
  onDelete?: () => void;
}

const MessageActions = memo(function MessageActions({
  content,
  onRegenerate,
  onDelete,
}: MessageActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard access denied — silently ignore
    }
  };

  return (
    <Box
      className="message-actions"
      sx={{
        display: 'flex',
        gap: `${spacing.gap.xs}px`,
        alignItems: 'center',
        opacity: 0,
        transition: 'opacity 0.15s ease',
      }}
    >
      <Tooltip title={copied ? 'Copied!' : 'Copy'} placement="top">
        <IconButton
          size="small"
          onClick={handleCopy}
          sx={{
            color: colorSemantics.icon.secondary,
            p: `${spacing.component.xxs}px`,
            '&:hover': {
              color: colorSemantics.icon.primary,
              backgroundColor: colorSemantics.interactive.ghostHover,
            },
          }}
        >
          {copied ? (
            <CheckOutlinedIcon sx={{ fontSize: 14, color: colorSemantics.status.success.main }} />
          ) : (
            <ContentCopyOutlinedIcon sx={{ fontSize: 14 }} />
          )}
        </IconButton>
      </Tooltip>

      {onRegenerate && (
        <Tooltip title="Regenerate" placement="top">
          <IconButton
            size="small"
            onClick={onRegenerate}
            sx={{
              color: colorSemantics.icon.secondary,
              p: `${spacing.component.xxs}px`,
              '&:hover': {
                color: colorSemantics.icon.primary,
                backgroundColor: colorSemantics.interactive.ghostHover,
              },
            }}
          >
            <RefreshOutlinedIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>
      )}

      {onDelete && (
        <Tooltip title="Delete" placement="top">
          <IconButton
            size="small"
            onClick={onDelete}
            sx={{
              color: colorSemantics.icon.secondary,
              p: `${spacing.component.xxs}px`,
              '&:hover': {
                color: colorSemantics.status.error.main,
                backgroundColor: colorSemantics.status.error.lightest,
              },
            }}
          >
            <DeleteOutlineIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
});

export default MessageActions;
