"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function ApatiaPart1() {
  const [matrixRain, setMatrixRain] = useState('');

  // Matrix rain effect (mais sutil para apatia)
  useEffect(() => {
    const chars = '😶😐😑🤷‍♂️🤷‍♀️💤😴🚫❌⚫⬛◾▪️';
    const generateRain = () => {
      let result = '';
      for (let i = 0; i < 50; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };
    
    const interval = setInterval(() => {
      setMatrixRain(generateRain());
    }, 3000); // Mais lento, mais apático
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 relative overflow-hidden">
      {/* Subtle Background Rain */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        {matrixRain.split('').map((char, i) => (
          <span 
            key={i} 
            className="absolute font-mono text-xs text-gray-500"
            style={{
              left: `${(i % 20) * 5}%`,
              top: `${Math.floor(i / 20) * 15}%`,
              animationDelay: `${Math.random() * 5}s`,
              animation: `slowfall 8s linear infinite`
            }}
          >
            {char}
          </span>
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 flex justify-between items-center px-6 py-6 border-b border-slate-800/50 backdrop-blur-sm">
        <Link href="/">
          <Button
            size="lg"
            className="bg-gray-900/80 dark:bg-slate-800/50 backdrop-blur border border-gray-700 dark:border-slate-700/50 text-gray-100 dark:text-slate-300 hover:text-gray-300 hover:border-gray-400/30 font-mono font-medium transition-all shadow-lg"
          >
            <Icon icon="lucide:arrow-left" width={18} height={18} />
            COGNITIVE OVERFLOW
          </Button>
        </Link>

        <div className="text-slate-400 font-mono text-sm">
          [APATIA_PROTOCOL_LOADED]
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5 }} // Mais lento
            className="mb-8"
          >
            <h1 className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-400 via-gray-400 to-slate-500 tracking-wide font-mono mb-6">
              APATIA
            </h1>
            
            <div className="text-2xl text-gray-500 font-mono mb-4">
              [ANTI-MOTIVATION_PROTOCOL]
            </div>
            
            <p className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Uma jornada visual sobre desmotivação, propósito e a arte refinada de não dar a mínima.
              <br />
              <span className="text-gray-500">Baseado nos insights do Manus.ia</span>
            </p>
          </motion.div>
        </div>

        {/* Main Landing Content */}
        <div className="space-y-16">
          {/* Hero Statement */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-300 via-gray-300 to-slate-400 tracking-wide font-mono mb-8">
              CIÊNCIA, ALMA E AÇÃO
            </h2>
            
            <Card className="bg-slate-800/40 backdrop-blur-sm border border-slate-600/40 max-w-5xl mx-auto">
              <CardBody className="p-8">
                <p className="text-xl md:text-2xl text-slate-300 leading-relaxed">
                  A apatia que aflige adultos de 30 anos não é falha individual, mas{" "}
                  <span className="text-orange-400 font-semibold animate-pulse">
                    sintoma sistêmico da modernidade líquida
                  </span>
                  {" "}- e pode ser curada através da integração de sabedoria ancestral com neurociência moderna.
                </p>
              </CardBody>
            </Card>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          >
            {/* Neuroplasticidade */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="group"
            >
              <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-600/50 hover:border-blue-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-400/20 h-full">
                <CardBody className="p-8 text-center">
                  <div className="text-5xl mb-4 group-hover:animate-pulse">
                    <Icon icon="lucide:brain" className="text-blue-400 mx-auto" width={60} height={60} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-200 mb-4 font-mono">
                    NEUROPLASTICIDADE
                  </h3>
                  <p className="text-slate-300 leading-relaxed">
                    Mudanças cerebrais mensuráveis em apenas{" "}
                    <span className="text-blue-400 font-semibold">2-8 semanas</span>
                  </p>
                </CardBody>
              </Card>
            </motion.div>

            {/* Aceleração Social */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.8 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="group"
            >
              <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-600/50 hover:border-yellow-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-400/20 h-full">
                <CardBody className="p-8 text-center">
                  <div className="text-5xl mb-4 group-hover:animate-spin group-hover:animate-slow">
                    <Icon icon="lucide:hourglass" className="text-yellow-400 mx-auto" width={60} height={60} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-200 mb-4 font-mono">
                    ACELERAÇÃO SOCIAL
                  </h3>
                  <p className="text-slate-300 leading-relaxed">
                    Ritmo de vida que escapa ao{" "}
                    <span className="text-yellow-400 font-semibold">controle individual</span>
                  </p>
                </CardBody>
              </Card>
            </motion.div>

            {/* Transformação */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.6, duration: 0.8 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="group"
            >
              <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-600/50 hover:border-green-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-400/20 h-full">
                <CardBody className="p-8 text-center">
                  <div className="text-5xl mb-4 group-hover:animate-bounce">
                    <Icon icon="lucide:seedling" className="text-green-400 mx-auto" width={60} height={60} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-200 mb-4 font-mono">
                    TRANSFORMAÇÃO
                  </h3>
                  <p className="text-slate-300 leading-relaxed">
                    Caminhos comprovados de{" "}
                    <span className="text-green-400 font-semibold">superação individual e coletiva</span>
                  </p>
                </CardBody>
              </Card>
            </motion.div>
          </motion.div>

          {/* Quote Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2, duration: 1 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Card className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 backdrop-blur-sm border border-slate-600/30">
              <CardBody className="p-12">
                <div className="text-6xl mb-6 opacity-30">
                  <Icon icon="lucide:quote" className="text-slate-400 mx-auto" width={80} height={80} />
                </div>
                <blockquote className="text-2xl md:text-3xl text-slate-300 italic leading-relaxed mb-8 font-light">
                  "A apatia pode ser o convite para um despertar que nossa civilização urgentemente necessita"
                </blockquote>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                                     <div className="text-slate-400 font-mono text-sm">
                     — Reflexão sobre nossa condição moderna
                   </div>
                </motion.div>
              </CardBody>
            </Card>
                     </motion.div>

          {/* Diagnóstico Filosófico Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5, duration: 1 }}
            className="max-w-7xl mx-auto"
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-300 via-gray-300 to-slate-400 tracking-wide font-mono mb-6">
                O DIAGNÓSTICO FILOSÓFICO
              </h2>
              <p className="text-lg text-slate-400 font-mono">
                Pensadores contemporâneos analisam nossa condição moderna
              </p>
            </div>

            {/* Philosophers Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Byung-Chul Han */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 3, duration: 0.6 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="group"
              >
                <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm border border-slate-600/50 hover:border-blue-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-400/20 h-full">
                  <CardBody className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-400/30">
                        <Icon icon="lucide:user-check" className="text-blue-400" width={28} height={28} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-200 font-mono">Byung-Chul Han</h3>
                        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full font-mono">
                          SOCIEDADE DO CANSAÇO
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-slate-900/50 border-l-4 border-blue-400 p-3 mb-4 rounded-r">
                      <p className="text-sm text-slate-300 italic">
                        "O explorador é o mesmo explorado - vítima e carrasco não podem mais ser diferenciados"
                      </p>
                    </div>
                    
                    <p className="text-sm text-slate-400 leading-relaxed">
                      A auto-exploração neoliberal é mais eficaz que a opressão externa, criando pressão constante de otimização pessoal.
                    </p>
                  </CardBody>
                </Card>
              </motion.div>

              {/* Hartmut Rosa */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 3.2, duration: 0.6 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="group"
              >
                <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm border border-slate-600/50 hover:border-yellow-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-400/20 h-full">
                  <CardBody className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center border border-yellow-400/30">
                        <Icon icon="lucide:clock" className="text-yellow-400" width={28} height={28} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-200 font-mono">Hartmut Rosa</h3>
                        <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full font-mono">
                          ACELERAÇÃO SOCIAL
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-slate-900/50 border-l-4 border-yellow-400 p-3 mb-4 rounded-r">
                      <p className="text-sm text-slate-300 italic">
                        "A aceleração assumiu vida própria"
                      </p>
                    </div>
                    
                    <p className="text-sm text-slate-400 leading-relaxed">
                      Adultos de 30 anos estão vulneráveis por não conseguirem controlar o ritmo de vida, sem tempo para desenvolver "ressonância" com o mundo.
                    </p>
                  </CardBody>
                </Card>
              </motion.div>

              {/* Zygmunt Bauman */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 3.4, duration: 0.6 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="group"
              >
                <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm border border-slate-600/50 hover:border-purple-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-400/20 h-full">
                  <CardBody className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center border border-purple-400/30">
                        <Icon icon="lucide:waves" className="text-purple-400" width={28} height={28} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-200 font-mono">Zygmunt Bauman</h3>
                        <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full font-mono">
                          MODERNIDADE LÍQUIDA
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-slate-900/50 border-l-4 border-purple-400 p-3 mb-4 rounded-r">
                      <p className="text-sm text-slate-300 italic">
                        "Individualização forçada sem recursos estruturais"
                      </p>
                    </div>
                    
                    <p className="text-sm text-slate-400 leading-relaxed">
                      Relacionamentos e instituições tornaram-se fluidos demais para oferecer estabilidade existencial, criando pressão para ser individual sem suporte.
                    </p>
                  </CardBody>
                </Card>
              </motion.div>

              {/* Viktor Frankl */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 3.6, duration: 0.6 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="group"
              >
                <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm border border-slate-600/50 hover:border-orange-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-400/20 h-full">
                  <CardBody className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center border border-orange-400/30">
                        <Icon icon="lucide:search" className="text-orange-400" width={28} height={28} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-200 font-mono">Viktor Frankl</h3>
                        <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full font-mono">
                          VÁCUO EXISTENCIAL
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-slate-900/50 border-l-4 border-orange-400 p-3 mb-4 rounded-r">
                      <p className="text-sm text-slate-300 italic">
                        "Tríade neurótica de massa: agressão, depressão e vício"
                      </p>
                    </div>
                    
                    <p className="text-sm text-slate-400 leading-relaxed">
                      A apatia é manifestação do vácuo existencial que surge quando a busca por sentido é bloqueada, levando à perda de significado transcendente.
                    </p>
                  </CardBody>
                </Card>
              </motion.div>

              {/* Charles Taylor */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 3.8, duration: 0.6 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="group"
              >
                <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm border border-slate-600/50 hover:border-red-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-red-400/20 h-full">
                  <CardBody className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center border border-red-400/30">
                        <Icon icon="lucide:compass" className="text-red-400" width={28} height={28} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-200 font-mono">Charles Taylor</h3>
                        <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full font-mono">
                          MAL-ESTARES DA MODERNIDADE
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-slate-900/50 border-l-4 border-red-400 p-3 mb-4 rounded-r">
                      <p className="text-sm text-slate-300 italic">
                        "Perda de horizontes morais e ascensão da razão instrumental"
                      </p>
                    </div>
                    
                    <p className="text-sm text-slate-400 leading-relaxed">
                      Identifica três mal-estares: perda de horizontes morais, ascensão da razão instrumental e paradoxal perda de liberdade através do excesso de escolhas.
                    </p>
                  </CardBody>
                </Card>
              </motion.div>

              {/* Interactive Summary Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 4, duration: 0.6 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="group"
              >
                <Card className="bg-gradient-to-br from-slate-700/60 to-slate-800/60 backdrop-blur-sm border border-slate-500/50 hover:border-slate-400/70 transition-all duration-300 hover:shadow-lg hover:shadow-slate-400/20 h-full flex flex-col justify-center">
                  <CardBody className="p-6 text-center">
                    <div className="w-16 h-16 bg-slate-500/20 rounded-full flex items-center justify-center border border-slate-400/30 mx-auto mb-4">
                      <Icon icon="lucide:network" className="text-slate-400" width={28} height={28} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-200 font-mono mb-4">
                      CONVERGÊNCIA TEÓRICA
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      Análise multidisciplinar revela padrões estruturais por trás da apatia moderna
                    </p>
                  </CardBody>
                </Card>
              </motion.div>
            </div>

            {/* Summary Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 4.2, duration: 0.8 }}
            >
              <Card className="bg-slate-800/40 backdrop-blur-sm border border-slate-600/40">
                <CardBody className="p-8">
                  <h3 className="text-2xl font-bold text-slate-200 mb-4 font-mono flex items-center gap-3">
                    <Icon icon="lucide:lightbulb" className="text-yellow-400" width={28} height={28} />
                    SÍNTESE FILOSÓFICA
                  </h3>
                  <p className="text-lg text-slate-300 leading-relaxed">
                    Os pensadores contemporâneos convergem em identificar a apatia dos 30 anos como produto de{" "}
                    <span className="text-green-400 font-semibold">estruturas sociais específicas</span>, não deficiências pessoais.
                    A combinação de auto-exploração, aceleração temporal, fluidez institucional e perda de sentido
                    cria um ambiente propício para o desenvolvimento da apatia como{" "}
                    <span className="text-blue-400 font-semibold">resposta adaptativa</span>.
                  </p>
                </CardBody>
              </Card>
            </motion.div>
                     </motion.div>

          {/* Neurobiologia Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 4.5, duration: 1 }}
            className="max-w-7xl mx-auto"
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-300 via-gray-300 to-slate-400 tracking-wide font-mono mb-6">
                A BASE NEUROBIOLÓGICA
              </h2>
              <p className="text-lg text-slate-400 font-mono">
                PARTE 1: Fundamentos Científicos da Apatia Moderna
              </p>
            </div>

            {/* Dopamine and Cortex Grid */}
            <div className="grid lg:grid-cols-2 gap-8 mb-12">
              {/* Dopamine Decline */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 5, duration: 0.8 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm border border-slate-600/50 hover:border-blue-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-400/20 h-full">
                  <CardBody className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <Icon icon="lucide:trending-down" className="text-blue-400" width={24} height={24} />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-200 font-mono">
                        DECLÍNIO DOPAMINÉRGICO
                      </h3>
                    </div>

                    {/* Dopamine Line Chart Visualization */}
                    <div className="bg-slate-900/50 rounded-lg p-6 mb-6 border border-slate-700/50">
                      <div className="relative h-40 mb-4">
                        {/* Grid lines */}
                        <div className="absolute inset-0">
                          {[20, 40, 60, 80, 100].map((line) => (
                            <div 
                              key={line}
                              className="absolute w-full border-t border-slate-700/30"
                              style={{ bottom: `${line}%` }}
                            >
                              <span className="absolute -left-8 -top-2 text-xs text-slate-500 font-mono">
                                {line}%
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Data points and line */}
                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 160">
                          {/* Line path */}
                          <motion.path
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ delay: 5.5, duration: 2, ease: "easeInOut" }}
                            d="M 50,16 L 130,32 L 210,46 L 290,59 L 370,70"
                            stroke="#60a5fa"
                            strokeWidth="3"
                            fill="none"
                            className="drop-shadow-lg"
                          />
                          
                          {/* Data points */}
                          {[
                            { x: 50, y: 16, age: '20', level: 100 },
                            { x: 130, y: 32, age: '30', level: 90 },
                            { x: 210, y: 46, age: '40', level: 81 },
                            { x: 290, y: 59, age: '50', level: 73 },
                            { x: 370, y: 70, age: '60', level: 66 }
                          ].map((point, index) => (
                            <motion.g key={point.age}>
                              <motion.circle
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 5.7 + index * 0.2, duration: 0.5 }}
                                cx={point.x}
                                cy={point.y}
                                r="6"
                                fill="#3b82f6"
                                stroke="#60a5fa"
                                strokeWidth="2"
                                className="cursor-pointer hover:fill-blue-400 transition-colors"
                              />
                              {/* Pulse ring */}
                              <motion.circle
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                                transition={{ 
                                  delay: 5.7 + index * 0.2,
                                  duration: 1.5,
                                  repeat: Infinity,
                                  repeatDelay: 2
                                }}
                                cx={point.x}
                                cy={point.y}
                                r="6"
                                fill="none"
                                stroke="#60a5fa"
                                strokeWidth="1"
                              />
                              {/* Age labels */}
                              <text 
                                x={point.x} 
                                y="155" 
                                textAnchor="middle" 
                                className="fill-slate-300 text-xs font-mono"
                              >
                                {point.age}
                              </text>
                              {/* Value tooltip */}
                              <motion.g
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 6 + index * 0.2, duration: 0.5 }}
                              >
                                <rect
                                  x={point.x - 15}
                                  y={point.y - 25}
                                  width="30"
                                  height="16"
                                  rx="8"
                                  fill="#1e293b"
                                  stroke="#475569"
                                  strokeWidth="1"
                                />
                                <text
                                  x={point.x}
                                  y={point.y - 13}
                                  textAnchor="middle"
                                  className="fill-blue-400 text-xs font-mono font-semibold"
                                >
                                  {point.level}%
                                </text>
                              </motion.g>
                            </motion.g>
                          ))}
                        </svg>

                        {/* Age axis labels */}
                        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-12">
                          <span className="text-xs text-slate-400 font-mono">ANOS</span>
                        </div>
                      </div>
                      <div className="text-center text-xs text-slate-400 font-mono">
                        DISPONIBILIDADE DE DOPAMINA POR IDADE
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Icon icon="lucide:check-circle" className="text-green-400 mt-1 flex-shrink-0" width={16} height={16} />
                        <p className="text-sm text-slate-300">
                          Redução de <span className="text-orange-400 font-semibold">10% na disponibilidade de dopamina</span> por década após os 20 anos
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <Icon icon="lucide:check-circle" className="text-green-400 mt-1 flex-shrink-0" width={16} height={16} />
                        <p className="text-sm text-slate-300">
                          Declínio de 6-8% na densidade de transportadores dopaminérgicos no estriado ventral
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <Icon icon="lucide:check-circle" className="text-green-400 mt-1 flex-shrink-0" width={16} height={16} />
                        <p className="text-sm text-slate-300">
                          Impacto direto na motivação, iniciativa e sensação de recompensa
                        </p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>

              {/* Prefrontal Cortex */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 5.2, duration: 0.8 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm border border-slate-600/50 hover:border-purple-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-400/20 h-full">
                  <CardBody className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <Icon icon="lucide:brain" className="text-purple-400" width={24} height={24} />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-200 font-mono">
                        CÓRTEX PRÉ-FRONTAL
                      </h3>
                    </div>

                    {/* Brain Visualization */}
                    <div className="flex justify-center mb-6">
                      <div className="relative">
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: 5.7, duration: 1, type: "spring" }}
                          className="w-40 h-40 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-full border border-purple-400/30 flex items-center justify-center relative"
                        >
                          <Icon icon="lucide:brain" className="text-purple-400" width={60} height={60} />
                          
                          {/* Decline indicator */}
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 6.5, duration: 0.5 }}
                            className="absolute -top-2 -right-2 w-12 h-12 bg-red-500/90 rounded-full flex items-center justify-center border-2 border-red-400"
                          >
                            <span className="text-white font-bold text-sm font-mono">-1%</span>
                          </motion.div>
                          
                          {/* Pulse rings */}
                          <div className="absolute inset-0 rounded-full border border-purple-400/20 animate-ping"></div>
                          <div className="absolute inset-2 rounded-full border border-purple-400/10 animate-ping animation-delay-1000"></div>
                        </motion.div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Icon icon="lucide:check-circle" className="text-green-400 mt-1 flex-shrink-0" width={16} height={16} />
                        <p className="text-sm text-slate-300">
                          Redução volumétrica de <span className="text-orange-400 font-semibold">0,5-1% anualmente</span> após os 30 anos
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <Icon icon="lucide:check-circle" className="text-green-400 mt-1 flex-shrink-0" width={16} height={16} />
                        <p className="text-sm text-slate-300">
                          Compromete funções executivas essenciais para iniciativa e planejamento
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <Icon icon="lucide:check-circle" className="text-green-400 mt-1 flex-shrink-0" width={16} height={16} />
                        <p className="text-sm text-slate-300">
                          Conflito entre sistema límbico (emoção) e córtex pré-frontal (controle)
                        </p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            </div>

            {/* Neuroinflammation Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 6, duration: 0.8 }}
            >
              <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm border border-slate-600/50 hover:border-red-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-red-400/20">
                <CardBody className="p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                      <Icon icon="lucide:flame" className="text-red-400" width={24} height={24} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-200 font-mono">
                      NEUROINFLAMAÇÃO: MECANISMO CAUSAL CENTRAL
                    </h3>
                  </div>

                  <div className="grid lg:grid-cols-3 gap-8 items-center">
                    {/* Correlation Stats */}
                    <div className="lg:col-span-1">
                      <Card className="bg-slate-900/50 border border-slate-700/50">
                        <CardBody className="p-6 text-center">
                          <div className="text-4xl font-bold text-red-400 font-mono mb-2">
                            0,65-0,78
                          </div>
                          <div className="text-xs text-slate-400 font-mono mb-2">CORRELAÇÃO</div>
                          <p className="text-sm text-slate-300">
                            entre níveis de ácido quinolínico e sintomas apáticos
                          </p>
                        </CardBody>
                      </Card>
                    </div>

                    {/* Process Flow */}
                    <div className="lg:col-span-2">
                      <p className="text-slate-300 mb-6 leading-relaxed">
                        A ativação microglial crônica libera citocinas pró-inflamatórias (IL-1β, IL-6, TNF-α) que ativam a via da quinurenina, 
                        desviando triptofano da síntese de serotonina para produção de ácido quinolínico neurotóxico.
                      </p>

                      {/* Visual Process Flow */}
                      <div className="flex items-center justify-center gap-6">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 6.5, duration: 0.5 }}
                          className="text-center"
                        >
                          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-400/30 mb-2">
                            <Icon icon="lucide:brain" className="text-blue-400" width={28} height={28} />
                          </div>
                          <span className="text-xs text-slate-400 font-mono">CÉREBRO SAUDÁVEL</span>
                        </motion.div>

                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 6.7, duration: 0.5 }}
                        >
                          <Icon icon="lucide:arrow-right" className="text-slate-500" width={24} height={24} />
                        </motion.div>

                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 6.9, duration: 0.5 }}
                          className="text-center"
                        >
                          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center border border-red-400/30 mb-2 animate-pulse">
                            <Icon icon="lucide:flame" className="text-red-400" width={28} height={28} />
                          </div>
                          <span className="text-xs text-slate-400 font-mono">INFLAMAÇÃO</span>
                        </motion.div>

                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 7.1, duration: 0.5 }}
                        >
                          <Icon icon="lucide:arrow-right" className="text-slate-500" width={24} height={24} />
                        </motion.div>

                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 7.3, duration: 0.5 }}
                          className="text-center"
                        >
                          <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center border border-yellow-400/30 mb-2">
                            <Icon icon="lucide:battery-low" className="text-yellow-400" width={28} height={28} />
                          </div>
                          <span className="text-xs text-slate-400 font-mono">APATIA</span>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          </motion.div>

          {/* Neurobiologia Parte 2 Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 7.5, duration: 1 }}
            className="max-w-7xl mx-auto"
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-300 via-gray-300 to-slate-400 tracking-wide font-mono mb-6">
                A BASE NEUROBIOLÓGICA
              </h2>
              <p className="text-lg text-slate-400 font-mono">
                PARTE 2: Diferenciação Diagnóstica Científica
              </p>
            </div>

            {/* Comparison Grid - Preguiça vs Procrastinação vs Apatia */}
            <div className="grid lg:grid-cols-3 gap-6 mb-12">
              {/* Preguiça */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 8, duration: 0.6 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm border border-slate-600/50 hover:border-yellow-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-400/20 h-full">
                  <div className="bg-gradient-to-r from-yellow-600 to-yellow-500 px-6 py-4 rounded-t-lg">
                    <div className="flex items-center gap-3">
                      <Icon icon="lucide:sofa" className="text-white" width={24} height={24} />
                      <h3 className="text-xl font-bold text-white font-mono">PREGUIÇA</h3>
                    </div>
                  </div>
                  <CardBody className="p-6">
                    <p className="text-sm text-slate-300 mb-4">
                      <span className="font-bold text-slate-200">Definição:</span> Preferência comportamental consciente por atividades de menor esforço.
                    </p>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-start gap-3">
                        <Icon icon="lucide:check-circle" className="text-green-400 mt-1 flex-shrink-0" width={16} height={16} />
                        <span className="text-sm text-slate-300">Sistemas neuroquímicos funcionais</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <Icon icon="lucide:check-circle" className="text-green-400 mt-1 flex-shrink-0" width={16} height={16} />
                        <span className="text-sm text-slate-300">Responsividade a incentivos externos</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <Icon icon="lucide:check-circle" className="text-green-400 mt-1 flex-shrink-0" width={16} height={16} />
                        <span className="text-sm text-slate-300">Escolha consciente e reversível</span>
                      </div>
                    </div>
                    
                    <div className="bg-slate-900/50 rounded-lg p-4 text-center">
                      <span className="text-sm text-yellow-400 font-bold font-mono">RESPONDE A:</span>
                      <p className="text-sm text-slate-300 mt-1">Modificações comportamentais simples</p>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>

              {/* Procrastinação */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 8.2, duration: 0.6 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm border border-slate-600/50 hover:border-orange-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-400/20 h-full">
                  <div className="bg-gradient-to-r from-orange-600 to-red-500 px-6 py-4 rounded-t-lg">
                    <div className="flex items-center gap-3">
                      <Icon icon="lucide:hourglass" className="text-white" width={24} height={24} />
                      <h3 className="text-xl font-bold text-white font-mono">PROCRASTINAÇÃO</h3>
                    </div>
                  </div>
                  <CardBody className="p-6">
                    <p className="text-sm text-slate-300 mb-4">
                      <span className="font-bold text-slate-200">Definição:</span> Déficit de autorregulação com hiperativação límbica e hipoativação pré-frontal.
                    </p>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-start gap-3">
                        <Icon icon="lucide:check-circle" className="text-green-400 mt-1 flex-shrink-0" width={16} height={16} />
                        <span className="text-sm text-slate-300">Processamento temporal alterado</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <Icon icon="lucide:check-circle" className="text-green-400 mt-1 flex-shrink-0" width={16} height={16} />
                        <span className="text-sm text-slate-300">Capacidade neuroquímica preservada</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <Icon icon="lucide:check-circle" className="text-green-400 mt-1 flex-shrink-0" width={16} height={16} />
                        <span className="text-sm text-slate-300">Conflito entre intenção e ação</span>
                      </div>
                    </div>
                    
                    <div className="bg-slate-900/50 rounded-lg p-4 text-center">
                      <span className="text-sm text-orange-400 font-bold font-mono">RESPONDE A:</span>
                      <p className="text-sm text-slate-300 mt-1">Técnicas de autorregulação e estruturação</p>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>

              {/* Apatia */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 8.4, duration: 0.6 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm border border-slate-600/50 hover:border-purple-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-400/20 h-full">
                  <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 rounded-t-lg">
                    <div className="flex items-center gap-3">
                      <Icon icon="lucide:battery-low" className="text-white" width={24} height={24} />
                      <h3 className="text-lg font-bold text-white font-mono">INCAPACIDADE NEUROQUÍMICA</h3>
                    </div>
                  </div>
                  <CardBody className="p-6">
                    <p className="text-sm text-slate-300 mb-4">
                      <span className="font-bold text-slate-200">Definição:</span> Déficits mensuráveis com alterações estruturais cerebrais documentadas.
                    </p>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-start gap-3">
                        <Icon icon="lucide:check-circle" className="text-green-400 mt-1 flex-shrink-0" width={16} height={16} />
                        <span className="text-sm text-slate-300">Redução quantificável de neurotransmissores</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <Icon icon="lucide:check-circle" className="text-green-400 mt-1 flex-shrink-0" width={16} height={16} />
                        <span className="text-sm text-slate-300">Resistência a intervenções comportamentais simples</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <Icon icon="lucide:check-circle" className="text-green-400 mt-1 flex-shrink-0" width={16} height={16} />
                        <span className="text-sm text-slate-300">Redução da atividade no córtex cingulado anterior</span>
                      </div>
                    </div>
                    
                    <div className="bg-slate-900/50 rounded-lg p-4 text-center">
                      <span className="text-sm text-purple-400 font-bold font-mono">RESPONDE A:</span>
                      <p className="text-sm text-slate-300 mt-1">Intervenções farmacológicas + neuromodulação</p>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            </div>

            {/* Anedonia and TDAH/Burnout Grid */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Anedonia */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 8.6, duration: 0.8 }}
              >
                <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm border border-slate-600/50 hover:border-pink-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-pink-400/20 h-full">
                  <CardBody className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center">
                        <Icon icon="lucide:heart-crack" className="text-pink-400" width={24} height={24} />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-200 font-mono">
                        ANEDONIA COMO SINTOMA CENTRAL
                      </h3>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 items-center mb-6">
                      {/* Percentage Circle */}
                      <div className="text-center">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 9, duration: 0.8, type: "spring" }}
                          className="relative w-24 h-24 mx-auto mb-3"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-pink-600/20 rounded-full border border-pink-400/30"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-3xl font-bold text-pink-400 font-mono">70%</span>
                          </div>
                          <div className="absolute inset-0 rounded-full border-2 border-pink-400/50"></div>
                        </motion.div>
                        <p className="text-sm text-slate-400">dos casos apresentam anedonia como sintoma central</p>
                      </div>

                      {/* Description */}
                      <div className="md:col-span-2">
                        <p className="text-sm text-slate-300 mb-4 leading-relaxed">
                          Diferentemente da depressão clássica, manifesta-se como "high-functioning depression" - manutenção do funcionamento ocupacional com{" "}
                          <span className="text-orange-400 font-semibold">gasto energético 10 vezes maior</span> que o normal.
                        </p>

                        {/* Symptom Tags */}
                        <div className="flex flex-wrap gap-2">
                          {[
                            "Perda de prazer",
                            "Fadiga persistente", 
                            "Funcionalidade preservada",
                            "Esforço aumentado",
                            "Mascaramento social"
                          ].map((symptom, index) => (
                            <motion.span
                              key={symptom}
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 9.2 + index * 0.1, duration: 0.4 }}
                              className="bg-pink-500/20 text-pink-400 px-3 py-1 rounded-full text-xs font-mono border border-pink-400/30"
                            >
                              {symptom}
                            </motion.span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>

              {/* TDAH and Burnout */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 8.8, duration: 0.8 }}
                className="space-y-6"
              >
                {/* TDAH Card */}
                <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm border border-slate-600/50 hover:border-cyan-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-400/20">
                  <CardBody className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                        <Icon icon="lucide:zap" className="text-cyan-400" width={20} height={20} />
                      </div>
                      <h4 className="text-lg font-bold text-slate-200 font-mono">
                        TDAH ADULTO NÃO DIAGNOSTICADO
                      </h4>
                    </div>

                    <p className="text-sm text-slate-300 mb-3">
                      Afeta 2,5-5% da população adulta, com manifestações específicas aos 30 anos:
                    </p>

                    <div className="space-y-2">
                      {[
                        '"Trail of incompletions" - projetos inacabados',
                        'Procrastinação patológica associada à disfunção executiva',
                        '"ADHD paralysis" - imobilização por sobrecarga cognitiva'
                      ].map((item, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <Icon icon="lucide:chevron-right" className="text-cyan-400 mt-1 flex-shrink-0" width={14} height={14} />
                          <span className="text-sm text-slate-300">{item}</span>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>

                {/* Burnout Card */}
                <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm border border-slate-600/50 hover:border-red-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-red-400/20">
                  <CardBody className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                        <Icon icon="lucide:flame" className="text-red-400" width={20} height={20} />
                      </div>
                      <h4 className="text-lg font-bold text-slate-200 font-mono">
                        BURNOUT SILENCIOSO
                      </h4>
                    </div>

                    <p className="text-sm text-slate-300 mb-3">
                      Caracteriza-se por sintomas físicos subclínicos:
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {[
                        "Cefaléias tensionais",
                        "Distúrbios gastrointestinais",
                        "Insônia paradoxal",
                        "23-40% desenvolvem depressão secundária"
                      ].map((symptom, index) => (
                        <motion.span
                          key={symptom}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 9.5 + index * 0.1, duration: 0.4 }}
                          className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-mono border border-red-400/30"
                        >
                          {symptom}
                        </motion.span>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            </div>

            {/* Contexto Moderno Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 10, duration: 1 }}
              className="mt-24"
            >
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-300 via-gray-300 to-slate-400 tracking-wide font-mono mb-6">
                  O IMPACTO DO CONTEXTO MODERNO
                </h2>
                <p className="text-lg text-slate-400 font-mono">
                  Fatores estruturais que moldam nossa condição contemporânea
                </p>
              </div>

              {/* Four Concepts Grid */}
              <div className="grid lg:grid-cols-2 gap-6 mb-12">
                {/* Auto-exploração Neoliberal */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 10.5, duration: 0.6 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                >
                  <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm border border-slate-600/50 hover:border-blue-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-400/20 h-full">
                    <CardBody className="p-8">
                      <div className="flex items-start gap-6">
                        {/* Icon */}
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: 11, duration: 0.8 }}
                          className="w-16 h-16 bg-gradient-to-br from-blue-500/30 to-blue-600/30 rounded-full flex items-center justify-center border border-blue-400/40 flex-shrink-0"
                        >
                          <Icon icon="lucide:user-check" className="text-blue-400" width={28} height={28} />
                        </motion.div>

                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-slate-200 mb-4 font-mono">
                            AUTO-EXPLORAÇÃO NEOLIBERAL
                          </h3>
                          
                          <div className="bg-slate-900/50 border-l-4 border-blue-400 p-4 mb-4 rounded-r">
                            <p className="text-sm text-slate-300 italic">
                              "O sujeito empresarial de si mesmo - explorador e explorado simultaneamente"
                            </p>
                          </div>

                          <p className="text-sm text-slate-300 leading-relaxed">
                            O neoliberalismo produziu um sujeito que se auto-explora, sendo esta auto-exploração{" "}
                            <span className="text-orange-400 font-semibold">mais eficiente que a alo-exploração porque é acompanhada por sentimento de liberdade</span>, 
                            criando burnout neuronal e psíquico invisível.
                          </p>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>

                {/* Aceleração Social */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 10.7, duration: 0.6 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                >
                  <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm border border-slate-600/50 hover:border-green-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-400/20 h-full">
                    <CardBody className="p-8">
                      <div className="flex items-start gap-6">
                        {/* Icon */}
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: 11.2, duration: 0.8 }}
                          className="w-16 h-16 bg-gradient-to-br from-green-500/30 to-green-600/30 rounded-full flex items-center justify-center border border-green-400/40 flex-shrink-0"
                        >
                          <Icon icon="lucide:gauge" className="text-green-400" width={28} height={28} />
                        </motion.div>

                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-slate-200 mb-4 font-mono">
                            ACELERAÇÃO SOCIAL
                          </h3>
                          
                          <div className="bg-slate-900/50 border-l-4 border-green-400 p-4 mb-4 rounded-r">
                            <p className="text-sm text-slate-300 italic">
                              "Encolhimento do presente - período decrescente onde expectativas baseadas no passado correspondem ao futuro"
                            </p>
                          </div>

                          <p className="text-sm text-slate-300 leading-relaxed">
                            Hartmut Rosa identifica três formas entrelaçadas de aceleração: tecnológica, da mudança social e do ritmo de vida, 
                            produzindo <span className="text-orange-400 font-semibold">"standstill frenético"</span> - aceleração máxima que paradoxalmente produz paralisia.
                          </p>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>

                {/* Home Office Limbo */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 10.9, duration: 0.6 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                >
                  <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm border border-slate-600/50 hover:border-red-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-red-400/20 h-full">
                    <CardBody className="p-8">
                      <div className="flex items-start gap-6">
                        {/* Icon */}
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: 11.4, duration: 0.8 }}
                          className="w-16 h-16 bg-gradient-to-br from-red-500/30 to-red-600/30 rounded-full flex items-center justify-center border border-red-400/40 flex-shrink-0"
                        >
                          <Icon icon="lucide:home" className="text-red-400" width={28} height={28} />
                        </motion.div>

                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-slate-200 mb-4 font-mono">
                            LIMBO EXISTENCIAL DO HOME OFFICE
                          </h3>
                          
                          <div className="bg-slate-900/50 border-l-4 border-red-400 p-4 mb-4 rounded-r">
                            <p className="text-sm text-slate-300 italic">
                              "O cérebro processa o mesmo espaço físico simultaneamente como 'local de trabalho' e 'lar'"
                            </p>
                          </div>

                          <p className="text-sm text-slate-300 leading-relaxed">
                            O trabalho remoto intensifica formas clássicas de alienação, criando{" "}
                            <span className="text-orange-400 font-semibold">isolamento estrutural</span> distinto do isolamento escolhido. 
                            Pesquisa da Microsoft demonstra que trabalho remoto torna redes colaborativas "mais estáticas e compartimentalizadas".
                          </p>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>

                {/* Zoom Fatigue */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 11.1, duration: 0.6 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                >
                  <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm border border-slate-600/50 hover:border-purple-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-400/20 h-full">
                    <CardBody className="p-8">
                      <div className="flex items-start gap-6">
                        {/* Icon */}
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: 11.6, duration: 0.8 }}
                          className="w-16 h-16 bg-gradient-to-br from-purple-500/30 to-purple-600/30 rounded-full flex items-center justify-center border border-purple-400/40 flex-shrink-0"
                        >
                          <Icon icon="lucide:video" className="text-purple-400" width={28} height={28} />
                        </motion.div>

                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-slate-200 mb-4 font-mono">
                            ZOOM FATIGUE
                          </h3>
                          
                          <div className="bg-slate-900/50 border-l-4 border-purple-400 p-4 mb-4 rounded-r">
                            <p className="text-sm text-slate-300 italic">
                              "Contato visual artificial prolongado ativa sistemas neurais de alerta social"
                            </p>
                          </div>

                          <p className="text-sm text-slate-300 leading-relaxed">
                            "Zoom fatigue" possui base neurobiológica específica: aumenta cortisol em 15-20%, 
                            enquanto o cérebro gasta <span className="text-orange-400 font-semibold">35% mais energia</span> processando sinais não-verbais limitados. 
                            Ver-se constantemente na tela cria "ansiedade do espelho".
                          </p>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              </div>

              {/* Synthesis Section */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 11.8, duration: 0.8 }}
              >
                <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm border border-slate-600/50 hover:border-cyan-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-400/20">
                  <CardBody className="p-8">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                        <Icon icon="lucide:link" className="text-cyan-400" width={24} height={24} />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-200 font-mono">
                        SÍNTESE: A CONVERGÊNCIA DE PRESSÕES
                      </h3>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8 items-center">
                      {/* Text Content */}
                      <div>
                        <p className="text-slate-300 mb-4 leading-relaxed">
                          A combinação destes fatores cria um ambiente único na história humana: 
                          estruturas que simultaneamente prometem e impossibilitam realização.
                        </p>
                        
                        <p className="text-slate-300 leading-relaxed">
                          O neoliberalismo produz sujeitos que se auto-exploram até o esgotamento sob ilusão de liberdade, 
                          enquanto tecnologias que prometiam eficiência criaram sobrecarga cognitiva subliminar. 
                          O trabalho remoto gerou "limbo existencial" onde fronteiras espaço-temporais dissolvidas 
                          impedem formação de identidade coerente.
                        </p>
                      </div>

                      {/* Radar Chart Visualization */}
                      <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-700/50">
                        <div className="text-center mb-4">
                          <h4 className="text-lg font-bold text-slate-200 font-mono mb-2">
                            PRESSÕES CONTEXTUAIS
                          </h4>
                          <p className="text-xs text-slate-400 font-mono">
                            Comparação geracional
                          </p>
                        </div>

                        {/* Simplified Radar Visualization */}
                        <div className="relative w-64 h-64 mx-auto">
                          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
                            {/* Grid circles */}
                            <circle cx="100" cy="100" r="20" fill="none" stroke="#475569" strokeWidth="1" opacity="0.3" />
                            <circle cx="100" cy="100" r="40" fill="none" stroke="#475569" strokeWidth="1" opacity="0.3" />
                            <circle cx="100" cy="100" r="60" fill="none" stroke="#475569" strokeWidth="1" opacity="0.3" />
                            <circle cx="100" cy="100" r="80" fill="none" stroke="#475569" strokeWidth="1" opacity="0.3" />
                            
                            {/* Grid lines */}
                            <line x1="100" y1="20" x2="100" y2="180" stroke="#475569" strokeWidth="1" opacity="0.3" />
                            <line x1="20" y1="100" x2="180" y2="100" stroke="#475569" strokeWidth="1" opacity="0.3" />
                            <line x1="40" y1="40" x2="160" y2="160" stroke="#475569" strokeWidth="1" opacity="0.3" />
                            <line x1="160" y1="40" x2="40" y2="160" stroke="#475569" strokeWidth="1" opacity="0.3" />

                            {/* Data polygon - Geração 30+ */}
                            <motion.polygon
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 0.6 }}
                              transition={{ delay: 12.5, duration: 1 }}
                              points="100,32 168,68 176,132 132,168 68,132"
                              fill="#3b82f6"
                              stroke="#60a5fa"
                              strokeWidth="2"
                            />

                            {/* Data polygon - Gerações Anteriores */}
                            <motion.polygon
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 0.4 }}
                              transition={{ delay: 12.7, duration: 1 }}
                              points="100,52 148,76 156,124 124,148 76,124"
                              fill="#10b981"
                              stroke="#34d399"
                              strokeWidth="2"
                            />

                            {/* Labels */}
                            <text x="100" y="15" textAnchor="middle" className="fill-slate-300 text-xs font-mono">Auto-exploração</text>
                            <text x="185" y="60" textAnchor="middle" className="fill-slate-300 text-xs font-mono">Aceleração</text>
                            <text x="185" y="145" textAnchor="middle" className="fill-slate-300 text-xs font-mono">Fusão E-T</text>
                            <text x="100" y="195" textAnchor="middle" className="fill-slate-300 text-xs font-mono">Sobrecarga</text>
                            <text x="15" y="145" textAnchor="middle" className="fill-slate-300 text-xs font-mono">Isolamento</text>
                          </svg>
                        </div>

                        {/* Legend */}
                        <div className="flex justify-center gap-6 mt-4">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-500 rounded"></div>
                            <span className="text-xs text-slate-300 font-mono">Geração 30+</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded"></div>
                            <span className="text-xs text-slate-300 font-mono">Gerações Anteriores</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            </motion.div>
          </motion.div>
         </div>
       </div>

      <style jsx>{`
        @keyframes slowfall {
          0% { 
            opacity: 0.3; 
            transform: translateY(-20px);
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