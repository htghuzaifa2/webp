import { Image as ImageIcon } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';

export function Header() {
  return (
    <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-10">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <ImageIcon className="h-7 w-7 text-primary" />
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">
            <span className="text-primary">WebP</span>Converter
          </h1>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
