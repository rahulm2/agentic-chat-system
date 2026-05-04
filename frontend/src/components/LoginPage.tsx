import { useState, type FormEvent } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
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
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: colorSemantics.background.subtle,
        p: `${spacing.layout.xs}px`,
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 420,
          p: `${spacing.component['2xl']}px`,
          borderRadius: `${borderSemantics.radius.dialog}px`,
        }}
      >
        <Typography
          component="h1"
          sx={{
            ...typographyPresets.heading.lg,
            color: colorSemantics.text.primary,
            textAlign: 'center',
            mb: `${spacing.gap.xs}px`,
          }}
        >
          Agentic Chat
        </Typography>
        <Typography
          sx={{
            ...typographyPresets.body.md,
            color: colorSemantics.text.secondary,
            textAlign: 'center',
            mb: `${spacing.gap.xl}px`,
          }}
        >
          {isRegisterMode ? 'Create an account' : 'Sign in to continue'}
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: `${spacing.gap.lg}px`,
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
            sx={{ py: `${spacing.component.xs}px` }}
          >
            {isPending ? (
              <CircularProgress size={22} color="inherit" />
            ) : isRegisterMode ? (
              'Create Account'
            ) : (
              'Sign In'
            )}
          </Button>
        </Box>

        <Typography
          sx={{
            ...typographyPresets.body.sm,
            color: colorSemantics.text.secondary,
            textAlign: 'center',
            mt: `${spacing.gap.lg}px`,
          }}
        >
          {isRegisterMode ? 'Already have an account? ' : "Don't have an account? "}
          <Link
            component="button"
            type="button"
            onClick={toggleMode}
            sx={{
              ...typographyPresets.label.md,
              color: colorSemantics.interactive.primary,
              cursor: 'pointer',
              verticalAlign: 'baseline',
            }}
          >
            {isRegisterMode ? 'Sign In' : 'Register'}
          </Link>
        </Typography>
      </Card>
    </Box>
  );
}
