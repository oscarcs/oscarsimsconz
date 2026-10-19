'use client';

import { Link } from "./Link";
import { Post } from "../data/posts";
import { Nav } from './Nav';
import { Footer } from './Footer';

type PostProps = {
    post: Post;
};

export default function PostPage({ post }: PostProps) {
    return (
        <div className="site-shell">
            <Nav />

            {/* Content */}
            <div className="article-layout flex-1 flex flex-col px-6 py-8 mx-auto w-full max-w-2xl">
                <div className="mb-4">
                    <a href="/" className="text-sm text-muted hover:text-copper transition-colors">
                        &larr; Back to home
                    </a>
                </div>

                <div className="article-heading border-b border-white/10 pb-8 mb-8">
                    <h1 className="font-display text-4xl sm:text-5xl font-medium tracking-tight">{post.name}</h1>
                    <p className="text-sm text-muted mt-2">{post.dateDescription}</p>

                    <div className="mt-4">
                        <Link href={post.link} className="text-sm text-copper hover:text-ivory transition-colors">
                            {post.linkText}
                        </Link>
                    </div>
                </div>

                <section className="prose prose-sm prose-invert max-w-none prose-p:text-gray-300 prose-headings:text-ivory prose-strong:text-ivory prose-a:text-copper prose-a:hover:text-ivory prose-ul:text-gray-300 prose-li:text-gray-300">
                    <div dangerouslySetInnerHTML={{ __html: post.body }} />
                </section>
            </div>

            <Footer />
        </div>
    );
}
