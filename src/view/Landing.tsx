'use client';

import { useState } from 'react';
import { getAllPosts } from '../data/posts';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Nav } from './Nav';
import { Footer } from './Footer';

const POSTS_PER_PAGE = 5;
const EDITIONS = ['foil', 'holographic', 'polychrome'] as const;

export default function Landing() {
    const posts = getAllPosts();
    const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
    const paginated = totalPages > 1;

    const [page, setPage] = useState(0);
    const [edition, setEdition] = useState<string>('foil');

    function pickEdition(ed: string, direction: number) {
        setEdition(ed);
        const container = document.getElementById('card-container');
        container?.dispatchEvent(new CustomEvent('edition-change', { detail: { edition: ed, direction } }));
    }

    const visiblePosts = paginated
        ? posts.slice(page * POSTS_PER_PAGE, (page + 1) * POSTS_PER_PAGE)
        : posts;

    return (
        <div className="w-full min-h-screen flex flex-col bg-[#0a0a0a] text-white">
            <Nav />

            {/* Main two-column layout */}
            <div className="flex-1 flex flex-col lg:flex-row items-center lg:items-stretch justify-center gap-8 px-6 pt-2 pb-8 mx-auto w-full max-w-5xl">
                {/* Card column */}
                <div className="flex flex-col items-center justify-center w-full lg:w-1/2">
                    <div
                        id="card-container"
                        className="card-canvas-container w-full max-w-sm aspect-[2.5/3.5] relative"
                    />
                    <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
                        <button
                            onClick={() => {
                                const i = (EDITIONS.indexOf(edition as typeof EDITIONS[number]) - 1 + EDITIONS.length) % EDITIONS.length;
                                pickEdition(EDITIONS[i], -1);
                            }}
                            className="p-1 rounded hover:bg-white/10 transition-colors"
                            aria-label="Previous edition"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <span className="text-xs tabular-nums">
                            {EDITIONS.indexOf(edition as typeof EDITIONS[number]) + 1}/{EDITIONS.length}
                        </span>
                        <button
                            onClick={() => {
                                const i = (EDITIONS.indexOf(edition as typeof EDITIONS[number]) + 1) % EDITIONS.length;
                                pickEdition(EDITIONS[i], 1);
                            }}
                            className="p-1 rounded hover:bg-white/10 transition-colors"
                            aria-label="Next edition"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Posts column */}
                <div className="flex flex-col lg:w-1/2 w-full lg:justify-start lg:py-12">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Posts & Projects</h2>
                        {paginated && (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <button
                                    onClick={() => setPage(p => Math.max(0, p - 1))}
                                    disabled={page === 0}
                                    className="p-1 rounded hover:bg-white/10 transition-colors disabled:opacity-25 disabled:cursor-default"
                                    aria-label="Previous page"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                <span className="text-xs tabular-nums">
                                    {page + 1}/{totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                    disabled={page === totalPages - 1}
                                    className="p-1 rounded hover:bg-white/10 transition-colors disabled:opacity-25 disabled:cursor-default"
                                    aria-label="Next page"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col gap-3">
                        {visiblePosts.map((post) => (
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

            <Footer />
        </div>
    );
}
