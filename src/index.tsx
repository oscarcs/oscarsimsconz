import { Hono } from 'hono';
import { renderer } from './renderer';
import initViews from './views';
import { ViewRenderer } from './middleware';

initViews()
const app = new Hono()

app.use(renderer)
app.use(ViewRenderer)

app.get('/', (c) => {
    return c.view('hello', {
        meta: {
            title: 'Hello World',
        },
        props: {
            message: 'index'
        }
    })
});

app.get('/:name', (c) => {
    const { name } = c.req.param();

    return c.view('hello', {
        meta: {
            title: 'Hello World',
        },
        props: {
            message: name
        }
    })
});

export default app