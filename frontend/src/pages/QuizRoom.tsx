import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { submitQuizScore } from "@/lib/authClient";
import { BarChart, Check, X, Award } from "lucide-react";

interface Question {
  q: string;
  options: string[];
  correct: number;
}

interface LocationState {
  questions: Question[];
}

const QuizRoom = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { subjectId } = useParams<{ subjectId: string }>();
  const questions = (location.state as LocationState)?.questions || [];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);

  useEffect(() => {
    if (!questions || questions.length === 0) {
      navigate("/lounge");
    }
  }, [questions, navigate]);

  const handleOptionSelect = (optionIndex: number) => {
    if (isAnswered) return;
    setSelectedOption(optionIndex);
  };

  const handleAction = () => {
    if (isAnswered) {
      // Logic for moving to next question
      setSelectedOption(null);
      setIsAnswered(false);
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Logic for checking answer
      if (selectedOption === null) return;
      const correctOptionIndex = questions[currentQuestionIndex].correct;
      if (selectedOption === correctOptionIndex) {
        setScore(prev => prev + 20);
      }
      setIsAnswered(true);
    }
  };

  const handleSubmitScore = async () => {
    try {
      if (subjectId) {
        await submitQuizScore(subjectId, score);
        navigate("/lounge");
      }
    } catch (error) {
      console.error("Failed to submit score:", error);
      alert("Error submitting score. Please try again.");
    }
  };

  if (!questions || questions.length === 0) {
    return <div className="flex justify-center items-center h-screen animate-pulse">Initializing Quiz...</div>;
  }

  // Quiz Results View
  if (currentQuestionIndex >= questions.length) {
    return (
      <div className="p-6 text-center space-y-6 max-w-lg mx-auto min-h-screen flex flex-col justify-center">
        <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Award className="w-12 h-12 text-accent" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Quiz Complete!</h1>
        <Card className="p-8 border-accent/20 gradient-card shadow-card">
          <p className="text-sm uppercase font-bold text-muted-foreground mb-2">Your Performance</p>
          <div className="text-5xl font-black text-foreground mb-2">{score}</div>
          <p className="text-xs text-accent font-bold tracking-widest">XP EARNED</p>
        </Card>
        <Button onClick={handleSubmitScore} className="w-full h-12 text-lg font-bold shadow-lg">
          Claim Rewards
        </Button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="pb-20 px-4 pt-6 max-w-lg mx-auto min-h-screen space-y-6">
      <div className="flex justify-between items-end px-2">
        <div>
          <p className="text-[10px] uppercase font-bold tracking-widest text-accent">{subjectId} Challenge</p>
          <h1 className="text-2xl font-black tracking-tight italic uppercase">Round {currentQuestionIndex + 1}</h1>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Score</p>
          <span className="text-2xl font-black text-foreground tracking-tighter">{score}</span>
        </div>
      </div>

      <Card className="p-6 space-y-6 border-accent/10 shadow-card bg-card/50 backdrop-blur-sm">
        <div className="flex justify-between items-center border-b border-border pb-4">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            {currentQuestionIndex + 1} of {questions.length} Questions
          </h2>
          <div className="flex items-center gap-2 bg-secondary/10 px-3 py-1 rounded-full">
            <BarChart className="w-3 h-3 text-secondary-foreground" />
            <span className="text-[10px] font-bold text-secondary-foreground uppercase">20 Points</span>
          </div>
        </div>
        
        <p className="text-lg font-medium leading-relaxed text-foreground">
          {currentQuestion.q}
        </p>

        <div className="grid grid-cols-1 gap-3">
          {currentQuestion.options.map((option, index) => {
            const isCorrect = index === currentQuestion.correct;
            const isSelected = selectedOption === index;
            
            let variant: "outline" | "default" = "outline";
            let stateClass = "border-accent/10 bg-accent/5";

            if (isAnswered) {
              if (isCorrect) stateClass = "bg-green-500/20 border-green-500 text-green-500 font-bold";
              else if (isSelected) stateClass = "bg-red-500/20 border-red-500 text-red-500 font-bold";
              else stateClass = "opacity-40 border-border";
            } else if (isSelected) {
              stateClass = "border-accent bg-accent/20 ring-2 ring-accent ring-offset-2 ring-offset-background";
            }

            return (
              <Button
                key={index}
                variant={variant}
                // whitespace-normal allows text to wrap, break-words handles very long continuous strings
                className={`group relative justify-start text-left h-auto py-4 px-4 whitespace-normal break-words transition-all duration-200 ${stateClass}`}
                onClick={() => handleOptionSelect(index)}
                disabled={isAnswered}
              >
                <span className="flex-1 pr-6">{option}</span>
                {isAnswered && isCorrect && <Check className="absolute right-4 w-5 h-5 text-green-500 animate-in zoom-in duration-300" />}
                {isAnswered && isSelected && !isCorrect && <X className="absolute right-4 w-5 h-5 text-red-500 animate-in zoom-in duration-300" />}
              </Button>
            );
          })}
        </div>

        <Button
          onClick={handleAction}
          disabled={selectedOption === null}
          className={`w-full h-14 text-lg font-black uppercase tracking-widest shadow-xl transition-all ${
            isAnswered ? "bg-foreground text-background hover:bg-foreground/90" : "bg-primary"
          }`}
        >
          {isAnswered ? "Continue" : "Confirm Answer"}
        </Button>
      </Card>
    </div>
  );
};

export default QuizRoom;