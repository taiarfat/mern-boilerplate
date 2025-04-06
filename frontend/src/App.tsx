import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import HomePage from './pages/HomePage';
import Layout from './components/Layout';
import HRPage from './pages/HRPage';
import ProjectsPage from './pages/ProjectsPage';
import IncomePage from './pages/IncomePage';
import ExpensesPage from './pages/ExpensesPage';

// Create a client
const queryClient = new QueryClient();

// Create a theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#f58220',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="/employees" element={<HRPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/income" element={<IncomePage />} />
              <Route path="/expenses" element={<ExpensesPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Router>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
