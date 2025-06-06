"use client";

import { motion } from "framer-motion";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";

export default function ApatiaPart3() {
  const communities = [
    {
      name: "Findhorn Ecovillage",
      icon: "🌱",
      color: "emerald",
      glowColor: "emerald-400",
      members: "450 membros",
      achievement: "menor pegada ecológica do mundo industrializado",
      description: "Transformou caravanas degradadas na Escócia numa comunidade próspera",
      principles: ["Escuta interior profunda", "Co-criação com a natureza", "Trabalho como amor em ação"],
      insight: "A metodologia de 'attunement' (sintonização) diária cria conexão grupal que combate atomização social identificada por Bauman."
    },
    {
      name: "Search Inside Yourself (Google)",
      icon: "🔍",
      color: "blue",
      glowColor: "blue-400",
      members: "14.000+ participantes",
      achievement: "28% redução nos níveis de estresse",
      description: "Demonstra transformação corporativa globalmente em apenas 4 semanas",
      principles: ["Neurociência", "Mindfulness", "Inteligência emocional"],
      insight: "O programa fundamenta práticas contemplativas em neurociência, tornando-as acessíveis para céticos científicos."
    },
    {
      name: "ManKind Project",
      icon: "🔥",
      color: "purple",
      glowColor: "purple-400",
      members: "22.000+ homens desde 1985",
      achievement: "rituais modernos de passagem",
      description: "Aborda diretamente a perda de iniciações tradicionais",
      principles: ["Rei", "Guerreiro", "Amante", "Mago"],
      insight: "Oferece estruturas de significado que transcendem o individualismo."
    },
    {
      name: "Burning Man",
      icon: "🔥",
      color: "red",
      glowColor: "red-400",
      members: "80.000 participantes",
      achievement: "4ª maior cidade de Nevada",
      description: "Economia do dom funcionando em escala baseada em dádiva, descomodificação e participação radical",
      principles: ["Inclusão radical", "Dádiva", "Descomodificação", "Autossuficiência", "Expressão radical"],
      insight: "Oferece blueprint para comunidades que transcendem capitalismo de consumo."
    }
  ];

  const strategies = [
    {
      title: "Base Contemplativa Diária",
      duration: "20-40 minutos",
      icon: "🧠",
      color: "purple",
      glowColor: "purple-400",
      practices: [
        "Combinar mindfulness com loving-kindness meditation",
        "Fundamentação na neurociência da neuroplasticidade",
        "Práticas de respiração consciente regulam o sistema nervoso autônomo",
        "Dissolução de padrões de auto-exploração compulsiva"
      ]
    },
    {
      title: "Movimento Corporal Consciente",
      duration: "3-5 vezes por semana",
      icon: "🏃‍♂️",
      color: "red",
      glowColor: "red-400",
      practices: [
        "Yoga, Qigong ou Tai Chi que integram corpo-mente-espírito",
        "Posturas específicas aumentam GABA naturalmente",
        "Alternativa aos ansiolíticos através da sabedoria corporal",
        "Reconexão com inteligência somática"
      ]
    },
    {
      title: "Reconexão Natural Estruturada",
      duration: "15-30 minutos diários",
      icon: "🌳",
      color: "emerald",
      glowColor: "emerald-400",
      practices: [
        "Forest bathing combinado com earthing/grounding",
        "Horticultura terapêutica semanal",
        "Meta-análises confirmam benefícios mensuráveis para bem-estar mental",
        "Dose mínima de natureza com efeitos significativos"
      ]
    },
    {
      title: "Otimização Circadiana",
      duration: "Alinhamento diário",
      icon: "🌙",
      color: "blue",
      glowColor: "blue-400",
      practices: [
        "Light therapy matinal (30 minutos, 10.000 lux)",
        "Sincronizada com higiene de luz noturna",
        "Realinhamento do relógio biológico normaliza cortisol",
        "Combate aspectos fisiológicos da aceleração social"
      ]
    },
    {
      title: "Suporte Nutricional Direcionado",
      duration: "Suplementação específica",
      icon: "🍎",
      color: "yellow",
      glowColor: "yellow-400",
      practices: [
        "Ômega-3 (1-2g/dia, 60% EPA) otimiza síntese de neurotransmissores",
        "Vitamina D (5000-7000 UI/dia) regula enzima-chave na produção de serotonina",
        "Déficit de vitamina D afeta ~70% da população",
        "Dieta anti-inflamatória para reduzir neuroinflamação"
      ]
    },
    {
      title: "Práticas Comunitárias Intencionais",
      duration: "Conexão regular",
      icon: "👥",
      color: "cyan",
      glowColor: "cyan-400",
      practices: [
        "Criar ou juntar-se a grupos com governança participativa",
        "Economia de reciprocidade e rituais de conexão regular",
        "Check-ins emocionais estruturados e attunement grupal",
        "Combate atomização social identificada por Bauman"
      ]
    }
  ];

  return (
    <div className="space-y-20">
      {/* Section 5: Superação Comunitária */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="relative"
      >
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-emerald-400/20 blur-xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-blue-400/20 blur-xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 rounded-full bg-purple-400/10 blur-2xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative z-10">
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400 text-center mb-4 font-mono tracking-wider"
          >
            SUPERAÇÃO COMUNITÁRIA
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="text-slate-400 text-center text-xl mb-16 font-mono max-w-4xl mx-auto"
          >
            Casos documentados de transformação coletiva da apatia
          </motion.p>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {communities.map((community, index) => (
              <motion.div
                key={community.name}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 1.5 + index * 0.3 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="group"
              >
                <Card className={`bg-slate-800/40 backdrop-blur-sm border border-slate-600/40 hover:border-${community.glowColor}/50 transition-all duration-500 h-full overflow-hidden hover:shadow-lg hover:shadow-${community.glowColor}/20`}>
                  <CardBody className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`text-4xl`}>{community.icon}</div>
                      <div>
                        <h3 className={`text-xl font-bold text-${community.color}-400 font-mono group-hover:text-${community.color}-300 transition-colors`}>
                          {community.name}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-slate-400 font-mono">
                          <span className={`text-${community.color}-300 font-bold`}>{community.members}</span>
                          <span>•</span>
                          <span>{community.achievement}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-slate-300 text-sm mb-4 leading-relaxed">
                      {community.description}
                    </p>

                    <div className="mb-4">
                      <p className="text-slate-400 text-xs font-mono font-bold mb-2">PRINCÍPIOS FUNDAMENTAIS:</p>
                      <div className="flex flex-wrap gap-2">
                        {community.principles.map((principle, idx) => (
                          <span 
                            key={idx}
                            className={`px-2 py-1 bg-${community.color}-400/20 text-${community.color}-300 text-xs rounded font-mono border border-${community.color}-400/30`}
                          >
                            {principle}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className={`bg-slate-900/50 rounded-lg p-3 border-l-4 border-${community.color}-400/50`}>
                      <p className="text-slate-300 text-sm italic leading-relaxed">
                        "{community.insight}"
                      </p>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 3.5 }}
            className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-8 border border-slate-600/50"
          >
            <h3 className="text-2xl font-bold text-cyan-400 mb-4 font-mono flex items-center gap-2">
              <span>🤝</span> SÍNTESE: TRANSFORMAÇÃO COLETIVA
            </h3>
            <p className="text-slate-300 leading-relaxed mb-6">
              Casos de sucesso documentados demonstram que a transformação da apatia é possível tanto individual quanto coletivamente, 
              oferecendo modelos replicáveis. Estas comunidades comprovam que <span className="text-cyan-300 font-bold">estruturas sociais alternativas 
              podem nutrir em vez de drenar a vitalidade humana</span>, criando ambientes onde a conexão autêntica, propósito compartilhado 
              e ritmos naturais substituem a aceleração alienante da modernidade líquida.
            </p>
            <div className="flex justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-mono font-bold shadow-lg shadow-cyan-500/20 transition-all"
              >
                <span>🌍</span>
                Explorar Modelos Comunitários
              </Button>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Section 6: Estratégias Integradas */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="relative"
      >
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-20 w-36 h-36 rounded-full bg-yellow-400/20 blur-xl animate-pulse delay-500"></div>
          <div className="absolute bottom-10 left-20 w-44 h-44 rounded-full bg-red-400/20 blur-xl animate-pulse delay-1500"></div>
          <div className="absolute top-2/3 right-1/3 w-52 h-52 rounded-full bg-emerald-400/10 blur-2xl animate-pulse delay-2500"></div>
        </div>

        <div className="relative z-10">
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-400 to-emerald-400 text-center mb-4 font-mono tracking-wider"
          >
            ESTRATÉGIAS INTEGRADAS DE TRANSFORMAÇÃO
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="text-slate-400 text-center text-xl mb-16 font-mono max-w-4xl mx-auto"
          >
            Protocolo holístico baseado em evidências científicas e sabedoria ancestral
          </motion.p>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {strategies.map((strategy, index) => (
              <motion.div
                key={strategy.title}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 1.5 + index * 0.2 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="group"
              >
                <Card className={`bg-slate-800/40 backdrop-blur-sm border border-slate-600/40 hover:border-${strategy.glowColor}/50 transition-all duration-500 h-full overflow-hidden hover:shadow-lg hover:shadow-${strategy.glowColor}/20`}>
                  <CardBody className="p-6">
                    <div className="flex flex-col items-center text-center mb-4">
                      <div className={`text-4xl mb-2`}>{strategy.icon}</div>
                      <h3 className={`text-lg font-bold text-${strategy.color}-400 font-mono group-hover:text-${strategy.color}-300 transition-colors mb-1`}>
                        {strategy.title}
                      </h3>
                      <span className="text-slate-400 text-sm font-mono">{strategy.duration}</span>
                    </div>

                    <div className="space-y-3">
                      {strategy.practices.map((practice, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <div className={`w-2 h-2 rounded-full bg-${strategy.color}-400 mt-2 flex-shrink-0`}></div>
                          <p className="text-slate-300 text-sm leading-relaxed">
                            {practice}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 4.5 }}
            className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-8 border border-slate-600/50"
          >
            <h3 className="text-2xl font-bold text-yellow-400 mb-4 font-mono flex items-center gap-2">
              <span>🧩</span> SÍNTESE: PROTOCOLO INTEGRADO
            </h3>
            <p className="text-slate-300 leading-relaxed mb-6">
              A síntese das evidências aponta para um protocolo integrado que combina insights filosóficos, 
              práticas orientais validadas cientificamente, e experiências comunitárias comprovadas. 
              <span className="text-yellow-300 font-bold">Esta abordagem holística reconhece que a apatia moderna tem causas multifatoriais</span> 
              e, portanto, requer intervenções em múltiplos níveis - neurobiológico, psicológico, social e espiritual.
            </p>
            <div className="flex justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-yellow-600 to-red-600 hover:from-yellow-500 hover:to-red-500 text-white font-mono font-bold shadow-lg shadow-yellow-500/20 transition-all"
              >
                <span>⚡</span>
                Criar Protocolo Personalizado
              </Button>
            </div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
} 