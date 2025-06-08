import { cn } from "@/lib/utils";
import { userAuthStore } from "@/store/authStore";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Loader } from "../Loader";
import Markdown from "../Markdown";
import { Copy, ThumbsDown, ThumbsUp } from "lucide-react";
import toast from "react-hot-toast";

interface ChatMessageProps {
  message: {
    role: "user" | "assistant" | "system";
    content: string;
    comment?: string;
  };
  isUserLoading?: boolean;
  isAiLoading?: boolean;
}
const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isAiLoading,
  isUserLoading,
}) => {
  const { user } = userAuthStore();
  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("copied");
  };
  return (
    <div
      className={cn(
        "flex w-full items-start gap-4 p-4 rounded-lg",
        message.role === "user" ? "bg-blue-50 mt-10" : "bg-muted/50",
        "mb-4 relative"
      )}
    >
      <Avatar className="h-8 w-8">
        {message.role === "user" ? (
          user?.profilePicture ? (
            <AvatarImage
              src={user?.profilePicture}
              alt={user?.name}
            ></AvatarImage>
          ) : (
            <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
          )
        ) : (
          <AvatarImage src="/images/deepseek-small-logo.svg" alt="deepseek" />
        )}
      </Avatar>

      <div className="flex-1 space-y-2">
        {message.role === "user" && isUserLoading ? (
          <Loader type="user" position="left" className="mr-2" />
        ) : message.role === "assistant" && isAiLoading ? (
          <Loader type="ai" />
        ) : (
          <div className="prose prose-sm max-w-none">
            <Markdown content={message.content} />
          </div>
        )}
      </div>

      {message.role === "user" ? (
        <div className="absolute right-4 top-1/2 mt-4 transform -translate-y-1/2">
          <Copy
            className="h-5 w-5 text-gray-600 cursor-pointer"
            onClick={() => handleCopy(message.content)}
          />
        </div>
      ) : (
        <div className="absolute left-4 -bottom-10  transform -translate-y-1/2 flex gap-3">
          <Copy
            className="h-5 w-5 text-gray-600 cursor-pointer"
            onClick={() => handleCopy(message.content)}
          />
          <ThumbsUp
            className="h-5 w-5 text-green-600 cursor-pointer"
            onClick={() => console.log("liked")}
          />
          <ThumbsDown
            className="h-5 w-5 text-red-600 cursor-pointer"
            onClick={() => console.log("unliked")}
          />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;

