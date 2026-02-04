import 'vite/modulepreload-polyfill';
import { viewRenderer } from './renderer';
import { ViewData } from './global';
import './app.css';
import initViews from './views';
import type { EditionType } from './three/PlayingCard';

const view: ViewData = window._hono_view;
initViews();
viewRenderer(view.name || '', view);

// Three.js card — initialized here (client-only entry) so three.js
// is never bundled into the Cloudflare Worker.
if (view.name === 'landing') {
    const cardContainer = document.getElementById('card-container');
    if (cardContainer) {
        (async () => {
            await import('./three/webgpu-polyfill');
            const { PlayingCard } = await import('./three/PlayingCard');
            const scene = new PlayingCard(cardContainer);
            await scene.init();
            scene.setEdition('foil');
            scene.kick(1);

            cardContainer.addEventListener('edition-change', ((e: CustomEvent<{ edition: EditionType; direction: number }>) => {
                scene.setEdition(e.detail.edition);
                scene.kick(e.detail.direction);
            }) as EventListener);
        })();
    }
}