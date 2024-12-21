import isProd from "../config/is_prod"
import { Manifest, ManifestItem, ViewData } from "../global"

type LayoutProps = {
    children: React.ReactNode,
    view: ViewData,
    manifest?: Manifest,
}

export default function App({ children, view, manifest }: LayoutProps) {
    const viewScript = 'var _hono_view = '  + JSON.stringify(view) + ';'
    let cssDoms:React.ReactNode[] = []
    let scriptDoms:React.ReactNode[] = []
    
    if (isProd && manifest) {
        
        const cssFiles:string[] = [];
        const scriptFiles:string[] = [];
        
        for (const [, v] of Object.entries(manifest)) {
            const item: ManifestItem = v
            
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
                {!isProd && <script type="module" src="http://localhost:5174/src/client.tsx"></script>}
            </head>
            <body>
                {children}
                {scriptDoms}
            </body>
        </html>
    )
}