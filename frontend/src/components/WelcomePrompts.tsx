import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacyRounded';
import WarningAmberIcon from '@mui/icons-material/WarningAmberRounded';
import MedicalInformationIcon from '@mui/icons-material/MedicalInformationRounded';
import HelpOutlineIcon from '@mui/icons-material/HelpOutlineRounded';
import {
  colorSemantics,
  spacing,
  typographyPresets,
  borderSemantics,
} from '../design-system';

interface PromptSuggestion {
  icon: React.ReactNode;
  title: string;
  prompt: string;
}

const suggestions: PromptSuggestion[] = [
  {
    icon: <LocalPharmacyIcon sx={{ fontSize: 20, color: colorSemantics.interactive.primary }} />,
    title: 'Drug lookup',
    prompt: 'What are the available forms and dosages for metformin?',
  },
  {
    icon: <WarningAmberIcon sx={{ fontSize: 20, color: colorSemantics.status.warning.main }} />,
    title: 'Adverse events',
    prompt: 'What are the most common adverse events reported for lisinopril?',
  },
  {
    icon: <MedicalInformationIcon sx={{ fontSize: 20, color: colorSemantics.status.success.main }} />,
    title: 'Drug interactions',
    prompt: 'Can you check if there are adverse events when taking aspirin and warfarin together?',
  },
  {
    icon: <HelpOutlineIcon sx={{ fontSize: 20, color: colorSemantics.status.info.main }} />,
    title: 'Medication info',
    prompt: 'Look up the RxCUI for omeprazole and find any reported side effects.',
  },
];

interface WelcomePromptsProps {
  onSelectPrompt: (prompt: string) => void;
}

export default function WelcomePrompts({ onSelectPrompt }: WelcomePromptsProps) {
  return (
    <Box
      data-testid="message-area"
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: `${spacing.layout.xs}px`,
        pb: `${spacing.layout.lg}px`,
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: `${borderSemantics.radius.card}px`,
          backgroundColor: colorSemantics.interactive.primary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: `${spacing.gap.lg}px`,
        }}
      >
        <Typography
          sx={{
            ...typographyPresets.heading.lg,
            color: colorSemantics.text.inverse,
          }}
        >
          A
        </Typography>
      </Box>

      <Typography
        sx={{
          ...typographyPresets.heading.lg,
          color: colorSemantics.text.primary,
          mb: `${spacing.gap.xs}px`,
        }}
      >
        How can I help you today?
      </Typography>
      <Typography
        sx={{
          ...typographyPresets.body.md,
          color: colorSemantics.text.secondary,
          mb: `${spacing.gap['2xl']}px`,
          textAlign: 'center',
          maxWidth: 480,
        }}
      >
        Ask me about medications, drug interactions, adverse events, and more.
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: `${spacing.gap.md}px`,
          width: '100%',
          maxWidth: 640,
        }}
      >
        {suggestions.map((s) => (
          <ButtonBase
            key={s.title}
            onClick={() => onSelectPrompt(s.prompt)}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              textAlign: 'left',
              p: `${spacing.component.md}px`,
              borderRadius: `${borderSemantics.radius.card}px`,
              border: `1px solid ${colorSemantics.border.default}`,
              backgroundColor: colorSemantics.background.default,
              transition: 'border-color 0.15s, background-color 0.15s',
              '&:hover': {
                borderColor: colorSemantics.border.strong,
                backgroundColor: colorSemantics.background.subtle,
              },
            }}
          >
            <Box sx={{ mb: `${spacing.gap.sm}px` }}>{s.icon}</Box>
            <Typography
              sx={{
                ...typographyPresets.label.lg,
                color: colorSemantics.text.primary,
                mb: `${spacing.gap.xs}px`,
              }}
            >
              {s.title}
            </Typography>
            <Typography
              sx={{
                ...typographyPresets.body.sm,
                color: colorSemantics.text.secondary,
                lineHeight: 1.4,
              }}
            >
              {s.prompt}
            </Typography>
          </ButtonBase>
        ))}
      </Box>
    </Box>
  );
}
