import { useState, useEffect } from "react";
import { Zap, Coins, Flame, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { fetchWalletInfo } from "@/lib/authClient";

type WalletInfo = {
  address: string | null;
  balance: number;
  symbol: string;
};

const subjects = [
  {
    id: "maths",
    name: "Maths",
    icon: "🔢",
    color: "from-blue-500 to-cyan-500",
    progress: 65,
  },
  {
    id: "physics",
    name: "Physics",
    icon: "⚛️",
    color: "from-purple-500 to-pink-500",
    progress: 42,
  },
  {
    id: "chemistry",
    name: "Chemistry",
    icon: "🧪",
    color: "from-green-500 to-emerald-500",
    progress: 78,
  },
  {
    id: "anatomy",
    name: "Anatomy",
    icon: "🦴",
    color: "from-orange-500 to-red-500",
    progress: 55,
  },
];

const Home = () => {
  const navigate = useNavigate();
  const { user, fetchUser } = useAuth();
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);

  // Sync all data on mount
  useEffect(() => {
    const loadData = async () => {
      await fetchUser(); // Update XP and Streak
      const walletData = await fetchWalletInfo(); // Update EduCoins
      setWalletInfo(walletData);
    };
    loadData();
  }, [fetchUser]);

  // Dynamic calculations based on live XP
  const userLevel = Math.floor((user?.xp || 0) / 1000);
  const nextLevelThreshold = (userLevel + 1) * 1000;
  const xpProgress = user?.xp ? ((user.xp % 1000) / 10) : 0;
  const streak = (user as any)?.streak ?? 0;
  
  // Use wallet balance if address is linked, otherwise 0
  const eduCoins = walletInfo && walletInfo.address ? walletInfo.balance : 0;

  return (
    <div className="pb-20 px-4 pt-6 max-w-lg mx-auto min-h-screen">
      {/* Header with Level Badge */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gradient mb-2">GURUKUL</h1>
          <p className="text-muted-foreground">Welcome back, {user?.username}!</p>
        </div>
        <div className="flex items-center gap-2 bg-accent/10 px-3 py-2 rounded-xl border border-accent/20">
          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          <span className="font-bold text-accent">Lvl {userLevel}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card className="p-4 shadow-card gradient-card border-accent/20 text-center">
          <div className="flex flex-col items-center">
            <Flame className="w-6 h-6 text-orange-500 mb-1" />
            <p className="text-xl font-bold">{streak}</p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Streak</p>
          </div>
        </Card>

        <Card className="p-4 shadow-card gradient-card border-accent/20 text-center">
          <div className="flex flex-col items-center">
            <Zap className="w-6 h-6 text-accent mb-1" />
            <p className="text-xl font-bold">{user?.xp || 0}</p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total XP</p>
          </div>
        </Card>

        <Card className="p-4 shadow-card gradient-card border-secondary/20 text-center">
          <div className="flex flex-col items-center">
            <Coins className="w-6 h-6 text-secondary mb-1" />
            <p className="text-xl font-bold">{eduCoins}</p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Coins</p>
          </div>
        </Card>
      </div>

      {/* Level Progress Banner */}
      <Card className="p-4 mb-6 shadow-float gradient-cyber border-none">
        <div className="flex justify-between text-sm text-primary-foreground font-medium mb-2">
          <span>Level {userLevel} Progress</span>
          <span>{user?.xp || 0} / {nextLevelThreshold} XP</span>
        </div>
        <Progress value={xpProgress} className="h-2 bg-white/20" />
      </Card>

      {/* Subjects Section */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Your Subjects</h2>
        <div className="grid grid-cols-2 gap-4">
          {subjects.map((subject) => (
            // Inside Home.tsx - Subjects Section map
<Card
  key={subject.id}
  className="p-5 cursor-pointer transition-all hover:scale-105 hover:shadow-float shadow-card gradient-card border-border"
  // CHANGE THIS: Use subject.id instead of subject.name
  onClick={() => navigate(`/subject/${subject.id}`)}
>
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${subject.color} flex items-center justify-center text-2xl mb-3 shadow-lg`}
              >
                {subject.icon}
              </div>
              <h3 className="font-semibold mb-2 text-foreground">{subject.name}</h3>
              <div className="space-y-2">
                <Progress value={subject.progress} className="h-1.5" />
                <p className="text-[10px] text-muted-foreground uppercase font-bold">{subject.progress}% Mastered</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="p-4 shadow-card gradient-card border-accent/20">
        <h3 className="font-semibold text-foreground mb-3">Continue Your Quest</h3>
        <div className="grid grid-cols-2 gap-3">
          <button 
            className="flex flex-col items-center gap-2 bg-accent/5 hover:bg-accent/10 border border-accent/10 rounded-xl p-4 transition-all"
            onClick={() => navigate('/courses')}
          >
            <span className="text-2xl">📚</span>
            <span className="text-xs font-bold text-accent">Study</span>
          </button>
          <button 
            className="flex flex-col items-center gap-2 bg-secondary/5 hover:bg-secondary/10 border border-secondary/10 rounded-xl p-4 transition-all"
            onClick={() => navigate('/lounge')}
          >
            <span className="text-2xl">🎮</span>
            <span className="text-xs font-bold text-secondary">VR Lounge</span>
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Home;