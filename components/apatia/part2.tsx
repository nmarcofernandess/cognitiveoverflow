"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardBody } from "@heroui/card";
import { Icon } from '@iconify/react';
import { motion } from "framer-motion";

export default function ApatiaPart2() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Subtle Matrix Rain Background */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
        <div className="h-full w-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHRleHQgeD0iNSIgeT0iMTUiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiMwMGZmMDAiPjE8L3RleHQ+Cjwvc3ZnPgo=')] animate-pulse"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        
        {/* Vulnerabilidade aos 30 Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mb-32"
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 tracking-wide font-mono mb-6">
              VULNERABILIDADE AOS 30
            </h2>
            <p className="text-lg text-slate-400 font-mono">
              A década crítica onde todas as pressões convergem
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Dados Epidemiológicos */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
            >
              <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm border border-slate-600/50 hover:border-blue-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-400/20 h-full">
                <CardBody className="p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Icon icon="lucide:trending-down" className="text-blue-400" width={24} height={24} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-200 font-mono">
                      DADOS EPIDEMIOLÓGICOS
                    </h3>
                  </div>

                  {/* MHI Chart Visualization */}
                  <div className="bg-slate-900/50 rounded-lg p-6 mb-6 border border-slate-700/50">
                    <h4 className="text-lg font-bold text-slate-200 font-mono mb-4 text-center">
                      ÍNDICE DE SAÚDE MENTAL (MHI-5)
                    </h4>
                    
                    <div className="space-y-4">
                      {/* Bar for 1970s */}
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-300 font-mono w-24">1970s</span>
                        <div className="flex-1 bg-slate-800 rounded-full h-8 relative overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "92.5%" }}
                            transition={{ delay: 1.5, duration: 1.2 }}
                            className="bg-gradient-to-r from-green-500 to-green-400 h-full rounded-full flex items-center justify-end pr-4"
                          >
                            <span className="text-white font-bold text-sm">74</span>
                          </motion.div>
                        </div>
                      </div>

                      {/* Bar for 1980s */}
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-300 font-mono w-24">1980s</span>
                        <div className="flex-1 bg-slate-800 rounded-full h-8 relative overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "90.6%" }}
                            transition={{ delay: 1.7, duration: 1.2 }}
                            className="bg-gradient-to-r from-blue-500 to-blue-400 h-full rounded-full flex items-center justify-end pr-4"
                          >
                            <span className="text-white font-bold text-sm">72.5</span>
                          </motion.div>
                        </div>
                      </div>

                      {/* Bar for 1990s */}
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-300 font-mono w-24">1990s</span>
                        <div className="flex-1 bg-slate-800 rounded-full h-8 relative overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "83.75%" }}
                            transition={{ delay: 1.9, duration: 1.2 }}
                            className="bg-gradient-to-r from-red-500 to-red-400 h-full rounded-full flex items-center justify-end pr-4"
                          >
                            <span className="text-white font-bold text-sm">67</span>
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed">
                    Estudos longitudinais mostram que aos 30 anos, nascidos nos anos 1990 apresentam índice de saúde mental (MHI-5) de{" "}
                    <span className="text-red-400 font-semibold">67</span>, comparado a{" "}
                    <span className="text-blue-400 font-semibold">72.5</span> (nascidos nos 1980) e{" "}
                    <span className="text-green-400 font-semibold">74</span> (nascidos nos 1970), evidenciando{" "}
                    <span className="text-orange-400 font-semibold">efeito de coorte significativo</span>.
                  </p>
                </CardBody>
              </Card>
            </motion.div>

            {/* Convergência de Pressões */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
            >
              <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm border border-slate-600/50 hover:border-orange-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-400/20 h-full">
                <CardBody className="p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                      <Icon icon="lucide:compress" className="text-orange-400" width={24} height={24} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-200 font-mono">
                      CONVERGÊNCIA DE PRESSÕES
                    </h3>
                  </div>

                  {/* Timeline Visualization */}
                  <div className="bg-slate-900/50 rounded-lg p-6 mb-6 border border-slate-700/50">
                    <div className="relative h-32">
                      {/* Life timeline */}
                      <div className="absolute top-1/2 left-0 right-0 h-2 bg-slate-700 rounded-full"></div>
                      
                      {/* Age markers */}
                      {[
                        { age: 20, left: "15%", color: "bg-green-500" },
                        { age: 30, left: "35%", color: "bg-red-500" },
                        { age: 40, left: "55%", color: "bg-blue-500" },
                        { age: 50, left: "75%", color: "bg-purple-500" }
                      ].map((marker, index) => (
                        <motion.div
                          key={marker.age}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 2 + index * 0.2, duration: 0.4 }}
                          className={`absolute w-4 h-4 ${marker.color} rounded-full transform -translate-x-1/2 -translate-y-1/2`}
                          style={{ left: marker.left, top: "50%" }}
                        >
                          <span className="absolute text-xs font-bold text-slate-200 transform -translate-x-1/2 translate-y-6 font-mono">
                            {marker.age}
                          </span>
                        </motion.div>
                      ))}

                      {/* Pressure indicators around age 30 */}
                      <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 2.8, duration: 0.6 }}
                        className="absolute bg-red-900/50 rounded-lg p-2 text-xs text-red-300 border border-red-500/30"
                        style={{ left: "25%", top: "10%", width: "120px" }}
                      >
                        Consolidação profissional interrompida
                      </motion.div>
                      
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 3, duration: 0.6 }}
                        className="absolute bg-red-900/50 rounded-lg p-2 text-xs text-red-300 border border-red-500/30"
                        style={{ left: "40%", top: "70%", width: "120px" }}
                      >
                        Cuidado filhos pequenos
                      </motion.div>
                      
                      <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 3.2, duration: 0.6 }}
                        className="absolute bg-red-900/50 rounded-lg p-2 text-xs text-red-300 border border-red-500/30"
                        style={{ left: "30%", top: "25%", width: "120px" }}
                      >
                        Cuidado pais idosos
                      </motion.div>
                    </div>
                  </div>

                  <p className="text-sm text-slate-300 mb-4 leading-relaxed">
                    <span className="text-orange-400 font-semibold">68% combinam cuidado de filhos pequenos, pais idosos e pressões profissionais</span>, 
                    tornando-os mais vulneráveis ao colapso de fronteiras domésticas.
                  </p>

                  {/* Pressure Tags */}
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Consolidação profissional",
                      "Cuidado familiar", 
                      "Expectativas sociais",
                      "Transição digital"
                    ].map((pressure, index) => (
                      <motion.span
                        key={pressure}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 3.4 + index * 0.1, duration: 0.4 }}
                        className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-mono border border-red-400/30"
                      >
                        {pressure}
                      </motion.span>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          </div>

          {/* Statistics Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Saúde Mental */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2, duration: 0.6 }}
            >
              <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm border border-slate-600/50 hover:border-blue-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-400/20">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-lg">
                  <h4 className="text-lg font-bold text-white font-mono">SAÚDE MENTAL</h4>
                </div>
                <CardBody className="p-6 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 2.5, duration: 0.8, type: "spring" }}
                    className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-400/40"
                  >
                    <span className="text-3xl font-bold text-blue-400 font-mono">20%</span>
                  </motion.div>
                  <p className="text-sm text-slate-300">
                    Taxa de episódio depressivo maior aos 30 anos
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    (vs. 10% aos 26-49 anos e 5% aos 50+)
                  </p>
                </CardBody>
              </Card>
            </motion.div>

            {/* Transição Digital */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.2, duration: 0.6 }}
            >
              <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm border border-slate-600/50 hover:border-green-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-400/20">
                <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 rounded-t-lg">
                  <h4 className="text-lg font-bold text-white font-mono">TRANSIÇÃO DIGITAL</h4>
                </div>
                <CardBody className="p-6">
                  <p className="text-sm text-slate-300 mb-4 leading-relaxed">
                    Nascidos na transição digital, têm expectativas altas de eficiência tecnológica mas menor tolerância a falhas que gerações precedentes.
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="text-center">
                      <Icon icon="lucide:laptop" className="text-green-400 mx-auto mb-2" width={24} height={24} />
                      <p className="text-xs text-slate-300">Nativos<br/>Digitais</p>
                    </div>
                    <div className="text-purple-400 font-bold font-mono text-lg">VS</div>
                    <div className="text-center">
                      <Icon icon="lucide:book-open" className="text-blue-400 mx-auto mb-2" width={24} height={24} />
                      <p className="text-xs text-slate-300">Educação<br/>Analógica</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>

            {/* Carga Psicológica */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.4, duration: 0.6 }}
            >
              <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm border border-slate-600/50 hover:border-purple-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-400/20">
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 rounded-t-lg">
                  <h4 className="text-lg font-bold text-white font-mono">CARGA PSICOLÓGICA</h4>
                </div>
                <CardBody className="p-6 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 2.9, duration: 0.8, type: "spring" }}
                    className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-400/40"
                  >
                    <span className="text-3xl font-bold text-purple-400 font-mono">36%</span>
                  </motion.div>
                  <p className="text-sm text-slate-300">
                    Apresentam "qualquer doença mental" no último ano
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    Maior taxa entre todas as faixas etárias adultas
                  </p>
                </CardBody>
              </Card>
            </motion.div>
          </div>
        </motion.div>

        {/* Fatores Ocultos Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.5, duration: 1 }}
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 tracking-wide font-mono mb-6">
              FATORES OCULTOS
            </h2>
            <p className="text-lg text-slate-400 font-mono">
              Os pontos cegos que intensificam a apatia silenciosamente
            </p>
          </div>

          {/* Hidden Factors Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* Vitamina D */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 4, duration: 0.6 }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm border border-slate-600/50 hover:border-yellow-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-400/20 h-full">
                <CardBody className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500/30 to-yellow-600/30 rounded-full flex items-center justify-center border border-yellow-400/40">
                      <Icon icon="lucide:sun" className="text-yellow-400" width={24} height={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-200 font-mono">
                      DEFICIÊNCIA VITAMINA D
                    </h3>
                  </div>

                  <p className="text-sm text-slate-300 mb-3">
                    Afeta <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-xs font-bold">32,9%</span> dos trabalhadores indoor, produzindo:
                  </p>

                  <div className="space-y-2 mb-4">
                    {[
                      "Redução da síntese de neurotransmissores",
                      "Comprometimento da neuroplasticidade", 
                      "Aumento da neuroinflamação"
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <Icon icon="lucide:chevron-right" className="text-yellow-400 mt-1 flex-shrink-0" width={14} height={14} />
                        <span className="text-sm text-slate-300">{item}</span>
                      </div>
                    ))}
                  </div>

                  <p className="text-xs text-slate-400">
                    Receptores de vitamina D estão amplamente distribuídos no cérebro, incluindo regiões motivacionais críticas.
                  </p>
                </CardBody>
              </Card>
            </motion.div>

            {/* Disrupção Circadiana */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 4.2, duration: 0.6 }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm border border-slate-600/50 hover:border-blue-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-400/20 h-full">
                <CardBody className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500/30 to-blue-600/30 rounded-full flex items-center justify-center border border-blue-400/40">
                      <Icon icon="lucide:moon" className="text-blue-400" width={24} height={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-200 font-mono">
                      DISRUPÇÃO CIRCADIANA
                    </h3>
                  </div>

                  <p className="text-sm text-slate-300 mb-3">
                    Luz artificial noturna <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs font-bold">>8 lux</span> já suprime melatonina:
                  </p>

                  <div className="space-y-2 mb-4">
                    {[
                      "Escritórios (~500 lux) vs. luz solar (100.000+ lux)",
                      "LED azul (480nm) suprime melatonina por 2x mais tempo",
                      "Desregulação do ciclo sono-vigília"
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <Icon icon="lucide:chevron-right" className="text-blue-400 mt-1 flex-shrink-0" width={14} height={14} />
                        <span className="text-sm text-slate-300">{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-xs text-blue-400 font-mono">Luz azul</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span className="text-xs text-yellow-400 font-mono">Luz natural</span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>

            {/* Microbiota */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 4.4, duration: 0.6 }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm border border-slate-600/50 hover:border-green-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-400/20 h-full">
                <CardBody className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500/30 to-green-600/30 rounded-full flex items-center justify-center border border-green-400/40">
                      <Icon icon="lucide:activity" className="text-green-400" width={24} height={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-200 font-mono">
                      MICROBIOTA INTESTINAL
                    </h3>
                  </div>

                  <p className="text-sm text-slate-300 mb-3">
                    Sedentarismo reduz bactérias benéficas:
                  </p>

                  <div className="space-y-2 mb-4">
                    {[
                      "Redução de Lactobacillus e Bifidobacterium (produtores de GABA e serotonina)",
                      "Aumento de Enterobacteriaceae inflamatórias"
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <Icon icon="lucide:chevron-right" className="text-green-400 mt-1 flex-shrink-0" width={14} height={14} />
                        <span className="text-sm text-slate-300">{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="text-center bg-green-500/10 rounded-lg p-3 border border-green-400/30">
                    <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-lg font-bold">95%</span>
                    <p className="text-xs text-slate-300 mt-1">da serotonina é produzida no intestino</p>
                  </div>
                </CardBody>
              </Card>
            </motion.div>

            {/* Disruptores Endócrinos */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 4.6, duration: 0.6 }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm border border-slate-600/50 hover:border-red-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-red-400/20 h-full">
                <CardBody className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500/30 to-red-600/30 rounded-full flex items-center justify-center border border-red-400/40">
                      <Icon icon="lucide:flask-conical" className="text-red-400" width={24} height={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-200 font-mono">
                      DISRUPTORES ENDÓCRINOS
                    </h3>
                  </div>

                  <p className="text-sm text-slate-300 mb-3">
                    Compostos químicos domésticos interferem na produção hormonal:
                  </p>

                  <div className="space-y-2">
                    {[
                      "Ftalatos (45-55 ng/m³) em plásticos e cosméticos",
                      "Bisfenol A (2-5x maiores indoor) em embalagens",
                      { text: "Retardantes de chama em", highlight: "99%", suffix: "das residências" }
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <Icon icon="lucide:chevron-right" className="text-red-400 mt-1 flex-shrink-0" width={14} height={14} />
                        <span className="text-sm text-slate-300">
                          {typeof item === 'string' ? item : (
                            <>
                              {item.text} <span className="bg-red-500/20 text-red-400 px-1 py-0.5 rounded text-xs font-bold">{item.highlight}</span> {item.suffix}
                            </>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </motion.div>

            {/* Sobrecarga Cognitiva */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 4.8, duration: 0.6 }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm border border-slate-600/50 hover:border-purple-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-400/20 h-full">
                <CardBody className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500/30 to-purple-600/30 rounded-full flex items-center justify-center border border-purple-400/40">
                      <Icon icon="lucide:brain" className="text-purple-400" width={24} height={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-200 font-mono">
                      SOBRECARGA COGNITIVA
                    </h3>
                  </div>

                  <p className="text-sm text-slate-300 mb-3">
                    Multitasking digital produz custos ocultos:
                  </p>

                  <div className="space-y-2">
                    {[
                      { highlight: "47", text: "trocas de aplicativos por hora (vs. 23 em escritório)" },
                      { highlight: "127", text: "interrupções digitais diárias" },
                      { text: "Perda de até", highlight: "40%", suffix: "do tempo produtivo" },
                      { highlight: "23 minutos", text: "para retomar foco completo" }
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <Icon icon="lucide:chevron-right" className="text-purple-400 mt-1 flex-shrink-0" width={14} height={14} />
                        <span className="text-sm text-slate-300">
                          {item.text && <>
                            {item.text} <span className="bg-purple-500/20 text-purple-400 px-1 py-0.5 rounded text-xs font-bold">{item.highlight}</span> {item.suffix}
                          </>}
                          {!item.text && <>
                            <span className="bg-purple-500/20 text-purple-400 px-1 py-0.5 rounded text-xs font-bold">{item.highlight}</span> {item.suffix || item.text}
                          </>}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </motion.div>

            {/* Trauma Acumulativo */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 5, duration: 0.6 }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm border border-slate-600/50 hover:border-gray-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-gray-400/20 h-full">
                <CardBody className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-500/30 to-gray-600/30 rounded-full flex items-center justify-center border border-gray-400/40">
                      <Icon icon="lucide:heart-pulse" className="text-gray-400" width={24} height={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-200 font-mono">
                      TRAUMA ACUMULATIVO
                    </h3>
                  </div>

                  <p className="text-sm text-slate-300 mb-3">
                    Micro-estressores produzem efeitos neurobiológicos mensuráveis:
                  </p>

                  <div className="space-y-2">
                    {[
                      "Hiperativação crônica do eixo hipotálamo-hipófise-adrenal",
                      "Alterações na plasticidade sináptica",
                      "Inflamação sistêmica baixo-grau",
                      "Efeito dose-dependente gradual"
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <Icon icon="lucide:chevron-right" className="text-gray-400 mt-1 flex-shrink-0" width={14} height={14} />
                        <span className="text-sm text-slate-300">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          </div>

          {/* Synthesis Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 5.5, duration: 0.8 }}
          >
            <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm border border-slate-600/50 hover:border-cyan-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-400/20">
              <CardBody className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                    <Icon icon="lucide:link" className="text-cyan-400" width={24} height={24} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-200 font-mono">
                    SÍNTESE: PONTOS CEGOS DA MODERNIDADE
                  </h3>
                </div>

                <p className="text-slate-300 mb-6 leading-relaxed">
                  Estes fatores ambientais e fisiológicos ocultos convergem para criar um ambiente interno e externo que{" "}
                  <span className="text-orange-400 font-semibold">favorece a apatia como resposta adaptativa</span>. 
                  Sua invisibilidade contribui para a atribuição incorreta da apatia a falhas de caráter ou motivação.
                </p>

                <div className="text-center">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="inline-block bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono font-bold py-3 px-8 rounded-full transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
                  >
                    <Icon icon="lucide:search" className="inline mr-2" width={18} height={18} />
                    EXPLORAR INTERAÇÕES ENTRE FATORES
                  </motion.div>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          {/* Sabedoria Ancestral Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 6, duration: 1 }}
            className="mt-32"
          >
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 tracking-wide font-mono mb-6">
                A RESPOSTA DA SABEDORIA ANCESTRAL
              </h2>
              <p className="text-lg text-slate-400 font-mono">
                Antídotos milenares validados pela neurociência moderna
              </p>
            </div>

            {/* Mandala Background */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none z-0">
              <svg className="w-96 h-96" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#3498db" strokeWidth="0.5"/>
                <circle cx="50" cy="50" r="40" fill="none" stroke="#3498db" strokeWidth="0.5"/>
                <circle cx="50" cy="50" r="35" fill="none" stroke="#3498db" strokeWidth="0.5"/>
                <circle cx="50" cy="50" r="30" fill="none" stroke="#3498db" strokeWidth="0.5"/>
                <circle cx="50" cy="50" r="25" fill="none" stroke="#3498db" strokeWidth="0.5"/>
                <circle cx="50" cy="50" r="20" fill="none" stroke="#3498db" strokeWidth="0.5"/>
                <circle cx="50" cy="50" r="15" fill="none" stroke="#3498db" strokeWidth="0.5"/>
                <circle cx="50" cy="50" r="10" fill="none" stroke="#3498db" strokeWidth="0.5"/>
                <circle cx="50" cy="50" r="5" fill="none" stroke="#3498db" strokeWidth="0.5"/>
                <line x1="50" y1="5" x2="50" y2="95" stroke="#3498db" strokeWidth="0.5"/>
                <line x1="5" y1="50" x2="95" y2="50" stroke="#3498db" strokeWidth="0.5"/>
                <line x1="14.64" y1="14.64" x2="85.36" y2="85.36" stroke="#3498db" strokeWidth="0.5"/>
                <line x1="85.36" y1="14.64" x2="14.64" y2="85.36" stroke="#3498db" strokeWidth="0.5"/>
              </svg>
            </div>

            {/* Wisdom Traditions Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-12 relative z-10">
              {/* Budismo */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 6.5, duration: 0.6 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm border border-slate-600/50 hover:border-purple-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-400/20 h-full">
                  <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 rounded-t-lg">
                    <div className="flex items-center gap-3">
                      <Icon icon="lucide:circle-dot" className="text-white" width={24} height={24} />
                      <h3 className="text-lg font-bold text-white font-mono">BUDISMO</h3>
                    </div>
                  </div>
                  <CardBody className="p-6">
                    <p className="text-sm text-slate-300 mb-4">
                      Aborda diretamente a auto-exploração através das Três Características da Existência:
                    </p>
                    
                    <div className="space-y-3 mb-6">
                      {[
                        { term: "Anicca", desc: "(impermanência): dissolve a rigidez mental que alimenta a apatia" },
                        { term: "Dukkha", desc: "(sofrimento): liberta da luta inútil contra a mudança natural" },
                        { term: "Anatta", desc: "(não-eu): alivia a pressão interna que leva à exaustão existencial" }
                      ].map((item, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <Icon icon="lucide:circle" className="text-purple-400 mt-1 flex-shrink-0" width={12} height={12} />
                          <span className="text-sm text-slate-300">
                            <span className="font-bold text-slate-200">{item.term}</span> {item.desc}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="bg-purple-900/30 rounded-lg p-4 border border-purple-400/30">
                      <p className="text-xs text-center text-slate-300">
                        <span className="font-bold text-purple-400">Meta-análises:</span> Loving-kindness meditation produz efeitos extraordinários na depressão{" "}
                        <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-xs font-bold">d = 3.33</span>
                      </p>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>

              {/* Yoga/Bhagavad Gita */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 6.7, duration: 0.6 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm border border-slate-600/50 hover:border-red-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-red-400/20 h-full">
                  <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 rounded-t-lg">
                    <div className="flex items-center gap-3">
                      <Icon icon="lucide:flower" className="text-white" width={24} height={24} />
                      <h3 className="text-lg font-bold text-white font-mono">BHAGAVAD GITA / YOGA</h3>
                    </div>
                  </div>
                  <CardBody className="p-6">
                    <p className="text-sm text-slate-300 mb-4">
                      Oferece o conceito transformador de <span className="font-bold text-slate-200">karma yoga</span> - ação desapegada que converte trabalho em prática espiritual:
                    </p>
                    
                    <div className="space-y-3 mb-6">
                      {[
                        "Resolve diretamente a armadilha da sociedade do desempenho",
                        "Engajamento total sem apego aos resultados",
                        "Paralelos diretos com o \"flow state\" de Csikszentmihalyi"
                      ].map((item, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <Icon icon="lucide:circle" className="text-red-400 mt-1 flex-shrink-0" width={12} height={12} />
                          <span className="text-sm text-slate-300">{item}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="bg-red-900/30 rounded-lg p-4 border border-red-400/30">
                      <p className="text-xs text-center text-slate-300">
                        <span className="font-bold text-red-400">Pesquisas:</span> Posturas específicas aumentam GABA naturalmente em{" "}
                        <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs font-bold">27% após 60 minutos</span>
                      </p>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>

              {/* Taoísmo */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 6.9, duration: 0.6 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm border border-slate-600/50 hover:border-blue-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-400/20 h-full">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-lg">
                    <div className="flex items-center gap-3">
                      <Icon icon="lucide:waves" className="text-white" width={24} height={24} />
                      <h3 className="text-lg font-bold text-white font-mono">TAOÍSMO</h3>
                    </div>
                  </div>
                  <CardBody className="p-6">
                    <p className="text-sm text-slate-300 mb-4">
                      Contribui com <span className="font-bold text-slate-200">Wu Wei</span> (ação sem esforço) - não inação, mas ação em harmonia com fluxo natural:
                    </p>
                    
                    <div className="space-y-3 mb-6">
                      {[
                        "Alternativa à hiperatividade moderna",
                        "Equilíbrio dinâmico entre ação e repouso",
                        "Reconexão com ritmos naturais"
                      ].map((item, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <Icon icon="lucide:circle" className="text-blue-400 mt-1 flex-shrink-0" width={12} height={12} />
                          <span className="text-sm text-slate-300">{item}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-400/30">
                      <p className="text-xs text-center text-slate-300">
                        <span className="font-bold text-blue-400">Estudos:</span> Qigong e Tai Chi demonstram tamanhos de efeito pequenos a moderados na redução de depressão{" "}
                        <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs font-bold">SMD = 0.36-0.38</span>
                      </p>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>

              {/* Zen */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 7.1, duration: 0.6 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm border border-slate-600/50 hover:border-green-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-400/20 h-full">
                  <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 rounded-t-lg">
                    <div className="flex items-center gap-3">
                      <Icon icon="lucide:mountain" className="text-white" width={24} height={24} />
                      <h3 className="text-lg font-bold text-white font-mono">ZEN</h3>
                    </div>
                  </div>
                  <CardBody className="p-6">
                    <p className="text-sm text-slate-300 mb-4">
                      Desenvolve capacidades de presença pura através de zazen e koans:
                    </p>
                    
                    <div className="space-y-3 mb-6">
                      {[
                        "Esgotamento da mente analítica obsessiva",
                        { text: "Shoshin", desc: " (mente de principiante): previne cristalização de padrões depressivos" },
                        "Abertura curiosa à experiência"
                      ].map((item, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <Icon icon="lucide:circle" className="text-green-400 mt-1 flex-shrink-0" width={12} height={12} />
                          <span className="text-sm text-slate-300">
                            {typeof item === 'string' ? item : (
                              <>
                                <span className="font-bold text-slate-200">{item.text}</span>{item.desc}
                              </>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="bg-green-900/30 rounded-lg p-4 border border-green-400/30">
                      <p className="text-xs text-center text-slate-300">
                        <span className="font-bold text-green-400">Neuroimagem:</span> Meditadores Zen experientes mostram maior espessura cortical em áreas de processamento emocional
                      </p>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>

              {/* Osho */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 7.3, duration: 0.6 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm border border-slate-600/50 hover:border-yellow-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-400/20 h-full">
                  <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 px-6 py-4 rounded-t-lg">
                    <div className="flex items-center gap-3">
                      <Icon icon="lucide:flame" className="text-white" width={24} height={24} />
                      <h3 className="text-lg font-bold text-white font-mono">OSHO</h3>
                    </div>
                  </div>
                  <CardBody className="p-6">
                    <p className="text-sm text-slate-300 mb-4">
                      Integra movimento e catarse através da meditação dinâmica:
                    </p>
                    
                    <div className="space-y-3 mb-6">
                      {[
                        "Especialmente relevante para sociedades reprimidas",
                        "Liberação de tensões acumuladas",
                        "Integração corpo-mente-emoções"
                      ].map((item, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <Icon icon="lucide:circle" className="text-yellow-400 mt-1 flex-shrink-0" width={12} height={12} />
                          <span className="text-sm text-slate-300">{item}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="bg-yellow-900/30 rounded-lg p-4 border border-yellow-400/30">
                      <p className="text-xs text-center text-slate-300">
                        <span className="font-bold text-yellow-400">Estudos:</span> Redução significativa de cortisol, agressividade, ansiedade e depressão após{" "}
                        <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-xs font-bold">21 dias</span> de prática
                      </p>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>

              {/* Interactive Exploration Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 7.5, duration: 0.6 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <Card className="bg-gradient-to-br from-blue-600/80 to-green-600/80 backdrop-blur-sm border border-cyan-400/50 hover:border-cyan-300/70 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-400/30 h-full flex items-center justify-center">
                  <CardBody className="p-8 text-center text-white">
                    <Icon icon="lucide:compass" className="mx-auto mb-4 text-cyan-200" width={48} height={48} />
                    <h3 className="text-xl font-bold mb-3 font-mono">EXPLORE AS PRÁTICAS</h3>
                    <p className="mb-6 text-slate-100">
                      Descubra como estas tradições podem ser aplicadas na vida moderna
                    </p>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="inline-block bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white font-mono font-bold py-3 px-6 rounded-full transition-all cursor-pointer"
                    >
                      EXPLORAR MAIS
                    </motion.div>
                  </CardBody>
                </Card>
              </motion.div>
            </div>

            {/* Wisdom Synthesis */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 7.8, duration: 0.8 }}
            >
              <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm border border-slate-600/50 hover:border-cyan-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-400/20">
                <CardBody className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                      <Icon icon="lucide:link" className="text-cyan-400" width={24} height={24} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-200 font-mono">
                      SÍNTESE: ANTÍDOTOS PRECISOS
                    </h3>
                  </div>

                  <p className="text-slate-300 leading-relaxed">
                    As tradições espirituais orientais oferecem antídotos precisos para cada aspecto da apatia moderna, 
                    validados agora por décadas de pesquisa neurocientífica rigorosa. Estas práticas não são apenas 
                    "bem-estar" superficial, mas <span className="text-orange-400 font-semibold">transformações profundas da relação com a experiência</span> 
                    que modificam os próprios mecanismos neurobiológicos da apatia.
                  </p>
                </CardBody>
              </Card>
            </motion.div>
          </motion.div>

          {/* Validação Neurocientífica Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 8.5, duration: 1 }}
            className="mt-32"
          >
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 tracking-wide font-mono mb-6">
                VALIDAÇÃO NEUROCIENTÍFICA
              </h2>
              <p className="text-lg text-slate-400 font-mono">
                Ciência moderna confirmando sabedoria ancestral
              </p>
            </div>

            {/* Brain Background */}
            <div className="absolute top-0 right-0 opacity-[0.03] pointer-events-none z-0">
              <svg className="w-96 h-96" viewBox="0 0 512 512">
                <path fill="#3498db" d="M208 368v-64h-64v64h64zm0-128v-64h-64v64h64zm128 128v-64h-64v64h64zm0-128v-64h-64v64h64zm128 128v-64h-64v64h64zm0-128v-64h-64v64h64zM208 112V48h-64v64h64zm128 0V48h-64v64h64zm128 0V48h-64v64h64z"/>
                <path fill="#2ecc71" d="M416 48h-64v64h64V48zm0 128h-64v64h64v-64zm0 128h-64v64h64v-64zM288 48h-64v64h64V48zm0 128h-64v64h64v-64zm0 128h-64v64h64v-64zM160 48H96v64h64V48zm0 128H96v64h64v-64zm0 128H96v64h64v-64z"/>
              </svg>
            </div>

            {/* Evidence Grid */}
            <div className="grid lg:grid-cols-2 gap-8 mb-12 relative z-10">
              {/* Neuroplasticidade */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 9, duration: 0.6 }}
              >
                <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm border border-slate-600/50 hover:border-blue-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-400/20 h-full">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-lg">
                    <div className="flex items-center gap-3">
                      <Icon icon="lucide:brain" className="text-white" width={24} height={24} />
                      <h3 className="text-lg font-bold text-white font-mono">NEUROPLASTICIDADE EM ADULTOS</h3>
                    </div>
                  </div>
                  <CardBody className="p-6">
                    <p className="text-sm text-slate-300 mb-4">
                      Estudos de neuroimagem demonstram que práticas contemplativas induzem mudanças estruturais detectáveis:
                    </p>
                    
                    <div className="space-y-3 mb-6">
                      {[
                        { text: "Mudanças mensuráveis após apenas", highlight: "16 horas", suffix: "de prática total" },
                        "Maior espessura cortical em áreas de processamento emocional",
                        "Aumento da densidade de matéria cinzenta no hipocampo",
                        { text: "Redução de", highlight: "27%", suffix: "na atividade da amígdala após apenas 8 semanas" }
                      ].map((item, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <Icon icon="lucide:check-circle" className="text-blue-400 mt-1 flex-shrink-0" width={16} height={16} />
                          <span className="text-sm text-slate-300">
                            {typeof item === 'string' ? item : (
                              <>
                                {item.text} <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs font-bold">{item.highlight}</span> {item.suffix}
                              </>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Simple Bar Chart Visualization */}
                    <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                      <h4 className="text-sm font-bold text-slate-200 mb-3 text-center">Atividade Cerebral Relativa (%)</h4>
                      <div className="space-y-3">
                        {[
                          { area: "Amígdala", before: 100, after: 73, color: "red" },
                          { area: "Hipocampo", before: 100, after: 115, color: "green" },
                          { area: "Córtex Pré-frontal", before: 100, after: 125, color: "blue" }
                        ].map((data, index) => (
                          <div key={index}>
                            <div className="flex justify-between text-xs text-slate-400 mb-1">
                              <span>{data.area}</span>
                              <span>Antes: {data.before}% → Após: {data.after}%</span>
                            </div>
                            <div className="flex gap-2">
                              <div className="flex-1 bg-slate-800 rounded h-4 relative overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${data.before}%` }}
                                  transition={{ delay: 9.5 + index * 0.2, duration: 1 }}
                                  className={`h-full rounded ${
                             data.color === 'red' ? 'bg-red-500/60' : 
                             data.color === 'green' ? 'bg-green-500/60' : 
                             'bg-blue-500/60'
                           }`}
                                />
                              </div>
                              <div className="flex-1 bg-slate-800 rounded h-4 relative overflow-hidden">
                                                                 <motion.div
                                   initial={{ width: 0 }}
                                   animate={{ width: `${Math.min(data.after, 140)}%` }}
                                   transition={{ delay: 9.7 + index * 0.2, duration: 1 }}
                                   className={`h-full rounded ${
                                     data.color === 'red' ? 'bg-red-400' : 
                                     data.color === 'green' ? 'bg-green-400' : 
                                     'bg-blue-400'
                                   }`}
                                 />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>

              {/* Neurotransmissores */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 9.2, duration: 0.6 }}
              >
                <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm border border-slate-600/50 hover:border-purple-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-400/20 h-full">
                  <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 rounded-t-lg">
                    <div className="flex items-center gap-3">
                      <Icon icon="lucide:flask-conical" className="text-white" width={24} height={24} />
                      <h3 className="text-lg font-bold text-white font-mono">MODULAÇÃO DE NEUROTRANSMISSORES</h3>
                    </div>
                  </div>
                  <CardBody className="p-6">
                    <p className="text-sm text-slate-300 mb-4">
                      Práticas específicas alteram diretamente a química cerebral:
                    </p>
                    
                    <div className="space-y-3 mb-6">
                      {[
                        { text: "Yoga aumenta GABA em", highlight: "27%", suffix: "após sessão única de 60 minutos" },
                        "Efeitos anti-ansiedade superiores ao exercício convencional",
                        "Práticas de respiração específicas modulam serotonina e dopamina",
                        { text: "Qigong e Tai Chi: tamanhos de efeito pequenos a moderados na redução de depressão", highlight: "SMD = 0.36-0.38" }
                      ].map((item, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <Icon icon="lucide:check-circle" className="text-purple-400 mt-1 flex-shrink-0" width={16} height={16} />
                          <span className="text-sm text-slate-300">
                            {typeof item === 'string' ? item : (
                              <>
                                {item.text} <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-xs font-bold">{item.highlight}</span> {item.suffix}
                              </>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Neurotransmitter Icons */}
                    <div className="flex justify-center items-center gap-8">
                      {[
                        { name: "GABA", icon: "lucide:brain", color: "purple" },
                        { name: "Serotonina", icon: "lucide:smile", color: "blue" },
                        { name: "Dopamina", icon: "lucide:zap", color: "green" }
                      ].map((nt, index) => (
                        <motion.div
                          key={nt.name}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 10 + index * 0.2, duration: 0.6 }}
                          className="text-center"
                        >
                                                     <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                             nt.color === 'purple' ? 'bg-purple-500/20 border border-purple-400/40' :
                             nt.color === 'blue' ? 'bg-blue-500/20 border border-blue-400/40' :
                             'bg-green-500/20 border border-green-400/40'
                           }`}>
                             <Icon icon={nt.icon} className={
                               nt.color === 'purple' ? 'text-purple-400' :
                               nt.color === 'blue' ? 'text-blue-400' : 
                               'text-green-400'
                             } width={20} height={20} />
                          </div>
                          <p className="text-xs text-slate-300 font-mono">{nt.name}</p>
                        </motion.div>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              </motion.div>

              {/* Eixo HPA */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 9.4, duration: 0.6 }}
              >
                <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm border border-slate-600/50 hover:border-red-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-red-400/20 h-full">
                  <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 rounded-t-lg">
                    <div className="flex items-center gap-3">
                      <Icon icon="lucide:heart-pulse" className="text-white" width={24} height={24} />
                      <h3 className="text-lg font-bold text-white font-mono">REGULAÇÃO DO EIXO HPA</h3>
                    </div>
                  </div>
                  <CardBody className="p-6">
                    <p className="text-sm text-slate-300 mb-4">
                      Meta-análises confirmam que práticas contemplativas normalizam padrões hormonais:
                    </p>
                    
                    <div className="space-y-3 mb-6">
                      {[
                        "Normalização de padrões de cortisol",
                        "Redução de marcadores inflamatórios (IL-6, TNF-α, PCR)",
                        "Fortalecimento da resiliência neuroendócrina"
                      ].map((item, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <Icon icon="lucide:check-circle" className="text-red-400 mt-1 flex-shrink-0" width={16} height={16} />
                          <span className="text-sm text-slate-300">{item}</span>
                        </div>
                      ))}
                    </div>

                    {/* Stress Response Visualization */}
                    <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                      <div className="relative h-24 flex items-center justify-center">
                        <svg className="w-full h-full" viewBox="0 0 180 80">
                          {/* Stress pattern */}
                          <motion.path
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ delay: 10.5, duration: 2 }}
                            d="M10,60 C30,20 60,70 90,25 C120,65 150,35 170,55"
                            stroke="#e74c3c"
                            fill="none"
                            strokeWidth="2"
                            strokeDasharray="0"
                          />
                          {/* Relaxed pattern */}
                          <motion.path
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ delay: 11, duration: 2 }}
                            d="M10,60 C30,50 60,55 90,45 C120,50 150,45 170,50"
                            stroke="#3498db"
                            fill="none"
                            strokeWidth="2"
                            strokeDasharray="5,5"
                          />
                        </svg>
                      </div>
                      <div className="flex justify-between text-xs mt-2">
                        <span className="text-red-400 font-mono">Estresse crônico</span>
                        <span className="text-blue-400 font-mono">Após práticas</span>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>

              {/* Epigenética */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 9.6, duration: 0.6 }}
              >
                <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm border border-slate-600/50 hover:border-green-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-400/20 h-full">
                  <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 rounded-t-lg">
                    <div className="flex items-center gap-3">
                      <Icon icon="lucide:dna" className="text-white" width={24} height={24} />
                      <h3 className="text-lg font-bold text-white font-mono">TRAUMA INTERGERACIONAL E EPIGENÉTICA</h3>
                    </div>
                  </div>
                  <CardBody className="p-6">
                    <p className="text-sm text-slate-300 mb-4">
                      Pesquisas revelam que trauma parental afeta expressão gênica em descendentes:
                    </p>
                    
                    <div className="space-y-3 mb-6">
                      {[
                        { text: "Alterações epigenéticas são", highlight: "reversíveis" },
                        "Terapia cognitivo-comportamental altera metilação do FKBP5 em veteranos com PTSD",
                        "Práticas contemplativas podem prevenir transmissão transgeracional do trauma"
                      ].map((item, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <Icon icon="lucide:check-circle" className="text-green-400 mt-1 flex-shrink-0" width={16} height={16} />
                          <span className="text-sm text-slate-300">
                            {typeof item === 'string' ? item : (
                              <>
                                {item.text} <span className="text-orange-400 font-semibold">{item.highlight}</span>
                              </>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* DNA Icon */}
                    <div className="flex justify-center items-center">
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 11, duration: 0.8 }}
                        className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center border border-green-400/40"
                      >
                        <Icon icon="lucide:dna" className="text-green-400" width={32} height={32} />
                      </motion.div>
                    </div>
                    <p className="text-xs text-center text-slate-300 mt-2 font-mono">
                      Expressão gênica modificável
                    </p>
                  </CardBody>
                </Card>
              </motion.div>
            </div>

            {/* Scientific Synthesis */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 11.5, duration: 0.8 }}
            >
              <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm border border-slate-600/50 hover:border-cyan-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-400/20">
                <CardBody className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                      <Icon icon="lucide:microscope" className="text-cyan-400" width={24} height={24} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-200 font-mono">
                      SÍNTESE: CIÊNCIA VALIDANDO SABEDORIA
                    </h3>
                  </div>

                  <p className="text-slate-300 mb-6 leading-relaxed">
                    A neurociência moderna confirma que <span className="text-orange-400 font-semibold">práticas espirituais produzem mudanças cerebrais mensuráveis</span> 
                    que revertem padrões neurológicos associados à apatia e depressão. Esta validação científica remove barreiras céticas 
                    e oferece protocolos precisos para transformação.
                  </p>

                  <div className="text-center">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="inline-block bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono font-bold py-3 px-8 rounded-full transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
                    >
                      <Icon icon="lucide:search" className="inline mr-2" width={18} height={18} />
                      EXPLORAR MECANISMOS NEURAIS
                    </motion.div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
} 