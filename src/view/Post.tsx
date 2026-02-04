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
        <div className="w-full min-h-screen flex flex-col bg-[#0a0a0a] text-white">
            <Nav />

            {/* Content */}
            <div className="flex-1 flex flex-col px-6 py-8 mx-auto w-full max-w-2xl">
                <div className="mb-4">
                    <a href="/" className="text-sm text-gray-500 hover:text-white transition-colors">
                        &larr; Back to home
                    </a>
                </div>

                <div className="border border-white/10 rounded-lg p-6 sm:p-8 mb-8">
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight">{post.name}</h1>
                    <p className="text-sm text-gray-500 mt-2">{post.dateDescription}</p>

                    <div className="mt-4">
                        <Link href={post.link} className="text-sm text-gray-400 hover:text-white transition-colors">
                            {post.linkText}
                        </Link>
                    </div>
                </div>

                <section className="prose prose-sm prose-invert max-w-none prose-p:text-gray-300 prose-headings:text-white prose-strong:text-white prose-a:text-gray-400 prose-a:hover:text-white prose-ul:text-gray-300 prose-li:text-gray-300">
                    <div dangerouslySetInnerHTML={{ __html: post.body }} />
                </section>
            </div>

            <Footer />
        </div>
    );
}
