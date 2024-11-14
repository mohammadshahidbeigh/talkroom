// client/src/App.tsx
import {BrowserRouter as Router} from "react-router-dom";
import AppRoutes from "./routes";
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import  useAppSelector  from './hooks/useAppSelector';

const App = () => {
  const darkMode = useAppSelector((state) => state.settings.darkMode);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppRoutes />
      </Router>
    </ThemeProvider>
  );
};

export default App;
