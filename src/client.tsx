import 'vite/modulepreload-polyfill';
import { viewRenderer } from './renderer';
import { ViewData } from './global';
import './app.css';
import initViews from './views';

const view: ViewData = window._hono_view;
initViews();
viewRenderer(view.name || '', view);

// Three.js globe — initialized here (client-only entry) so three.js
// is never bundled into the Cloudflare Worker.
if (view.name === 'landing') {
    const globeContainer = document.getElementById('globe-container');
    if (globeContainer) {
        (async () => {
            await import('./three/webgpu-polyfill');
            const { Globe } = await import('./three/Globe');
            const globe = new Globe(globeContainer);
            await globe.init();
        })();
    }
}