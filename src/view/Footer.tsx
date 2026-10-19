import { Link } from './Link';

export function Footer() {
    return (
        <footer className="site-footer site-width flex items-center justify-between gap-4">
            <Link href="https://antipodean.ee">Antipodean Systems OÜ</Link>
            <span>© {new Date().getFullYear()}</span>
        </footer>
    );
}
