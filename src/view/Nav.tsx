import { Link } from './Link';
import { Time } from './Time';

export function Nav() {
    return (
        <nav className="px-6 py-4 shrink-0">
            <div className="flex items-center justify-between">
                <a href="/" className="text-lg font-bold tracking-tight hover:opacity-80 transition-opacity">Oscar Sims</a>
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
    );
}
