import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Box, Trophy, Users, Zap, Loader2, Radio, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateQuizQuestions, api } from "@/lib/authClient";
import { App } from '@capacitor/app';
import type { PluginListenerHandle } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const Lounge = () => {
  const navigate = useNavigate();
  const { fetchUser } = useAuth();
  const [loadingSubject, setLoadingSubject] = useState<string | null>(null);
  const appStateListenerRef = useRef<PluginListenerHandle | null>(null);

  // --- START REWARD LOGIC ---
  useEffect(() => {
    const processReward = async () => {
      const startTimeStr = localStorage.getItem("vrGameStartTime");
      const roomName = localStorage.getItem("vrGameRoomName");

      if (startTimeStr && roomName) {
        const startTime = parseInt(startTimeStr, 10);
        const duration = Math.round((Date.now() - startTime) / 1000);

        const MAX_SESSION_TIME = 7200; 
        if (duration > MAX_SESSION_TIME) {
          localStorage.removeItem("vrGameStartTime");
          localStorage.removeItem("vrGameRoomName");
          toast.error("VR Session expired. Join again to earn tokens.");
          return;
        }

        localStorage.removeItem("vrGameStartTime");
        localStorage.removeItem("vrGameRoomName");

        if (duration > 15) {
          try {
            toast.info(`Calculating rewards for your time in ${roomName}...`);
            const response = await api.post("/lectures/reward-time/", { duration });
            const { xp_awarded, tokens_awarded } = response.data;
            
            let rewardMessage = "You've been rewarded!";
            if (xp_awarded > 0 && tokens_awarded > 0) rewardMessage = `You earned ${xp_awarded} XP and ${tokens_awarded} EDU!`;
            else if (xp_awarded > 0) rewardMessage = `You earned ${xp_awarded} XP!`;
            else if (tokens_awarded > 0) rewardMessage = `You earned ${tokens_awarded} EDU!`;

            toast.success(rewardMessage);
            await fetchUser(); 
          } catch (error) {
            console.error("Failed to award time:", error);
            toast.error("Could not process your reward.");
          }
        }
      }
    };

    const setupListeners = async () => {
      appStateListenerRef.current = await App.addListener('appStateChange', ({ isActive }) => {
        if (isActive) processReward();
      });
    };
    setupListeners();

    window.addEventListener("focus", processReward);

    return () => {
      appStateListenerRef.current?.remove();
      window.removeEventListener("focus", processReward);
    };
  }, [fetchUser]);
  // --- END REWARD LOGIC ---

  const subjects = [
    { id: "Biology", name: "Life Sciences", icon: "🧬", color: "from-green-500 to-emerald-500", players: 4 },
    { id: "Chemistry", name: "Atomic Lab", icon: "🧪", color: "from-purple-500 to-pink-500", players: 2 },
    { id: "Math", name: "Logic Arena", icon: "🔢", color: "from-blue-500 to-cyan-500", players: 7 },
  ];

  const handleEnterRoom = async (subjectId: string) => {
    try {
      setLoadingSubject(subjectId);
      const data = await generateQuizQuestions(subjectId);
      navigate(`/quiz-room/${subjectId}`, { state: { questions: data.questions } });
    } catch (error) {
      console.error("Failed to generate quiz:", error);
      alert("AI Lab is busy. Please try again in a moment.");
    } finally {
      setLoadingSubject(null);
    }
  };

  const handleVRArenaClick = async () => {
    // Logic updated to match Playground.tsx behavior
    localStorage.setItem("vrGameStartTime", Date.now().toString());
    localStorage.setItem("vrGameRoomName", "VR Arena");
    
    // If you want the "VR Arena" button to open a specific link immediately like Playground:
    const targetUrl = "https://18.60.212.203:8080/"; // Example default VR link
    await Browser.open({ url: targetUrl });
    
    // Or, if you want it to just navigate to the playground:
    // navigate('/playground'); 
  };

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto min-h-screen space-y-8 bg-background/50">
      {/* Dynamic Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-accent/20 to-transparent p-6 border border-accent/10 shadow-2xl">
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-tighter uppercase italic">
              The Lounge
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                13 Players Online
              </p>
            </div>
          </div>

          <Button 
            variant="outline" 
            size="sm"
            className="group gap-2 border-accent/30 bg-background/50 backdrop-blur-md hover:bg-accent/20 transition-all rounded-full"
            onClick={handleVRArenaClick}
          >
            <Box className="w-4 h-4 text-accent group-hover:rotate-12 transition-transform" />
            <span className="font-black text-[10px] uppercase">VR Arena</span>
          </Button>
        </div>
        
        <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-accent/20 blur-[50px] rounded-full" />
      </div>

      {/* Main Subject Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Radio className="w-3 h-3" /> Select Category
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {subjects.map((s) => (
            <Card 
              key={s.id}
              className={`group p-1 transition-all duration-300 hover:scale-[1.01] active:scale-[0.98] border-none bg-gradient-to-r ${s.color} shadow-lg ${
                loadingSubject === s.id ? "opacity-70 grayscale" : ""
              }`}
              onClick={() => handleEnterRoom(s.id)}
            >
              <div className="bg-card rounded-[calc(var(--radius)-2px)] p-5 relative overflow-hidden h-full">
                <div className="flex items-center gap-5 relative z-10">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                    {loadingSubject === s.id ? <Loader2 className="animate-spin w-6 h-6 text-white" /> : s.icon}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-black text-xl tracking-tight text-foreground group-hover:text-accent transition-colors">
                      {s.name}
                    </h3>
                    <div className="flex gap-4 mt-2">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">{s.players} Active</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-accent" />
                        <span className="text-[10px] font-bold text-accent uppercase">+100 XP</span>
                      </div>
                    </div>
                  </div>
                  <Trophy className="w-8 h-8 text-muted-foreground/10 group-hover:text-accent/20 transition-colors" />
                </div>
                <div className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="p-4 rounded-2xl border border-dashed border-muted-foreground/20 bg-muted/5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
          <Award className="w-5 h-5 text-accent" />
        </div>
        <div>
          <p className="text-xs font-bold text-foreground">Global Tournament Starting Soon</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Join the waitlist for the Science Cup</p>
        </div>
      </div>
    </div>
  );
};

export default Lounge;