"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface ThreadTitleContextType {
  threadTitles: Record<string, string>;
  updateThreadTitle: (threadId: string, title: string) => void;
  getThreadTitle: (threadId: string, fallback?: string) => string;
}

const ThreadTitleContext = createContext<ThreadTitleContextType | undefined>(undefined);

export const ThreadTitleProvider = ({ children }: { children: ReactNode }) => {
  const [threadTitles, setThreadTitles] = useState<Record<string, string>>({});

  useEffect(() => {
    const stored = localStorage.getItem('threadTitles');
    if (stored) {
      setThreadTitles(JSON.parse(stored));
    }
  }, []);

  const updateThreadTitle = (threadId: string, title: string) => {
    const newTitles = { ...threadTitles, [threadId]: title };
    setThreadTitles(newTitles);
    localStorage.setItem('threadTitles', JSON.stringify(newTitles));
  };

  const getThreadTitle = (threadId: string, fallback = "New Chat") => {
    return threadTitles[threadId] || fallback;
  };

  return (
    <ThreadTitleContext.Provider value={{ threadTitles, updateThreadTitle, getThreadTitle }}>
      {children}
    </ThreadTitleContext.Provider>
  );
};

export const useThreadTitle = () => {
  const context = useContext(ThreadTitleContext);
  if (!context) {
    throw new Error("useThreadTitle must be used within ThreadTitleProvider");
  }
  return context;
};