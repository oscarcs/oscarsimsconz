'use client';

import { Building2, Github, Mail, MapPin, MessageCircleCode } from "lucide-react";

type AppProps = {
    children: React.ReactNode,
    message: string,
};

export default function Landing({ children, message, ...props }: AppProps) {
    return <div className="w-full min-h-screen flex flex-col bg-offwhite p-6 pb-0" {...props}>
        <div className="flex flex-col md:flex-row grow">
            <div className="shrink-0 v3 text-industrial flex flex-col gap-2 border-b md:border-b-0 md:border-r border-industrial border-dashed py-2 md:pr-6">
                <div className="pattern text-industrial border flex flex-col border-industrial px-10 py-2 mb-4 items-center">
                    <div className="v1">Oscar Sims</div>
                    <div className="v2">Software engineer from Auckland, NZ.</div>
                </div>
                
                <div className="flex flex-row items-center gap-2">
                    <MapPin className="inline-block" size="14"></MapPin>
                    Tallinn, Estonia (UTC+2)
                </div>
                <div className="flex flex-row items-center gap-2">
                    <Mail className="inline-block" size="14"></Mail>
                    oscar@oscarsims.co.nz
                </div>
                <div className="flex flex-row items-center gap-2">
                    <Building2 className="inline-block" size="14"></Building2>
                    <a href="https://antipodean.ee" target="blank" className="hover:underline">Antipodean Systems OÜ</a>
                </div>
                <div className="flex flex-row items-center gap-2">
                    <img height="14" width="14" src="https://cdn.simpleicons.org/github/303032ff" />
                    <a href="https://github.com/oscarcs" target="blank" className="hover:underline">oscarcs</a>
                </div>
            </div>
            {/* <div className="pattern px-6">

            </div> */}
            <main className="flex flex-col grow pt-6 md:pt-0 md:px-6 pb-6">
                <div className="flex flex-col gap-4">
                    <p>Kia ora, tervetuloa, and tere. I'm Oscar, a fullstack software engineer from New Zealand.</p>
                    <p>I've worked most recently in modern Typescript and Node web stacks, and also previously in C# and .NET. I've worked at AI-based startups (twice), a regtech scale-up, and a giant cinema software multinational, among other things.</p>
                    <p>I'm currently freelancing (and studying the Finnish language) from Tallinn, Estonia, but I'm interested in working on interesting and challenging projects pretty much anywhere. Drop me a line.</p>
                    <p>Outside of work, I'm passionate about <a href="https://www.stuff.co.nz/opinion/129175203/councils-are-defying-the-need-for-housing-intensification">regulatory</a> <a href="https://www.nzherald.co.nz/nz/auckland-heritage-houses-oscar-sims-inner-suburb-density-will-improve-affordability/BUARW3Q4LMMMSDPDHB2XGUGH3M/">reform</a> to create more <a href="https://www.greaterauckland.org.nz/2024/04/17/texas-lessons/">liveable cities.</a></p>
                </div>
            </main>
        </div>
        <footer className="text-industrial text-center w-full border-t border-industrial border-dashed py-2">
            © 2025 Oscar Sims
        </footer>
    </div>;
}