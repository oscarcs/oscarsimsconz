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
// Temporary debug helper — appends to body so React hydration can't wipe it
const _dbgEl = document.createElement('pre');
_dbgEl.id = 'card-debug';
_dbgEl.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:9999;color:lime;font-size:11px;padding:8px;white-space:pre-wrap;word-break:break-all;background:#000;max-height:40vh;overflow:auto;';
document.body.appendChild(_dbgEl);
function dbg(msg: string) { _dbgEl.textContent += msg + '\n'; }

dbg(`view="${view.name}" gpu=${typeof navigator.gpu} ua=${navigator.userAgent.slice(0,80)}`);

if (view.name === 'landing') {
    const cardContainer = document.getElementById('card-container');
    dbg(`container=${!!cardContainer}`);
    if (cardContainer) {
        const editions: EditionType[] = ['foil', 'holographic', 'polychrome'];
        const edition = editions[Math.floor(Math.random() * editions.length)];

        (async () => {
            try {
                dbg('polyfill...');
                await import('./three/webgpu-polyfill');
                dbg('BusinessCard...');
                const { BusinessCard } = await import('./three/BusinessCard');
                dbg('new scene...');
                const scene = new BusinessCard(cardContainer);
                dbg('init...');
                await scene.init();
                dbg('setEdition...');
                scene.setEdition(edition);
                dbg('OK!');
            } catch (e) {
                dbg(`ERR: ${e}\n${(e as Error).stack || ''}`);
            }
        })();
    }
}