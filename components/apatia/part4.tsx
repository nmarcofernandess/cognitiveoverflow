"use client";

import { motion } from "framer-motion";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";

export default function ApatiaPart4() {
  const truths = [
    {
      number: 1,
      title: "A Apatia Não É Preguiça",
      color: "blue",
      glowColor: "blue-400",
      icon: "💡",
      description: "A apatia não é preguiça, mas esgotamento espiritual causado por desconexão de fontes transcendentes de significado.",
      quote: "Sua cura requer não mais esforço, mas redirecionamento da energia para práticas que nutrem em vez de drenar."
    },
    {
      number: 2,
      title: "O Paradoxo do Individualismo",
      color: "purple",
      glowColor: "purple-400",
      icon: "🔄",
      description: "O individualismo extremo paradoxalmente destrói a individualidade autêntica.",
      quote: "A recuperação do self genuíno acontece através de práticas que reconhecem interdependência fundamental - com natureza, comunidade, e dimensões transpessoais da experiência."
    },
    {
      number: 3,
      title: "A Necessidade de Rituais",
      color: "red",
      glowColor: "red-400",
      icon: "🕯️",
      description: "A modernidade não ofereceu substitutos adequados para rituais tradicionais de passagem.",
      quote: "Rituais modernos conscientes são necessários, não opcionais, para marcar transições para maturidade psico-espiritual."
    },
    {
      number: 4,
      title: "Trauma Intergeracional",
      color: "emerald",
      glowColor: "emerald-400",
      icon: "🧬",
      description: "Trauma intergeracional contribui silenciosamente para apatia contemporânea.",
      quote: "Mudanças epigenéticas são reversíveis através de práticas específicas que interrompem transmissão de padrões destrutivos."
    },
    {
      number: 5,
      title: "Tempo Sagrado",
      color: "yellow",
      glowColor: "yellow-400",
      icon: "⏳",
      description: "A aceleração social pode ser resistida através de práticas que cultivam 'tempo sagrado'.",
      quote: "Momentos de profundidade que escapam da lógica da eficiência e criam espaços de ressonância autêntica."
    }
  ];

  return (
    <div className="space-y-20">
      {/* Section 7: Verdades Profundas e Conclusão */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="relative"
      >
        {/* Background Mandala */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
          <svg width="800" height="800" viewBox="0 0 100 100" className="animate-spin" style={{ animationDuration: '120s' }}>
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-cyan-400"/>
            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-cyan-400"/>
            <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-cyan-400"/>
            <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-cyan-400"/>
            <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-cyan-400"/>
            <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-cyan-400"/>
            <circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-cyan-400"/>
            <circle cx="50" cy="50" r="10" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-cyan-400"/>
            <circle cx="50" cy="50" r="5" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-cyan-400"/>
            <line x1="50" y1="5" x2="50" y2="95" stroke="currentColor" strokeWidth="0.5" className="text-cyan-400"/>
            <line x1="5" y1="50" x2="95" y2="50" stroke="currentColor" strokeWidth="0.5" className="text-cyan-400"/>
            <line x1="14.64" y1="14.64" x2="85.36" y2="85.36" stroke="currentColor" strokeWidth="0.5" className="text-cyan-400"/>
            <line x1="85.36" y1="14.64" x2="14.64" y2="85.36" stroke="currentColor" strokeWidth="0.5" className="text-cyan-400"/>
          </svg>
        </div>

        {/* Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-blue-400/20 blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-40 h-40 rounded-full bg-purple-400/20 blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-40 left-1/4 w-36 h-36 rounded-full bg-red-400/20 blur-xl animate-pulse delay-2000"></div>
          <div className="absolute bottom-20 right-1/3 w-44 h-44 rounded-full bg-emerald-400/20 blur-xl animate-pulse delay-3000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 rounded-full bg-yellow-400/10 blur-2xl animate-pulse delay-4000"></div>
        </div>

        <div className="relative z-10">
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 via-red-400 via-emerald-400 to-yellow-400 text-center mb-4 font-mono tracking-wider"
          >
            VERDADES PROFUNDAS E CONCLUSÃO
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="text-slate-400 text-center text-xl mb-16 font-mono max-w-4xl mx-auto"
          >
            Insights fundamentais para compreender e transcender a apatia moderna
          </motion.p>

          {/* Truth Cards Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {truths.map((truth, index) => (
              <motion.div
                key={truth.number}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 1.5 + index * 0.3 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="group"
              >
                <Card className={`bg-slate-800/40 backdrop-blur-sm border border-slate-600/40 hover:border-${truth.glowColor}/50 transition-all duration-500 h-full overflow-hidden hover:shadow-lg hover:shadow-${truth.glowColor}/20`}>
                  <CardBody className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-8 h-8 rounded-full bg-${truth.color}-400/20 flex items-center justify-center text-${truth.color}-400 font-mono font-bold text-sm`}>
                        {truth.number}
                      </div>
                      <div className="text-2xl">{truth.icon}</div>
                      <h3 className={`text-lg font-bold text-${truth.color}-400 font-mono group-hover:text-${truth.color}-300 transition-colors flex-1`}>
                        {truth.title}
                      </h3>
                    </div>

                    <p className="text-slate-300 text-sm mb-4 leading-relaxed">
                      {truth.description}
                    </p>

                    <div className={`bg-slate-900/50 rounded-lg p-4 border-l-4 border-${truth.color}-400/50`}>
                      <p className="text-slate-300 text-sm italic leading-relaxed">
                        "{truth.quote}"
                      </p>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Conclusion Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 4.5 }}
            className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-8 border border-slate-600/50 relative overflow-hidden"
          >
            {/* Conclusion Background Effect */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-400/20 via-purple-400/20 to-yellow-400/20 animate-pulse"></div>
            </div>
            
            <div className="relative z-10">
              <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-6 font-mono flex items-center gap-3">
                <span>⭐</span> CONCLUSÃO
              </h3>
              
              <div className="space-y-6 text-slate-300 leading-relaxed">
                <p>
                  A apatia moderna aos 30 anos representa uma <span className="text-cyan-300 font-bold">crise espiritual disfarçada de problema psicológico individual</span>. 
                  Sua resolução requer reconhecer tanto suas raízes estruturais quanto as possibilidades reais de transformação 
                  através da integração consciente de sabedoria ancestral com insights contemporâneos.
                </p>
                
                <p>
                  <span className="text-yellow-300 font-bold">Os caminhos de cura não apenas existem, mas estão sendo validados por ciência rigorosa 
                  e demonstrados por comunidades ao redor do mundo</span>. A questão não é se a transformação é possível, 
                  mas se indivíduos e sociedades escolherão práticas que nutrem a alma humana em vez de explorá-la.
                </p>
                
                <p>
                  A geração de 30 anos está posicionada uniquement para liderar esta transformação - <span className="text-emerald-300 font-bold">velha o suficiente para 
                  reconhecer as limitações das promessas modernas, jovem o suficiente para implementar alternativas, e educada 
                  o suficiente para integrar múltiplas formas de conhecimento</span>. 
                  <span className="text-purple-300 font-bold">A apatia pode ser o convite 
                  para um despertar que nossa civilização urgentemente necessita</span>.
                </p>
              </div>

              {/* Call to Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-mono font-bold shadow-lg shadow-blue-500/20 transition-all"
                >
                  <span>🤔</span>
                  Refletir Sobre as Verdades
                </Button>
                
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-mono font-bold shadow-lg shadow-emerald-500/20 transition-all"
                >
                  <span>🚀</span>
                  Próximos Passos
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Final Inspiration Quote */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 5.0 }}
            className="text-center mt-16"
          >
            <div className="bg-gradient-to-r from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-full px-8 py-4 border border-cyan-400/30 shadow-lg shadow-cyan-400/10 inline-block">
              <p className="text-cyan-300 font-mono text-lg italic">
                "A Matrix da apatia pode ser hackeada. O código da transformação já foi escrito."
              </p>
              <p className="text-slate-400 font-mono text-sm mt-2">
                — Red pill loading... 🔴
              </p>
            </div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
} 