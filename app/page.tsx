"use client";

import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import Link from "next/link";
import { useState } from "react";

export default function CognitiveOverflowDashboard() {
  const [glitchActive, setGlitchActive] = useState(false);

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
    },
    {
      id: 'recursos',
      title: "RECURSOS VAULT",
      subtitle: "Knowledge Database System",
      description: "Banco de conhecimento protegido onde insights, recursos e documentação são armazenados de forma persistente. Seu segundo cérebro digital.",
      path: "/recursos",
      color: "from-amber-500/20 to-orange-500/20",
      borderColor: "border-amber-500/40",
      glowColor: "shadow-amber-500/30",
      emoji: "🔐",
      status: "ACTIVE",
      tags: ["Knowledge", "Database", "Insights"]
    },
    {
      id: 'apatia',
      title: "APATIA LANDING",
      subtitle: "Anti-Motivation Protocol",
      description: "Uma landing page única criada a partir dos slides do Manus.ia. Uma jornada visual sobre desmotivação, propósito e a arte de não dar a mínima.",
      path: "/apatia",
      color: "from-slate-500/20 to-gray-500/20",
      borderColor: "border-slate-500/40",
      glowColor: "shadow-slate-500/30",
      emoji: "😶",
      status: "ACTIVE",
      tags: ["Landing", "Psychology", "Anti-Motivation"]
    },
    {
      id: 'tokenflow',
      title: "TOKENFLOW",
      subtitle: "Chat Analysis Engine",
      description: "Motor de análise avançada para conversas de IA. Importa, filtra, analisa e exporta suas conversas do ChatGPT e Claude com inteligência.",
      path: "/tokenflow",
      color: "from-blue-500/20 to-cyan-500/20",
      borderColor: "border-blue-500/40",
      glowColor: "shadow-blue-500/30",
      emoji: "🧠",
      status: "ACTIVE",
      tags: ["AI", "Analysis", "Chat"]
    },
    {
      id: 'comic-builder',
      title: "COMIC BUILDER",
      subtitle: "Visual Storytelling Engine",
      description: "Ferramenta para criação de histórias em quadrinhos com suporte a IA. Organize personagens, cenas e gere prompts estruturados para manter consistência visual.",
      path: "/comic-builder",
      color: "from-indigo-500/20 to-violet-500/20",
      borderColor: "border-indigo-500/40",
      glowColor: "shadow-indigo-500/30",
      emoji: "📚",
      status: "ACTIVE",
      tags: ["Creative", "AI", "Comics"]
    }
  ];

  return (
    <div className="min-h-screen overflow-hidden relative bg-gradient-to-br from-black via-slate-900 to-black">
      {/* Background Gradient */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 opacity-10">
        <div className="w-full h-full bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-pink-500/5"></div>
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
              className={`text-7xl md:text-9xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent ${
                glitchActive ? 'animate-pulse' : ''
              }`}
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
          
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {projects.map((project, index) => {
              // Function to get the radial gradient based on project color
              const getRadialGradient = (color: string) => {
                if (color.includes('purple')) return 'radial-gradient(circle at top right, rgba(138, 43, 226, 0.1), transparent 60%)';
                if (color.includes('green')) return 'radial-gradient(circle at top right, rgba(34, 197, 94, 0.1), transparent 60%)';
                if (color.includes('amber')) return 'radial-gradient(circle at top right, rgba(251, 191, 36, 0.1), transparent 60%)';
                if (color.includes('blue')) return 'radial-gradient(circle at top right, rgba(59, 130, 246, 0.1), transparent 60%)';
                if (color.includes('indigo')) return 'radial-gradient(circle at top right, rgba(99, 102, 241, 0.1), transparent 60%)';
                return 'radial-gradient(circle at top right, rgba(100, 116, 139, 0.1), transparent 60%)';
              };

              const cardStyle = {
                background: [
                  'linear-gradient(135deg, rgba(30, 30, 35, 0.9), rgba(40, 40, 45, 0.9), rgba(25, 25, 30, 0.9))',
                  getRadialGradient(project.color)
                ].join(', ')
              };

              return (
              <Card 
                key={project.id}
                className={`project-card relative overflow-hidden cursor-pointer transition-all duration-500 hover:scale-105 bg-gradient-to-br ${project.color} ${project.borderColor} border backdrop-blur-lg hover:shadow-2xl group`}
                style={cardStyle}
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
                          : project.id === 'matrix'
                          ? 'bg-green-500/20 text-green-300'
                          : project.id === 'recursos'
                          ? 'bg-amber-500/20 text-amber-300'
                          : project.id === 'tokenflow'
                          ? 'bg-blue-500/20 text-blue-300'
                          : project.id === 'comic-builder'
                          ? 'bg-indigo-500/20 text-indigo-300'
                          : 'bg-slate-500/20 text-slate-300'
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
                          ? 'bg-gradient-to-r from-purple-500/60 to-pink-500/60 border border-purple-400 text-white hover:from-purple-500/80 hover:to-pink-500/80 hover:text-white shadow-lg'
                          : project.id === 'matrix'
                          ? 'bg-gradient-to-r from-green-500/60 to-emerald-500/60 border border-green-400 text-white hover:from-green-500/80 hover:to-emerald-500/80 hover:text-white shadow-lg'
                          : project.id === 'recursos'
                          ? 'bg-gradient-to-r from-amber-500/60 to-orange-500/60 border border-amber-400 text-white hover:from-amber-500/80 hover:to-orange-500/80 hover:text-white shadow-lg'
                          : project.id === 'tokenflow'
                          ? 'bg-gradient-to-r from-blue-500/60 to-cyan-500/60 border border-blue-400 text-white hover:from-blue-500/80 hover:to-cyan-500/80 hover:text-white shadow-lg'
                          : project.id === 'comic-builder'
                          ? 'bg-gradient-to-r from-indigo-500/60 to-violet-500/60 border border-indigo-400 text-white hover:from-indigo-500/80 hover:to-violet-500/80 hover:text-white shadow-lg'
                          : 'bg-gradient-to-r from-slate-500/60 to-gray-500/60 border border-slate-400 text-white hover:from-slate-500/80 hover:to-gray-500/80 hover:text-white shadow-lg'
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
                      : project.id === 'matrix'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                      : project.id === 'recursos'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                      : project.id === 'tokenflow'
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                      : project.id === 'comic-builder'
                      ? 'bg-gradient-to-r from-indigo-500 to-violet-500'
                      : 'bg-gradient-to-r from-slate-500 to-gray-500'
                  } animate-pulse`}></div>
                  <div className={`absolute right-0 -top-1 w-1.5 h-1.5 ${
                    project.id === 'marco' 
                      ? 'bg-pink-500' 
                      : project.id === 'matrix'
                      ? 'bg-emerald-500'
                      : project.id === 'recursos'
                      ? 'bg-orange-500'
                      : project.id === 'tokenflow'
                      ? 'bg-cyan-500'
                      : project.id === 'comic-builder'
                      ? 'bg-violet-500'
                      : 'bg-gray-500'
                  } rounded-full animate-ping`}></div>
                </div>
              </Card>
              );
            })}
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


    </div>
  );
}
