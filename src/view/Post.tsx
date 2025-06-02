'use client';

import { Link } from "./Link";
import { Post } from "../data/posts";

type PostProps = {
    post: Post;
};

export default function PostPage({ post }: PostProps) {
    return <div className="w-full min-h-screen flex flex-col bg-offwhite p-6 pb-0">
        <div className="flex flex-col grow max-w-xl mx-auto">
            <div className="shrink-0 v3 text-industrial flex flex-col">
                <div className="pattern text-industrial border flex flex-col border-industrial px-10 py-2 items-center">
                    <div className="v1">{post.name}</div>
                    <div className="v2">{post.dateDescription}</div>
                </div>
                <div className="py-6">
                    <Link href="/" className="text-sm text-industrial hover:underline">← Back to home</Link>
                </div>
            </div>
            <div className="pattern border-b border-industrial"></div>
            <div className="flex flex-col pt-6 pb-6">
                <div className="flex flex-col gap-4">
                    <Link href={post.link} className="text-industrial hover:underline">
                        {post.linkText}
                    </Link>
                </div>
            </div>
            <div className="pattern border-b border-industrial"></div>
            <section className="flex flex-col pt-6 pb-6">
                <div className="flex flex-col gap-4 prose prose-sm max-w-none prose-p:text-industrial prose-headings:text-industrial prose-strong:text-industrial prose-ul:text-industrial prose-li:text-industrial">
                    <div dangerouslySetInnerHTML={{ __html: post.body }} />
                </div>
            </section>
        </div>
        <footer className="text-industrial text-sm text-center w-full border-t border-industrial border-dashed py-2">
            © 2025 Oscar Sims
        </footer>
    </div>;
}
