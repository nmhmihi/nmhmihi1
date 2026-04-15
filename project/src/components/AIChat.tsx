'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, User, Send, LoaderCircle } from 'lucide-react';
import { askAI } from '@/ai/flows/chat-flow';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface Message {
    role: 'user' | 'model';
    content: string;
}

export function AIChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage: Message = { role: 'user', content: input };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            const aiResponse = await askAI(newMessages);
            const aiMessage: Message = { role: 'model', content: aiResponse };
            setMessages((prev) => [...prev, aiMessage]);
        } catch (error) {
            console.error("AI Error:", error);
            const errorMessage: Message = { role: 'model', content: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại." };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        if (scrollAreaRef.current) {
            const scrollableNode = scrollAreaRef.current.children[0].children[0];
             if (scrollableNode) {
                scrollableNode.scrollTo({
                    top: scrollableNode.scrollHeight,
                    behavior: 'smooth'
                });
            }
        }
    }, [messages, isLoading]);


    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
                    size="icon"
                >
                    <Bot className="h-7 w-7" />
                    <span className="sr-only">Mở Trợ lý AI</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl h-[70vh] flex flex-col p-0">
                <DialogHeader className="p-4 border-b">
                    <DialogTitle className="flex items-center gap-2">
                        <Bot /> Trợ lý AI
                    </DialogTitle>
                    <DialogDescription>
                        Hỏi bất cứ điều gì về ứng dụng này.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="flex-grow" ref={scrollAreaRef}>
                   <div className="space-y-4 p-4">
                        {messages.length === 0 && !isLoading && (
                            <div className="text-center text-muted-foreground p-8">
                                <p>Xin chào! Tôi có thể giúp gì cho bạn?</p>
                            </div>
                        )}
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={cn(
                                    'flex items-start gap-3',
                                    message.role === 'user' ? 'justify-end' : 'justify-start'
                                )}
                            >
                                {message.role === 'model' && (
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback><Bot size={20}/></AvatarFallback>
                                    </Avatar>
                                )}
                                <div
                                    className={cn(
                                        'p-3 rounded-lg max-w-sm md:max-w-md',
                                        message.role === 'user'
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted'
                                    )}
                                >
                                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                </div>
                                {message.role === 'user' && (
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback><User size={20}/></AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        ))}
                         {isLoading && (
                            <div className="flex items-start gap-3 justify-start">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback><Bot size={20}/></AvatarFallback>
                                </Avatar>
                                <div className="p-3 rounded-lg bg-muted flex items-center">
                                    <LoaderCircle className="animate-spin h-5 w-5 text-muted-foreground" />
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
                <DialogFooter className="p-4 border-t">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSend();
                        }}
                        className="flex w-full space-x-2"
                    >
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Nhập câu hỏi của bạn..."
                            disabled={isLoading}
                        />
                        <Button type="submit" disabled={isLoading || !input.trim()}>
                            <Send className="h-4 w-4" />
                            <span className="sr-only">Gửi</span>
                        </Button>
                    </form>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
