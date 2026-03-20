"use client";

import { useState, useRef, useEffect } from "react";
import type { ProjectMessage } from "@/lib/types/database";
import { Send, Paperclip } from "lucide-react";
import { Loader } from "@/components/ui/Loader";

interface ChatMessagesProps {
  messages: ProjectMessage[];
  currentProfileId: number;
  recipientId: number | null;
  projectId: number;
  onSendMessage: (text: string) => Promise<void>;
  onUploadFile?: (file: File) => Promise<string | null>;
  isLoading?: boolean;
  senderNames?: Record<number, string>;
}

export function ChatMessages({
  messages,
  currentProfileId,
  recipientId,
  projectId,
  onSendMessage,
  onUploadFile,
  isLoading,
  senderNames = {},
}: ChatMessagesProps) {
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || isSending) return;
    setIsSending(true);
    try {
      await onSendMessage(newMessage.trim());
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUploadFile) return;
    setIsSending(true);
    try {
      const url = await onUploadFile(file);
      if (url) {
        await onSendMessage(`📎 [File: ${file.name}](${url})`);
      }
    } catch (error) {
      console.error("Failed to upload file:", error);
    } finally {
      setIsSending(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader size="md" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-lg border">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-text-secondary text-sm py-8">
            No messages yet. Start the conversation!
          </p>
        )}
        {messages.map((msg) => {
          const isMine = msg.senderId === currentProfileId;
          const senderName = msg.senderId
            ? senderNames[msg.senderId] || (isMine ? "You" : "Staff")
            : "Unknown";
          return (
            <div
              key={msg.id}
              className={`flex ${isMine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-lg px-4 py-2.5 ${
                  isMine
                    ? "bg-brand-primary text-white"
                    : "bg-gray-100 text-text-primary"
                }`}
              >
                <p className="text-xs font-medium mb-1 opacity-70">
                  {senderName}
                </p>
                <p className="text-sm whitespace-pre-wrap break-words">
                  {msg.text}
                </p>
                <p
                  className={`text-[10px] mt-1 ${
                    isMine ? "text-blue-200" : "text-text-secondary"
                  }`}
                >
                  {msg.timpstamp
                    ? new Date(msg.timpstamp).toLocaleString()
                    : ""}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t p-3 flex items-center gap-2">
        {onUploadFile && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileSelect}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-text-secondary hover:text-brand-primary transition-colors"
              disabled={isSending}
            >
              <Paperclip size={20} />
            </button>
          </>
        )}
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          className="flex-1 resize-none rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent"
          disabled={isSending}
        />
        <button
          onClick={handleSend}
          disabled={!newMessage.trim() || isSending}
          className="p-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSending ? <Loader size="sm" className="text-white" /> : <Send size={20} />}
        </button>
      </div>
    </div>
  );
}
