import { useRef, useEffect, useState, useCallback, memo } from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Skeleton from '@mui/material/Skeleton';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineRounded';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import {
  colorSemantics,
  spacing,
  typographyPresets,
  borderSemantics,
} from '../design-system';
import {
  useInfiniteConversationList,
  useDeleteConversation,
} from '../hooks/useConversations';
import type { ConversationSummary } from '../api/conversations';

export const SIDEBAR_WIDTH = 272;

interface ConversationSidebarProps {
  open: boolean;
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
}

const ConversationItem = memo(function ConversationItem({
  conversation,
  isActive,
  onSelect,
  onDelete,
}: {
  conversation: ConversationSummary;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const title = conversation.title || 'New conversation';
  const date = new Date(conversation.updatedAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  return (
    <ListItem
      disablePadding
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{ position: 'relative' }}
    >
      <ListItemButton
        selected={isActive}
        onClick={onSelect}
        sx={{
          borderRadius: `${borderSemantics.radius.card}px`,
          mx: `${spacing.component.xs}px`,
          pr: hovered ? '40px' : `${spacing.component.md}px`,
          transition: 'padding-right 0.15s ease',
          '&.Mui-selected': {
            backgroundColor: colorSemantics.ai.messageBg,
            '&:hover': { backgroundColor: colorSemantics.ai.messageBg },
          },
          '&:hover': { backgroundColor: colorSemantics.background.muted },
        }}
      >
        <ListItemText
          primary={
            <Typography
              noWrap
              sx={{
                ...typographyPresets.body.sm,
                fontWeight: isActive ? 600 : 400,
                color: colorSemantics.text.primary,
              }}
            >
              {title}
            </Typography>
          }
          secondary={
            <Typography
              sx={{
                ...typographyPresets.body.xs,
                color: colorSemantics.text.secondary,
              }}
            >
              {date} · {conversation._count.messages} msg
              {conversation._count.messages !== 1 ? 's' : ''}
            </Typography>
          }
        />
      </ListItemButton>

      {hovered && (
        <Box
          sx={{
            position: 'absolute',
            right: `${spacing.component.md}px`,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 1,
          }}
        >
          <Tooltip title="Delete conversation">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              sx={{
                color: colorSemantics.icon.secondary,
                '&:hover': {
                  backgroundColor: colorSemantics.status.error.lightest,
                  color: colorSemantics.status.error.main,
                },
              }}
            >
              <DeleteOutlineIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </ListItem>
  );
});

function SkeletonItems({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Box
          key={i}
          sx={{
            px: `${spacing.component.md}px`,
            py: `${spacing.component.xs}px`,
          }}
        >
          <Skeleton
            variant="text"
            width={`${70 + (i % 3) * 10}%`}
            height={18}
            sx={{ mb: '2px' }}
          />
          <Skeleton variant="text" width="45%" height={14} />
        </Box>
      ))}
    </>
  );
}

export default function ConversationSidebar({
  open,
  activeConversationId,
  onSelectConversation,
  onDeleteConversation,
}: ConversationSidebarProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteConversationList();

  const deleteConversationMutation = useDeleteConversation();
  const sentinelRef = useRef<HTMLDivElement>(null);

  const conversations = data?.pages.flatMap((page) => page.conversations) ?? [];

  // IntersectionObserver: load more when sentinel enters view
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handleDelete = useCallback(
    (id: string) => {
      onDeleteConversation(id);
      deleteConversationMutation.mutate(id);
    },
    [deleteConversationMutation, onDeleteConversation]
  );

  return (
    <Box
      sx={{
        width: open ? SIDEBAR_WIDTH : 0,
        minWidth: open ? SIDEBAR_WIDTH : 0,
        overflow: 'hidden',
        transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        backgroundColor: colorSemantics.background.default,
        borderRight: open ? `1px solid ${colorSemantics.border.subtle}` : 'none',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}
    >
      {/* Sidebar header — stays aligned with ChatHeader height (56px) */}
      <Box
        sx={{
          px: `${spacing.component.md}px`,
          minHeight: 56,
          display: 'flex',
          alignItems: 'center',
          gap: `${spacing.gap.sm}px`,
          borderBottom: `1px solid ${colorSemantics.border.subtle}`,
          flexShrink: 0,
        }}
      >
        <ChatBubbleOutlineIcon
          sx={{ fontSize: 16, color: colorSemantics.icon.secondary }}
        />
        <Typography
          sx={{
            ...typographyPresets.label.md,
            color: colorSemantics.text.primary,
            whiteSpace: 'nowrap',
          }}
        >
          Conversations
        </Typography>
      </Box>

      {/* Scrollable list — virtualized via load-more-on-scroll */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          py: `${spacing.component.xs}px`,
          // Custom scrollbar styling
          '&::-webkit-scrollbar': { width: 4 },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': {
            background: colorSemantics.border.default,
            borderRadius: 2,
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: colorSemantics.border.strong,
          },
        }}
      >
        {isLoading ? (
          <SkeletonItems count={8} />
        ) : conversations.length === 0 ? (
          <Box
            sx={{
              px: `${spacing.component.md}px`,
              py: `${spacing.component['2xl']}px`,
              textAlign: 'center',
            }}
          >
            <Typography
              sx={{
                ...typographyPresets.body.sm,
                color: colorSemantics.text.secondary,
              }}
            >
              No conversations yet.
            </Typography>
            <Typography
              sx={{
                ...typographyPresets.body.xs,
                color: colorSemantics.text.tertiary,
                mt: '4px',
              }}
            >
              Start chatting to see history here.
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {conversations.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isActive={conv.id === activeConversationId}
                onSelect={() => onSelectConversation(conv.id)}
                onDelete={() => handleDelete(conv.id)}
              />
            ))}
          </List>
        )}

        {/* Sentinel element — triggers fetchNextPage when scrolled into view */}
        <Box ref={sentinelRef} sx={{ height: 1 }} />

        {isFetchingNextPage && (
          <Box sx={{ pt: `${spacing.component.xs}px` }}>
            <SkeletonItems count={3} />
          </Box>
        )}

        {/* End of list indicator */}
        {!hasNextPage && conversations.length > 0 && !isLoading && (
          <Box sx={{ py: `${spacing.component.md}px`, textAlign: 'center' }}>
            <Typography
              sx={{
                ...typographyPresets.label.xs,
                color: colorSemantics.text.tertiary,
              }}
            >
              All conversations loaded
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
