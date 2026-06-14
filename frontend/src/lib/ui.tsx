import React from 'react';

export const CornerDecoration = ({ className = "" }: { className?: string }) => (
  <div className={`absolute pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity ${className}`}>
    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-current" />
    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-current" />
    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-current" />
    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-current" />
  </div>
);

export const deduplicateItems = <T,>(items: T[], keyExtractor: (item: T, index: number) => string, listName: string): T[] => {
  if (!items) return [];
  const seen = new Set<string>();
  const result: T[] = [];
  items.forEach((item, index) => {
    const key = keyExtractor(item, index);
    if (seen.has(key)) {
      console.error(`[REACT KEY COLLISION] List: ${listName}, Key: ${key}. This will cause rendering issues.`);
    } else {
      seen.add(key);
      result.push(item);
    }
  });
  return result;
};
