/**
 * retryImport - Wrapper de import() dinâmico com retry automático
 *
 * PROBLEMA QUE RESOLVE:
 * Após deploy na Vercel, novos bundles têm hashes diferentes
 * (ex: SkinStore-CISlY4E2.js -> SkinStore-XYZ123.js). Se o
 * Service Worker antigo precacheou a página index.html antiga
 * ou se o navegador tem cache stale, o React.lazy() tenta
 * buscar um chunk que NÃO EXISTE MAIS no servidor, gerando:
 *   "Failed to fetch dynamically imported module"
 *
 * SOLUÇÃO:
 * 1. Detecta erros de chunk (TypeError, FetchError, ChunkLoadError)
 * 2. Aguarda um pequeno backoff
 * 3. Recarrega a página UMA VEZ com query string anti-cache
 *    (controlado por sessionStorage para evitar loop infinito)
 */

const SESSION_RELOAD_KEY = '__chunk_reload_count__';
const MAX_RELOADS_PER_SESSION = 1;

function shouldReloadOnChunkError(): boolean {
  try {
    const count = parseInt(
      sessionStorage.getItem(SESSION_RELOAD_KEY) || '0',
      10
    );
    if (count >= MAX_RELOADS_PER_SESSION) {
      console.warn(
        '[retryImport] Limite de reload atingido nesta sessão. Limpando caches.'
      );
      // Limpa caches como último recurso (Caches API + SW)
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach((name) => caches.delete(name));
        });
      }
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker
          .getRegistrations()
          .then((regs) => regs.forEach((r) => r.unregister()));
      }
      sessionStorage.removeItem(SESSION_RELOAD_KEY);
      return false;
    }
    sessionStorage.setItem(SESSION_RELOAD_KEY, String(count + 1));
    return true;
  } catch {
    return false;
  }
}

export function forceCleanReload(): void {
  if (!shouldReloadOnChunkError()) return;
  // Adiciona timestamp para bypassar cache HTTP do index.html
  const url = new URL(window.location.href);
  url.searchParams.set('_v', String(Date.now()));
  window.location.replace(url.toString());
}

function isChunkLoadError(err: unknown): boolean {
  if (!err) return false;
  const msg = (err as { message?: string })?.message || String(err);
  return (
    /Failed to fetch dynamically imported module/i.test(msg) ||
    /Importing a module script failed/i.test(msg) ||
    /Loading chunk \d+ failed/i.test(msg) ||
    /Loading CSS chunk \d+ failed/i.test(msg) ||
    /ChunkLoadError/i.test(msg) ||
    /error loading dynamically imported module/i.test(msg) ||
    /TypeError: Failed to fetch/i.test(msg)
  );
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * retryLazy - Versão robusta de React.lazy() que recarrega a página
 * automaticamente quando o chunk está stale.
 *
 * @param loader Função que retorna a promise do dynamic import
 * @param retries Número de retries locais antes de forçar reload (default: 1)
 */
export function retryLazy<T>(
  loader: () => Promise<T>,
  retries: number = 1
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const attempt = (remaining: number) => {
      loader().then(resolve).catch((err) => {
        if (isChunkLoadError(err) && remaining > 0) {
          // Retry com pequeno backoff
          delay(150).then(() => attempt(remaining - 1));
        } else if (isChunkLoadError(err)) {
          // Acabaram os retries -> reload forçado
          console.warn(
            '[retryImport] Chunk stale detectado. Recarregando aplicação...',
            err
          );
          forceCleanReload();
          // Não rejeita - o reload vai recriar o estado
          // Mantém a promise pendente por um tempo para evitar
          // que o Suspense "resolva" antes do reload
          setTimeout(() => {}, 5000);
        } else {
          reject(err);
        }
      });
    };
    attempt(retries);
  });
}

/**
 * lazyImport - Atalho para usar com React.lazy()
 *
 * @example
 * const SkinStore = React.lazy(() =>
 *   lazyImport(() => import('./components/SkinStore').then(m => ({ default: m.SkinStore })))
 * );
 */
export function lazyImport<T>(loader: () => Promise<T>): Promise<T> {
  return retryLazy(loader, 1);
}
