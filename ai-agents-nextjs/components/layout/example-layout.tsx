'use client';

import { type ReactNode } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

interface ExampleLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
  concepts: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prevHref?: string;
  prevLabel?: string;
  nextHref?: string;
  nextLabel?: string;
  docsLink?: string;
}

export function ExampleLayout({
  children,
  title,
  description,
  concepts,
  difficulty,
  prevHref,
  prevLabel,
  nextHref,
  nextLabel,
  docsLink,
}: ExampleLayoutProps) {
  const difficultyColors = {
    beginner: 'success',
    intermediate: 'warning',
    advanced: 'destructive',
  } as const;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-muted border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Badge variant={difficultyColors[difficulty]}>
                  {difficulty}
                </Badge>
                {docsLink && (
                  <a
                    href={docsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    View Docs
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>
              <h1 className="text-4xl font-bold text-foreground mb-3">
                {title}
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                {description}
              </p>
              <div className="flex flex-wrap gap-2 mt-6">
                {concepts.map((concept) => (
                  <Badge key={concept} variant="primary">
                    {concept}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </div>

      {/* Navigation Footer */}
      <div className="border-t border-border bg-muted">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            {prevHref ? (
              <Link
                href={prevHref}
                className="flex items-center gap-3 px-5 py-3 rounded-xl bg-card border border-border hover:border-primary transition-colors group"
              >
                <svg
                  className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <div className="text-left">
                  <p className="text-xs text-muted-foreground">Previous</p>
                  <p className="font-medium text-foreground">{prevLabel}</p>
                </div>
              </Link>
            ) : (
              <div />
            )}

            {nextHref ? (
              <Link
                href={nextHref}
                className="flex items-center gap-3 px-5 py-3 rounded-xl bg-card border border-border hover:border-primary transition-colors group"
              >
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Next</p>
                  <p className="font-medium text-foreground">{nextLabel}</p>
                </div>
                <svg
                  className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ) : (
              <div />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
