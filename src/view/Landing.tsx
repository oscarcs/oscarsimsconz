'use client';

import { Building2, Github, Mail, MapPin, MessageCircleCode } from "lucide-react";

type AppProps = {
    children: React.ReactNode,
    message: string,
};

export default function Landing({ children, message, ...props }: AppProps) {
    return <div className="w-full min-h-screen flex flex-col bg-offwhite p-6 pb-0" {...props}>
        <header className="flex flex-col md:flex-row gap-0 w-full mb-6 justify-center border-b border-t border-industrial">
            <div className="text-offwhite bg-red-500 flex flex-col border-industrial border-l border-r gap-0 px-20 py-2 items-center">
                <div className="v1">Oscar Sims</div>
                <div className="v2">Software engineer from Auckland, NZ.</div>
            </div>
        </header>
        <div className="v3 text-industrial w-full flex flex-col gap-2 md:flex-row justify-center md:gap-6 border-b border-t border-industrial border-dashed py-2">
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
        <main className="w-full grow flex flex-col">

        </main>
        <footer className="text-industrial text-center w-full border-t border-industrial border-dashed py-2">
            © 2025 Oscar Sims
        </footer>
    </div>;
}