import React, { useEffect, useRef } from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';
import confetti from 'canvas-confetti';

interface ProgressCircleProps {
  current: number;
  target: number;
}

const ProgressCircle: React.FC<ProgressCircleProps> = ({ current, target }) => {
  const actualPercentage = target > 0 ? (current / target) * 100 : 0;
  const chartPercentage = Math.min(actualPercentage, 100);
  const goalReached = actualPercentage >= 100;
  const hasTriggeredConfetti = useRef(false);

  const data = [{ name: 'progress', value: chartPercentage }];
  const formattedCurrent = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(current);

  // Reseta o controle de animação quando a meta deixa de estar batida
  useEffect(() => {
    if (!goalReached) {
      hasTriggeredConfetti.current = false;
    }
  }, [goalReached]);

  useEffect(() => {
    if (goalReached && !hasTriggeredConfetti.current) {
      hasTriggeredConfetti.current = true;

      // Animação de confetti celebratória
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval: NodeJS.Timeout = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

      // Cleanup: limpa o intervalo se o componente for desmontado antes da animação terminar
      return () => {
        clearInterval(interval);
      };
    }
  }, [goalReached]);

  return (
    <div className="relative w-64 h-64 sm:w-80 sm:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          innerRadius="70%"
          outerRadius="100%"
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            background
            dataKey="value"
            cornerRadius={30}
            className={goalReached ? "fill-green-500" : "fill-brand-yellow"}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {goalReached && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-full font-bold text-sm sm:text-base shadow-lg animate-bounce">
            🎉 Meta Batida! 🎉
          </div>
        )}
        <span className={`text-4xl sm:text-5xl font-bold ${goalReached ? 'text-green-500' : 'text-text-primary'}`}>
          {actualPercentage.toFixed(1)}%
        </span>
        <span className="text-lg text-text-secondary mt-2">{formattedCurrent}</span>
        {goalReached && (
          <span className="text-sm text-green-500 font-semibold mt-1">
            Parabéns! 🎊
          </span>
        )}
      </div>
    </div>
  );
};

export default ProgressCircle;