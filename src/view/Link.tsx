import { ArrowUpRight } from 'lucide-react';

interface LinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function Link({ href, children, className = '' }: LinkProps) {
  return (
    <a
      href={href}
      className={`inline-flex items-center hover:opacity-80 hover:underline ${className}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
      <ArrowUpRight className="text-secondary h-4 w-4" />
    </a>
  );
}
