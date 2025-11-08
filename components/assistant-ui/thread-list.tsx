import type { FC } from "react";
import { useState, useEffect } from "react";
import {
  ThreadListItemPrimitive,
  ThreadListPrimitive,
  useAssistantState,
  useThreadListItem,
  useThread,
} from "@assistant-ui/react";
import { ArchiveIcon, PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button";
import { Skeleton } from "@/components/ui/skeleton";

export const ThreadList: FC = () => {
  return (
    <ThreadListPrimitive.Root className="aui-root aui-thread-list-root flex flex-col items-stretch gap-1.5">
      <ThreadListNew />
      <ThreadListItems />
    </ThreadListPrimitive.Root>
  );
};

const ThreadListNew: FC = () => {
  return (
    <ThreadListPrimitive.New asChild>
      <Button
        className="aui-thread-list-new flex items-center justify-start gap-1 rounded-lg px-2.5 py-2 text-start hover:bg-muted data-active:bg-muted"
        variant="ghost"
      >
        <PlusIcon />
        New Thread
      </Button>
    </ThreadListPrimitive.New>
  );
};

const ThreadListItems: FC = () => {
  const isLoading = useAssistantState(({ threads }) => threads.isLoading);

  if (isLoading) {
    return <ThreadListSkeleton />;
  }

  return <ThreadListPrimitive.Items components={{ ThreadListItem }} />;
};

const ThreadListSkeleton: FC = () => {
  return (
    <>
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={i}
          role="status"
          aria-label="Loading threads"
          aria-live="polite"
          className="aui-thread-list-skeleton-wrapper flex items-center gap-2 rounded-md px-3 py-2"
        >
          <Skeleton className="aui-thread-list-skeleton h-[22px] flex-grow" />
        </div>
      ))}
    </>
  );
};

const ThreadListItem: FC = () => {
  return (
    <ThreadListItemPrimitive.Root className="aui-thread-list-item flex items-center gap-2 rounded-lg transition-all hover:bg-muted focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none data-active:bg-muted">
      <ThreadListItemPrimitive.Trigger className="aui-thread-list-item-trigger flex-grow px-3 py-2 text-start min-w-0">
        <ThreadListItemTitle />
      </ThreadListItemPrimitive.Trigger>
      <ThreadListItemArchive />
    </ThreadListItemPrimitive.Root>
  );
};

// Global store for thread titles
const threadTitles: Record<string, string> = {};

// Shared function to get thread title
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getThreadTitle = (threadId: string, messages: readonly any[]) => {
  // Check if we have a custom title
  if (threadTitles[threadId]) {
    return threadTitles[threadId];
  }
  
  // Generate default title from first message
  const firstMessage = messages[0];
  if (firstMessage?.content?.[0]?.type === "text") {
    const text = firstMessage.content[0].text;
    return text.slice(0, 50) + (text.length > 50 ? "..." : "");
  }
  
  return "New Chat";
};

const ThreadListItemTitle: FC = () => {
  const threadItem = useThreadListItem();
  const [, forceUpdate] = useState({});
  const currentThread = useThread();
  
  useEffect(() => {
    const handleUpdate = () => forceUpdate({});
    window.addEventListener('threadTitleUpdate', handleUpdate);
    return () => window.removeEventListener('threadTitleUpdate', handleUpdate);
  }, []);
  
  // Force update when current thread messages change (for active thread)
  useEffect(() => {
    if (currentThread.threadId === threadItem.id) {
      forceUpdate({});
    }
  }, [currentThread.messages.length, currentThread.threadId, threadItem.id]);
  
  const ellipsisStyle = {
    display: 'block',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minWidth: 0
  };

  // Check if we have a custom title
  const customTitle = threadTitles[threadItem.id];
  if (customTitle) {
    return (
      <span className="aui-thread-list-item-title text-sm" style={ellipsisStyle}>
        {customTitle}
      </span>
    );
  }
  
  // For active thread, use same logic as header
  if (currentThread.threadId === threadItem.id) {
    const title = getThreadTitle(threadItem.id, [...currentThread.messages]);
    return (
      <span className="aui-thread-list-item-title text-sm" style={ellipsisStyle}>
        {title}
      </span>
    );
  }
  
  // For other threads, use primitive
  return (
    <span className="aui-thread-list-item-title text-sm" style={ellipsisStyle}>
      <ThreadListItemPrimitive.Title fallback="New Chat" />
    </span>
  );
};

// Export function to update titles
export const updateThreadTitle = (threadId: string, title: string) => {
  threadTitles[threadId] = title;
  // Force re-render by dispatching a custom event
  window.dispatchEvent(new CustomEvent('threadTitleUpdate'));
};

const ThreadListItemArchive: FC = () => {
  return (
    <ThreadListItemPrimitive.Archive asChild>
      <TooltipIconButton
        className="aui-thread-list-item-archive mr-3 ml-auto size-4 p-0 text-foreground hover:text-primary"
        variant="ghost"
        tooltip="Archive thread"
      >
        <ArchiveIcon />
      </TooltipIconButton>
    </ThreadListItemPrimitive.Archive>
  );
};
