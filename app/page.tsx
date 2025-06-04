"use client";

import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function CognitiveOverflowDashboard() {
  const [matrixRain, setMatrixRain] = useState('');
  const [glitchActive, setGlitchActive] = useState(false);

  // Matrix rain effect
  useEffect(() => {
    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    const generateRain = () => {
      let result = '';
      for (let i = 0; i < 100; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };
    
    const interval = setInterval(() => {
      setMatrixRain(generateRain());
    }, 200);
    
    return () => clearInterval(interval);
  }, []);

  // Glitch effect trigger
  const triggerGlitch = () => {
    setGlitchActive(true);
    setTimeout(() => setGlitchActive(false), 300);
  };

  const projects = [
    {
      id: 'marco',
      title: "MARCO'S PERSONALITY TRIP",
      subtitle: "Neural Analysis Protocol",
      description: "Mergulhe na análise multidimensional da mente de Marco. Uma viagem psicodélica pelos padrões de personalidade, temperamentos e arquétipos comportamentais.",
      path: "/marco",
      color: "from-purple-500/20 to-pink-500/20",
      borderColor: "border-purple-500/40",
      glowColor: "shadow-purple-500/30",
      emoji: "🧠",
      status: "ACTIVE",
      tags: ["Personality", "Psychology", "Analysis"]
    },
    {
      id: 'matrix',
      title: "THE MATRIX",
      subtitle: "Reality Simulation Engine",
      description: "Entre na Matrix. Questione a realidade. Decodifique os algoritmos que governam nossa percepção. Você está pronto para a pílula vermelha?",
      path: "/matrix",
      color: "from-green-500/20 to-emerald-500/20",
      borderColor: "border-green-500/40",
      glowColor: "shadow-green-500/30",
      emoji: "💊",
      status: "ACTIVE",
      tags: ["Reality", "Simulation", "Philosophy"]
    }
  ];

  return (
    <div className="min-h-screen overflow-hidden relative bg-gradient-to-br from-black via-slate-900 to-black">
      {/* Matrix Background Rain */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 opacity-5">
        {matrixRain.split('').map((char, i) => (
          <span 
            key={i} 
            className="absolute font-mono text-xs text-cyan-400"
            style={{
              left: `${(i % 30) * 3.33}%`,
              top: `${Math.floor(i / 30) * 10}%`,
              animationDelay: `${Math.random() * 3}s`,
              animation: `matrixfall 4s linear infinite`
            }}
          >
            {char}
          </span>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto p-6">
        {/* Header */}
        <header 
          className="text-center mb-16 pt-16 cursor-pointer"
          onClick={triggerGlitch}
        >
          <div className="mb-8">
            <h1 
              className={`text-7xl md:text-9xl font-bold mb-6 ${
                glitchActive ? 'animate-pulse' : ''
              }`}
              style={{
                background: 'linear-gradient(45deg, #00bfff, #8a2be2, #ff1493, #00bfff)',
                backgroundSize: '200% 200%',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'gradientShift 4s ease infinite',
                textShadow: glitchActive ? '0 0 50px rgba(138, 43, 226, 0.8)' : 'none',
                filter: glitchActive ? 'brightness(2) saturate(2)' : 'brightness(1)'
              }}
            >
              COGNITIVE
              <br />
              OVERFLOW
            </h1>
            
            <div className="text-2xl text-cyan-400 font-mono mb-4 animate-pulse">
              [NEURAL_NETWORK_INITIALIZED]
            </div>
            
            <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Hub de projetos experimentais onde mente, código e criatividade se encontram.
              <br />
              <span className="text-cyan-500">Bem-vinda à overflow cognitiva, Yasmin.</span>
            </p>
          </div>
          
          <Chip 
            size="lg"
            className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-cyan-500/40 text-cyan-400 font-mono"
          >
            🚀 SYSTEM STATUS: OPERATIONAL
          </Chip>
        </header>

        {/* Projects Grid */}
        <section className="mb-16">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-200">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              ACTIVE PROJECTS
            </span>
          </h2>
          
          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {projects.map((project, index) => (
              <Card 
                key={project.id}
                className={`project-card relative overflow-hidden cursor-pointer transition-all duration-500 hover:scale-105 bg-gradient-to-br ${project.color} ${project.borderColor} border backdrop-blur-lg hover:${project.glowColor} hover:shadow-2xl group`}
                style={{
                  background: `
                    linear-gradient(135deg, 
                      rgba(30, 30, 35, 0.9), 
                      rgba(40, 40, 45, 0.9),
                      rgba(25, 25, 30, 0.9)
                    ),
                    ${project.color.includes('purple') ? 
                      'radial-gradient(circle at top right, rgba(138, 43, 226, 0.1), transparent 60%)' :
                      'radial-gradient(circle at top right, rgba(34, 197, 94, 0.1), transparent 60%)'
                    }
                  `
                }}
              >
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start w-full">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-4xl">{project.emoji}</span>
                        <Chip 
                          size="sm"
                          color={project.status === 'ACTIVE' ? 'success' : 'warning'}
                          variant="flat"
                          className="text-xs font-mono"
                        >
                          {project.status}
                        </Chip>
                      </div>
                      
                      <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                        {project.title}
                      </h3>
                      
                      <p className="text-sm text-gray-400 font-mono">
                        {project.subtitle}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardBody className="pt-0">
                  <p className="text-gray-300 leading-relaxed mb-6">
                    {project.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.tags.map((tag, i) => (
                      <Chip 
                        key={i} 
                        size="sm" 
                        variant="flat"
                        className={`${
                          project.id === 'marco' 
                            ? 'bg-purple-500/20 text-purple-300' 
                            : 'bg-green-500/20 text-green-300'
                        }`}
                      >
                        {tag}
                      </Chip>
                    ))}
                  </div>
                  
                  <Link href={project.path}>
                    <Button
                      size="lg"
                      className={`w-full font-mono font-bold transition-all group-hover:scale-105 ${
                        project.id === 'marco'
                          ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 border border-purple-500/50 text-purple-300 hover:from-purple-500/50 hover:to-pink-500/50'
                          : 'bg-gradient-to-r from-green-500/30 to-emerald-500/30 border border-green-500/50 text-green-300 hover:from-green-500/50 hover:to-emerald-500/50'
                      }`}
                    >
                      ENTER PROJECT →
                    </Button>
                  </Link>
                </CardBody>
                
                {/* Animated Corner */}
                <div className="absolute top-2 right-2 w-4 h-4">
                  <div className={`w-full h-0.5 ${
                    project.id === 'marco' 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                      : 'bg-gradient-to-r from-green-500 to-emerald-500'
                  } animate-pulse`}></div>
                  <div className={`absolute right-0 -top-1 w-1.5 h-1.5 ${
                    project.id === 'marco' ? 'bg-pink-500' : 'bg-emerald-500'
                  } rounded-full animate-ping`}></div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center">
          <div className="text-gray-500 font-mono text-sm mb-4">
            cognitive_overflow.exe v0.1.0
          </div>
          <p className="text-xs text-gray-600 italic">
            "A mente expandida nunca retorna ao seu tamanho original" — Marco 2024
          </p>
        </footer>
      </div>

      <style jsx>{`
        @keyframes gradientShift {
          0%, 100% { 
            background-position: 0% 50%;
          }
          50% { 
            background-position: 100% 50%;
          }
        }

        @keyframes matrixfall {
          0% { 
            opacity: 1; 
            transform: translateY(-50px);
          }
          100% { 
            opacity: 0; 
            transform: translateY(100vh);
          }
        }
      `}</style>
    </div>
  );
}
