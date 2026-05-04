import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

export default function ChatHeader() {
  return (
    <AppBar position="static" elevation={1}>
      <Toolbar>
        <Typography variant="h6" component="h1">
          Agentic Chat
        </Typography>
      </Toolbar>
    </AppBar>
  );
}
