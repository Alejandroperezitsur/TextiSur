import React from "react";
import { cn } from "@/lib/utils";
import { Check, CheckCheck } from "lucide-react";
import Image from "next/image";

interface MessageBubbleProps {
    message: {
        id: number;
        content: string;
        type: "text" | "image" | "file" | "audio";
        senderId: number;
        createdAt: string;
        isRead: boolean;
        attachmentUrl?: string;
    };
    isMe: boolean;
}

export const MessageBubble = ({ message, isMe }: MessageBubbleProps) => {
    return (
        <div className={cn("flex w-full mb-4", isMe ? "justify-end" : "justify-start")}>
            <div
                className={cn(
                    "max-w-[75%] px-4 py-2 rounded-2xl shadow-sm relative group",
                    isMe
                        ? "bg-primary text-primary-foreground rounded-tr-none"
                        : "bg-muted text-muted-foreground rounded-tl-none"
                )}
            >
                {/* Content */}
                {message.type === "text" && <p className="text-sm">{message.content}</p>}
                {message.type === "image" && message.attachmentUrl && (
                    <div className="mb-1 rounded-lg overflow-hidden border">
                        <Image
                            src={message.attachmentUrl}
                            alt="attachment"
                            width={200}
                            height={200}
                            className="object-cover w-full h-auto"
                            sizes="(max-width: 768px) 100vw, 200px"
                        />
                    </div>
                )}

                {/* Footer: Time & Status */}
                <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="text-[10px] opacity-70">
                        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isMe && (
                        <span className="text-[10px]">
                            {message.isRead ? <CheckCheck size={14} /> : <Check size={14} />}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};
