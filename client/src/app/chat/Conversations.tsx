"use client";
import ChatInput from "@/components/chat/ChatInput";
import ChatMessage from "@/components/chat/ChatMessage";
import ChatSidebar from "@/components/chat/ChatSidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { userAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useRef } from "react";

const Conversations = ({ id }: { id: string }) => {
  const {
    currentChat,
    messages,
    isLoading,
    isAiLoading,
    isUserLoading,
    fetchChat,
    sendMessage,
  } = useChatStore();
  const { isAuthenticated } = userAuthStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (id) {
      fetchChat(id);
    }
  }, [id, fetchChat]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const hasSentRef = useRef(false);
  const initialMessage = useMemo(() => {
    return searchParams.get("message");
  }, []);

  useEffect(() => {
    if (!hasSentRef.current && initialMessage) {
      sendMessage(id, initialMessage);
      hasSentRef.current = true;

      //Remove message from search params
      const current = new URLSearchParams(window.location.search);
      current.delete("message");
      const newUrl = `${window.location.pathname}?${current.toString()}`;
      router.replace(newUrl, { scroll: false });
    }
  }, [initialMessage, id, sendMessage, router]);

  const handleSendMesaage = async (message: string) => {
    try {
      await sendMessage(id, message);
    } catch (error) {
      console.log(error);
    }
  };

  if (!isAuthenticated) {
    return null;
  }
  return (
    <div className="flex h-screen overflow-hidden">
      <ChatSidebar />
      <div className="flex flex-1 flex-col relative md:ml-64 ml-0 p-4 md:p-10 lg:p-6">
        <header className="fixed top-0 left-6 right-0 z-10 flex h-14 items-center justify-between shadow-lg bg-background">
          <div className="w-full max-w-4xl mx-auto px-4 flex justify-center text-center items-center">
            <h1 className="text-lg mt-4 ml-20 font-semibold">
              {currentChat?.title}
            </h1>
          </div>
        </header>

        <div className="flex-1 w-full max-w-4xl mx-auto pt-12 mb-40">
          <ScrollArea className="h-[calc(100vh-8.5rem)]">
            <div className="flex flex-col px-4 pb-30">
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center p-8">
                    <div className="mb-4 h-16 w-16">
                      <img
                        src="/images/deepseek-small-logo.svg"
                        alt="deepsee-logo"
                        className="h-full w-full"
                      />
                    </div>
                    <h2 className="text-2xl font-bold ">Hi, I'm DeepSeek.</h2>
                  <p className="mt-2 text-center text-muted-foreground">
                    How can help you today
                  </p>
                </div>
              ) : (
                  messages.map((message,index) => (
                    <ChatMessage
                      key={index}
                      message={message}
                      isUserLoading = {isUserLoading && index === messages.length -2 && message.role === 'user' }
                      isAiLoading= {isAiLoading && index === messages.length -1 && message.role === 'assistant' }
                    />
                  ))
              )}
              <div ref={messagesEndRef}/>
            </div>
          </ScrollArea>
        </div>

          <div className="fixed left-0 mb-4 right-0 bottom-0 mx-auto flex px-4 justify-center items-center md:pl-10">
          <ChatInput onSubmit={handleSendMesaage} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default Conversations;
