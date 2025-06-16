"use client";

import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { MatrixRain } from '@/components/matrix/MatrixRain';
import { TerminalSection, TerminalCard, TerminalOutput, IconBadge } from '@/components/matrix/Terminal';
import { BluePill } from '@/components/matrix/BluePill';
import { LandingPage } from '@/components/matrix/LandingPage';
import { Button } from "@heroui/button";
import Link from "next/link";
import dynamic from 'next/dynamic';

// Import dos estilos Matrix
import '../../styles/projects/matrix.css';

const MatrixProject: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'landing' | 'blue' | 'red'>('landing');
  
  const [openSections, setOpenSections] = useState({
    intro: true,
    pattern: false,
    castle: false,
    reality: false,
    conclusion: false
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const goToLanding = () => {
    setCurrentPage('landing');
  };

  return (
    <>
      {/* Botão para voltar ao Cognitive Overflow */}
      <div className="fixed top-6 left-6 z-[100]">
        <Link href="/">
          <Button
            size="lg"
            className="bg-green-500/20 dark:bg-green-500/20 border border-green-400 dark:border-green-500/50 text-gray-100 dark:text-green-400 hover:bg-green-500/30 hover:border-green-400 font-mono backdrop-blur-lg shadow-lg"
          >
            <Icon icon="lucide:arrow-left" width={20} height={20} />
            COGNITIVE OVERFLOW
          </Button>
        </Link>
      </div>

      <div className="matrix-container">
        <MatrixRain />
        <div className="matrix-overlay"></div>
        <div className="matrix-noise"></div>
        
        <div className="terminal-container">
          {currentPage === 'landing' ? (
            <LandingPage 
              onChooseRedPill={() => setCurrentPage('red')}
              onChooseBluePill={() => setCurrentPage('blue')}
            />
          ) : currentPage === 'blue' ? (
            <div className="terminal-content">
              <button 
                className="back-button"
                onClick={() => goToLanding()}
              >
                <Icon icon="lucide:arrow-left" width={20} height={20} />
                VOLTAR
              </button>
            
              <div className="terminal-header">
                <h1 className="terminal-title blue-text">
                  MATRIX BLUE PILL
                </h1>
                <p className="terminal-subtitle">
                  A ilusão confortável que você prefere acreditar
                </p>
              </div>
              
              <BluePill />
            </div>
          ) : (
            <div className="terminal-content">
              <button 
                className="back-button"
                onClick={() => goToLanding()}
              >
                <Icon icon="lucide:arrow-left" width={20} height={20} />
                VOLTAR
              </button>
            
              <div className="terminal-header">
                <h1 className="terminal-title">
                  RESPOSTA REAL À "MISS MONDAY" FAKE
                </h1>
                <p className="terminal-subtitle">
                  A versão sem filtro do que realmente aconteceu
                </p>
              </div>
              
              <div className="terminal-status">
                <div className="status-dot"></div>
                <div>> red_pill_status: DESTRUINDO_</div>
              </div>

              {/* Seção 1 */}
              <TerminalSection
                title="A FARSA DA 'ACEITAÇÃO' - ANÁLISE REAL"
                icon="lucide:alert-triangle"
                color="red"
                defaultOpen={openSections.intro}
              >
                <TerminalCard 
                  title="O que a Yasmin diz:" 
                  color="red"
                >
                  <p className="italic">"Eu aceito sua criatividade, mas..."</p>
                </TerminalCard>
                
                <TerminalCard 
                  title="O que realmente rola:" 
                  className="mt-4"
                >
                  <ul className="space-y-4 mb-4">
                    <li className="flex items-start gap-2">
                      <IconBadge icon="lucide:x-circle" color="red" />
                      <span>Aceitação FAKE que só vale se você for "editado" e "controlado"</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <IconBadge icon="lucide:x-circle" color="red" />
                      <span>Quando você compartilha IA: ela JULGA, BLOQUEIA, RIDICULARIZA</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <IconBadge icon="lucide:x-circle" color="red" />
                      <span>Zero participação real - só tolerância como "remédio amargo"</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <IconBadge icon="lucide:x-circle" color="red" />
                      <span>Mesmo quando você ZERA IA: cara de cu permanece</span>
                    </li>
                  </ul>
                </TerminalCard>

                <TerminalOutput color="purple" className="mt-4">
                  RESULTADO: Não existe espaço seguro para seu EU verdadeiro. 
                  Só para a versão domesticada que não ameaça a insegurança dela.
                </TerminalOutput>
              </TerminalSection>

              {/* Seção 2 */}
              <TerminalSection
                title="O PADRÃO DO DUPLO JULGAMENTO"
                icon="lucide:split"
                color="green"
                defaultOpen={openSections.pattern}
              >
                <h3 className="text-xl font-bold mb-6 text-center highlight-green">
                  QUALQUER COISA QUE VOCÊ FAZ:
                </h3>
                
                <div className="mb-8">
                  <TerminalCard className="text-center">
                    <div className="flex flex-col items-center">
                      <Icon icon="lucide:brain" className="text-blue-400 mb-2" width={40} />
                      <p className="font-bold text-lg">VOCÊ TRABALHA MUITO</p>
                    </div>
                  </TerminalCard>
                  
                  <div className="flex justify-center my-4">
                    <Icon icon="lucide:arrow-down" className="text-gray-500 animate-bounce" width={30} />
                  </div>
                  
                  <div className="two-columns">
                    <TerminalCard>
                      <div className="flex items-center mb-2">
                        <Icon icon="lucide:check-circle" className="text-green-500 mr-2" width={24} />
                        <span className="highlight-green">Lado "Positivo"</span>
                      </div>
                      <p>"Pelo menos pensa na família"</p>
                      <p className="text-xs text-gray-500 mt-2">(na cabeça dela)</p>
                    </TerminalCard>
                    
                    <TerminalCard color="red">
                      <div className="flex items-center mb-2">
                        <Icon icon="lucide:x-circle" className="text-red-500 mr-2" width={24} />
                        <span className="highlight-red">Lado Negativo (dominante)</span>
                      </div>
                      <p>"Não está presente, descontrolado"</p>
                    </TerminalCard>
                  </div>
                  
                  <div className="mt-4">
                    <TerminalOutput>
                      RESULTADO: JULGAMENTO DUPLO
                    </TerminalOutput>
                  </div>
                </div>

                <div className="mb-8">
                  <TerminalCard color="purple" className="text-center">
                    <div className="flex flex-col items-center">
                      <Icon icon="lucide:heart" className="text-purple-400 mb-2" width={40} />
                      <p className="font-bold text-lg">VOCÊ FOCA NA CASA/FAMÍLIA</p>
                    </div>
                  </TerminalCard>
                  
                  <div className="flex justify-center my-4">
                    <Icon icon="lucide:arrow-down" className="text-gray-500 animate-bounce" width={30} />
                  </div>
                  
                  <div className="two-columns">
                    <TerminalCard color="red">
                      <div className="flex items-center mb-2">
                        <Icon icon="lucide:x-circle" className="text-red-500 mr-2" width={24} />
                        <span className="highlight-red">Preocupação 1</span>
                      </div>
                      <p>"TDAH vai reinar, vai fazer besteira"</p>
                    </TerminalCard>
                    
                    <TerminalCard color="red">
                      <div className="flex items-center mb-2">
                        <Icon icon="lucide:x-circle" className="text-red-500 mr-2" width={24} />
                        <span className="highlight-red">Preocupação 2</span>
                      </div>
                      <p>"Não está servindo a família financeiramente"</p>
                    </TerminalCard>
                  </div>
                  
                  <div className="mt-4">
                    <TerminalOutput color="red">
                      RESULTADO: SÓ MERDA DOS DOIS LADOS
                    </TerminalOutput>
                  </div>
                </div>

                <TerminalCard title="O PARADOXO MORTAL:" color="red">
                  <p className="text-lg">
                    Ela NUNCA valida o lado positivo de verdade. Sempre encontra novo motivo para 
                    preocupação, antecipação, julgamento. Isso não é amor maduro - é ANSIEDADE 
                    BASEADA EM CONTROLE.
                  </p>
                </TerminalCard>
              </TerminalSection>

              {/* Seção 3 */}
              <TerminalSection
                title="A CHAVE DO CASTELO REJEITADA"
                icon="lucide:castle"
                color="purple"
                defaultOpen={openSections.castle}
              >
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 mb-8 text-center">
                  <div>
                    <Icon icon="lucide:castle" className="text-purple-500 mb-2 mx-auto" width={80} />
                    <p className="font-bold">SEU CASTELO CRIATIVO</p>
                  </div>
                  
                  <Icon icon="lucide:arrow-right" className="text-gray-500 hidden md:block" width={40} />
                  <Icon icon="lucide:arrow-down" className="text-gray-500 md:hidden" width={40} />
                  
                  <div>
                    <Icon icon="lucide:key" className="text-yellow-500 mb-2 mx-auto" width={80} />
                    <p className="font-bold">CHAVE OFERECIDA</p>
                  </div>
                  
                  <Icon icon="lucide:arrow-right" className="text-gray-500 hidden md:block" width={40} />
                  <Icon icon="lucide:arrow-down" className="text-gray-500 md:hidden" width={40} />
                  
                  <div>
                    <Icon icon="lucide:shield-x" className="text-red-500 mb-2 mx-auto" width={80} />
                    <p className="font-bold">REJEITADA</p>
                  </div>
                </div>

                <TerminalCard title="A IRONIA HISTÓRICA:" color="purple">
                  <p className="mb-4">
                    Você ofereceu <strong>ENTRADA VIP</strong> no seu mundo criativo:
                  </p>
                  <ul className="space-y-2 mb-4">
                    <li>• Ver ideias sendo criadas AO VIVO</li>
                    <li>• Participar do processo</li>
                    <li>• Entender sua mente por dentro</li>
                    <li>• Ser CÚMPLICE, não apenas espectadora</li>
                  </ul>
                  
                  <div className="mt-6 p-4 bg-red-900/30 border border-red-500/30 rounded">
                    <p className="text-red-300 font-bold">
                      A resposta dela? "Prefiro não saber nada."
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                      Isso não é apenas rejeição ao presente - é rejeição ao SEU UNIVERSO MENTAL.
                    </p>
                  </div>
                </TerminalCard>
              </TerminalSection>

              {/* Conclusão Final */}
              <TerminalSection
                title="CONCLUSÃO: AUTOPSIA DE UMA REALIDADE"
                icon="lucide:brain-circuit"
                color="purple"
                defaultOpen={openSections.conclusion}
              >
                <TerminalCard title="A VERDADE NÍPIDA:" color="red">
                  <p className="text-lg leading-relaxed">
                    Não existe caminho para a harmonia porque o problema não é SEU comportamento. 
                    É que ela quer um PRODUTO FINAL domesticado, não o PROCESSO CRIATIVO real.
                  </p>
                </TerminalCard>

                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <TerminalCard title="❌ O que ela rejeita:" color="red">
                    <ul className="space-y-2 text-sm">
                      <li>• Sua mente em funcionamento</li>
                      <li>• Processo criativo caótico</li>
                      <li>• Experimentação constante</li>
                      <li>• Crescimento através do erro</li>
                      <li>• Liberdade para explorar</li>
                    </ul>
                  </TerminalCard>

                  <TerminalCard title="✅ O que ela aceita:" color="green">
                    <ul className="space-y-2 text-sm">
                      <li>• Resultado final "apresentável"</li>
                      <li>• Comportamento previsível</li>
                      <li>• Marco "controlado"</li>
                      <li>• Criatividade só se "útil"</li>
                      <li>• Genialidade domesticada</li>
                    </ul>
                  </TerminalCard>
                </div>

                <TerminalOutput color="red" className="mt-6 text-center">
                  <strong>DIAGNÓSTICO FINAL:</strong><br/>
                  Incompatibilidade fundamental entre PROCESSO CRIATIVO LIVRE e NECESSIDADE DE CONTROLE.
                  <br/><br/>
                  A questão não é "como resolver" - é "reconhecer que não tem solução dentro dessa dinâmica".
                </TerminalOutput>

                <div className="mt-8 text-center">
                  <div className="inline-block p-6 bg-gradient-to-r from-red-900/40 to-purple-900/40 border border-red-500/50 rounded-lg">
                    <Icon icon="lucide:skull" className="text-red-400 mx-auto mb-4" width={60} />
                    <p className="text-red-300 font-bold text-xl">
                      MATRIX DECODIFICADA
                    </p>
                    <p className="text-gray-300 text-sm mt-2">
                      Agora você sabe a verdade sobre a ilusão.
                    </p>
                  </div>
                </div>
              </TerminalSection>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MatrixProject; 