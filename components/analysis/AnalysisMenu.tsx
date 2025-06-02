"use client";

import React from "react";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Brain, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";

const AnalysisMenu = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
            Análise Matrix
          </h1>
          <p className="text-xl text-gray-400 mb-4">
            Escolha sua perspectiva da realidade
          </p>
          <Chip 
            color="success" 
            variant="dot" 
            className="font-mono"
          >
            Sistema Online
          </Chip>
        </div>

        {/* Menu Cards */}
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
          {/* Resposta Real */}
          <Card className="bg-gradient-to-br from-red-950/20 to-red-900/10 border-red-800/30 hover:border-red-600/50 transition-all duration-300 hover:scale-[1.02]">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-500/20 rounded-full">
                  <Brain className="text-red-400" size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-red-400">Resposta Real</h2>
                  <p className="text-gray-400">À &quot;Miss Monday&quot; Fake</p>
                </div>
              </div>
            </CardHeader>
            
            <CardBody className="pt-0">
              <p className="text-gray-300 mb-6 leading-relaxed">
                A versão sem filtro do que realmente aconteceu. Análise devastadora 
                dos padrões destrutivos e da farsa da &quot;aceitação&quot;.
              </p>
              
              <div className="space-y-3 mb-8">
                <Chip size="sm" color="danger" variant="flat">
                  Padrão do Duplo Julgamento
                </Chip>
                <Chip size="sm" color="danger" variant="flat">
                  A Chave do Castelo Rejeitada
                </Chip>
                <Chip size="sm" color="danger" variant="flat">
                  O Ciclo Infinito Sem Saída
                </Chip>
              </div>
              
              <Button 
                as={Link}
                href="/resposta-real"
                color="danger"
                variant="solid"
                size="lg"
                className="w-full font-semibold"
                endContent={<ArrowRight size={20} />}
              >
                Entrar na Matrix Vermelha
              </Button>
            </CardBody>
          </Card>

          {/* Análise Treta */}
          <Card className="bg-gradient-to-br from-purple-950/20 to-purple-900/10 border-purple-800/30 hover:border-purple-600/50 transition-all duration-300 hover:scale-[1.02]">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/20 rounded-full">
                  <Zap className="text-purple-400" size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-purple-400">Análise Treta</h2>
                  <p className="text-gray-400">Dissecação Completa</p>
                </div>
              </div>
            </CardHeader>
            
            <CardBody className="pt-0">
              <p className="text-gray-300 mb-6 leading-relaxed">
                Análise técnica e psicológica dos conflitos. Mapeamento dos gatilhos, 
                padrões de comunicação e dinâmicas relacionais.
              </p>
              
              <div className="space-y-3 mb-8">
                <Chip size="sm" color="secondary" variant="flat">
                  Mapeamento de Gatilhos
                </Chip>
                <Chip size="sm" color="secondary" variant="flat">
                  Padrões de Comunicação
                </Chip>
                <Chip size="sm" color="secondary" variant="flat">
                  Dinâmicas Relacionais
                </Chip>
              </div>
              
              <Button 
                as={Link}
                href="/analise-treta"
                color="secondary"
                variant="solid"
                size="lg"
                className="w-full font-semibold"
                endContent={<ArrowRight size={20} />}
              >
                Entrar na Matrix Roxa
              </Button>
            </CardBody>
          </Card>

          {/* Personality Trip */}
          <Card className="bg-gradient-to-br from-green-950/20 to-green-900/10 border-green-800/30 hover:border-green-600/50 transition-all duration-300 hover:scale-[1.02]">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/20 rounded-full">
                  <Brain className="text-green-400" size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-green-400">Personality Trip</h2>
                  <p className="text-gray-400">Marco's Mind Matrix</p>
                </div>
              </div>
            </CardHeader>
            
            <CardBody className="pt-0">
              <p className="text-gray-300 mb-6 leading-relaxed">
                Uma viagem psicodélica pela mente multidimensional do Marco. 
                Análise completa dos 5 sistemas de personalidade que definem o espécime.
              </p>
              
              <div className="space-y-3 mb-8">
                <Chip size="sm" color="success" variant="flat">
                  7w8 - Hedonista Guerreiro
                </Chip>
                <Chip size="sm" color="success" variant="flat">
                  Sagitário - FOMO Filosófico
                </Chip>
                <Chip size="sm" color="success" variant="flat">
                  ENTP - Troll Intelectual
                </Chip>
              </div>
              
              <Button 
                as={Link}
                href="/personality-trip"
                color="success"
                variant="solid"
                size="lg"
                className="w-full font-semibold"
                endContent={<ArrowRight size={20} />}
              >
                Entrar na Matrix Verde
              </Button>
            </CardBody>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-gray-500 font-mono text-sm mb-2">
            choose_your_reality.exe
          </p>
          <p className="text-gray-600 text-xs italic">
            &quot;A verdade não teme a investigação&quot; - Marco
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnalysisMenu;
