"use client";

import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Icon } from '@iconify/react';
import Link from "next/link";
import { useState } from "react";
import { projects } from "../config/projects";

export default function CognitiveOverflowDashboard() {
  const [glitchActive, setGlitchActive] = useState(false);

  // Glitch effect trigger
  const triggerGlitch = () => {
    setGlitchActive(true);
    setTimeout(() => setGlitchActive(false), 300);
  };

  // Function to render project cards with colored borders
  const renderProjectCard = (project: any, index: number) => {
    // Function to get the radial gradient based on project color
    const getRadialGradient = (colorPrimary: string) => {
      if (colorPrimary.includes('purple')) return 'radial-gradient(circle at top right, rgba(138, 43, 226, 0.1), transparent 60%)';
      if (colorPrimary.includes('green')) return 'radial-gradient(circle at top right, rgba(34, 197, 94, 0.1), transparent 60%)';
      if (colorPrimary.includes('amber')) return 'radial-gradient(circle at top right, rgba(251, 191, 36, 0.1), transparent 60%)';
      if (colorPrimary.includes('blue')) return 'radial-gradient(circle at top right, rgba(59, 130, 246, 0.1), transparent 60%)';
      if (colorPrimary.includes('indigo')) return 'radial-gradient(circle at top right, rgba(99, 102, 241, 0.1), transparent 60%)';
      return 'radial-gradient(circle at top right, rgba(100, 116, 139, 0.1), transparent 60%)';
    };

    const cardStyle = {
      background: [
        'linear-gradient(135deg, rgba(30, 30, 35, 0.9), rgba(40, 40, 45, 0.9), rgba(25, 25, 30, 0.9))',
        getRadialGradient(project.colors.primary)
      ].join(', ')
    };

    // Define border colors based on protection status
    const borderColor = project.protected 
      ? 'border-red-500/60 hover:border-red-400/80' 
      : 'border-blue-500/60 hover:border-blue-400/80';

    return (
      <Card 
        key={project.id}
        className={`project-card relative overflow-hidden cursor-pointer transition-all duration-500 hover:scale-105 bg-gradient-to-br ${project.colors.primary} border-2 ${borderColor} backdrop-blur-lg hover:shadow-2xl group`}
        style={cardStyle}
      >
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start w-full">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">{project.emoji}</span>
                {project.protected ? (
                  <Icon icon="lucide:lock" className="text-red-400" width={20} height={20} />
                ) : (
                  <Icon icon="lucide:globe" className="text-blue-400" width={20} height={20} />
                )}
                <Chip 
                  size="sm"
                  color={project.status === 'ACTIVE' ? 'success' : 'warning'}
                  variant="flat"
                  className="text-xs font-mono"
                >
                  {project.status}
                </Chip>
                {/* Protection status chip */}
                <Chip 
                  size="sm"
                  variant="flat"
                  className={`text-xs font-mono ${
                    project.protected 
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}
                >
                  {project.protected ? '🔐 PROTECTED' : '🌍 PUBLIC'}
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
          <p className="text-gray-300 leading-relaxed mb-6 text-sm">
            {project.description}
          </p>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {project.tags.map((tag: string) => (
              <Chip 
                key={tag}
                size="sm" 
                variant="flat"
                className="bg-white/10 text-gray-300 text-xs"
              >
                {tag}
              </Chip>
            ))}
          </div>
          
          <Link href={project.path}>
            <Button 
              className="w-full bg-gradient-to-r from-gray-600/80 to-gray-700/80 hover:from-cyan-500/80 hover:to-purple-500/80 text-white font-bold transition-all duration-300 group-hover:scale-105"
              size="lg"
            >
              <Icon icon="lucide:zap" className="mr-2" width={18} height={18} />
              ENTER PROJECT
            </Button>
          </Link>
        </CardBody>
      </Card>
    );
  };

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

        {/* Projects Section - Unified with colored borders */}
        <section className="mb-16">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-200">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              COGNITIVE PROJECTS
            </span>
          </h2>
          <div className="text-center mb-8">
            <p className="text-gray-400 font-mono">
              🔵 Blue border = Public access • 🔴 Red border = Matrix protected
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {projects.map((project, index) => renderProjectCard(project, index))}
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
