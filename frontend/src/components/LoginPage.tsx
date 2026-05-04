import { useState, type FormEvent } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import CircularProgress from '@mui/material/CircularProgress';
import {
  colorSemantics,
  spacing,
  typographyPresets,
  borderSemantics,
  shadowSemantics,
} from '../design-system';
import { useLogin, useRegister } from '../hooks/useAuth';
import { useSnackbar } from '../context/SnackbarProvider';

export default function LoginPage() {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const { showError } = useSnackbar();

  const isPending = loginMutation.isPending || registerMutation.isPending;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) return;

    if (isRegisterMode) {
      registerMutation.mutate(
        { email: trimmedEmail, password: trimmedPassword, name: name.trim() || undefined },
        { onError: (err) => showError(err.message) }
      );
    } else {
      loginMutation.mutate(
        { email: trimmedEmail, password: trimmedPassword },
        { onError: (err) => showError(err.message) }
      );
    }
  };

  const toggleMode = () => {
    setIsRegisterMode((prev) => !prev);
    loginMutation.reset();
    registerMutation.reset();
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: colorSemantics.background.default,
        p: `${spacing.layout.xs}px`,
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: `${borderSemantics.radius.card}px`,
          backgroundColor: colorSemantics.interactive.primary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: `${spacing.gap.xl}px`,
        }}
      >
        <Typography
          sx={{
            ...typographyPresets.heading.xl,
            color: colorSemantics.text.inverse,
          }}
        >
          A
        </Typography>
      </Box>

      <Typography
        component="h1"
        sx={{
          ...typographyPresets.heading.lg,
          color: colorSemantics.text.primary,
          mb: `${spacing.gap.xs}px`,
        }}
      >
        {isRegisterMode ? 'Create your account' : 'Welcome back'}
      </Typography>
      <Typography
        sx={{
          ...typographyPresets.body.md,
          color: colorSemantics.text.secondary,
          mb: `${spacing.gap['2xl']}px`,
        }}
      >
        {isRegisterMode
          ? 'Get started with Agentic Chat'
          : 'Sign in to Agentic Chat'}
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: `${spacing.gap.lg}px`,
          width: '100%',
          maxWidth: 380,
          p: `${spacing.component['2xl']}px`,
          borderRadius: `${borderSemantics.radius.dialog}px`,
          border: `1px solid ${colorSemantics.border.default}`,
          backgroundColor: colorSemantics.background.default,
          boxShadow: shadowSemantics.card,
        }}
      >
        {isRegisterMode && (
          <TextField
            label="Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            size="small"
            autoComplete="name"
          />
        )}
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          required
          size="small"
          autoComplete="email"
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          required
          size="small"
          autoComplete={isRegisterMode ? 'new-password' : 'current-password'}
          inputProps={{ minLength: 6 }}
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={isPending || !email.trim() || !password.trim()}
          sx={{
            py: `${spacing.component.sm}px`,
            borderRadius: `${borderSemantics.radius.button}px`,
            ...typographyPresets.label.lg,
            textTransform: 'none',
          }}
        >
          {isPending ? (
            <CircularProgress size={22} color="inherit" />
          ) : isRegisterMode ? (
            'Create Account'
          ) : (
            'Continue'
          )}
        </Button>
      </Box>

      <Typography
        sx={{
          ...typographyPresets.body.sm,
          color: colorSemantics.text.secondary,
          mt: `${spacing.gap.lg}px`,
        }}
      >
        {isRegisterMode ? 'Already have an account? ' : "Don't have an account? "}
        <Link
          component="button"
          type="button"
          onClick={toggleMode}
          underline="hover"
          sx={{
            ...typographyPresets.label.md,
            color: colorSemantics.interactive.primary,
            cursor: 'pointer',
            verticalAlign: 'baseline',
          }}
        >
          {isRegisterMode ? 'Sign In' : 'Sign Up'}
        </Link>
      </Typography>
    </Box>
  );
}
