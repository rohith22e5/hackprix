import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

const AIChatbot = () => {
  return (
    <Button
      size="icon"
      className="fixed bottom-20 right-4 w-14 h-14 rounded-full gradient-neon shadow-float animate-pulse-glow z-40"
      onClick={() => alert("Nova AI Assistant - Coming soon! 🤖")}
    >
      <Bot className="w-7 h-7 text-primary-foreground" />
    </Button>
  );
};

export default AIChatbot;