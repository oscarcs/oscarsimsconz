import 'vite/modulepreload-polyfill';
import { viewRenderer } from './renderer';
import { ViewData } from './global';
import './app.css';
import initViews from './views';

const view: ViewData = window._hono_view;
initViews();
viewRenderer(view.name || '', view);

// Load GPU code only on the landing page, and release resources on hot reload.
if (view.name === 'landing') {
    const globeContainer = document.getElementById('globe-container');
    if (globeContainer) {
        let globe: import('./three/Globe').Globe | undefined;
        let cancelled = false;
        import.meta.hot?.dispose(() => {
            cancelled = true;
            globe?.dispose();
        });
        (async () => {
            await import('./three/webgpu-polyfill');
            const { Globe } = await import('./three/Globe');
            if (cancelled) return;
            globe = new Globe(globeContainer);
            await globe.init();
        })().catch(error => {
            globe?.dispose();
            console.error('Unable to initialise the globe', error);
        });
    }
}
