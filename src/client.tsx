import 'vite/modulepreload-polyfill';
import { viewRenderer } from './renderer';
import { ViewData } from './global';
import './app.css';
import initViews from './views';

const view: ViewData = window._hono_view;
initViews();
viewRenderer(view.name || '', view);