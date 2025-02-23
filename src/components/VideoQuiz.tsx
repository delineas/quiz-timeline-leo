
import React, { useState, useRef, useEffect } from 'react';
import YouTube from 'react-youtube';
import { toast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface Question {
  id: number;
  timeStamp: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

const questions: Question[] = [
  {
    id: 1,
    timeStamp: 42,
    question: "¿Qué estrategia están usando las leonas para cazar?",
    options: ["Caza en solitario", "Caza en grupo coordinado"],
    correctAnswer: 1
  },
  {
    id: 2,
    timeStamp: 120,
    question: "¿Qué hace la leona principal durante la persecución?",
    options: ["Corre directamente hacia la presa", "Conduce a la presa hacia sus compañeras"],
    correctAnswer: 1
  },
  {
    id: 3,
    timeStamp: 180,
    question: "¿Cuál es el papel de las leonas que esperan?",
    options: ["Descansar mientras las otras cazan", "Preparar una emboscada"],
    correctAnswer: 1
  },
  {
    id: 4,
    timeStamp: 300,
    question: "¿Por qué es efectiva esta técnica de caza?",
    options: ["Porque las leonas son muy rápidas", "Porque combina persecución y emboscada"],
    correctAnswer: 1
  }
];

const VideoQuiz = () => {
  const [player, setPlayer] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const timeUpdateInterval = useRef<number>();

  const onPlayerReady = (event: any) => {
    setPlayer(event.target);
    timeUpdateInterval.current = window.setInterval(() => {
      setCurrentTime(event.target.getCurrentTime());
    }, 1000);
  };

  const onPlayerStateChange = (event: any) => {
    if (event.data === YouTube.PlayerState.ENDED) {
      setShowResults(true);
      clearInterval(timeUpdateInterval.current);
    }
  };

  useEffect(() => {
    const currentQuestion = questions.find(q => 
      q.timeStamp <= currentTime && 
      !answeredQuestions.has(q.id) &&
      (!activeQuestion || q.id > activeQuestion.id)
    );

    if (currentQuestion && currentQuestion !== activeQuestion) {
      setActiveQuestion(currentQuestion);
      setSelectedOption(null);
      player?.pauseVideo();
      toast({
        title: "Nueva pregunta disponible",
        description: "¡Responde para continuar viendo el video!",
        className: "bg-lionGold text-white",
      });
    }
  }, [currentTime, activeQuestion, answeredQuestions]);

  const handleAnswerSubmit = (optionIndex: number) => {
    if (!activeQuestion || selectedOption !== null) return;
    
    setSelectedOption(optionIndex);
    const isCorrect = optionIndex === activeQuestion.correctAnswer;
    
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      toast({
        title: "¡Correcto!",
        description: "¡Muy bien! Continúa viendo el video.",
        className: "bg-green-500 text-white",
      });
    } else {
      toast({
        title: "Incorrecto",
        description: "No te preocupes, sigue aprendiendo.",
        className: "bg-red-500 text-white",
      });
    }

    setTimeout(() => {
      setAnsweredQuestions(prev => new Set([...prev, activeQuestion.id]));
      setActiveQuestion(null);
      player?.playVideo();
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 min-h-screen flex flex-col items-center justify-center">
      <div className="w-full aspect-video relative rounded-lg overflow-hidden shadow-xl">
        <YouTube
          videoId="1TVQtt_VCts"
          opts={{
            height: '100%',
            width: '100%',
            playerVars: {
              autoplay: 1,
              modestbranding: 1,
              rel: 0,
            },
          }}
          onReady={onPlayerReady}
          onStateChange={onPlayerStateChange}
          className="absolute inset-0"
        />
      </div>

      <div className="w-full h-2 bg-sand/30 rounded-full relative">
        {questions.map((q) => (
          <div
            key={q.id}
            className={`timeline-dot absolute top-1/2 -translate-y-1/2 ${
              answeredQuestions.has(q.id) ? 'completed' :
              activeQuestion?.id === q.id ? 'active' : ''
            }`}
            style={{
              left: `${(q.timeStamp / 335) * 100}%`,
            }}
          />
        ))}
        <div
          className="h-full bg-lionGold rounded-full transition-all duration-300"
          style={{ width: `${(currentTime / 335) * 100}%` }}
        />
      </div>

      {activeQuestion && (
        <div className="question-card animate-fadeIn w-full">
          <h3 className="text-xl font-semibold mb-4">{activeQuestion.question}</h3>
          <div className="space-y-4">
            {activeQuestion.options.map((option, index) => (
              <button
                key={index}
                className={`option-button ${
                  selectedOption === index
                    ? index === activeQuestion.correctAnswer
                      ? 'correct'
                      : 'incorrect'
                    : ''
                }`}
                onClick={() => handleAnswerSubmit(index)}
                disabled={selectedOption !== null}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}

      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="bg-white/95 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle>Resultados del Quiz</DialogTitle>
            <DialogDescription>
              Has acertado {correctAnswers} de {questions.length} preguntas.
              {correctAnswers === questions.length ? (
                <p className="mt-2 text-green-600">¡Perfecto! ¡Has demostrado ser un experto en el comportamiento de los leones!</p>
              ) : (
                <p className="mt-2 text-savanna">¡Buen intento! Puedes volver a ver el video para mejorar tu puntuación.</p>
              )}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VideoQuiz;
