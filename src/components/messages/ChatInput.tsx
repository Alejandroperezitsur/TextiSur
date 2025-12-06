import React, { useState, useRef } from "react";
import { Paperclip, Send, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
    onSendMessage: (content: string, type: "text" | "image", file?: File) => void;
    onTypingStart: () => void;
    onTypingStop: () => void;
}

export const ChatInput = ({ onSendMessage, onTypingStart, onTypingStop }: ChatInputProps) => {
    const [message, setMessage] = useState("");
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value);

        // Typing logic
        onTypingStart();
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            onTypingStop();
        }, 2000);
    };

    const handleSend = () => {
        if (!message.trim()) return;
        onSendMessage(message, "text");
        setMessage("");
        onTypingStop();
    };

    return (
        <div className="p-4 bg-background border-t flex items-end gap-2">
            <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground">
                <Paperclip size={20} />
            </Button>
            <div className="relative flex-1">
                <Textarea
                    value={message}
                    onChange={handleChange}
                    placeholder="Escribe un mensaje..."
                    className="min-h-[44px] max-h-32 resize-none pr-10 py-3 rounded-xl bg-muted/50 border-none focus-visible:ring-1"
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                />
                <Button variant="ghost" size="icon" className="absolute right-1 bottom-1 text-muted-foreground h-8 w-8">
                    <Smile size={18} />
                </Button>
            </div>
            <Button onClick={handleSend} size="icon" className="shrink-0 rounded-full h-11 w-11">
                <Send size={20} className="ml-0.5" />
            </Button>
        </div>
    );
};
