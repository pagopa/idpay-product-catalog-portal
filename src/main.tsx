import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { theme } from '@pagopa/mui-italia';
import { BrowserRouter } from 'react-router-dom';

const basename =
  import.meta.env.VITE_BASE_PATH ||
  import.meta.env.BASE_PATH ||
  '/elenco-informatico-elettrodomestici/';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter basename={basename}>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </BrowserRouter>
);
