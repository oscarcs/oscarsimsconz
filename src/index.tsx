import { Hono } from 'hono';
import { renderer } from './renderer';
import initViews from './views';
import { ViewRenderer } from './middleware';

initViews()
const app = new Hono()

app.use(renderer)
app.use(ViewRenderer)

app.get('/', (c) => {
    return c.view('landing', {
        meta: {
            title: 'Oscar Sims',
        },
        props: { }
    })
});

export default app