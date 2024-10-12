import { FixedSelectionWithContent } from '@/components/fixed-selection-with-content';
import React from 'react';

export default function Layout({
    selection,
    content,
  }: {
    children: React.ReactNode;
    selection: React.ReactNode;
    content: React.ReactNode;
  }) {
    /**
     * Selection component (client) - triggers router refresh on change - stores state in URL
     * View component (server) - has its own loading page and loads ideas
     */
    return <FixedSelectionWithContent SelectionView={selection} ContentView={content} />;
  }
  