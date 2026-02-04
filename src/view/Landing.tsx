'use client';

import { useEffect, useRef, useState } from 'react';
import { Link } from './Link';
import { getAllPosts } from '../data/posts';

type EditionType = 'foil' | 'holographic' | 'polychrome';

const editions: { type: EditionType; label: string }[] = [
    { type: 'foil', label: 'Foil' },
    { type: 'holographic', label: 'Holographic' },
    { type: 'polychrome', label: 'Polychrome' },
];

export default function Landing() {
    const containerRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<any>(null);
    const [edition, setEdition] = useState<EditionType>('holographic');
    const posts = getAllPosts();

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        let disposed = false;

        (async () => {
            await import('../three/webgpu-polyfill');
            const { BusinessCard } = await import('../three/BusinessCard');
            if (disposed) return;
            const scene = new BusinessCard(container);
            sceneRef.current = scene;
            await scene.init();
            if (disposed) {
                scene.dispose();
                return;
            }
            scene.setEdition(edition);
        })();

        return () => {
            disposed = true;
            sceneRef.current?.dispose();
            sceneRef.current = null;
        };
    }, []);

    useEffect(() => {
        sceneRef.current?.setEdition(edition);
    }, [edition]);

    return (
        <div className="w-full min-h-screen flex flex-col bg-[#0a0a0a] text-white">
            {/* Top nav */}
            <nav className="flex items-center justify-between px-6 py-4 shrink-0">
                <span className="text-lg font-bold tracking-tight">Oscar Sims</span>
                <div className="flex items-center gap-5 text-sm text-gray-400">
                    <a href="mailto:oscar@oscarsims.co.nz" className="hover:text-white transition-colors">
                        Email
                    </a>
                    <Link href="https://github.com/oscarcs">
                        GitHub
                    </Link>
                </div>
            </nav>

            {/* Main two-column layout */}
            <div className="flex-1 flex flex-col lg:flex-row items-center lg:items-stretch gap-8 px-6 py-8">
                {/* Card column */}
                <div className="flex flex-col items-center justify-center lg:flex-1">
                    <div
                        ref={containerRef}
                        className="card-canvas-container w-full max-w-sm aspect-[2.5/3.5] relative"
                    />

                    {/* Edition switcher */}
                    <div className="flex gap-2 mt-6">
                        {editions.map((e) => (
                            <button
                                key={e.type}
                                onClick={() => setEdition(e.type)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                                    edition === e.type
                                        ? 'bg-white text-black'
                                        : 'bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white'
                                }`}
                            >
                                {e.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Posts column */}
                <div className="flex flex-col lg:flex-1 lg:max-w-md w-full lg:justify-center">
                    <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Posts & Projects</h2>
                    <div className="flex flex-col gap-3">
                        {posts.map((post) => (
                            <a
                                key={post.slug}
                                href={`/project/${post.slug}`}
                                className="group block border border-white/10 rounded-lg p-4 hover:border-white/25 transition-colors"
                            >
                                <div className="flex justify-between items-start gap-4">
                                    <span className="font-medium group-hover:text-white text-gray-200">{post.name}</span>
                                    <span className="text-xs text-gray-500 shrink-0">{post.dateDescription}</span>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">{post.shortDescription}</p>
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="shrink-0 px-6 py-4 border-t border-white/10 flex items-center justify-center gap-x-6 text-sm text-gray-500">
                <Link href="https://antipodean.ee">Antipodean Systems</Link>
            </footer>
        </div>
    );
}
