import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";
import { Users, Play, Clock, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { api } from "../lib/authClient";
import { App } from '@capacitor/app';
import type { PluginListenerHandle } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { useAuth } from "@/context/AuthContext";

const vrRooms = [
  {
    id: 1,
    name: "VR Kahoot",
    subject: "General",
    description: "Attend quiz in a virtual reality setting",
    players: 5,
    maxPlayers: 25,
    icon: "🧠",
    color: "from-blue-500 to-indigo-500",
  },
  {
    id: 2,
    name: "VR Classroom",
    subject: "General",
    description: "Join a virtual reality classroom session",
    players: 7,
    maxPlayers: 30,
    icon: "🏫",
    color: "from-yellow-500 to-red-500",
  },
  {
    id: 3,
    name: "Cell City Siege",
    subject: "Biology",
    description: "Battle viruses inside a 3D cell",
    players: 12,
    maxPlayers: 20,
    icon: "🦠",
    color: "from-green-500 to-emerald-500",
  },
  {
    id: 4,
    name: "Molecule Builder",
    subject: "Chemistry",
    description: "Build 3D molecules in VR",
    players: 8,
    maxPlayers: 15,
    icon: "⚗️",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: 5,
    name: "Anatomy VR Labroom",
    subject: "Biology",
    description: "Explore 3D anatomy models in a virtual lab",
    players: 10,
    maxPlayers: 20,
    icon: "💀",
    color: "from-red-500 to-orange-500",
  }
];

const Playground = () => {

  const { fetchUser } = useAuth();
  const appStateListenerRef = useRef<PluginListenerHandle | null>(null);

  useEffect(() => {
    const processReward = async () => {
      const startTimeStr = localStorage.getItem("vrGameStartTime");
      const roomName = localStorage.getItem("vrGameRoomName");

      if (startTimeStr && roomName) {
        const startTime = parseInt(startTimeStr, 10);
        const now = Date.now();
        const duration = Math.round((now - startTime) / 1000);

        // --- Session Expiry Check ---
        // If duration > 2 hours, assume the user left the app or forgot.
        const MAX_SESSION_TIME = 7200; 
        if (duration > MAX_SESSION_TIME) {
          localStorage.removeItem("vrGameStartTime");
          localStorage.removeItem("vrGameRoomName");
          toast.error("VR Session expired. Join again to earn tokens.");
          return;
        }

        // Clear immediately to prevent double-claiming on accidental re-focus
        localStorage.removeItem("vrGameStartTime");
        localStorage.removeItem("vrGameRoomName");

        // Reward only if they spent more than 15 seconds
        if (duration > 15) {
          try {
            toast.info(`Calculating rewards for your time in ${roomName}...`);
            const response = await api.post("/lectures/reward-time/", { duration });
            
            const { xp_awarded, tokens_awarded } = response.data;
            
            let rewardMessage = "You've been rewarded!";
            if (xp_awarded > 0 && tokens_awarded > 0) {
              rewardMessage = `You earned ${xp_awarded} XP and ${tokens_awarded} EDU!`;
            } else if (xp_awarded > 0) {
              rewardMessage = `You earned ${xp_awarded} XP!`;
            } else if (tokens_awarded > 0) {
              rewardMessage = `You earned ${tokens_awarded} EDU!`;
            }

            toast.success(rewardMessage);
            await fetchUser(); // Refetch user data to update profile
            
          } catch (error) {
            console.error("Failed to award time:", error);
            toast.error("Could not process your reward.");
          }
        }
      }
    };

    // Mobile: Fires when returning to the app from the In-App Browser
    const setupListeners = async () => {
        appStateListenerRef.current = await App.addListener('appStateChange', ({ isActive }) => {
            if (isActive) {
              processReward();
            }
        });
    };
    setupListeners();

    // Web: Fires when the browser tab regains focus
    window.addEventListener("focus", processReward);

    return () => {
      if (appStateListenerRef.current) {
        appStateListenerRef.current.remove();
      }
      window.removeEventListener("focus", processReward);
    };
  }, [fetchUser]);

  const handleJoinRoom = async (room: typeof vrRooms[0]) => {
    // 1. Mark the start time ONLY upon manual click
    localStorage.setItem("vrGameStartTime", Date.now().toString());
    localStorage.setItem("vrGameRoomName", room.name);

    const urls: Record<string, string> = {
      "Cell City Siege": "https://blood-game-c44cb.web.app/",
      "Molecule Builder": "https://molecule-builder-911c7.web.app/",
      "Anatomy VR Labroom": "https://my-anatomy-vr-2026.web.app/",
      "VR Kahoot": "https://18.60.212.203:8080/",
      "VR Classroom": "https://dclassroom-d128d.web.app/",
    };

    const targetUrl = urls[room.name];

    if (targetUrl) {
      // 2. Open in-app browser (Mobile) or new tab (Web)
      // This maintains the "Lounge" state in the background
      await Browser.open({ url: targetUrl });
    } else {
      toast.error("Room link not found.");
      localStorage.removeItem("vrGameStartTime");
    }
  };

  return (
    <div className="pb-20 px-4 pt-6 max-w-lg mx-auto min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gradient mb-2">VR Lounge</h1>
        <p className="text-muted-foreground">Jump into immersive learning games</p>
      </div>

      {/* Lobby Banner */}
      <Card className="p-6 mb-6 shadow-float gradient-cyber text-center">
        <div className="text-5xl mb-3 animate-float">🎮</div>
        <h2 className="text-xl font-bold text-primary-foreground mb-2">
          Virtual Campus Lobby
        </h2>
        <p className="text-sm text-primary-foreground/80">
          Choose a portal to enter a subject's VR game world
        </p>
      </Card>

      {/* Rooms List */}
      <div className="space-y-4">
        {vrRooms.map((room) => (
          <Card
            key={room.id}
            className="p-4 shadow-card gradient-card border-border hover:border-accent/50 transition-all hover:shadow-float"
          >
            <div className="flex gap-4">
              <div
                className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${room.color} flex items-center justify-center text-4xl flex-shrink-0 shadow-lg`}
              >
                {room.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <h3 className="font-bold text-foreground">{room.name}</h3>
                    <p className="text-xs text-accent">{room.subject}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-accent/10 px-2 py-1 rounded-full">
                    <Users className="w-4 h-4 text-accent" />
                    <span className="text-xs font-semibold text-accent">
                      {room.players}/{room.maxPlayers}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{room.description}</p>
                <Button
                  className="w-full gradient-neon glow-cyan hover:scale-105 transition-all"
                  onClick={() => handleJoinRoom(room)}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Join Room
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Info Notice */}
      <div className="mt-6 space-y-3">
        <Card className="p-4 shadow-card gradient-card border-secondary/30 flex items-center gap-3">
          <Clock className="w-5 h-5 text-secondary" />
          <p className="text-sm text-muted-foreground">
            Earn <span className="font-bold text-secondary">1 EDU Token</span> for every minute spent learning in VR!
          </p>
        </Card>
        
        <Card className="p-4 shadow-card gradient-card border-red-500/20 flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-red-400" />
          <p className="text-sm text-muted-foreground">
            Sessions over 2 hours will be marked as expired.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Playground;