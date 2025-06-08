import api from "@/lib/api";
import { create } from "zustand";

interface Chat {
  _id: string;
  title: string;
  decsription?: string;
  createdAt: string;
  updatedAt: string;
}

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  comment?: string;
}

interface ChatState {
  chats: Chat[];
  currentChat: Chat | null;
  messages: Message[];
  isLoading: boolean;
  isChatLoading: boolean;
  isUserLoading: boolean;
  isAiLoading: boolean;
  hasFetchChatOnce: boolean;
  error: string | null;
  fetchChats: () => Promise<void>;
  fetchChat: (chatId: string) => Promise<void>;
  createChat: (title?: string) => Promise<Chat>;
  deleteChat: (chatId: string) => Promise<void>;
  sendMessage: (chatId: string, content: string) => Promise<void>;
}

export const useChatStore = create<ChatState>()((set, get) => ({
  chats: [],
  currentChat: null,
  messages: [],
  isLoading: false,
  error: null,
  isUserLoading: false,
  isAiLoading: false,
  isChatLoading: false,
  hasFetchChatOnce: false,

  fetchChats: async () => {
    try {
      set({ error: null, isChatLoading: true });
      const { data } = await api.get("/chats");
      set({ chats: data.chats, isChatLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.error;
      set({ error: message, isChatLoading: false });
    }
  },

  fetchChat: async (chatId) => {
    try {
      set({ error: null, isLoading: true });
      const { data } = await api.get(`/chats/${chatId}`);
      set({
        currentChat: data.chat,
        messages: data.messages,
        isLoading: false,
      });
    } catch (error: any) {
      const message = error.response?.data?.error;
      set({ error: message, isLoading: false });
    }
  },

  createChat: async (title) => {
    try {
      set({ error: null, isLoading: true });
      const { data } = await api.post("/chats", { title });
      set((state) => ({
        chats: [data.chat, ...state.chats],
        isLoading: false,
      }));
      return data.chat;
    } catch (error: any) {
      const message = error.response?.data?.error;
      set({ error: message, isLoading: false });
    }
  },
  deleteChat: async (chatId) => {
    try {
      set({ error: null, isLoading: true });
      const { data } = await api.delete(`/chats/${chatId}`);
      set((state) => ({
        chats: state.chats.filter((chat) => chat._id !== chatId),
        isLoading: false,
      }));
    } catch (error: any) {
      const message = error.response?.data?.error;
      set({ error: message, isLoading: false });
    }
  },

  sendMessage: async (chatId, content) => {
    set({isUserLoading:true})
    const userMessage = { role: "user" as const, content };
    set((state) => ({
      messages: [...state.messages, userMessage],
    }));

    try {

      set({
        isAiLoading: true,
      });
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/conversation/${chatId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ message: userMessage }),
        }
      );

      if (!response.ok) throw new Error("failed to send message");

      set({
        isUserLoading: false,
      });

      const tempAssistantMessage = { role: "assistant" as const, content: "" };
      set((state) => ({ messages: [...state.messages, tempAssistantMessage] }));

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantResponse = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split("\n").filter(Boolean);
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6).trim();
              if (data === "[DONE]") continue;
              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  assistantResponse += parsed.content;
                  set((state) => {
                    const updated = [...state.messages];
                    const last = updated[updated.length - 1];
                    if (last?.role === "assistant")
                      last.content = assistantResponse;
                    return {
                      messages: updated,
                      isAiLoading: assistantResponse === "", // keep loading trye until we get content
                    };
                  });
                }
              } catch (error: any) {
                console.log("starem parse error", error);
                const message = error.response?.data?.error;
                set({
                  error: message,
                  isAiLoading: false,
                  isUserLoading: false,
                });
              }
            }
          }
        }
      } 
      if(!get().hasFetchChatOnce){
        const state = get();
        const lastMessage = state.messages[state.messages.length-1];
        if(lastMessage?.role === 'assistant' && lastMessage.content.trim().length >0){
            await get().fetchChats();
            set({hasFetchChatOnce:true})
        }
      }

      await get().fetchChat(chatId)

    } catch (error:any) {
         const message = error.response?.data?.error;
                set({
                  error: message,
                  isAiLoading: false,
                  isUserLoading: false,
                });

                set((state) => {
                    const msg = [...state.messages];
                    if(msg[msg.length -1]?.role=== 'assistant') msg.pop();
                    return {messages:msg}
                });
    } finally{
        set({
            isAiLoading:false,
            isUserLoading:false,
            hasFetchChatOnce:false
        })
    }
  },
}));
