import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { theme } from '@pagopa/mui-italia';
import { BrowserRouter } from 'react-router-dom';

createRoot(document.getElementById('root')!).render(
    <BrowserRouter basename="/elenco-informatico-elettrodomestici">
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </BrowserRouter>
);