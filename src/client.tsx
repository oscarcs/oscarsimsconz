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
if (view.name === 'landing') {
    const cardContainer = document.getElementById('card-container');
    if (cardContainer) {
        const editions: EditionType[] = ['foil', 'holographic', 'polychrome'];
        const edition = editions[Math.floor(Math.random() * editions.length)];

        (async () => {
            await import('./three/webgpu-polyfill');
            const { BusinessCard } = await import('./three/BusinessCard');
            const scene = new BusinessCard(cardContainer);
            await scene.init();
            scene.setEdition(edition);
        })();
    }
}