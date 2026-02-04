import 'vite/modulepreload-polyfill';
import { viewRenderer } from './renderer';
import { ViewData } from './global';
import './app.css';
import initViews from './views';
import type { EditionType } from './three/BusinessCard';

const view: ViewData = window._hono_view;
initViews();
viewRenderer(view.name || '', view);

// Three.js card — initialized here (client-only entry) so three.js
// is never bundled into the Cloudflare Worker.
// Temporary debug helper
function dbg(msg: string) {
    const el = document.getElementById('card-debug');
    if (el) el.textContent += msg + '\n';
}

const cardContainer = document.getElementById('card-container');
if (cardContainer) {
    const debugEl = document.createElement('pre');
    debugEl.id = 'card-debug';
    debugEl.style.cssText = 'color:lime;font-size:11px;padding:8px;white-space:pre-wrap;word-break:break-all;background:#111;';
    cardContainer.appendChild(debugEl);
}

dbg(`view.name="${view.name}" container=${!!cardContainer}`);
dbg(`navigator.gpu=${typeof navigator.gpu}`);

if (view.name === 'landing') {
    if (cardContainer) {
        const editions: EditionType[] = ['foil', 'holographic', 'polychrome'];
        const edition = editions[Math.floor(Math.random() * editions.length)];
        dbg(`edition=${edition}`);

        (async () => {
            try {
                dbg('importing polyfill...');
                await import('./three/webgpu-polyfill');
                dbg('importing BusinessCard...');
                const { BusinessCard } = await import('./three/BusinessCard');
                dbg('creating scene...');
                const scene = new BusinessCard(cardContainer);
                dbg('calling init...');
                await scene.init();
                dbg('setting edition...');
                scene.setEdition(edition);
                dbg('done!');
                // Remove debug overlay on success
                document.getElementById('card-debug')?.remove();
            } catch (e) {
                dbg(`ERROR: ${e}\n${(e as Error).stack || ''}`);
            }
        })();
    }
} else {
    dbg('not landing page, skipping card init');
}