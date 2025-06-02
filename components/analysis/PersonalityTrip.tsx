"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import Link from 'next/link';
import { Particles } from 'react-tsparticles';
import { loadFireworksPreset } from 'tsparticles-preset-fireworks';
import confetti from 'canvas-confetti';
import { useSpring, animated, config } from 'react-spring';
import { Parallax } from 'react-parallax';
import { Howl } from 'howler';

interface Cogumelo {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
  type: string;
}

interface PersonalityData {
  title: string;
  emoji: string;
  content: string[];
}

interface PersonalityCardProps {
  title: string;
  content: string[];
  index: number;
  emoji: string;
}

const PersonalityTrip = () => {
  const [explosionActive, setExplosionActive] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [cogumelos, setCogumelos] = useState<Cogumelo[]>([]);
  const [flashActive, setFlashActive] = useState(false);
  const [matrixCode, setMatrixCode] = useState('');
  const [raveMode, setRaveMode] = useState(false);
  const [particlesInit, setParticlesInit] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const soundRef = useRef<Howl | null>(null);

  // Spring animations
  const titleSpring = useSpring({
    transform: raveMode ? 'scale(1.1) rotate(2deg)' : 'scale(1) rotate(0deg)',
    config: config.wobbly
  });

  const cardSpring = useSpring({
    transform: raveMode ? 'translateY(-10px)' : 'translateY(0px)',
    config: config.gentle
  });

  // Initialize particles
  useEffect(() => {
    const timer = setTimeout(() => {
      setParticlesInit(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Matrix code generator
  useEffect(() => {
    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    const generateMatrix = () => {
      let result = '';
      for (let i = 0; i < 200; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };
    
    const interval = setInterval(() => {
      setMatrixCode(generateMatrix());
    }, 100);
    
    return () => clearInterval(interval);
  }, []);

  // Cogumelos crescendo
  useEffect(() => {
    const newCogumelos = [];
    for (let i = 0; i < 15; i++) {
      newCogumelos.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 30 + 10,
        rotation: Math.random() * 360,
        type: ['🍄', '🧬', '⚙️', '🔬', '💫'][Math.floor(Math.random() * 5)]
      });
    }
    setCogumelos(newCogumelos);
  }, []);

  // Mouse tracking for crazy effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Particles initialization
  const particlesLoaded = useCallback(async (container: any) => {
    console.log('Particles loaded!', container);
  }, []);

  const initParticles = useCallback(async (engine: any) => {
    await loadFireworksPreset(engine);
    setParticlesInit(true);
  }, []);

  // RAVE MODE ULTIMATE EXPLOSION
  const triggerRaveMode = () => {
    setRaveMode(!raveMode);
    
    // CONFETTI EXPLOSION
    confetti({
      particleCount: 200,
      spread: 160,
      origin: { y: 0.6 },
      colors: ['#8A2BE2', '#FF1493', '#00BFFF', '#FFD700']
    });
    
    // Multiple confetti bursts
    setTimeout(() => {
      confetti({
        particleCount: 150,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#8A2BE2', '#FF1493']
      });
    }, 200);
    
    setTimeout(() => {
      confetti({
        particleCount: 150,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#00BFFF', '#FFD700']
      });
    }, 400);
  };

  // Flash effect enhanced
  const triggerFlash = () => {
    setFlashActive(true);
    setTimeout(() => setFlashActive(false), 200);
    
    // Mini confetti on flash
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#8A2BE2', '#FF1493']
    });
  };

  // MEGA EXPLOSION
  const triggerExplosion = () => {
    setExplosionActive(true);
    triggerFlash();
    triggerRaveMode();
    setTimeout(() => setExplosionActive(false), 1000);
  };

  // ASCII Art Pattern
  const asciiPattern = `
    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
    ░░██████░░░░░░░░░░░░░░░░██████░░
    ░░██░░██░░██████████░░██░░██░░
    ░░██░░██░░██░░░░░░██░░██░░██░░
    ░░██████░░██░░██░░██░░██████░░
    ░░░░░░░░░░██░░██░░██░░░░░░░░░░
    ░░░░░░░░░░██████████░░░░░░░░░░
    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
  `;

  const PersonalityCard = ({ title, content, index, emoji }: PersonalityCardProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const [clicked, setClicked] = useState(false);

    return (
      <animated.div style={cardSpring}>
        <Card 
          className={`personality-card relative overflow-hidden cursor-pointer transition-all duration-500 ${
            isHovered ? 'border-purple-400/90 shadow-2xl shadow-purple-400/30' : 'border-purple-500/40'
          } ${clicked ? 'scale-110' : ''}`}
        style={{
          transform: `
            perspective(1000px) 
            rotateX(${(mousePos.y - 400) / 50}deg) 
            rotateY(${(mousePos.x - 400) / 50}deg)
            translateZ(${isHovered ? '50px' : '0px'})
            scale(${clicked ? '1.1' : '1'})
          `,
          background: `
            linear-gradient(${45 + index * 30}deg, 
              rgba(16, 16, 32, ${isHovered ? 0.95 : 0.85}), 
              rgba(32, 16, 64, ${isHovered ? 0.95 : 0.85}),
              rgba(64, 32, 128, ${isHovered ? 0.95 : 0.85}),
              rgba(16, 16, 32, ${isHovered ? 0.95 : 0.85})
            ),
            radial-gradient(circle at center, 
              rgba(138, 43, 226, ${isHovered ? 0.15 : 0.05}), 
              transparent 70%
            )
          `,
          backdropFilter: 'blur(20px)',
          border: `1px solid rgba(138, 43, 226, ${isHovered ? 0.6 : 0.3})`,
          boxShadow: isHovered ? 
            `0 0 60px rgba(138, 43, 226, 0.8), 0 0 120px rgba(138, 43, 226, 0.4), inset 0 0 60px rgba(138, 43, 226, 0.1)` : 
            `0 0 30px rgba(138, 43, 226, 0.4), inset 0 0 30px rgba(138, 43, 226, 0.05)`
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onPress={() => {
          setClicked(!clicked);
          triggerFlash();
        }}
      >
        <div className="card-emoji-explosion absolute top-1/2 left-1/2 pointer-events-none">
          {clicked && Array.from({length: 20}, (_, i) => (
            <span 
              key={i} 
              className="emoji-particle absolute text-2xl animate-pulse"
                             style={{
                 animation: `emojiExplode 1s ease-out forwards`,
                 transform: `translate(-50%, -50%) rotate(${i * 18}deg) translateX(${50 + Math.random() * 100}px)`
               } as React.CSSProperties}
            >
              {emoji}
            </span>
          ))}
        </div>
        
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start w-full">
            <h3 className="text-xl font-bold flex-1 title-glitch" style={{
              color: '#ffffff',
              textShadow: '0 0 20px rgba(138, 43, 226, 0.8), 0 0 40px rgba(255, 20, 147, 0.6)'
            }}>
              {title}
            </h3>
            <div className="text-4xl animate-spin" style={{ animationDuration: '3s' }}>
              {emoji}
            </div>
          </div>
        </CardHeader>
        
        <CardBody className="pt-0">
          <ul className="space-y-3">
            {content.map((item, i) => (
              <li key={i} className="flex items-start leading-relaxed" style={{
                color: '#e0e0e0',
                textShadow: '0 0 10px rgba(255, 255, 255, 0.3)'
              }}>
                <span className="mr-3 text-xl" style={{
                  color: '#00bfff',
                  textShadow: '0 0 15px rgba(0, 191, 255, 0.8)',
                  animation: 'bulletGlow 2s ease-in-out infinite alternate'
                }}>◈</span>
                <span dangerouslySetInnerHTML={{ __html: item }} />
              </li>
            ))}
          </ul>
          
          <div className="absolute bottom-3 right-3 w-10 h-5">
            <div className="w-full h-0.5 bg-gradient-to-r from-pink-500 to-cyan-500 animate-pulse"></div>
            <div className="absolute right-0 -top-1 w-1.5 h-1.5 bg-cyan-500 rounded-full animate-ping"></div>
          </div>
        </CardBody>
      </Card>
      </animated.div>
    );
  };

  const personalityData = [
    {
      title: "7w8 — O Hedonista com Lança na Mão",
      emoji: "⚔️",
      content: [
        "Um epicurista com um pé no caos e o outro chutando a porta da próxima aventura",
        "Gosta de estímulo como outros gostam de ar",
        "<strong>W8</strong> dá a esse palhaço um soco inglês: em vez de fugir dos problemas com risadinhas, ele encara sorrindo e, se possível, domina",
        "Parece que vive no modo \"rolê premium\", mas na real só quer escapar de ficar preso no tédio da própria cabeça",
        "<em>Tradução:</em> alguém que vai planejar uma roadtrip de LSD no deserto e ainda levar um plano B caso o cacto fale com ele"
      ]
    },
    {
      title: "Sagitário — O Centauro com FOMO Filosófico",
      emoji: "🏹",
      content: [
        "O signo que acha que a vida é um jogo open-world com fast travel liberado",
        "É aquele fogo mutável: não quer destruir, quer descobrir. Mas se queimar uns no caminho, ah bem",
        "Combo de liberdade + sarcasmo + oratória de coach em ácido",
        "Odeia rotina com intensidade religiosa",
        "Vai te dar conselhos que parecem sabedoria milenar, mas que na verdade foram pescados num podcast de 2x de velocidade enquanto ele fazia panqueca de whey"
      ]
    },
    {
      title: "Colérico — O General Carismático com Mau Humor",
      emoji: "⚡",
      content: [
        "Temperamento dos imperadores e dos chefes de startup que ninguém gosta mas todo mundo obedece",
        "Ambição em modo berserker",
        "Raciocínio rápido, intolerância a lentidão, e uma certa fascinação por explodir sistemas antes de estudá-los",
        "Se algo não anda, chuta",
        "Não pede desculpas. Oferece resultados"
      ]
    },
    {
      title: "ENTP — O Advogado do Diabo com Canal no YouTube",
      emoji: "🎬",
      content: [
        "MBTI dos trolls intelectuais e das pessoas que falam \"vamos fazer um podcast?\" a cada 3 meses",
        "Energia verbal infinita, atenção de colibri com TDAH",
        "Adora ideias, mas tem alergia a rotina e execução repetitiva",
        "Vive no brainstorming eterno — se fosse um código, seria um loop de <code className=\"bg-pink-500/20 px-1 rounded text-cyan-400\">generate()</code> sem <code className=\"bg-pink-500/20 px-1 rounded text-cyan-400\">commit()</code>",
        "Vê limites como sugestões. E regras como piada"
      ]
    },
    {
      title: "Pita — O Dosha que Quer Brigar com o Sol",
      emoji: "☀️",
      content: [
        "No Ayurveda, Pita é fogo + umidade: digestão rápida, intolerância a qualquer tipo de lerdeza ou burrice",
        "Corpo quente, mente afiada, personalidade do tipo \"por que isso ainda não tá resolvido?\"",
        "Motivação? Ser o melhor. Medo? Não ser o melhor",
        "Quando desequilibrado, vira um canhão de irritação gourmet"
      ]
    }
  ];

  return (
    <div 
      ref={containerRef}
      className="min-h-screen overflow-x-hidden relative"
      style={{
        background: `
          radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(138, 43, 226, ${raveMode ? 0.6 : 0.4}) 0%, transparent 40%),
          radial-gradient(circle at ${100 - mousePos.x/8}% ${100 - mousePos.y/8}%, rgba(255, 20, 147, ${raveMode ? 0.5 : 0.3}) 0%, transparent 50%),
          radial-gradient(ellipse at center, rgba(0, 191, 255, ${raveMode ? 0.3 : 0.1}) 0%, transparent 70%),
          linear-gradient(45deg, #000000 0%, #1a0033 20%, #330066 40%, #1a0033 60%, #000000 80%, #000000 100%)
        `,
        filter: flashActive ? 'brightness(4) saturate(3) hue-rotate(90deg)' : raveMode ? 'brightness(1.4) contrast(1.2) saturate(1.3)' : 'brightness(1.2) contrast(1.1)',
        backgroundSize: '400% 400%, 300% 300%, 200% 200%, 100% 100%',
        animation: raveMode ? 'backgroundShift 6s ease infinite, backgroundPulse 2s ease-in-out infinite alternate' : 'backgroundShift 12s ease infinite, backgroundPulse 4s ease-in-out infinite alternate'
      }}
    >
      {/* PARTICLES INSANAS */}
      {particlesInit && (
        <Particles
          id="tsparticles"
          init={initParticles}
          loaded={particlesLoaded}
          options={{
            preset: "fireworks",
            background: {
              opacity: 0
            },
            particles: {
              number: {
                value: raveMode ? 300 : 100
              },
              color: {
                value: ["#8A2BE2", "#FF1493", "#00BFFF", "#FFD700", "#FF69B4"]
              },
              shape: {
                type: ["circle", "triangle", "star"]
              },
              opacity: {
                value: { min: 0.1, max: 0.8 }
              },
              size: {
                value: { min: 1, max: 8 }
              },
              move: {
                enable: true,
                speed: raveMode ? 6 : 3,
                direction: "none",
                random: true,
                straight: false,
                outMode: "out"
              }
            },
            detectRetina: true
          }}
          className="fixed top-0 left-0 w-full h-full pointer-events-none z-1"
        />
      )}

      {/* RAVE MODE BUTTON */}
      <div className="fixed top-6 right-6 z-50">
        <Button
          onPress={triggerRaveMode}
          color={raveMode ? "warning" : "secondary"}
          variant="shadow"
          size="lg"
          className={`font-bold text-lg ${raveMode ? 'animate-bounce' : ''}`}
          style={{
            background: raveMode ? 
              'linear-gradient(45deg, #FF1493, #8A2BE2, #00BFFF)' : 
              'linear-gradient(45deg, #8A2BE2, #FF1493)',
            boxShadow: raveMode ? 
              '0 0 30px rgba(138, 43, 226, 0.8), 0 0 60px rgba(255, 20, 147, 0.6)' : 
              '0 0 20px rgba(138, 43, 226, 0.5)'
          }}
        >
          {raveMode ? '🎪 RAVE ON!' : '🔥 RAVE MODE'}
        </Button>
      </div>
      {/* FUMAÇA DE RAVE JORRANDO */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-5 overflow-hidden">
        {Array.from({length: 8}, (_, i) => (
          <div
            key={i}
            className="absolute w-96 h-96 opacity-20"
            style={{
              left: `${Math.random() * 120 - 10}%`,
              top: `${100 + Math.random() * 20}%`,
              background: `radial-gradient(ellipse, rgba(138, 43, 226, 0.6) 0%, rgba(255, 20, 147, 0.4) 30%, transparent 70%)`,
              borderRadius: '50%',
              filter: 'blur(40px)',
              animation: `smokeRise ${8 + Math.random() * 4}s ease-out infinite ${Math.random() * 3}s`,
              transform: `scale(${0.5 + Math.random() * 0.8})`
            }}
          />
        ))}
        
        {Array.from({length: 12}, (_, i) => (
          <div
            key={`smoke-${i}`}
            className="absolute w-64 h-64 opacity-15"
            style={{
              left: `${Math.random() * 110 - 5}%`,
              top: `${100 + Math.random() * 30}%`,
              background: `radial-gradient(circle, rgba(0, 191, 255, 0.5) 0%, rgba(255, 255, 255, 0.2) 40%, transparent 80%)`,
              borderRadius: '50%',
              filter: 'blur(60px)',
              animation: `smokeFlow ${10 + Math.random() * 6}s ease-in-out infinite ${Math.random() * 4}s`,
              transform: `rotate(${Math.random() * 360}deg) scale(${0.3 + Math.random() * 1.2})`
            }}
          />
        ))}
      </div>

      {/* Matrix Background Melhorado */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-10 opacity-8">
        {matrixCode.split('').map((char, i) => (
          <span 
            key={i} 
            className="absolute font-mono text-xs"
            style={{
              left: `${(i % 40) * 2.5}%`,
              top: `${Math.floor(i / 40) * 5}%`,
              color: `hsl(${120 + Math.sin(i * 0.1) * 60}, 70%, ${50 + Math.sin(i * 0.2) * 30}%)`,
              textShadow: `0 0 10px currentColor, 0 0 20px currentColor`,
              animationDelay: `${Math.random() * 2}s`,
              animation: `matrixfall 3s linear infinite ${Math.random() * 2}s, matrixGlow 2s ease-in-out infinite ${Math.random()}s`
            }}
          >
            {char}
          </span>
        ))}
      </div>

      {/* ASCII Art Overlay */}
      <pre className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 scale-150 text-pink-500 opacity-5 text-xs pointer-events-none z-10 animate-pulse">
        {asciiPattern}
      </pre>

      {/* COGUMELOS AFTER EFFECTS STYLE */}
      {cogumelos.map(cogumelo => (
        <div
          key={cogumelo.id}
          className="fixed pointer-events-none z-20"
          style={{
            left: `${cogumelo.x}%`,
            top: `${cogumelo.y}%`,
            fontSize: `${cogumelo.size}px`,
            filter: `
              drop-shadow(0 0 20px rgba(138, 43, 226, 0.8)) 
              drop-shadow(0 0 40px rgba(255, 20, 147, 0.6))
              brightness(1.3)
              saturate(1.5)
            `,
            animation: `
              cogumeloGrow ${8 + cogumelo.id * 0.5}s ease-in-out infinite ${cogumelo.id * 0.3}s,
              cogumeloFloat ${4 + Math.sin(cogumelo.id) * 2}s ease-in-out infinite ${cogumelo.id * 0.2}s,
              cogumeloGlow ${3 + cogumelo.id * 0.1}s ease-in-out infinite alternate
            `,
            transform: `rotate(${cogumelo.rotation}deg) scale(1)`,
            textShadow: `
              0 0 20px currentColor,
              0 0 40px currentColor,
              0 0 60px rgba(138, 43, 226, 0.8)
            `
          }}
        >
          <div style={{
            position: 'relative',
            display: 'inline-block'
          }}>
            {cogumelo.type}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '200%',
              height: '200%',
              transform: 'translate(-50%, -50%)',
              background: `radial-gradient(circle, rgba(138, 43, 226, 0.3) 0%, transparent 70%)`,
              borderRadius: '50%',
              filter: 'blur(20px)',
              animation: `cogumeloPulse ${2 + cogumelo.id * 0.1}s ease-in-out infinite alternate`
            }} />
          </div>
        </div>
      ))}

      {/* PARTICLE SYSTEM INSANO */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-20">
        {Array.from({length: 100}, (_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${2 + Math.random() * 6}px`,
              height: `${2 + Math.random() * 6}px`,
              background: `hsl(${280 + Math.random() * 80}, 80%, ${60 + Math.random() * 40}%)`,
              boxShadow: `
                0 0 20px currentColor,
                0 0 40px currentColor
              `,
              animation: `
                particleFloat ${5 + Math.random() * 10}s ease-in-out infinite ${Math.random() * 3}s,
                particleGlow ${2 + Math.random() * 3}s ease-in-out infinite alternate ${Math.random()}s
              `,
              filter: 'blur(0.5px)'
            }}
          />
        ))}
        
        {/* Partículas laser */}
        {Array.from({length: 20}, (_, i) => (
          <div
            key={`laser-${i}`}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${20 + Math.random() * 60}px`,
              height: '2px',
              background: `linear-gradient(90deg, transparent, rgba(138, 43, 226, 0.8), rgba(255, 20, 147, 0.8), transparent)`,
              transform: `rotate(${Math.random() * 360}deg)`,
              animation: `laserBeam ${3 + Math.random() * 4}s ease-in-out infinite ${Math.random() * 2}s`,
              filter: 'blur(1px)',
              boxShadow: `0 0 10px rgba(138, 43, 226, 0.8)`
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-30 max-w-6xl mx-auto p-6">


        {/* Header Épico */}
        <animated.header 
          style={titleSpring}
          className="text-center mb-16 p-16 relative cursor-pointer transition-transform hover:scale-105"
          onClick={triggerExplosion}
        >
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
            <div className="absolute top-1/5 left-1/10 w-25 h-25 border-2 border-pink-500/30 rounded-full animate-spin" style={{ animationDuration: '10s' }}></div>
            <div className="absolute top-3/5 right-3/20 w-20 h-20 border-2 border-cyan-500/30 transform rotate-45 animate-pulse" style={{ animationDuration: '10s' }}></div>
            <div className="absolute bottom-1/5 left-1/5 w-30 h-15 border-2 border-yellow-500/30 rounded-full animate-bounce" style={{ animationDuration: '10s' }}></div>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold mb-8 relative" style={{
            textShadow: `
              0 0 30px rgba(138, 43, 226, 0.8),
              0 0 60px rgba(255, 20, 147, 0.6),
              0 0 90px rgba(0, 191, 255, 0.4)
            `
          }}>
            <span className="inline-block bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent" style={{ 
              animationDelay: '0s',
              animation: 'titleWave 3s ease-in-out infinite, titleGlow 2s ease-in-out infinite alternate'
            }}>
              MARCO'S
            </span>
            <br />
            <span className="inline-block bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent" style={{ 
              animationDelay: '0.2s',
              animation: 'titleWave 3s ease-in-out infinite 0.2s, titleGlow 2s ease-in-out infinite alternate 0.2s'
            }}>
              PERSONALITY
            </span>
            <br />
            <span className="inline-block bg-gradient-to-r from-pink-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent" style={{ 
              animationDelay: '0.4s',
              animation: 'titleWave 3s ease-in-out infinite 0.4s, titleGlow 2s ease-in-out infinite alternate 0.4s'
            }}>
              TRIP
            </span>
          </h1>
          
          <div className="mt-8">
            <p className="text-xl text-cyan-400 mb-4 animate-pulse">
              🧬 BLUEPRINT DA MENTE MULTIDIMENSIONAL 🧬
            </p>
            <div className="text-2xl text-yellow-400 font-bold animate-bounce">
              ✨ WELCOME TO TOMORROWLAND, YASMIN! ✨
            </div>
          </div>

          {explosionActive && (
            <div className="absolute top-1/2 left-1/2 pointer-events-none">
              {Array.from({length: 30}, (_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-gradient-to-r from-pink-500 to-cyan-500 rounded-full animate-ping"
                  style={{
                    transform: `translate(-50%, -50%) rotate(${i * 12}deg) translateX(${100 + Math.random() * 200}px)`,
                    animationDuration: '1s'
                  }}
                />
              ))}
            </div>
          )}
        </animated.header>

        {/* Personality Section */}
        <section className="mb-16">
          <h2 className="text-4xl font-bold text-center mb-12 text-pink-500 title-glitch">
            AS CINCO DIMENSÕES DO ESPÉCIME
          </h2>
          
          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-16">
            {personalityData.map((data, index) => (
              <PersonalityCard
                key={index}
                title={data.title}
                content={data.content}
                index={index}
                emoji={data.emoji}
              />
            ))}
          </div>
        </section>

        {/* Conclusion Épica */}
        <Card 
          className="bg-gradient-to-br from-pink-950/20 via-cyan-950/10 to-yellow-950/20 border-pink-500/50 cursor-pointer transition-all hover:scale-105 hover:border-pink-500/80 hover:shadow-pink-500/50 hover:shadow-2xl mb-16"
          onClick={triggerFlash}
        >
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
            <div className="absolute top-1/2 left-1/5 w-25 h-50 border-2 border-cyan-500/20 rounded-full animate-spin" style={{ animationDuration: '4s' }}></div>
            <div className="absolute top-1/3 right-1/6 w-20 h-20 border border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-transparent animate-pulse" style={{ animationDuration: '3s' }}></div>
          </div>
          
          <CardHeader className="text-center">
            <h2 className="text-4xl font-bold text-pink-500 title-glitch mx-auto">
              SÍNTESE DO EXPERIMENTO
            </h2>
          </CardHeader>
          
          <CardBody className="text-center relative z-10">
            <div className="text-lg leading-relaxed text-gray-200 max-w-4xl mx-auto mb-8">
              <p className="mb-6">
                Um <span className="bg-gradient-to-r from-pink-500 via-cyan-500 to-yellow-500 bg-clip-text text-transparent font-bold animate-pulse">7w8-Sagitário-Colérico-ENTP-Pita</span> é basicamente:
              </p>
              
              <p className="mb-6">
                Um filósofo de rave com vocação pra CEO de culto. Briga por ideais às 9h, 
                larga tudo às 10h, inventa um app às 11h e te convida pra fugir da Matrix 
                às 11h30 — mas só se a playlist tiver synthwave e Nietzsche. 
                Vai te inspirar, te provocar e provavelmente te cansar.
              </p>
              
              <p className="mb-8">
                E mesmo assim, você vai querer segui-lo até o fim do buraco da toca do coelho. 
                Porque ele vai rir no caminho, fazer parecer que tudo importa — e que nada importa também.
              </p>
            </div>
            
            <Chip 
              size="lg" 
              color="warning" 
              variant="flat" 
              className="text-xl font-bold animate-bounce"
            >
              🐰 BEM-VINDA AO LABORATÓRIO DA LOUCURA CRIATIVA, YASMIN! 🧪
            </Chip>
          </CardBody>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-gray-500 font-mono text-sm mb-2 animate-pulse">
            personality_matrix_loaded.exe
          </p>
          <p className="text-gray-600 text-xs italic mb-8">
            "A loucura é apenas criatividade incompreendida" - Marco 2024
          </p>
          
          {/* MEGA RAVE BUTTON */}
          <Button
            onPress={() => {
              triggerExplosion();
              // CONFETTI APOCALIPSE
              for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                  confetti({
                    particleCount: 300 + i * 50,
                    spread: 120 + i * 20,
                    origin: { y: 0.5 + (i * 0.1) },
                    colors: ['#8A2BE2', '#FF1493', '#00BFFF', '#FFD700', '#FF69B4', '#32CD32']
                  });
                }, i * 300);
              }
            }}
            color="success"
            variant="shadow"
            size="lg"
            className="font-bold text-xl animate-pulse"
            style={{
              background: 'linear-gradient(45deg, #FF1493, #8A2BE2, #00BFFF, #FFD700)',
              backgroundSize: '400% 400%',
              animation: 'backgroundShift 3s ease infinite',
              boxShadow: '0 0 40px rgba(138, 43, 226, 0.8), 0 0 80px rgba(255, 20, 147, 0.6)'
            }}
          >
            🎆 EXPLODIR TUDO! 🎆
          </Button>
        </div>
      </div>

      <style jsx>{`
        @keyframes backgroundShift {
          0%, 100% { background-position: 0% 50%; }
          25% { background-position: 100% 0%; }
          50% { background-position: 100% 100%; }
          75% { background-position: 0% 100%; }
        }

        @keyframes backgroundPulse {
          0% { filter: brightness(1.2) contrast(1.1) saturate(1); }
          100% { filter: brightness(1.4) contrast(1.3) saturate(1.2); }
        }

        @keyframes smokeRise {
          0% { 
            transform: translateY(0) translateX(0) scale(0.5) rotate(0deg);
            opacity: 0;
          }
          20% { 
            opacity: 0.6;
            transform: translateY(-20vh) translateX(-10px) scale(0.8) rotate(90deg);
          }
          80% { 
            opacity: 0.4;
            transform: translateY(-80vh) translateX(20px) scale(1.5) rotate(270deg);
          }
          100% { 
            transform: translateY(-120vh) translateX(-30px) scale(2) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes smokeFlow {
          0% { 
            transform: translateY(0) translateX(0) scale(0.3) rotate(0deg);
            opacity: 0;
          }
          30% { 
            opacity: 0.5;
            transform: translateY(-30vh) translateX(50px) scale(0.8) rotate(180deg);
          }
          70% { 
            opacity: 0.3;
            transform: translateY(-70vh) translateX(-50px) scale(1.3) rotate(270deg);
          }
          100% { 
            transform: translateY(-100vh) translateX(80px) scale(1.8) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes matrixfall {
          0% { 
            opacity: 1; 
            transform: translateY(-100px) scale(1);
          }
          50% { 
            opacity: 0.8; 
            transform: translateY(50vh) scale(1.2);
          }
          100% { 
            opacity: 0; 
            transform: translateY(100vh) scale(0.8);
          }
        }

        @keyframes matrixGlow {
          0% { text-shadow: 0 0 10px currentColor, 0 0 20px currentColor; }
          100% { text-shadow: 0 0 20px currentColor, 0 0 40px currentColor, 0 0 60px currentColor; }
        }

        @keyframes cogumeloGrow {
          0% { 
            transform: scale(0) rotate(0deg);
            opacity: 0;
          }
          20% { 
            transform: scale(0.5) rotate(72deg);
            opacity: 0.7;
          }
          50% { 
            transform: scale(1.2) rotate(180deg);
            opacity: 1;
          }
          80% { 
            transform: scale(0.9) rotate(288deg);
            opacity: 0.9;
          }
          100% { 
            transform: scale(1) rotate(360deg);
            opacity: 0.8;
          }
        }

        @keyframes cogumeloFloat {
          0%, 100% { 
            transform: translateY(0px) translateX(0px) rotate(0deg);
          }
          25% { 
            transform: translateY(-20px) translateX(10px) rotate(5deg);
          }
          50% { 
            transform: translateY(-10px) translateX(-5px) rotate(-3deg);
          }
          75% { 
            transform: translateY(-30px) translateX(15px) rotate(7deg);
          }
        }

        @keyframes cogumeloGlow {
          0% { 
            filter: brightness(1.3) saturate(1.5) hue-rotate(0deg);
          }
          100% { 
            filter: brightness(1.8) saturate(2) hue-rotate(30deg);
          }
        }

        @keyframes cogumeloPulse {
          0% { 
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 0.3;
          }
          100% { 
            transform: translate(-50%, -50%) scale(1.5);
            opacity: 0.1;
          }
        }

        @keyframes particleFloat {
          0% { 
            transform: translateY(0) translateX(0) scale(1);
            opacity: 0;
          }
          20% { 
            opacity: 1;
            transform: translateY(-50px) translateX(20px) scale(1.2);
          }
          80% { 
            opacity: 0.8;
            transform: translateY(-150px) translateX(-30px) scale(0.8);
          }
          100% { 
            transform: translateY(-200px) translateX(50px) scale(0.5);
            opacity: 0;
          }
        }

        @keyframes particleGlow {
          0% { 
            box-shadow: 0 0 20px currentColor, 0 0 40px currentColor;
            transform: scale(1);
          }
          100% { 
            box-shadow: 0 0 40px currentColor, 0 0 80px currentColor;
            transform: scale(1.3);
          }
        }

        @keyframes laserBeam {
          0% { 
            opacity: 0;
            transform: scale(0.5) rotate(0deg);
          }
          20% { 
            opacity: 1;
            transform: scale(1) rotate(90deg);
          }
          80% { 
            opacity: 0.8;
            transform: scale(1.2) rotate(270deg);
          }
          100% { 
            opacity: 0;
            transform: scale(0.3) rotate(360deg);
          }
        }

        @keyframes titleWave {
          0%, 100% { 
            transform: translateY(0px) scale(1);
          }
          50% { 
            transform: translateY(-10px) scale(1.05);
          }
        }

        @keyframes titleGlow {
          0% { 
            filter: brightness(1) saturate(1);
            text-shadow: 0 0 30px rgba(138, 43, 226, 0.8), 0 0 60px rgba(255, 20, 147, 0.6), 0 0 90px rgba(0, 191, 255, 0.4);
          }
          100% { 
            filter: brightness(1.3) saturate(1.5);
            text-shadow: 0 0 50px rgba(138, 43, 226, 1), 0 0 100px rgba(255, 20, 147, 0.8), 0 0 150px rgba(0, 191, 255, 0.6);
          }
        }

        @keyframes bulletGlow {
          0% { 
            text-shadow: 0 0 15px rgba(0, 191, 255, 0.8);
            transform: scale(1);
          }
          100% { 
            text-shadow: 0 0 30px rgba(0, 191, 255, 1), 0 0 50px rgba(138, 43, 226, 0.5);
            transform: scale(1.2);
          }
        }

        @keyframes emojiExplode {
          0% {
            transform: translate(-50%, -50%) rotate(0deg) translateX(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) rotate(720deg) translateX(200px) scale(0);
            opacity: 0;
          }
        }

        .title-glitch {
          position: relative;
          color: #ff1493;
          text-shadow: 0 0 20px rgba(255, 20, 147, 0.8);
        }

        .title-glitch:before,
        .title-glitch:after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .title-glitch:before {
          animation: glitchTop 1s linear infinite;
          clip-path: polygon(0 0, 100% 0, 100% 33%, 0 33%);
          -webkit-clip-path: polygon(0 0, 100% 0, 100% 33%, 0 33%);
        }

        .title-glitch:after {
          animation: glitchBottom 1.5s linear infinite;
          clip-path: polygon(0 67%, 100% 67%, 100% 100%, 0 100%);
          -webkit-clip-path: polygon(0 67%, 100% 67%, 100% 100%, 0 100%);
        }

        @keyframes glitchTop {
          2%, 64% { transform: translate(2px, -2px); }
          4%, 60% { transform: translate(-2px, 2px); }
          62% { transform: translate(13px, -1px) skew(-13deg); }
        }

        @keyframes glitchBottom {
          2%, 64% { transform: translate(-2px, 0); }
          4%, 60% { transform: translate(-2px, 0); }
          62% { transform: translate(-22px, 5px) skew(21deg); }
        }

        @media (max-width: 768px) {
          .personality-card {
            padding: 1.5rem;
          }
          
          h1 {
            font-size: 3rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PersonalityTrip; 