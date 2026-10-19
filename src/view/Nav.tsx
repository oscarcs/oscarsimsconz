import { Link } from './Link';
import { Time } from './Time';

export function Nav() {
    return (
        <nav className="site-nav site-width">
            <div className="flex items-center justify-between">
                <a href="/" className="site-name">Oscar Sims</a>
                <div className="nav-links flex items-center gap-4 sm:gap-6 text-xs sm:text-sm">
                    <a href="mailto:oscar@oscarsims.co.nz" className="transition-colors">
                        Email
                    </a>
                    <Link href="https://github.com/oscarcs">
                        GitHub
                    </Link>
                </div>
            </div>
            <div className="location-label">
                Melbourne, Australia · <Time />
            </div>
        </nav>
    );
}
