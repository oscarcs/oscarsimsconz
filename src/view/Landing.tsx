'use client';

import { Building2, Mail, MapPin } from "lucide-react";
import { Link } from "./Link";
import { Time } from "./Time";
import { getAllPosts } from "../data/posts";

type AppProps = {
    children: React.ReactNode,
    message: string,
};

export default function Landing({ children, message, ...props }: AppProps) {
    const posts = getAllPosts();
    
    return <div className="w-full min-h-screen flex flex-col bg-offwhite p-6 pb-0" {...props}>
        <div className="flex flex-col grow max-w-xl mx-auto">
            <div className="shrink-0 v3 text-industrial flex flex-col">
                <div className="pattern text-industrial border flex flex-col border-industrial px-10 py-2 items-center">
                    <div className="v1">Oscar Sims</div>
                    <div className="v2">Software engineer from Auckland, NZ.</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 py-6">
                    <div className="flex flex-row items-center gap-2">
                        <MapPin className="inline-block" size="14"></MapPin>
                        Melbourne, Australia (<Time></Time>)
                    </div>
                    <div className="flex flex-row items-center gap-2">
                        <Mail className="inline-block" size="14"></Mail>
                        oscar@oscarsims.co.nz
                    </div>
                    <div className="flex flex-row items-center gap-2">
                        <Building2 className="inline-block" size="14"></Building2>
                        <Link href="https://antipodean.ee">Antipodean Systems OÜ</Link>
                    </div>
                    <div className="flex flex-row items-center gap-2">
                        <img height="14" width="14" src="https://cdn.simpleicons.org/github/303032ff" />
                        <Link href="https://github.com/oscarcs">oscarcs</Link>
                    </div>
                </div>
            </div>
            <div className="pattern border-b border-industrial"></div>
            <section className="flex flex-col pt-6 pb-6">
                <div className="flex flex-col gap-4">
                    <p className="font-semibold"><i>Kia ora</i> and <i>tervetuloa</i>.</p>
                    <p>I'm Oscar, a software engineer from New Zealand.</p>
                    <p>I've worked at AI-based startups (twice), a regtech scale-up, and a big cinema software multinational, among other things. I'm most experienced with modern fullstack Javascript/Typescript web tooling and C# but I like to try new technologies.</p>
                    <p>I'm actively looking for interesting and challenging projects to work on. Drop me a line.</p>
                    <p>Outside of work, I'm passionate about <Link href="https://www.stuff.co.nz/opinion/129175203/councils-are-defying-the-need-for-housing-intensification">regulatory</Link> <Link href="https://www.nzherald.co.nz/nz/auckland-heritage-houses-oscar-sims-inner-suburb-density-will-improve-affordability/BUARW3Q4LMMMSDPDHB2XGUGH3M/">reform</Link> to create more <Link href="https://www.greaterauckland.org.nz/2024/04/17/texas-lessons/">liveable cities.</Link></p>
                </div>
            </section>
            <div className="pattern border-b border-industrial"></div>
            <section className="flex flex-col pt-6 pb-6">
                <div className="flex flex-col gap-4">
                    <p className="font-semibold">Posts & selected projects</p>
                    <div className="flex flex-col gap-3">
                        {posts.map((post) => (
                            <div key={post.slug} className="border border-industrial p-4">
                                <div className="flex flex-col gap-2">
                                    <div className="flex justify-between items-start">
                                        <Link href={`/project/${post.slug}`} className="font-medium hover:underline">
                                            {post.name}
                                        </Link>
                                        <span className="text-sm text-gray-600">{post.dateDescription}</span>
                                    </div>
                                    <p className="text-sm text-industrial">{post.shortDescription}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
        <footer className="text-industrial text-sm text-center w-full border-t border-industrial border-dashed py-2">
            © 2025 Oscar Sims
        </footer>
    </div>;
}