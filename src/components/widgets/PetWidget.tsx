import React, { useState } from 'react';
import { useDockStore } from '../../stores/dockStore';
import { Zap, Moon } from 'lucide-react';

export const PetWidget: React.FC = () => {
  const { metrics } = useDockStore();
  const [petType, setPetType] = useState<'cat' | 'dog' | 'dragon'>('cat');

  const cpu = metrics?.cpu_usage || 15;

  // Estados: 'sleeping' (<25%), 'walking' (25%-60%), 'running' (>60%)
  const state = cpu > 60 ? 'running' : cpu > 25 ? 'walking' : 'sleeping';

  const togglePet = () => {
    if (petType === 'cat') setPetType('dog');
    else if (petType === 'dog') setPetType('dragon');
    else setPetType('cat');
  };

  const getPetEmoji = () => {
    switch (petType) {
      case 'dog':
        return state === 'running' ? '🐕💨' : state === 'walking' ? '🐕' : '🐶💤';
      case 'dragon':
        return state === 'running' ? '🐉🔥' : state === 'walking' ? '🐉' : '🐲💤';
      case 'cat':
      default:
        return state === 'running' ? '🐈💨' : state === 'walking' ? '🐈' : '🐱💤';
    }
  };

  const getStateDescription = () => {
    switch (state) {
      case 'running':
        return 'Correndo a todo vapor!';
      case 'walking':
        return 'Passeando tranquilo';
      case 'sleeping':
      default:
        return 'Tirando um cochilo...';
    }
  };

  return (
    <div 
      onClick={togglePet}
      className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 transition-all duration-200 cursor-pointer shadow-sm group select-none ${
        state === 'running' ? 'animate-bounce-subtle border-amber-400/40' : ''
      }`}
      title={`Mascote (${petType.toUpperCase()}): ${getStateDescription()} | CPU: ${Math.round(cpu)}%. Clique para trocar de bichinho.`}
    >
      {/* Indicador de Status */}
      <div className="absolute top-1 right-1.5 flex items-center">
        {state === 'running' ? (
          <Zap className="w-2.5 h-2.5 text-amber-400 animate-pulse" />
        ) : state === 'sleeping' ? (
          <Moon className="w-2.5 h-2.5 text-blue-300 opacity-60" />
        ) : (
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        )}
      </div>

      {/* Ícone do Mascote */}
      <div className={`text-lg transition-transform duration-300 ${
        state === 'running' ? 'scale-125' : state === 'walking' ? 'scale-105' : 'scale-90 opacity-80'
      }`}>
        {getPetEmoji()}
      </div>

      {/* Rótulo inferior */}
      <span className="text-[8px] font-semibold text-white/50 leading-none mt-0.5">
        {state === 'running' ? 'Corrida' : state === 'walking' ? 'Ativo' : 'Soneca'}
      </span>
    </div>
  );
};
