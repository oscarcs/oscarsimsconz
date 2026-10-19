'use client';

import { useState } from 'react';
import { getAllPosts } from '../data/posts';
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Nav } from './Nav';
import { Footer } from './Footer';

const POSTS_PER_PAGE = 5;

export default function Landing() {
    const posts = getAllPosts();
    const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
    const paginated = totalPages > 1;

    const [page, setPage] = useState(0);

    const visiblePosts = paginated
        ? posts.slice(page * POSTS_PER_PAGE, (page + 1) * POSTS_PER_PAGE)
        : posts;

    return (
        <div className="site-shell">
            <Nav />

            {/* Two-column on desktop, stacked on mobile */}
            <main className="landing-layout site-width">
                {/* Globe */}
                <div className="flex items-center justify-center w-full lg:w-1/2">
                    <div
                        id="globe-container"
                        className="globe-canvas"
                        role="img"
                        aria-label="Rotating bronze and silver globe"
                    />
                </div>

                {/* Posts */}
                <div className="flex flex-col w-full lg:w-1/2">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="section-label">Posts & Projects</h2>
                        {paginated && (
                            <div className="flex items-center gap-2 text-sm text-muted">
                                <button
                                    onClick={() => setPage(p => Math.max(0, p - 1))}
                                    disabled={page === 0}
                                    className="pagination-button"
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
                                    className="pagination-button"
                                    aria-label="Next page"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="project-list">
                        {visiblePosts.map((post) => (
                            <a
                                key={post.slug}
                                href={`/project/${post.slug}`}
                                className="project-row group"
                            >
                                <div className="flex justify-between items-baseline gap-4">
                                    <span className="project-title">{post.name}</span>
                                    <span className="project-date">{post.dateDescription}</span>
                                </div>
                                <p className="project-description">{post.shortDescription}</p>
                                <ArrowUpRight className="project-arrow" aria-hidden="true" />
                            </a>
                        ))}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
