import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {installChunkErrorHandler} from './lib/chunkErrorHandler';
import './index.css';

// Instala o handler global ANTES de renderizar o app.
// Isso garante que erros de chunks de bibliotecas carregadas
// pelo React.lazy() e por imports dinâmicos externos sejam
// capturados e o app faça auto-reload limpo.
installChunkErrorHandler();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
