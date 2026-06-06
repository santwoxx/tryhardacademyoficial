/**
 * chunkErrorHandler - Listener global para capturar erros de chunk
 * que ocorrem ANTES do React (em imports dinâmicos de bibliotecas
 * externas, por exemplo) e que NÃO passam pelo ErrorBoundary.
 *
 * Estratégia em 3 camadas:
 *   1. window 'error'         -> erros síncronos de <script>
 *   2. window 'unhandledrejection' -> promises rejeitadas
 *   3. fetch() monkey-patch   -> captura 404 de chunks para diagnóstico
 *
 * Cada um deles verifica se a mensagem é de chunk stale e, se for,
 * força um reload limpo com bypass de cache.
 */

import { forceCleanReload } from './retryImport';

const CHUNK_ERROR_PATTERNS = [
  /Failed to fetch dynamically imported module/i,
  /Importing a module script failed/i,
  /Loading chunk \d+ failed/i,
  /Loading CSS chunk \d+ failed/i,
  /ChunkLoadError/i,
  /error loading dynamically imported module/i,
];

function isChunkError(message: string | undefined | null): boolean {
  if (!message) return false;
  return CHUNK_ERROR_PATTERNS.some((re) => re.test(message));
}

function handleChunkError(source: string, message: string): void {
  console.warn(
    `[chunkErrorHandler] Chunk error detectado em ${source}:`,
    message
  );
  forceCleanReload();
}

let installed = false;

export function installChunkErrorHandler(): void {
  if (installed || typeof window === 'undefined') return;
  installed = true;

  // Camada 1: erros globais síncronos
  window.addEventListener(
    'error',
    (event) => {
      const msg = event.message || (event.error && event.error.message);
      if (isChunkError(msg)) {
        event.preventDefault();
        handleChunkError('window.error', msg);
      }
    },
    true // capture phase - roda antes dos listeners do React
  );

  // Camada 2: promises rejeitadas
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const msg =
      (reason && (reason.message || String(reason))) || 'unknown';
    if (isChunkError(msg)) {
      event.preventDefault();
      handleChunkError('unhandledrejection', msg);
    }
  });

  // Camada 3: instrumentar fetch para detectar 404 de assets hasheados
  const originalFetch = window.fetch.bind(window);
  window.fetch = async function patchedFetch(
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> {
    try {
      const response = await originalFetch(input, init);
      // Detecta 404 de chunks JS/CSS (assets hasheados que sumiram)
      if (
        response.status === 404 &&
        typeof input === 'string' &&
        /\/(assets|workbox)\/.*\.(js|css)(\?|$)/.test(input)
      ) {
        console.warn(
          '[chunkErrorHandler] Asset chunk 404 detectado:',
          input
        );
        forceCleanReload();
      }
      return response;
    } catch (err) {
      // Network error pode ser chunk stale em mobile offline->online
      const msg = (err as Error)?.message || String(err);
      if (isChunkError(msg)) {
        handleChunkError('fetch.catch', msg);
        // Retorna uma resposta fake para não quebrar o await
        return new Response('', { status: 503, statusText: 'Chunk Reload' });
      }
      throw err;
    }
  };

  // Camada 4: detectar visibilidade -> se aba ficou oculta durante deploy,
  // recarregar ao voltar para pegar a versão nova sem forçar reload visível
  let wasHidden = false;
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      wasHidden = true;
    } else if (document.visibilityState === 'visible' && wasHidden) {
      wasHidden = false;
      // Verifica se há nova versão registrada no SW
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration().then((reg) => {
          if (reg && reg.waiting) {
            // Novo SW esperando -> ativação imediata
            reg.waiting.postMessage({ type: 'SKIP_WAITING' });
            // Pequeno delay para o SW ativar, depois reload
            setTimeout(() => {
              const url = new URL(window.location.href);
              url.searchParams.set('_v', String(Date.now()));
              window.location.replace(url.toString());
            }, 200);
          }
        });
      }
    }
  });

  console.info('[chunkErrorHandler] Instalado. Proteção contra chunks stale ativa.');
}
