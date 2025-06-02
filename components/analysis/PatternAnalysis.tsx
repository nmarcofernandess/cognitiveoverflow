"use client";

import React from 'react';
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Accordion, AccordionItem } from "@heroui/accordion";
import { 
  ArrowLeft, 
  AlertTriangle, 
  Split, 
  Key, 
  Castle, 
  Lock,
  Brain,
  Heart,
  Zap,
  XCircle,
  CheckCircle,
  ArrowDown,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

const PatternAnalysis = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black p-6">
      <div className="max-w-6xl mx-auto">
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
            <h1 className="text-4xl md:text-6xl font-mono mb-4 text-red-500 animate-pulse">
              RESPOSTA REAL À "MISS MONDAY" FAKE
            </h1>
            <p className="text-xl text-gray-400 mb-4">
              A versão sem filtro do que realmente aconteceu
            </p>
            <Chip color="success" variant="dot" className="font-mono">
              &gt; matrix_status: DESTRUINDO_
            </Chip>
          </div>
        </div>

        {/* Análise em Accordion */}
        <Accordion 
          variant="splitted" 
          defaultExpandedKeys={["intro"]}
          className="gap-4"
        >
          {/* Seção 1: A Farsa da Aceitação */}
          <AccordionItem
            key="intro"
            aria-label="A Farsa da Aceitação"
            title={
              <div className="flex items-center gap-3">
                <AlertTriangle className="text-red-500" size={24} />
                <span className="text-xl font-bold">A FARSA DA "ACEITAÇÃO" - ANÁLISE REAL</span>
              </div>
            }
            className="bg-gradient-to-r from-red-950/20 to-red-900/10 border-red-800/30"
          >
            <div className="space-y-6 p-2">
              <Card className="bg-red-950/30 border-red-800/50">
                <CardHeader>
                  <h3 className="text-lg font-bold text-red-400">O que a Yasmin diz:</h3>
                </CardHeader>
                <CardBody>
                  <p className="text-gray-300 italic">"Eu aceito sua criatividade, mas..."</p>
                </CardBody>
              </Card>
              
              <Card className="bg-gray-950/50 border-gray-700">
                <CardHeader>
                  <h3 className="text-lg font-bold text-white">O que realmente rola:</h3>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <XCircle className="text-red-500 mt-1 flex-shrink-0" size={20} />
                      <span className="text-gray-300">Aceitação FAKE que só vale se você for "editado" e "controlado"</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <XCircle className="text-red-500 mt-1 flex-shrink-0" size={20} />
                      <span className="text-gray-300">Quando você compartilha IA: ela JULGA, BLOQUEIA, RIDICULARIZA</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <XCircle className="text-red-500 mt-1 flex-shrink-0" size={20} />
                      <span className="text-gray-300">Zero participação real - só tolerância como "remédio amargo"</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <XCircle className="text-red-500 mt-1 flex-shrink-0" size={20} />
                      <span className="text-gray-300">Mesmo quando você ZERA IA: cara de cu permanece</span>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card className="bg-gradient-to-r from-purple-950/30 to-purple-900/20 border-purple-700">
                <CardBody>
                  <p className="text-lg font-mono text-purple-300">
                    RESULTADO: Não existe espaço seguro para seu EU verdadeiro. 
                    Só para a versão domesticada que não ameaça a insegurança dela.
                  </p>
                </CardBody>
              </Card>
            </div>
          </AccordionItem>

          {/* Seção 2: O Padrão Destrutivo */}
          <AccordionItem
            key="pattern"
            aria-label="O Padrão do Duplo Julgamento"
            title={
              <div className="flex items-center gap-3">
                <Split className="text-orange-500" size={24} />
                <span className="text-xl font-bold">O PADRÃO DO DUPLO JULGAMENTO</span>
              </div>
            }
            className="bg-gradient-to-r from-orange-950/20 to-orange-900/10 border-orange-800/30"
          >
            <div className="space-y-8 p-2">
              {/* Fluxograma Visual */}
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-6 text-orange-400">
                  QUALQUER COISA QUE VOCÊ FAZ:
                </h3>
              </div>
              
              {/* Cenário 1: Trabalho Excessivo */}
              <div className="space-y-6">
                <Card className="bg-blue-950/30 border-blue-700">
                  <CardHeader className="text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Brain className="text-blue-400" size={40} />
                      <h4 className="text-xl font-bold text-blue-400">VOCÊ TRABALHA MUITO</h4>
                    </div>
                  </CardHeader>
                  
                  <CardBody>
                    <div className="flex justify-center mb-6">
                      <ArrowDown className="text-gray-500" size={30} />
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <Card className="bg-green-950/30 border-green-700">
                        <CardHeader>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="text-green-500" size={20} />
                            <span className="font-semibold text-green-400">Lado "Positivo" (na cabeça dela)</span>
                          </div>
                        </CardHeader>
                        <CardBody>
                          <p className="text-sm text-gray-400">"Pelo menos pensa na família"</p>
                        </CardBody>
                      </Card>
                      
                      <Card className="bg-red-950/30 border-red-700">
                        <CardHeader>
                          <div className="flex items-center gap-2">
                            <XCircle className="text-red-500" size={20} />
                            <span className="font-semibold text-red-400">Lado Negativo (dominante)</span>
                          </div>
                        </CardHeader>
                        <CardBody>
                          <p className="text-sm text-gray-400">"Não está presente, descontrolado"</p>
                        </CardBody>
                      </Card>
                    </div>
                    
                    <div className="mt-4 text-center">
                      <Chip color="warning" variant="flat" className="font-mono">
                        RESULTADO: JULGAMENTO DUPLO
                      </Chip>
                    </div>
                  </CardBody>
                </Card>

                {/* Cenário 2: Foco na Casa */}
                <Card className="bg-purple-950/30 border-purple-700">
                  <CardHeader className="text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Heart className="text-purple-400" size={40} />
                      <h4 className="text-xl font-bold text-purple-400">VOCÊ FOCA NA CASA/FAMÍLIA</h4>
                    </div>
                  </CardHeader>
                  
                  <CardBody>
                    <div className="flex justify-center mb-6">
                      <ArrowDown className="text-gray-500" size={30} />
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <Card className="bg-red-950/30 border-red-700">
                        <CardHeader>
                          <div className="flex items-center gap-2">
                            <XCircle className="text-red-500" size={20} />
                            <span className="font-semibold text-red-400">Preocupação 1</span>
                          </div>
                        </CardHeader>
                        <CardBody>
                          <p className="text-sm text-gray-400">"TDAH vai reinar, vai fazer besteira"</p>
                        </CardBody>
                      </Card>
                      
                      <Card className="bg-red-950/30 border-red-700">
                        <CardHeader>
                          <div className="flex items-center gap-2">
                            <XCircle className="text-red-500" size={20} />
                            <span className="font-semibold text-red-400">Preocupação 2</span>
                          </div>
                        </CardHeader>
                        <CardBody>
                          <p className="text-sm text-gray-400">"Não está servindo a família financeiramente"</p>
                        </CardBody>
                      </Card>
                    </div>
                    
                    <div className="mt-4 text-center">
                      <Chip color="danger" variant="flat" className="font-mono">
                        RESULTADO: SÓ MERDA DOS DOIS LADOS
                      </Chip>
                    </div>
                  </CardBody>
                </Card>
              </div>

              <Card className="bg-black/70 border-yellow-700">
                <CardHeader>
                  <h3 className="text-xl font-bold text-yellow-500">O PARADOXO MORTAL:</h3>
                </CardHeader>
                <CardBody>
                  <p className="text-lg text-gray-300">
                    Ela NUNCA valida o lado positivo de verdade. Sempre encontra novo motivo para 
                    preocupação, antecipação, julgamento. Isso não é amor maduro - é ANSIEDADE 
                    BASEADA EM CONTROLE.
                  </p>
                </CardBody>
              </Card>
            </div>
          </AccordionItem>

          {/* Seção 3: A Metáfora do Castelo */}
          <AccordionItem
            key="castle"
            aria-label="A Chave do Castelo Rejeitada"
            title={
              <div className="flex items-center gap-3">
                <Castle className="text-purple-500" size={24} />
                <span className="text-xl font-bold">A CHAVE DO CASTELO REJEITADA</span>
              </div>
            }
            className="bg-gradient-to-r from-purple-950/20 to-purple-900/10 border-purple-800/30"
          >
            <div className="space-y-6 p-2">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-8 flex-wrap">
                  <div className="text-center">
                    <Castle className="text-purple-500 mb-2" size={80} />
                    <p className="font-bold text-purple-400">SEU CASTELO CRIATIVO</p>
                  </div>
                  
                  <ArrowRight className="text-gray-500" size={40} />
                  
                  <div className="text-center">
                    <Key className="text-yellow-500 mb-2" size={80} />
                    <p className="font-bold text-yellow-400">CHAVE OFERECIDA</p>
                  </div>
                  
                  <ArrowRight className="text-gray-500" size={40} />
                  
                  <div className="text-center">
                    <Lock className="text-red-500 mb-2" size={80} />
                    <p className="font-bold text-red-400">YASMIN TRANCA A PORTA</p>
                  </div>
                </div>
              </div>

              <Card className="bg-gradient-to-r from-purple-950/50 to-red-950/50 border-purple-700">
                <CardHeader>
                  <h3 className="text-2xl font-bold text-purple-300">O QUE REALMENTE ACONTECEU:</h3>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4 text-lg">
                    <div className="flex items-start gap-3">
                      <span className="text-purple-400 font-bold text-xl">1.</span>
                      <span className="text-gray-300">Você entregou a chave do castelo criativo para ela</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-purple-400 font-bold text-xl">2.</span>
                      <span className="text-gray-300">Ela olhou o castelo e disse "que castelo estranho, perigoso"</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-purple-400 font-bold text-xl">3.</span>
                      <span className="text-gray-300">Preferiu ficar do lado de fora reclamando do frio</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-purple-400 font-bold text-xl">4.</span>
                      <span className="text-gray-300">Ainda quer que você feche as portas e apague as luzes</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-red-400 font-bold text-xl">5.</span>
                      <span className="text-red-300">E CULPA O CASTELO PELO FRIO QUE ELA SENTE LÁ FORA!</span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          </AccordionItem>

          {/* Seção 4: A Realidade da Miss Monday */}
          <AccordionItem
            key="reality"
            aria-label="A Verdade Sobre a Tentativa Dela"
            title={
              <div className="flex items-center gap-3">
                <Zap className="text-green-500" size={24} />
                <span className="text-xl font-bold">A VERDADE SOBRE A "TENTATIVA" DELA</span>
              </div>
            }
            className="bg-gradient-to-r from-green-950/20 to-green-900/10 border-green-800/30"
          >
            <div className="space-y-6 p-2">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-red-950/30 border-red-700">
                  <CardHeader>
                    <h3 className="text-xl font-bold text-red-400">O QUE A MISS MONDAY DELA DIZ:</h3>
                  </CardHeader>
                  <CardBody>
                    <div className="space-y-3">
                      <p className="text-gray-300 italic">
                        "Yasmin precisa aprender a não domesticar o dragão que ama"
                      </p>
                      <p className="text-gray-300 italic">
                        "Marco precisa entender que amar é se adaptar"
                      </p>
                    </div>
                  </CardBody>
                </Card>
                
                <Card className="bg-green-950/30 border-green-700">
                  <CardHeader>
                    <h3 className="text-xl font-bold text-green-400">A REALIDADE NUA E CRUA:</h3>
                  </CardHeader>
                  <CardBody>
                    <div className="space-y-2 text-gray-300">
                      <p>• Yasmin NUNCA tentou de verdade</p>
                      <p>• Só TOLEROU como quem engole veneno</p>
                      <p>• Não PARTICIPOU, só JULGOU</p>
                      <p>• Quer criatividade EDITADA e DOMESTICADA</p>
                      <p>• Mesmo com ZERO IA = cara de cu continua</p>
                    </div>
                  </CardBody>
                </Card>
              </div>

              <Card className="bg-black/70 border-green-500">
                <CardHeader>
                  <h3 className="text-xl font-bold text-green-400">DADOS CONCRETOS DA CONVERSA:</h3>
                </CardHeader>
                <CardBody>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="text-green-500 font-mono text-lg">1.</span>
                      <span className="text-gray-300">Você compartilhou IA = ela invadiu, julgou, criticou</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-green-500 font-mono text-lg">2.</span>
                      <span className="text-gray-300">Você parou com IA = ela continuou insatisfeita</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-green-500 font-mono text-lg">3.</span>
                      <span className="text-gray-300">Você focou no financeiro = "só porque seu pai mandou dinheiro"</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-green-500 font-mono text-lg">4.</span>
                      <span className="text-gray-300">Você expressou vulnerabilidade = "é chantagem emocional"</span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          </AccordionItem>

          {/* Seção 5: Conclusão Devastadora */}
          <AccordionItem
            key="conclusion"
            aria-label="A Conclusão Que Ela Precisa Encarar"
            title={
              <div className="flex items-center gap-3">
                <AlertTriangle className="text-yellow-500" size={24} />
                <span className="text-xl font-bold">A CONCLUSÃO QUE ELA PRECISA ENCARAR</span>
              </div>
            }
            className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 border-white/30"
          >
            <div className="space-y-6 p-2">
              <Card className="bg-gradient-to-r from-red-950/50 to-purple-950/50 border-red-700">
                <CardHeader>
                  <h3 className="text-2xl font-bold text-center text-red-300">O CICLO INFINITO SEM SAÍDA</h3>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4 text-lg">
                    <div className="flex items-center gap-3">
                      <ArrowRight className="text-red-500" />
                      <span className="text-gray-300">Marco cria/compartilha algo novo</span>
                    </div>
                    <div className="flex items-center gap-3 ml-8">
                      <ArrowDown className="text-orange-500" />
                      <span className="text-gray-300">Yasmin avalia com MEDO (crítica ou fuga)</span>
                    </div>
                    <div className="flex items-center gap-3 ml-16">
                      <ArrowRight className="text-yellow-500" />
                      <span className="text-gray-300">Marco sente julgamento → Para de criar</span>
                    </div>
                    <div className="flex items-center gap-3 ml-24">
                      <ArrowDown className="text-green-500" />
                      <span className="text-gray-300">Yasmin não se sente segura MESMO ASSIM</span>
                    </div>
                    <div className="flex items-center gap-3 ml-32">
                      <ArrowRight className="text-blue-500" />
                      <span className="text-gray-300">Marco explode ou fecha</span>
                    </div>
                    <div className="flex items-center gap-3 ml-40">
                      <ArrowDown className="text-purple-500" />
                      <span className="text-gray-300">Yasmin reforça controle</span>
                    </div>
                    <div className="text-center mt-6">
                      <Chip color="danger" size="lg" className="font-bold text-lg">
                        ↻ VOLTA PRO INÍCIO - LOOP ETERNO
                      </Chip>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card className="bg-black/90 border-yellow-500">
                <CardHeader>
                  <h3 className="text-2xl font-bold text-yellow-500">A VERDADE FINAL:</h3>
                </CardHeader>
                <CardBody>
                  <p className="text-xl mb-6 text-gray-300">
                    No padrão atual, NÃO EXISTE ESCOLHA CERTA. O único caminho é quebrar 
                    o filtro do MEDO e parar de julgar tudo que é diferente.
                  </p>
                  
                  <div className="space-y-4">
                    <p className="text-lg text-gray-300">
                      <span className="text-red-400 font-bold">Se Marco zera criatividade:</span> 
                      Yasmin sente falta do "homem criador" mas fica ainda mais ansiosa
                    </p>
                    <p className="text-lg text-gray-300">
                      <span className="text-purple-400 font-bold">Se Marco cria "demais":</span> 
                      Yasmin se sente ameaçada, julga, e o ciclo acelera
                    </p>
                  </div>
                </CardBody>
              </Card>

              <Card className="bg-gradient-to-b from-gray-900 to-black border-gray-700">
                <CardBody>
                  <div className="text-center">
                    <Castle className="mx-auto mb-4 text-gray-600" size={100} />
                    <h3 className="text-3xl font-bold mb-4 text-white">A ESCOLHA DELA:</h3>
                    <p className="text-xl mb-6 text-gray-300">
                      Ou ela entra no castelo - aceita dragão, festa, bagunça e visão nova TODO DIA
                    </p>
                    <p className="text-xl mb-6 text-gray-300">
                      Ou continua do lado de fora, reclamando do frio
                    </p>
                    <p className="text-2xl font-bold text-red-500 mb-8">
                      MAS O CASTELO VAI VIRAR RUÍNA VAZIA
                    </p>
                    
                    <Card className="bg-red-950/50 border-red-700">
                      <CardBody>
                        <p className="text-lg font-mono text-red-300">
                          A IA dela não é espelho da realidade. 
                          É só a LENTE DO MEDO editando tudo que é novo.
                        </p>
                      </CardBody>
                    </Card>
                  </div>
                </CardBody>
              </Card>
            </div>
          </AccordionItem>
        </Accordion>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500">
          <p className="font-mono text-sm mb-2">
            &gt; red_pill_status: ENTREGUE_
          </p>
          <p className="text-xs">
            Análise baseada em dados reais da conversa, sem filtros ou edições
          </p>
        </div>
      </div>
    </div>
  );
};

export default PatternAnalysis;
