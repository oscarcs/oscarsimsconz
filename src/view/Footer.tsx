import { Link } from './Link';

export function Footer() {
    return (
        <footer className="shrink-0 px-6 py-4 border-t border-white/10 flex items-center justify-center gap-x-6 text-sm text-gray-500">
            <Link href="https://antipodean.ee">Antipodean Systems OÜ</Link>
            <span className="text-white/15">|</span>
            <span>© {new Date().getFullYear()}</span>
        </footer>
    );
}
