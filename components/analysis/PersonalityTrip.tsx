"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Icon } from '@iconify/react';
import Link from "next/link";

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
  raveMode: boolean;
  mousePos: { x: number; y: number };
  onClick: () => void;
}

const PersonalityTrip = () => {
  const [explosionActive, setExplosionActive] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [flashActive, setFlashActive] = useState(false);
  const [matrixCode, setMatrixCode] = useState('');
  const [raveMode, setRaveMode] = useState(false);
  const [mushrooms, setMushrooms] = useState<Array<{id: number, x: number, y: number, size: number, rotation: number}>>([]);

  // Matrix code generator - só no rave mode
  useEffect(() => {
    if (!raveMode) return;
    
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
  }, [raveMode]);

  // Mouse tracking - só no rave mode
  useEffect(() => {
    if (!raveMode) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [raveMode]);

  // Cogumelos flutuantes - só no rave mode
  useEffect(() => {
    if (!raveMode) {
      setMushrooms([]);
      return;
    }

    const generateMushrooms = () => {
      const newMushrooms = [];
      for (let i = 0; i < 8; i++) {
        newMushrooms.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: 20 + Math.random() * 30,
          rotation: Math.random() * 360
        });
      }
      setMushrooms(newMushrooms);
    };

    generateMushrooms();
    const interval = setInterval(generateMushrooms, 5000);
    return () => clearInterval(interval);
  }, [raveMode]);

  // RAVE MODE ULTIMATE EXPLOSION
  const triggerRaveMode = () => {
    const newMode = !raveMode;
    setRaveMode(newMode);
    
    if (newMode) {
      // Ativa explosão visual
      setExplosionActive(true);
      triggerFlash();
      
      // Gera explosão de cogumelos
      const newMushrooms: Array<{id: number, x: number, y: number, size: number, rotation: number}> = [];
      for (let i = 0; i < 15; i++) {
        newMushrooms.push({
          id: Date.now() + i,
          x: 50 + (Math.random() - 0.5) * 60,
          y: 50 + (Math.random() - 0.5) * 60,
          size: 15 + Math.random() * 25,
          rotation: Math.random() * 360
        });
      }
      setMushrooms(prev => [...prev, ...newMushrooms]);
      
      setTimeout(() => setExplosionActive(false), 1500);
    }
  };

  // Flash effect enhanced
  const triggerFlash = () => {
    setFlashActive(true);
    setTimeout(() => setFlashActive(false), 200);
  };

  const PersonalityCard = ({ title, content, index, emoji, raveMode, mousePos, onClick }: PersonalityCardProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const [clicked, setClicked] = useState(false);

    // Parallax só no rave mode
    const parallaxTransform = raveMode ? `
      perspective(1000px) 
      rotateX(${(mousePos.y - 400) / 50}deg) 
      rotateY(${(mousePos.x - 400) / 50}deg)
      translateZ(${isHovered ? '50px' : '0px'})
      scale(${clicked ? '1.1' : '1'})
    ` : 'scale(1)';

    return (
      <Card 
        className={`personality-card relative overflow-hidden cursor-pointer transition-all duration-500 ${
          raveMode 
            ? (isHovered ? 'border-purple-400/90 shadow-2xl shadow-purple-400/30' : 'border-purple-500/40')
            : (isHovered ? 'border-gray-400/60 shadow-xl shadow-gray-400/20' : 'border-gray-600/40')
        } ${clicked ? 'scale-105' : ''}`}
        style={{
          transform: parallaxTransform,
          background: raveMode ? `
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
          ` : `
            linear-gradient(135deg, 
              rgba(30, 30, 35, ${isHovered ? 0.95 : 0.85}), 
              rgba(40, 40, 45, ${isHovered ? 0.95 : 0.85}),
              rgba(25, 25, 30, ${isHovered ? 0.95 : 0.85})
            )
          `,
          backdropFilter: raveMode ? 'blur(20px)' : 'blur(10px)',
          border: raveMode 
            ? `1px solid rgba(138, 43, 226, ${isHovered ? 0.6 : 0.3})`
            : `1px solid rgba(120, 120, 120, ${isHovered ? 0.4 : 0.2})`,
          boxShadow: raveMode 
            ? (isHovered ? 
                `0 0 60px rgba(138, 43, 226, 0.8), 0 0 120px rgba(138, 43, 226, 0.4), inset 0 0 60px rgba(138, 43, 226, 0.1)` : 
                `0 0 30px rgba(138, 43, 226, 0.4), inset 0 0 30px rgba(138, 43, 226, 0.05)`)
            : (isHovered ?
                `0 0 20px rgba(120, 120, 120, 0.3)` :
                `0 0 10px rgba(120, 120, 120, 0.1)`)
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => {
          setClicked(!clicked);
          onClick();
        }}
      >
        {/* Explosão de emojis só no rave mode */}
        <div className="card-emoji-explosion absolute top-1/2 left-1/2 pointer-events-none">
          {clicked && raveMode && Array.from({length: 20}, (_, i) => (
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
            <h3 className="text-xl font-bold flex-1" style={{
              color: raveMode ? '#ffffff' : '#e0e0e0',
              textShadow: raveMode ? '0 0 20px rgba(138, 43, 226, 0.8), 0 0 40px rgba(255, 20, 147, 0.6)' : 'none'
            }}>
              {title}
            </h3>
            <div 
              className={raveMode ? "text-4xl animate-spin" : "text-4xl"}
              style={{ animationDuration: raveMode ? '3s' : 'none' }}
            >
              {emoji}
            </div>
          </div>
        </CardHeader>
        
        <CardBody className="pt-0">
          <ul className="space-y-3">
            {content.map((item, i) => (
              <li key={i} className="flex items-start leading-relaxed" style={{
                color: raveMode ? '#e0e0e0' : '#c0c0c0',
                textShadow: raveMode ? '0 0 10px rgba(255, 255, 255, 0.3)' : 'none'
              }}>
                <span className="mr-3 text-xl" style={{
                  color: raveMode ? '#00bfff' : '#888888',
                  textShadow: raveMode ? '0 0 15px rgba(0, 191, 255, 0.8)' : 'none',
                  animation: raveMode ? 'bulletGlow 2s ease-in-out infinite alternate' : 'none'
                }}>◈</span>
                <span dangerouslySetInnerHTML={{ __html: item }} />
              </li>
            ))}
          </ul>
          
          {raveMode && (
            <div className="absolute bottom-3 right-3 w-10 h-5">
              <div className="w-full h-0.5 bg-gradient-to-r from-pink-500 to-cyan-500 animate-pulse"></div>
              <div className="absolute right-0 -top-1 w-1.5 h-1.5 bg-cyan-500 rounded-full animate-ping"></div>
            </div>
          )}
        </CardBody>
      </Card>
    );
  };

  const personalityData: PersonalityData[] = [
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
      className="min-h-screen overflow-x-hidden relative"
              style={{
          background: raveMode ? `
            radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(138, 43, 226, 0.6) 0%, transparent 40%),
            radial-gradient(circle at ${100 - mousePos.x/8}% ${100 - mousePos.y/8}%, rgba(255, 20, 147, 0.5) 0%, transparent 50%),
            radial-gradient(ellipse at center, rgba(0, 191, 255, 0.3) 0%, transparent 70%),
            linear-gradient(45deg, #000000 0%, #1a0033 20%, #330066 40%, #1a0033 60%, #000000 80%, #000000 100%)
          ` : `
            linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)
          `,
          filter: flashActive 
            ? 'brightness(4) saturate(3) hue-rotate(90deg)' 
            : raveMode 
              ? 'brightness(1.4) contrast(1.2) saturate(1.3)' 
              : 'brightness(1) contrast(1) saturate(1)',
          animation: raveMode 
            ? 'backgroundShift 6s ease infinite, backgroundPulse 2s ease-in-out infinite alternate' 
            : 'none'
        }}
    >
      {/* NAVIGATION BUTTONS */}
      <div className="fixed top-6 left-6 z-50">
        <Link href="/">
          <Button
            size="lg"
            className={`font-mono font-bold backdrop-blur-lg transition-all ${
              raveMode 
                ? 'bg-purple-500/20 border border-purple-500/50 text-purple-300 hover:bg-purple-500/30 hover:border-purple-400'
                : 'bg-gray-500/20 border border-gray-500/50 text-gray-300 hover:bg-gray-500/30 hover:border-gray-400'
            }`}
          >
            <Icon icon="lucide:arrow-left" width={20} height={20} />
            COGNITIVE OVERFLOW
          </Button>
        </Link>
      </div>

      {/* RAVE MODE BUTTON */}
      <div className="fixed top-6 right-6 z-50">
        <Button
          onClick={triggerRaveMode}
          color={raveMode ? "warning" : "default"}
          variant="shadow"
          size="lg"
          className={`font-bold text-lg ${raveMode ? 'animate-bounce' : ''}`}
          style={{
            background: raveMode ? 
              'linear-gradient(45deg, #FF1493, #8A2BE2, #00BFFF)' : 
              'linear-gradient(45deg, #4a4a4a, #6a6a6a)',
            boxShadow: raveMode ? 
              '0 0 30px rgba(138, 43, 226, 0.8), 0 0 60px rgba(255, 20, 147, 0.6)' : 
              '0 0 10px rgba(120, 120, 120, 0.3)'
          }}
        >
{raveMode ? '🎪 RAVE ON!' : '🎵 RAVE OFF'}
        </Button>
      </div>

      {/* Cogumelos Flutuantes - SÓ NO RAVE MODE */}
      {raveMode && mushrooms.length > 0 && (
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-20">
          {mushrooms.map((mushroom) => (
            <div
              key={mushroom.id}
              className="absolute text-4xl animate-bounce"
              style={{
                left: `${mushroom.x}%`,
                top: `${mushroom.y}%`,
                fontSize: `${mushroom.size}px`,
                transform: `rotate(${mushroom.rotation}deg)`,
                animation: `mushroomFloat 6s ease-in-out infinite ${Math.random() * 2}s, mushroomSpin 8s linear infinite ${Math.random()}s`,
                filter: 'drop-shadow(0 0 20px rgba(255, 20, 147, 0.8))'
              }}
            >
              🍄
            </div>
          ))}
        </div>
      )}

      {/* Matrix Background - SÓ NO RAVE MODE */}
      {raveMode && (
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
      )}

      {/* Main Content */}
      <div className="relative z-30 max-w-6xl mx-auto p-6">
        {/* Header Épico */}
        <header 
          className="text-center mb-16 p-16 relative cursor-pointer transition-transform hover:scale-105"
          onClick={triggerRaveMode}
          style={{
            transform: raveMode ? 'scale(1.1) rotate(2deg)' : 'scale(1) rotate(0deg)'
          }}
        >
          <h1 className="text-6xl md:text-8xl font-bold mb-8 relative" style={{
            textShadow: raveMode ? `
              0 0 30px rgba(138, 43, 226, 0.8),
              0 0 60px rgba(255, 20, 147, 0.6),
              0 0 90px rgba(0, 191, 255, 0.4)
            ` : 'none'
          }}>
            <span className={`inline-block ${raveMode 
              ? 'bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent'
              : 'text-gray-200'
            }`} style={{ 
              animationDelay: '0s',
              animation: raveMode ? 'titleWave 3s ease-in-out infinite, titleGlow 2s ease-in-out infinite alternate' : 'none'
            }}>
              MARCO'S
            </span>
            <br />
            <span className={`inline-block ${raveMode 
              ? 'bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent'
              : 'text-gray-200'
            }`} style={{ 
              animationDelay: '0.2s',
              animation: raveMode ? 'titleWave 3s ease-in-out infinite 0.2s, titleGlow 2s ease-in-out infinite alternate 0.2s' : 'none'
            }}>
              PERSONALITY
            </span>
            <br />
            <span className={`inline-block ${raveMode 
              ? 'bg-gradient-to-r from-pink-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent'
              : 'text-gray-200'
            }`} style={{ 
              animationDelay: '0.4s',
              animation: raveMode ? 'titleWave 3s ease-in-out infinite 0.4s, titleGlow 2s ease-in-out infinite alternate 0.4s' : 'none'
            }}>
              TRIP
            </span>
          </h1>
          
          <div className="mt-8">
            <p className={`text-xl mb-4 ${raveMode ? 'text-cyan-400 animate-pulse' : 'text-gray-400'}`}>
              🧬 BLUEPRINT DA MENTE MULTIDIMENSIONAL 🧬
            </p>
            <div className={`text-2xl font-bold ${raveMode ? 'text-yellow-400 animate-bounce' : 'text-gray-300'}`}>
              {raveMode ? '✨ WELCOME TO TOMORROWLAND, YASMIN! ✨' : '🧠 Análise de Personalidade - Marco Fernandes'}
            </div>
          </div>

          {/* Explosão melhorada */}
          {explosionActive && (
            <div className="absolute top-1/2 left-1/2 pointer-events-none">
              {Array.from({length: raveMode ? 50 : 20}, (_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 rounded-full animate-ping"
                  style={{
                    background: raveMode 
                      ? `linear-gradient(45deg, #FF1493, #8A2BE2, #00BFFF, #FFD700)`
                      : `linear-gradient(45deg, #888888, #aaaaaa)`,
                    transform: `translate(-50%, -50%) rotate(${i * (360/50)}deg) translateX(${100 + Math.random() * 200}px)`,
                    animationDuration: '1.5s',
                    animationDelay: `${Math.random() * 0.5}s`
                  }}
                />
              ))}
            </div>
          )}
        </header>

        {/* Personality Section */}
        <section className="mb-16">
          <h2 className={`text-4xl font-bold text-center mb-12 ${raveMode ? 'text-pink-500 title-glitch' : 'text-gray-300'}`}>
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
                raveMode={raveMode}
                mousePos={mousePos}
                onClick={triggerFlash}
              />
            ))}
          </div>
        </section>

        {/* Conclusion Épica */}
        <Card 
          className={`cursor-pointer transition-all hover:scale-105 mb-16 ${
            raveMode 
              ? 'bg-gradient-to-br from-pink-950/20 via-cyan-950/10 to-yellow-950/20 border-pink-500/50 hover:border-pink-500/80 hover:shadow-pink-500/50 hover:shadow-2xl'
              : 'bg-gradient-to-br from-gray-800/80 via-gray-700/80 to-gray-800/80 border-gray-600/50 hover:border-gray-500/80 hover:shadow-gray-500/30 hover:shadow-xl'
          }`}
          onClick={triggerFlash}
        >
          <CardHeader className="text-center">
            <h2 className={`text-4xl font-bold mx-auto ${raveMode ? 'text-pink-500 title-glitch' : 'text-gray-200'}`}>
              SÍNTESE DO EXPERIMENTO
            </h2>
          </CardHeader>
          
          <CardBody className="text-center relative z-10">
            <div className={`text-lg leading-relaxed max-w-4xl mx-auto mb-8 ${raveMode ? 'text-gray-200' : 'text-gray-300'}`}>
              <p className="mb-6">
                Um <span className={`font-bold ${raveMode ? 'bg-gradient-to-r from-pink-500 via-cyan-500 to-yellow-500 bg-clip-text text-transparent animate-pulse' : 'text-gray-100'}`}>7w8-Sagitário-Colérico-ENTP-Pita</span> é basicamente:
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
              color={raveMode ? "warning" : "default"}
              variant="flat" 
              className={`text-xl font-bold ${raveMode ? 'animate-bounce' : ''}`}
            >
              {raveMode 
                ? '🐰 BEM-VINDA AO LABORATÓRIO DA LOUCURA CRIATIVA, YASMIN! 🧪'
                : '🧠 Análise Completa - Marco Fernandes'
              }
            </Chip>
          </CardBody>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className={`font-mono text-sm mb-2 ${raveMode ? 'text-gray-500 animate-pulse' : 'text-gray-600'}`}>
            personality_matrix_loaded.exe
          </p>
          <p className={`text-xs italic mb-8 ${raveMode ? 'text-gray-600' : 'text-gray-500'}`}>
            "A loucura é apenas criatividade incompreendida" - Marco 2024
          </p>
          

        </div>
      </div>

      <style jsx>{`
        @keyframes backgroundShift {
          0%, 100% { 
            background-position: 0% 50%;
            background-size: 400% 400%;
          }
          25% { 
            background-position: 100% 0%;
            background-size: 300% 300%;
          }
          50% { 
            background-position: 100% 100%;
            background-size: 200% 200%;
          }
          75% { 
            background-position: 0% 100%;
            background-size: 400% 400%;
          }
        }

        @keyframes backgroundPulse {
          0% { filter: brightness(1.2) contrast(1.1) saturate(1); }
          100% { filter: brightness(1.4) contrast(1.3) saturate(1.2); }
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

        @keyframes mushroomFloat {
          0%, 100% { 
            transform: translateY(0px) scale(1);
          }
          50% { 
            transform: translateY(-20px) scale(1.1);
          }
        }

        @keyframes mushroomSpin {
          0% { 
            filter: drop-shadow(0 0 20px rgba(255, 20, 147, 0.8)) hue-rotate(0deg);
          }
          100% { 
            filter: drop-shadow(0 0 20px rgba(255, 20, 147, 0.8)) hue-rotate(360deg);
          }
        }

        .title-glitch {
          position: relative;
          color: #ff1493;
          text-shadow: 0 0 20px rgba(255, 20, 147, 0.8);
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