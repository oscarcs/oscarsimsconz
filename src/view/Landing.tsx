'use client';

import { Link } from './Link';
import { Time } from './Time';
import { getAllPosts } from '../data/posts';

export default function Landing() {
    const posts = getAllPosts();

    return (
        <div className="w-full min-h-screen flex flex-col bg-[#0a0a0a] text-white">
            {/* Top nav */}
            <nav className="px-6 py-4 shrink-0">
                <div className="flex items-center justify-between">
                    <span className="text-lg font-bold tracking-tight">Oscar Sims</span>
                    <div className="flex items-center gap-5 text-sm text-gray-400">
                        <a href="mailto:oscar@oscarsims.co.nz" className="hover:text-white transition-colors">
                            Email
                        </a>
                        <Link href="https://github.com/oscarcs">
                            GitHub
                        </Link>
                    </div>
                </div>
                <div className="text-xs font-light uppercase tracking-widest text-gray-500 mt-1">
                    Melbourne, Australia · <Time />
                </div>
            </nav>

            {/* Main two-column layout */}
            <div className="flex-1 flex flex-col lg:flex-row items-center lg:items-stretch justify-center gap-8 px-6 py-8 mx-auto w-full max-w-5xl">
                {/* Card column */}
                <div className="flex flex-col items-center justify-center w-full lg:w-1/2">
                    <div
                        id="card-container"
                        className="card-canvas-container w-full max-w-sm aspect-[2.5/3.5] relative"
                    />
                </div>

                {/* Posts column */}
                <div className="flex flex-col lg:w-1/2 w-full lg:justify-center">
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
