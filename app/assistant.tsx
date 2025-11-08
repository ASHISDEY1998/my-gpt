"use client";

import { AssistantRuntimeProvider } from "@assistant-ui/react";
import {
  useChatRuntime,
  AssistantChatTransport,
} from "@assistant-ui/react-ai-sdk";
import { Thread } from "@/components/assistant-ui/thread";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useThread } from "@assistant-ui/react";
import { ThreadListSidebar } from "@/components/assistant-ui/threadlist-sidebar";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import { PencilIcon, CheckIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateThreadTitle, getThreadTitle } from "@/components/assistant-ui/thread-list";

const ThreadName = () => {
  const thread = useThread();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [, forceUpdate] = useState({});
  
  const threadId = thread.threadId;
  const title = getThreadTitle(threadId, thread.messages);

  const handleEdit = () => {
    setEditValue(title);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editValue.trim() && threadId) {
      updateThreadTitle(threadId, editValue.trim());
      forceUpdate({});
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue("");
  };

  useEffect(() => {
    const handleUpdate = () => forceUpdate({});
    window.addEventListener('threadTitleUpdate', handleUpdate);
    return () => window.removeEventListener('threadTitleUpdate', handleUpdate);
  }, []);

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="h-8 text-sm"
          autoFocus
        />
        <Button size="sm" variant="ghost" onClick={handleSave}>
          <CheckIcon className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={handleCancel}>
          <XIcon className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 group">
      <span className="text-sm font-medium">{title}</span>
      <Button
        size="sm"
        variant="ghost"
        onClick={handleEdit}
        className="opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <PencilIcon className="h-4 w-4" />
      </Button>
    </div>
  );
};

export const Assistant = () => {
  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: "/api/chat",
    }),
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <SidebarProvider>
        <div className="flex h-dvh w-full pr-0.5">
          <ThreadListSidebar />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <ThreadName />
            </header>
            <div className="flex-1 overflow-hidden">
              <Thread />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </AssistantRuntimeProvider>
  );
};
