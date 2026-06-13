import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, PlayCircle, BookOpen } from "lucide-react";

const subjectData: Record<string, any> = {
  // Ensure these keys match the IDs sent from Home.tsx
  maths: { // Changed from 'math' to 'maths' to match Home.tsx id
    name: "Mathematics",
    icon: "🔢",
    color: "from-blue-500 to-cyan-500",
    topics: [
      { id: 1, title: "Algebra Basics", progress: 100, lessons: 12 },
      { id: 2, title: "Geometry", progress: 75, lessons: 10 },
    ],
  },
  physics: {
    name: "Physics",
    icon: "⚛️",
    color: "from-purple-500 to-pink-500",
    topics: [
      { id: 1, title: "Mechanics", progress: 60, lessons: 14 },
    ],
  },
  chemistry: {
    name: "Chemistry",
    icon: "🧪",
    color: "from-green-500 to-emerald-500",
    topics: [
      { id: 1, title: "Atomic Structure", progress: 90, lessons: 8 },
    ],
  },
  anatomy: { // Added this to match the Anatomy card on Home
    name: "Anatomy",
    icon: "🦴",
    color: "from-orange-500 to-red-500",
    topics: [
      { id: 1, title: "Skeletal System", progress: 55, lessons: 10 },
    ],
  },
};

const SubjectDetail = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const subject = subjectId ? subjectData[subjectId] : null;

  if (!subject) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Subject not found</p>
      </div>
    );
  }

  return (
    <div className="pb-20 px-4 pt-6 max-w-lg mx-auto min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          size="icon"
          variant="outline"
          onClick={() => navigate("/")}
          className="rounded-xl"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div
          className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${subject.color} flex items-center justify-center text-3xl shadow-lg`}
        >
          {subject.icon}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gradient">{subject.name}</h1>
          <p className="text-sm text-muted-foreground">{subject.topics.length} topics</p>
        </div>
      </div>

      {/* Overview Card */}
      <Card className="p-5 mb-6 shadow-float gradient-cyber">
        <h3 className="font-semibold text-primary-foreground mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <button className="bg-white/10 hover:bg-white/20 backdrop-blur text-primary-foreground rounded-xl p-3 text-sm font-medium transition-all flex items-center justify-center gap-2">
            <PlayCircle className="w-4 h-4" />
            Watch Lesson
          </button>
          <button className="bg-white/10 hover:bg-white/20 backdrop-blur text-primary-foreground rounded-xl p-3 text-sm font-medium transition-all flex items-center justify-center gap-2">
            <BookOpen className="w-4 h-4" />
            Read Notes
          </button>
        </div>
      </Card>

      {/* Topics List */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Topics</h2>
        <div className="space-y-3">
          {subject.topics.map((topic: any) => (
            <Card
              key={topic.id}
              className="p-4 shadow-card gradient-card border-border hover:border-accent/50 transition-all cursor-pointer"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-foreground">{topic.title}</h3>
                  <p className="text-sm text-muted-foreground">{topic.lessons} lessons</p>
                </div>
                <span className="text-sm font-bold text-accent">{topic.progress}%</span>
              </div>
              <Progress value={topic.progress} className="h-2" />
              {topic.progress === 100 && (
                <p className="text-xs text-accent mt-2 flex items-center gap-1">
                  ✅ Completed
                </p>
              )}
              {topic.progress === 0 && (
                <p className="text-xs text-muted-foreground mt-2">Not started</p>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* VR Game Promo */}
      <Card className="p-5 shadow-card gradient-neon text-center">
        <div className="text-4xl mb-3 animate-float">🎮</div>
        <h3 className="font-bold text-white mb-2">Play VR Games</h3>
        <p className="text-sm text-white/80 mb-4">
          Practice {subject.name} concepts in immersive VR environments
        </p>
        <Button
          className="bg-white text-primary hover:bg-white/90 glow-cyan"
          onClick={() => navigate("/lounge")}
        >
          Go to VR Lounge
        </Button>
      </Card>
    </div>
  );
};

export default SubjectDetail;
