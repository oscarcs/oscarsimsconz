import isProd from "../config/is_prod"
import { Manifest, ManifestItem, ViewData } from "../global"

type LayoutProps = {
    children: React.ReactNode,
    view: ViewData,
    manifest?: Manifest,
}

export default function App({ children, view, manifest }: LayoutProps) {
    const viewScript = 'var _hono_view = '  + JSON.stringify(view) + ';';
    let cssDoms:React.ReactNode[] = [];
    let scriptDoms:React.ReactNode[] = [];
    
    if (isProd && manifest) {
        
        const cssFiles:string[] = [];
        const scriptFiles:string[] = [];
        
        for (const [, v] of Object.entries(manifest)) {
            const item: ManifestItem = v;
            
            if (item.isEntry) {
                item.css?.forEach((c) => {
                    cssFiles.push('/' + c);
                });
                
                if (item.file) {
                    scriptFiles.push('/' + item.file);
                }
            }
        }

        cssDoms = cssFiles.map(l => {
            return <link href={l} rel="stylesheet" key={l} />
        });

        scriptDoms = scriptFiles.map(s => {
            return <script type="module" src={s} key={s}></script>
        });
    }

    return (
        <html lang={view.meta.lang || 'en'}>
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <title>{view.meta.title}</title>
                <meta name="description" content={view.meta.description || view.meta.title} />
                {cssDoms}
                <script dangerouslySetInnerHTML={{__html: viewScript}} />
                {!isProd && <script type="module" dangerouslySetInnerHTML={{__html: `import("http://" + location.hostname + ":5174/src/client.tsx")`}} />}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300..700;1,300..700&family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap" rel="stylesheet" />
            </head>
            <body>
                {children}
                {scriptDoms}
            </body>
        </html>
    )
}