'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  {
    title: 'Getting Started',
    items: [
      { href: '/', label: 'Home', icon: '🏠' },
    ],
  },
  {
    title: 'Fundamentals',
    items: [
      { href: '/examples/01-intro', label: '1. Introduction', icon: '👋' },
      { href: '/examples/02-translation', label: '2. Translation', icon: '🌍' },
      { href: '/examples/03-reasoning', label: '3. Reasoning', icon: '🧠' },
      { href: '/examples/04-streaming', label: '4. Streaming', icon: '⚡' },
    ],
  },
  {
    title: 'Agency',
    items: [
      { href: '/examples/05-tools', label: '5. Tool Calling', icon: '🔧' },
      { href: '/examples/06-memory', label: '6. Memory', icon: '💾' },
      { href: '/examples/07-react-agent', label: '7. ReAct Agent', icon: '🔄' },
      { href: '/examples/08-aot-agent', label: '8. AoT Agent', icon: '⚛️' },
    ],
  },
  {
    title: 'Advanced',
    items: [
      { href: '/examples/09-multi-agent', label: '9. Multi-Agent', icon: '👥' },
      { href: '/examples/10-rag', label: '10. RAG', icon: '📚' },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 border-r border-border bg-card overflow-y-auto">
      <div className="sticky top-0 p-4 bg-card border-b border-border">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/30">
            AI
          </div>
          <div>
            <h1 className="font-bold text-foreground">AI Agents</h1>
            <p className="text-xs text-muted-foreground">Next.js 16 + AI SDK</p>
          </div>
        </Link>
      </div>

      <nav className="p-4 space-y-6">
        {navigation.map((section) => (
          <div key={section.title}>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              {section.title}
            </h2>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`
                        flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium
                        transition-all duration-200
                        ${isActive
                          ? 'bg-primary/10 text-primary shadow-sm'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        }
                      `}
                    >
                      <span className="text-base">{item.icon}</span>
                      <span>{item.label}</span>
                      {isActive && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="p-4 mt-auto border-t border-border">
        <div className="p-4 rounded-xl bg-muted">
          <p className="text-sm font-medium text-foreground mb-1">
            Need help?
          </p>
          <p className="text-xs text-muted-foreground mb-3">
            Check out the AI SDK documentation
          </p>
          <a
            href="https://sdk.vercel.ai/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-primary hover:underline"
          >
            View Docs →
          </a>
        </div>
      </div>
    </aside>
  );
}
