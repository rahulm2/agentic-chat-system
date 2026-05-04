import { memo } from 'react';
import Box from '@mui/material/Box';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import {
  colorSemantics,
  typographyPresets,
  borderSemantics,
  fontFamily,
} from '../design-system';

interface MarkdownRendererProps {
  content: string;
  isStreaming?: boolean;
}

const MarkdownRenderer = memo(function MarkdownRenderer({
  content,
  isStreaming,
}: MarkdownRendererProps) {
  return (
    <Box
      sx={{
        '& p': {
          ...typographyPresets.body.md,
          color: colorSemantics.text.primary,
          lineHeight: 1.7,
          margin: 0,
          marginBottom: '0.75em',
          '&:last-child': { marginBottom: 0 },
        },
        '& h1, & h2, & h3, & h4, & h5, & h6': {
          color: colorSemantics.text.primary,
          marginTop: '1em',
          marginBottom: '0.5em',
          '&:first-of-type': { marginTop: 0 },
        },
        '& h1': { ...typographyPresets.heading.xl },
        '& h2': { ...typographyPresets.heading.lg },
        '& h3': { ...typographyPresets.heading.md },
        '& h4': { ...typographyPresets.heading.sm },
        '& h5, & h6': { ...typographyPresets.heading.xs },
        '& ul, & ol': {
          paddingLeft: '1.5em',
          marginBottom: '0.75em',
          '& li': {
            ...typographyPresets.body.md,
            color: colorSemantics.text.primary,
            lineHeight: 1.7,
            marginBottom: '0.25em',
          },
        },
        '& code': {
          fontFamily: fontFamily.mono,
          fontSize: '0.875em',
          backgroundColor: colorSemantics.background.muted,
          color: colorSemantics.text.primary,
          borderRadius: `${borderSemantics.radius.code}px`,
          padding: '0.15em 0.4em',
        },
        '& pre': {
          backgroundColor: colorSemantics.background.subtle,
          borderRadius: `${borderSemantics.radius.code}px`,
          padding: '1em',
          overflowX: 'auto',
          marginBottom: '0.75em',
          border: `1px solid ${colorSemantics.border.default}`,
          '& code': {
            backgroundColor: 'transparent',
            padding: 0,
            borderRadius: 0,
            fontSize: '0.8125rem',
            fontFamily: fontFamily.mono,
          },
        },
        '& a': {
          color: colorSemantics.interactive.primary,
          textDecoration: 'underline',
          '&:hover': {
            color: colorSemantics.interactive.primaryHover,
          },
        },
        '& blockquote': {
          borderLeft: `3px solid ${colorSemantics.border.default}`,
          paddingLeft: '1em',
          marginLeft: 0,
          marginRight: 0,
          color: colorSemantics.text.secondary,
          fontStyle: 'italic',
        },
        '& table': {
          width: '100%',
          borderCollapse: 'collapse',
          marginBottom: '0.75em',
          '& th, & td': {
            ...typographyPresets.body.sm,
            padding: '0.5em 0.75em',
            border: `1px solid ${colorSemantics.border.default}`,
          },
          '& th': {
            backgroundColor: colorSemantics.background.subtle,
            fontWeight: 600,
          },
        },
        '& hr': {
          border: 'none',
          borderTop: `1px solid ${colorSemantics.border.default}`,
          margin: '1em 0',
        },
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
      >
        {content}
      </ReactMarkdown>
      {isStreaming && (
        <Box
          component="span"
          sx={{
            display: 'inline-block',
            width: 2,
            height: 16,
            ml: '2px',
            backgroundColor: colorSemantics.text.primary,
            borderRadius: 1,
            verticalAlign: 'text-bottom',
            animation: 'blink 0.8s step-end infinite',
            '@keyframes blink': {
              '0%, 100%': { opacity: 1 },
              '50%': { opacity: 0 },
            },
          }}
        />
      )}
    </Box>
  );
});

export default MarkdownRenderer;
