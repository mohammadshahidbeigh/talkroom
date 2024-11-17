// client/src/App.tsx
import {BrowserRouter as Router} from "react-router-dom";
import AppRoutes from "./routes";
import {ThemeProvider, createTheme, CssBaseline, Box} from "@mui/material";
import useAppSelector from "./hooks/useAppSelector";
import {SocketProvider} from "./contexts/SocketContext";
import {Provider} from "react-redux";
import {store} from "./store";
import Sidebar from "./components/Layout/Sidebar";

const App = () => {
  const darkMode = useAppSelector((state) => state.settings.darkMode);

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
    },
  });

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <SocketProvider>
            <Box sx={{display: "flex"}}>
              <Sidebar />
              <Box sx={{flexGrow: 1}}>
                <AppRoutes />
              </Box>
            </Box>
          </SocketProvider>
        </Router>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
