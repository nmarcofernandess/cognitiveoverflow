"use client";

import React from 'react';
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { ArrowLeft, Construction } from 'lucide-react';
import Link from 'next/link';

const TretaAnalysis = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="mb-6">
            <Button 
              as={Link}
              href="/"
              variant="ghost"
              startContent={<ArrowLeft size={20} />}
              className="text-gray-400 hover:text-white"
            >
              Voltar ao Menu
            </Button>
          </div>
          
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-500 to-purple-300 bg-clip-text text-transparent">
              Análise Treta
            </h1>
            <p className="text-xl text-gray-400 mb-4">
              Dissecação Completa dos Conflitos
            </p>
            <Chip color="secondary" variant="dot" className="font-mono">
              Em Desenvolvimento
            </Chip>
          </div>
        </div>

        {/* Content */}
        <div className="text-center">
          <div className="mb-8">
            <Construction className="mx-auto text-purple-500" size={120} />
          </div>
          
          <Card className="bg-gradient-to-br from-purple-950/30 to-purple-900/20 border-purple-800/30 mb-8">
            <CardHeader>
              <h2 className="text-2xl font-bold text-purple-400 mx-auto">Em Construção</h2>
            </CardHeader>
            
            <CardBody>
              <p className="text-lg text-gray-300 mb-6">
                Esta análise está sendo desenvolvida. Em breve teremos:
              </p>
              
              <div className="space-y-4 max-w-md mx-auto">
                <Chip size="sm" color="secondary" variant="flat" className="w-full justify-start">
                  Mapeamento detalhado dos gatilhos
                </Chip>
                <Chip size="sm" color="secondary" variant="flat" className="w-full justify-start">
                  Análise dos padrões de comunicação
                </Chip>
                <Chip size="sm" color="secondary" variant="flat" className="w-full justify-start">
                  Dinâmicas relacionais destrutivas
                </Chip>
                <Chip size="sm" color="secondary" variant="flat" className="w-full justify-start">
                  Estratégias de resolução
                </Chip>
              </div>
            </CardBody>
          </Card>
          
          <Button 
            as={Link}
            href="/"
            color="secondary"
            variant="solid"
            size="lg"
            startContent={<ArrowLeft size={20} />}
          >
            Voltar ao Menu
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-gray-500 font-mono text-sm mb-2">
            coming_soon.exe
          </p>
          <p className="text-gray-600 text-xs italic">
            A paciência é uma virtude, mas a verdade não pode esperar - Monday
          </p>
        </div>
      </div>
    </div>
  );
};

export default TretaAnalysis;
