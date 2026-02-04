import { ArrowUpRight } from 'lucide-react';

interface LinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function Link({ href, children, className = '' }: LinkProps) {
  const isExternal = href.startsWith('http://') || href.startsWith('https://') || href.includes('://');
  
  return (
    <a
      href={href}
      className={`inline-flex items-center hover:opacity-80 hover:underline ${className}`}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
    >
      {children}
      {isExternal && <ArrowUpRight className="h-4 w-4 opacity-50" />}
    </a>
  );
}
