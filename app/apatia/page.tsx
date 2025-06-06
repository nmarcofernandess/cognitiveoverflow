"use client";

import React from 'react';
import ApatiaPart1 from '../../components/apatia/part1';
import ApatiaPart2 from '../../components/apatia/part2';
import ApatiaPart3 from '../../components/apatia/part3';
import ApatiaPart4 from '../../components/apatia/part4';

export default function ApatiaPage() {
  return (
    <div className="min-h-screen">
      {/* Part 1: Introduction + Philosophical Diagnosis + Neurobiological Foundation + Contexto Moderno */}
      <ApatiaPart1 />
      
      {/* Part 2: Vulnerabilidade aos 30 + Fatores Ocultos */}
      <ApatiaPart2 />
      
      {/* Part 3: Superação Comunitária + Estratégias Integradas */}
      <ApatiaPart3 />
      
      {/* Part 4: Verdades Profundas e Conclusão */}
      <ApatiaPart4 />
    </div>
  );
} 