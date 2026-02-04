import { Hono } from 'hono';
import { renderer } from './renderer';
import initViews from './views';
import { ViewRenderer } from './middleware';
import { getPostBySlug } from './data/posts';

initViews();
const app = new Hono();

app.use(renderer);
app.use(ViewRenderer);

app.get('/', (c) => {
    return c.view('landing', {
        meta: {
            title: 'Oscar Sims',
        },
        props: { }
    });
});

app.get('/project/:slug', (c) => {
    const slug = c.req.param('slug');
    const post = getPostBySlug(slug);
    
    if (!post) {
        return c.notFound();
    }
    
    return c.view('post', {
        meta: {
            title: `${post.name} - Oscar Sims`,
            description: post.shortDescription,
        },
        props: { post }
    });
});

app.notFound((c) => {
    return c.text('404. We couldn\'t find that resource.', 404);
});

app.onError((err, c) => {
    console.error(err);
    return c.text('500. Something went wrong.', 500);
});

export default app;