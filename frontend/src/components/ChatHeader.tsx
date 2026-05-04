import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { colorSemantics, typographyPresets } from '../design-system';

export default function ChatHeader() {
  return (
    <AppBar position="static" elevation={1}>
      <Toolbar>
        <Typography
          component="h1"
          sx={{
            ...typographyPresets.heading.sm,
            color: colorSemantics.text.inverse,
          }}
        >
          Agentic Chat
        </Typography>
      </Toolbar>
    </AppBar>
  );
}
