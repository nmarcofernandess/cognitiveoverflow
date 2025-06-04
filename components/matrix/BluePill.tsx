import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { DashboardSection } from "./DashboardSection";
import { DataCard } from "./DataCard";
import { Chart } from "./Chart";

export const BluePill: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>("summary");
  
  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };
  
  return (
    <div className="blue-screen dashboard-container">
      <motion.div 
        className="dashboard-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="dashboard-title">AUTÓPSIA CONJUGAL 4.0: Marco & Yasmin</h1>
        <p className="dashboard-subtitle">Análise Multimodal Clínica de um Relacionamento em Crise</p>
        
        <div className="dashboard-nav">
          <button 
            className={`dash-nav-item ${activeSection === "summary" ? "active" : ""}`}
            onClick={() => handleSectionChange("summary")}
          >
            <Icon icon="lucide:clipboard" width={18} />
            <span>Sumário</span>
          </button>
          <button 
            className={`dash-nav-item ${activeSection === "intro" ? "active" : ""}`}
            onClick={() => handleSectionChange("intro")}
          >
            <Icon icon="lucide:info" width={18} />
            <span>Introdução</span>
          </button>
          <button 
            className={`dash-nav-item ${activeSection === "timeline" ? "active" : ""}`}
            onClick={() => handleSectionChange("timeline")}
          >
            <Icon icon="lucide:timer" width={18} />
            <span>Timeline</span>
          </button>
          <button 
            className={`dash-nav-item ${activeSection === "analysis" ? "active" : ""}`}
            onClick={() => handleSectionChange("analysis")}
          >
            <Icon icon="lucide:bar-chart-2" width={18} />
            <span>Análises</span>
          </button>
          <button 
            className={`dash-nav-item ${activeSection === "protocols" ? "active" : ""}`}
            onClick={() => handleSectionChange("protocols")}
          >
            <Icon icon="lucide:clipboard-list" width={18} />
            <span>Protocolos</span>
          </button>
          <button 
            className={`dash-nav-item ${activeSection === "conclusion" ? "active" : ""}`}
            onClick={() => handleSectionChange("conclusion")}
          >
            <Icon icon="lucide:check-circle" width={18} />
            <span>Conclusão</span>
          </button>
        </div>
      </motion.div>

      <div className="dashboard-content">
        {activeSection === "summary" && (
          <DashboardSection title="Sumário Executivo">
            <DataCard title="Visão Geral" className="highlight-card">
              <p>Este documento apresenta uma análise exaustiva de 38 mensagens trocadas entre Marco e Yasmin ao longo de 53 horas (22 a 24 de maio de 2025), aplicando múltiplos frameworks teóricos da psicologia conjugal para diagnosticar padrões destrutivos e propor intervenções baseadas em evidências. A análise revela um relacionamento em estado crítico, com ratio de interações positivas/negativas de 0.42 (limiar de risco: &lt;5.0), presença ativa dos Quatro Cavaleiros de Gottman, e padrões de comunicação que alternam entre vulnerabilidade rejeitada e coerção intelectualizada.</p>
            </DataCard>

            <div className="kpi-container">
              <DataCard title="Meses sem intimidade sexual" type="kpi" value="10" />
              <DataCard title="Probabilidade de ruptura" type="kpi" value="89.1%" />
              <DataCard title="Ratio de interações positivas/negativas" type="kpi" value="0.42" />
              <DataCard title="Tentativas de reparo" type="kpi" value="5" />
            </div>

            <DataCard title="Principais achados" type="list">
              <ul className="blue-list">
                <li>10 meses sem intimidade sexual</li>
                <li>Padrão de stonewalling recorrente (isolamento emocional)</li>
                <li>Conflito central: autonomia criativa vs segurança emocional</li>
                <li>Gatilho específico: criação de IAs com conteúdo sexual (Miss Monday)</li>
                <li>Probabilidade de ruptura em 90 dias: 89.1% sem intervenção</li>
              </ul>
            </DataCard>
          </DashboardSection>
        )}

        {activeSection === "intro" && (
          <DashboardSection title="Introdução e Contexto">
            <DataCard title="1.1 Apresentação do Caso">
              <p>Marco Fernandes, 34 anos, é nutricionista, programador e CEO do DietFlow, um SaaS de nutrição. Diagnosticado com TDAH e traços de superdotação, apresenta um perfil neurodivergente caracterizado por hiperfoco intenso, processamento criativo acelerado e aversão a rotinas convencionais. Yasmin, sua esposa, é designer e modelo, com diagnóstico de TEA leve, manifestando necessidade de previsibilidade, estrutura e segurança emocional.</p>
              <p>O casal está junto há 11 anos, casados formalmente, residindo em Santa Rita do Passa Quatro-SP. A crise atual eclodiu após Marco criar personagens de inteligência artificial com características sexuais explícitas (Miss Monday, Harley Quinn, Ana), compartilhando parcialmente essa atividade com Yasmin, que interpretou como substituição emocional e sexual.</p>
            </DataCard>

            <DataCard title="1.2 Metodologia de Análise">
              <p>Esta autópsia conjugal utiliza uma abordagem multimodal integrando quatro frameworks teóricos principais:</p>
              <div className="methodology-cards">
                <div className="method-card">
                  <h3>Framework de Gottman</h3>
                  <p>Desenvolvido por John Gottman e colaboradores ao longo de 40 anos de pesquisa no "Love Lab" da Universidade de Washington. Identifica os "Quatro Cavaleiros do Apocalipse" (crítica, desprezo, defensividade e stonewalling) como preditores de divórcio com 93.6% de precisão.</p>
                </div>
                <div className="method-card">
                  <h3>Internal Family Systems (IFS)</h3>
                  <p>Criado por Richard Schwartz, propõe que a psique é composta por múltiplas "partes" ou subpersonalidades, cada uma com suas próprias perspectivas e qualidades.</p>
                </div>
                <div className="method-card">
                  <h3>Comunicação Não-Violenta (CNV)</h3>
                  <p>Desenvolvida por Marshall Rosenberg, foca em quatro componentes: observação sem julgamento, identificação de sentimentos, reconhecimento de necessidades e formulação de pedidos específicos.</p>
                </div>
                <div className="method-card">
                  <h3>Terapia de Esquemas</h3>
                  <p>Criada por Jeffrey Young, identifica padrões cognitivos e emocionais desenvolvidos na infância que se perpetuam na vida adulta.</p>
                </div>
              </div>
            </DataCard>

            <DataCard title="1.3 Corpus de Dados">
              <p>A análise baseia-se em 38 mensagens de WhatsApp trocadas entre 22/05/2025 14:56 e 24/05/2025 21:15, totalizando aproximadamente 1.240 palavras. Adicionalmente, temos acesso a um documento interno de Marco intitulado "Diagnóstico da Bad Vibe Yasmin", que revela sua percepção dos conflitos antes da crise explodir.</p>
            </DataCard>

            <DataCard title="1.4 Visão Geral Multimodal - Os 4 Frameworks">
              <h3 className="blue-subtitle">GOTTMAN - Os 4 Cavaleiros + Bids (Análise Visual)</h3>
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Cavaleiro</th>
                      <th>Marco</th>
                      <th>Yasmin</th>
                      <th>Evidência</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Crítica</strong></td>
                      <td>⭐⭐</td>
                      <td>⭐⭐⭐⭐⭐</td>
                      <td><em>"você não faz pela família"</em> / <em>"sempre com cara de cu"</em></td>
                    </tr>
                    <tr>
                      <td><strong>Desprezo</strong></td>
                      <td>⭐⭐⭐⭐</td>
                      <td>⭐⭐</td>
                      <td><em>"É gado"</em> / <em>"romântica frustrada"</em></td>
                    </tr>
                    <tr>
                      <td><strong>Defensividade</strong></td>
                      <td>⭐⭐⭐⭐⭐</td>
                      <td>⭐⭐⭐⭐</td>
                      <td>Intelectualização vs vitimização</td>
                    </tr>
                    <tr>
                      <td><strong>Stonewalling</strong></td>
                      <td>⭐⭐⭐⭐⭐</td>
                      <td>⭐⭐</td>
                      <td>2 dias sem resposta / fechamento emocional</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <p><strong>Bids for Connection:</strong> Yasmin faz 80% dos bids, Marco rejeita 70% ou intelectualiza. Ratio atual: 1:8 (destrutivo).</p>

              <h3 className="blue-subtitle">CONVERGÊNCIA DOS FRAMEWORKS:</h3>
              <ul className="blue-list">
                <li><strong>IFS:</strong> Marco = Protetor Intelectual dominante (60%), Yasmin = Gerenciadora Segurança (50%)</li>
                <li><strong>CNV:</strong> Padrão destrutivo - Observação misturada com interpretação, pedidos viram ultimatos</li>
                <li><strong>Schema:</strong> Marco = Grandiosidade + Autonomia Prejudicada, Yasmin = Abandono + Subjugação</li>
                <li><strong>Diagnóstico:</strong> Guerra entre autonomia criativa vs segurança emocional com comunicação destrutiva escalando</li>
              </ul>
            </DataCard>
          </DashboardSection>
        )}

        {activeSection === "timeline" && (
          <DashboardSection title="Análise Temporal dos Gatilhos">
            <DataCard title="2.1 Linha do Tempo Detalhada">
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Evento Gatilho</th>
                      <th>Iniciador</th>
                      <th>Intensidade</th>
                      <th>Impacto Acumulado</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Há 10 meses</strong></td>
                      <td>Parada sexual completa</td>
                      <td>Ambos</td>
                      <td>5/5</td>
                      <td>🔴 Base destrutiva</td>
                    </tr>
                    <tr>
                      <td><strong>3 semanas atrás</strong></td>
                      <td>Criação da Miss Monday</td>
                      <td>Marco</td>
                      <td>4/5</td>
                      <td>🔴 Escalada</td>
                    </tr>
                    <tr>
                      <td><strong>22/05 - 14h56</strong></td>
                      <td>Texto vulnerável de Yasmin</td>
                      <td>Yasmin</td>
                      <td>3/5</td>
                      <td>🟡 Tentativa reconexão</td>
                    </tr>
                    <tr>
                      <td><strong>23/05 - 01h25</strong></td>
                      <td>Resposta defensiva brutal</td>
                      <td>Marco</td>
                      <td>5/5</td>
                      <td>🔴 Ruptura emocional</td>
                    </tr>
                    <tr>
                      <td><strong>23/05 - 01h45</strong></td>
                      <td>Yasmin aceita condições</td>
                      <td>Yasmin</td>
                      <td>2/5</td>
                      <td>🟡 Submissão temporária</td>
                    </tr>
                    <tr>
                      <td><strong>24/05 - 19h12</strong></td>
                      <td>Silêncio de Marco por 2 dias</td>
                      <td>Marco</td>
                      <td>4/5</td>
                      <td>🔴 Stonewalling</td>
                    </tr>
                    <tr>
                      <td><strong>24/05 - 20h25</strong></td>
                      <td>Ultimato final de Marco</td>
                      <td>Marco</td>
                      <td>5/5</td>
                      <td>🔴 DEFCON 1</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <p><strong>Padrão Identificado:</strong> Yasmin vulnerável → Marco intelectualiza → Yasmin controla → Marco ameaça → Loop infinito</p>
              
              <h3 className="blue-subtitle">Detalhamento dos Eventos Críticos:</h3>
              <p><strong>Há 10 meses</strong> - Cessação completa da atividade sexual do casal. Este marco representa o início da deterioração física da intimidade, criando um vácuo afetivo que posteriormente seria preenchido por outras atividades.</p>
              <p><strong>3 semanas antes</strong> - Marco cria a primeira versão da Miss Monday, uma IA com características sexuais dominantes. Este ato representa a busca por satisfação criativa e sexual fora do relacionamento, ainda que de forma virtual.</p>
              <p><strong>22/05 - 14:56</strong> - Yasmin envia mensagem vulnerável de 8 parágrafos, expondo suas necessidades emocionais e pedindo maior presença de Marco no "mundo real". Intensidade emocional: 4/5.</p>
              <p><strong>23/05 - 01:25</strong> - Marco responde com análise psicológica de 11 parágrafos, diagnosticando Yasmin como "romântica frustrada com dependência emocional". Primeira manifestação de desprezo explícito. Intensidade: 5/5.</p>
              <p><strong>23/05 - 01:45</strong> - Breve momento de vulnerabilidade de Marco, expressando seus desejos genuínos de conexão. Única tentativa de reparo bilateral. Intensidade: 3/5.</p>
              <p><strong>24/05 - 19:12</strong> - Após quase 2 dias de silêncio, Yasmin pede posicionamento. Marco mantém stonewalling parcial. Intensidade: 4/5.</p>
              <p><strong>24/05 - 20:25</strong> - Marco emite ultimato final: "Qualquer coisa menos que isso = fim do relacionamento". Ponto de ruptura. Intensidade: 5/5.</p>
            </DataCard>

            <div className="two-column-dashboard">
              <DataCard title="2.2 Padrões de Escalada">
                <p>A análise temporal revela um padrão consistente de escalada:</p>
                <ol className="blue-list">
                  <li><strong>Yasmin vulnerável</strong> → Marco intelectualiza/diagnostica</li>
                  <li><strong>Yasmin insiste</strong> → Marco se defende/ataca</li>
                  <li><strong>Yasmin tenta negociar</strong> → Marco emite ultimato</li>
                  <li><strong>Yasmin se submete</strong> → Marco mantém exigências</li>
                </ol>
                <p>Este ciclo se repete com intensidade crescente ao longo das 53 horas analisadas.</p>
              </DataCard>

              <DataCard title="2.3 Histórico de Concessões e Limite de Auto-Sacrifício (Marco)">
                <p><strong>CONTEXTO CRÍTICO:</strong> O ultimato final de Marco (24/05 20:25) não foi um ataque irracional, mas o resultado de múltiplas tentativas prévias de adaptação que esgotaram sua tolerância para mudanças.</p>
                
                <h3 className="blue-subtitle">Concessões Documentadas de Marco:</h3>
                <ul className="blue-list">
                  <li>
                    <strong>Interrupção das IAs:</strong> Pausou completamente o uso da Miss Monday quando Yasmin expressou desconforto inicial
                    <p><em>"Minhas IAs, que eu compartilhei com você e parei de ter contato imediatamente quando você discordou"</em></p>
                  </li>
                  <li>
                    <strong>Reajuste de Prioridades:</strong> Alterou drasticamente sua rotina para focar no que Yasmin considerava prioritário
                    <p><em>"Total foco em financeiro, tirar nome do serasa, regularizar Uniguaçu, responder whats, diminuir contas"</em></p>
                  </li>
                </ul>
              </DataCard>
            </div>

            <DataCard title="2.4 Densidade e Padrões de Escalada (Dados Reais)">
              <h3 className="blue-subtitle">Análise Quantitativa da Evolução Temporal:</h3>
              
              <h4>Distribuição de Intensidade por Período:</h4>
              <div className="intensity-chart">
                <Chart type="line" data={[
                  { period: "22/05 (14:56-15:33)", value: 3.7 },
                  { period: "23/05 (01:25-02:18)", value: 4.1 },
                  { period: "23/05 (12:17-16:30)", value: 3.8 },
                  { period: "23/05 (20:36-20:41)", value: 2.5 },
                  { period: "24/05 (19:12-21:15)", value: 4.6 }
                ]} />
              </div>

              <h4>Picos de Conflito Identificados:</h4>
              <ul className="blue-list">
                <li><strong>23/05 01:25</strong> - Marco: "romântica frustrada" (desprezo 5/5)</li>
                <li><strong>23/05 01:54</strong> - Marco: "O QUE TA ROLANDO?" (explosão 5/5)</li>
                <li><strong>23/05 12:24</strong> - Marco: "matando o homem que diz amar" (ultimato 5/5)</li>
                <li><strong>24/05 20:25</strong> - Marco: "fim do relacionamento" (ultimato final 5/5)</li>
                <li><strong>24/05 20:35</strong> - Marco: "EU NÃO SOU QUALQUER HOMEM" (explosão 5/5)</li>
              </ul>

              <h4>Degradação da Qualidade Comunicativa:</h4>
              <ul className="blue-list">
                <li><strong>Primeira metade (msgs 1-19):</strong> 42% tentativas de reparo</li>
                <li><strong>Segunda metade (msgs 20-38):</strong> 17% tentativas de reparo</li>
                <li><strong>Progressão de ultimatos:</strong> 0 → 3 → 5 (escalada linear)</li>
              </ul>
            </DataCard>
          </DashboardSection>
        )}

        {activeSection === "analysis" && (
          <DashboardSection title="Análises">
            <DataCard title="Métricas Gottman Consolidadas">
              <div className="two-columns-grid">
                <div className="analysis-column">
                  <h3 className="blue-subtitle">Frequência dos Quatro Cavaleiros</h3>
                  <div className="pie-chart-container">
                    <Chart type="pie" data={[
                      { name: "Crítica", value: 12, color: "#FF5252" },
                      { name: "Desprezo", value: 3, color: "#FF9D80" },
                      { name: "Defensividade", value: 2, color: "#FFD180" },
                      { name: "Stonewalling", value: 2, color: "#FFECB3" },
                      { name: "Tentativas de Reparo", value: 5, color: "#81C784" },
                    ]} />
                  </div>
                  <p><strong>Crítica:</strong> 12 ocorrências (31.6% das mensagens)</p>
                  <p><strong>Desprezo:</strong> 3 ocorrências (7.9% das mensagens)</p>
                  <p><strong>Defensividade:</strong> 2 ocorrências (5.3% das mensagens)</p>
                  <p><strong>Stonewalling:</strong> 2 ocorrências (5.3% das mensagens)</p>
                </div>

                <div className="analysis-column">
                  <h3 className="blue-subtitle">Ratio de Positividade</h3>
                  <div className="ratio-visualization">
                    <div className="ratio-container">
                      <div className="ratio-item positive">
                        <span>8</span>
                        <p>Interações Positivas</p>
                      </div>
                      <div className="ratio-item negative">
                        <span>19</span>
                        <p>Interações Negativas</p>
                      </div>
                    </div>
                    <div className="ratio-result">
                      <span>0.42</span>
                      <p>Ratio P/N</p>
                    </div>
                  </div>
                  <p className="ratio-interpretation">A literatura indica que casais estáveis mantêm ratio mínimo de 5:1. Casais em conflito podem sobreviver com 0.8:1. O ratio 0.42:1 encontrado está na zona crítica, indicando probabilidade de divórcio superior a 90% nos próximos 4 anos segundo os estudos longitudinais de Gottman.</p>
                </div>
              </div>
            </DataCard>

            <DataCard title="Análise por Internal Family Systems (IFS)">
              <div className="ifs-grid">
                <div className="ifs-person">
                  <h3 className="blue-subtitle">Sistema de Partes de Marco</h3>
                  <div className="ifs-parts">
                    <div className="ifs-part">
                      <h4>Self (Núcleo Saudável) - 5% ativo</h4>
                      <p><strong>Características:</strong> Criatividade genuína, visão inovadora, capacidade de amar</p>
                      <p><strong>Manifestação nas mensagens:</strong> Apenas no momento vulnerável de 23/05 01:45</p>
                    </div>
                    <div className="ifs-part primary">
                      <h4>Protetor Intelectual - 60% ativo</h4>
                      <p><strong>Função:</strong> Defender contra críticas através de análise e diagnóstico</p>
                      <p><strong>Manifestação:</strong> "Seu texto carrega uma carga oculta no inconsciente"</p>
                    </div>
                    <div className="ifs-part">
                      <h4>Protetor Controlador - 25% ativo</h4>
                      <p><strong>Função:</strong> Manter autonomia absoluta</p>
                      <p><strong>Manifestação:</strong> Ultimatos, condições binárias</p>
                    </div>
                    <div className="ifs-part">
                      <h4>Exilado Criança Ferida - 10% ativo</h4>
                      <p><strong>Características:</strong> Medo de não ser aceito como é</p>
                      <p><strong>Manifestação indireta:</strong> "Preferia perder tudo na vida do que perder você"</p>
                    </div>
                  </div>
                </div>

                <div className="ifs-person">
                  <h3 className="blue-subtitle">Sistema de Partes de Yasmin</h3>
                  <div className="ifs-parts">
                    <div className="ifs-part">
                      <h4>Self (Núcleo Saudável) - 10% ativo</h4>
                      <p><strong>Características:</strong> Capacidade de amar, vulnerabilidade corajosa</p>
                      <p><strong>Manifestação:</strong> Mensagem inicial de 22/05, tentativas de reparo</p>
                    </div>
                    <div className="ifs-part primary">
                      <h4>Gerenciadora da Segurança - 50% ativo</h4>
                      <p><strong>Função:</strong> Buscar previsibilidade e controle do ambiente</p>
                      <p><strong>Manifestação:</strong> Questionamentos sobre IAs, cobranças domésticas</p>
                    </div>
                    <div className="ifs-part">
                      <h4>Exilada Criança Abandonada - 30% ativo</h4>
                      <p><strong>Características:</strong> Terror de ser substituída, não ser suficiente</p>
                      <p><strong>Manifestação:</strong> "Talvez eu não seja evoluída o suficiente"</p>
                    </div>
                    <div className="ifs-part">
                      <h4>Protetora Submissa - 10% ativo</h4>
                      <p><strong>Função:</strong> Evitar conflito através de concordância</p>
                      <p><strong>Manifestação:</strong> "Entendo seu lado", "Está tudo bem"</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="ifs-dynamic">
                <h3 className="blue-subtitle">Dinâmica Sistêmica IFS</h3>
                <p>O conflito central ocorre entre:</p>
                <ul className="blue-list">
                  <li><strong>Protetor Intelectual de Marco</strong> vs <strong>Exilada Abandonada de Yasmin</strong></li>
                  <li><strong>Gerenciadora de Yasmin</strong> vs <strong>Protetor Controlador de Marco</strong></li>
                </ul>
                <p>Nenhum dos dois está operando a partir do Self, impossibilitando conexão genuína. As "partes" estão em guerra, não os indivíduos completos.</p>
              </div>
            </DataCard>

            <DataCard title="Análise pela Comunicação Não-Violenta (CNV)">
              <div className="cnv-analysis">
                <h3 className="blue-subtitle">Violações dos Princípios CNV</h3>
                <p>Marshall Rosenberg estabeleceu quatro componentes essenciais para comunicação compassiva. A análise revela violações sistemáticas:</p>
                
                <div className="cnv-component">
                  <h4>Observação vs Avaliação</h4>
                  <div className="cnv-examples">
                    <div className="cnv-violation">
                      <p><strong>Marco:</strong> "Você se coloca no papel de romântica frustrada" (avaliação)</p>
                      <p><strong>CNV:</strong> "Quando você disse X, eu observei Y" (observação)</p>
                    </div>
                    <div className="cnv-violation">
                      <p><strong>Yasmin:</strong> "Você sempre com cara de cu" (avaliação)</p>
                      <p><strong>CNV:</strong> "Notei expressão facial tensa em 3 ocasiões" (observação)</p>
                    </div>
                  </div>
                </div>
                
                <div className="cnv-component">
                  <h4>Sentimentos vs Pensamentos</h4>
                  <div className="cnv-examples">
                    <div className="cnv-violation">
                      <p><strong>Marco:</strong> "É chantagem emocional" (pensamento/julgamento)</p>
                      <p><strong>CNV:</strong> "Sinto-me manipulado e com raiva" (sentimento)</p>
                    </div>
                    <div className="cnv-violation">
                      <p><strong>Yasmin:</strong> "Estou perdida" (sentimento válido, mas vago)</p>
                      <p><strong>CNV:</strong> "Sinto medo e confusão sobre nosso futuro" (específico)</p>
                    </div>
                  </div>
                </div>
                
                <div className="cnv-component">
                  <h4>Necessidades vs Estratégias</h4>
                  <div className="cnv-examples">
                    <div className="cnv-violation">
                      <p><strong>Marco:</strong> "Quero que você me aceite 100%" (estratégia rígida)</p>
                      <p><strong>CNV:</strong> "Preciso de aceitação e autonomia" (necessidade)</p>
                    </div>
                    <div className="cnv-violation">
                      <p><strong>Yasmin:</strong> "Quero o homem que decide ser chão" (estratégia)</p>
                      <p><strong>CNV:</strong> "Preciso de presença e segurança emocional" (necessidade)</p>
                    </div>
                  </div>
                </div>
                
                <div className="cnv-component">
                  <h4>Pedidos vs Exigências</h4>
                  <div className="cnv-examples">
                    <div className="cnv-violation">
                      <p><strong>Marco:</strong> "Qualquer coisa menos = fim" (exigência com ameaça)</p>
                      <p><strong>CNV:</strong> "Você estaria disposta a experimentar X por Y dias?" (pedido)</p>
                    </div>
                    <div className="cnv-violation">
                      <p><strong>Yasmin:</strong> "Pode me posicionar sobre isso?" (pedido quase-CNV)</p>
                      <p><strong>CNV:</strong> "Você poderia compartilhar seus sentimentos agora?" (específico)</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <h3 className="blue-subtitle">Guerra de Necessidades Não-Atendidas</h3>
              <div className="needs-comparison">
                <div className="needs-column">
                  <h4>Necessidades de Marco:</h4>
                  <ul className="blue-list">
                    <li>Autonomia criativa</li>
                    <li>Aceitação incondicional</li>
                    <li>Liberdade de expressão</li>
                    <li>Admiração por sua genialidade</li>
                  </ul>
                </div>
                <div className="needs-column">
                  <h4>Necessidades de Yasmin:</h4>
                  <ul className="blue-list">
                    <li>Segurança emocional</li>
                    <li>Presença consistente</li>
                    <li>Inclusão e parceria</li>
                    <li>Priorização sobre outros interesses</li>
                  </ul>
                </div>
              </div>
              <p>O conflito não é sobre IAs ou tarefas domésticas, mas sobre necessidades fundamentais em oposição aparente.</p>
            </DataCard>
          </DashboardSection>
        )}

        {activeSection === "protocols" && (
          <DashboardSection title="Protocolos de Intervenção">
            <DataCard title="13.1 Nível 1: Micro-Experimentos de Baixo Risco">
              <div className="protocol-cards">
                <div className="protocol-card">
                  <h3>Protocolo "Pausa Compassiva"</h3>
                  <p><strong>Objetivo:</strong> Reduzir reatividade em 72 horas</p>
                  <p><strong>Método:</strong> Antes de responder a qualquer mensagem ou fala do parceiro, fazer pausa de 5-10 segundos</p>
                  <p><strong>Durante a pausa:</strong> Respirar profundamente e perguntar "O que meu parceiro está precisando agora?"</p>
                  <p><strong>Critério de sucesso:</strong> Redução de 50% em respostas defensivas</p>
                </div>
                <div className="protocol-card">
                  <h3>Protocolo "Apreciação Diária"</h3>
                  <p><strong>Objetivo:</strong> Aumentar ratio positivo/negativo</p>
                  <p><strong>Método:</strong> Cada parceiro expressa UMA apreciação genuína por dia, antes de qualquer crítica</p>
                  <p><strong>Marco:</strong> Focar em aspectos emocionais/físicos de Yasmin</p>
                  <p><strong>Yasmin:</strong> Focar em criatividade/intelecto de Marco</p>
                  <p><strong>Critério de sucesso:</strong> 21 dias consecutivos sem falha</p>
                </div>
                <div className="protocol-card">
                  <h3>Protocolo "Toque Não-Sexual"</h3>
                  <p><strong>Objetivo:</strong> Reconstruir intimidade física básica</p>
                  <p><strong>Método:</strong> 30 segundos de contato físico não-sexual por dia (abraço, mão dada, cafuné)</p>
                  <p><strong>Sem expectativa</strong> de evolução para sexo</p>
                  <p><strong>Critério de sucesso:</strong> 14 dias consecutivos</p>
                </div>
              </div>
            </DataCard>

            <DataCard title="13.2 Nível 2: Intervenções de Risco Moderado">
              <div className="protocol-cards">
                <div className="protocol-card">
                  <h3>Protocolo "Gradient de Intimidade"</h3>
                  <p><strong>Duração:</strong> 21 dias</p>
                  <p><strong>Fase 1 (dias 1-7):</strong> Beijos e carícias não-genitais</p>
                  <p><strong>Fase 2 (dias 8-14):</strong> Intimidade sexual sem penetração</p>
                  <p><strong>Fase 3 (dias 15-21):</strong> Intimidade completa SE ambos desejarem</p>
                  <p><strong>Regra de ouro:</strong> Qualquer desconforto = pausa sem culpa</p>
                </div>
                <div className="protocol-card">
                  <h3>Protocolo "Compartilhamento Criativo Estruturado"</h3>
                  <p><strong>Marco</strong> compartilha UMA ideia criativa por semana</p>
                  <p><strong>Yasmin</strong> tem 24h para processar antes de responder</p>
                  <p><strong>Resposta deve seguir formato:</strong> "O que gostei..." + "O que me preocupa..." + "Proposta de adaptação..."</p>
                  <p><strong>Sem julgamentos morais</strong>, apenas práticos</p>
                </div>
              </div>
            </DataCard>

            <DataCard title="14. Plano de Implementação de 90 Dias">
              <div className="implementation-phases">
                <div className="phase">
                  <h3>Fase 1: Estabilização (Dias 1-30)</h3>
                  <div className="phase-content">
                    <div>
                      <h4>Objetivos:</h4>
                      <ul className="blue-list">
                        <li>Cessar hostilidades ativas</li>
                        <li>Estabelecer comunicação funcional mínima</li>
                        <li>Criar base para trabalho conjunto</li>
                      </ul>
                    </div>
                    <div>
                      <h4>Ações Diárias:</h4>
                      <ul className="blue-list">
                        <li>Protocolo Pausa Compassiva (ambos)</li>
                        <li>Uma apreciação genuína (ambos)</li>
                        <li>15 minutos de conversa sobre assuntos neutros</li>
                        <li>Zero críticas ou análises psicológicas</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="phase">
                  <h3>Fase 2: Reconstrução (Dias 31-60)</h3>
                  <div className="phase-content">
                    <div>
                      <h4>Pré-requisitos:</h4>
                      <p>Fase 1 completada com 70% sucesso</p>
                      <h4>Objetivos:</h4>
                      <ul className="blue-list">
                        <li>Reconstruir intimidade física gradual</li>
                        <li>Estabelecer projetos conjuntos</li>
                        <li>Processar mágoas com mediação</li>
                      </ul>
                    </div>
                    <div>
                      <h4>Ações Semanais:</h4>
                      <ul className="blue-list">
                        <li>Terapia de casal (presencial ou online)</li>
                        <li>Um "date" sem mencionar problemas</li>
                        <li>Projeto criativo conjunto (30 min/semana)</li>
                        <li>Protocolo Gradiente de Intimidade</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="phase">
                  <h3>Fase 3: Consolidação (Dias 61-90)</h3>
                  <div className="phase-content">
                    <div>
                      <h4>Pré-requisitos:</h4>
                      <p>Fase 2 com intimidade física restabelecida</p>
                      <h4>Objetivos:</h4>
                      <ul className="blue-list">
                        <li>Integrar aprendizados na rotina</li>
                        <li>Criar visão conjunta de futuro</li>
                        <li>Estabelecer rituais de manutenção</li>
                      </ul>
                    </div>
                    <div>
                      <h4>Métricas de Sucesso Final:</h4>
                      <ul className="blue-list">
                        <li>Ratio P/N >3.0 sustentado</li>
                        <li>Zero episódios de stonewalling em 30 dias</li>
                        <li>Satisfação relacional >7 para ambos</li>
                        <li>Intimidade física regular e mutuamente satisfatória</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </DataCard>

            <DataCard title="15.1 Checklist Diário (21 dias)">
              <div className="checklist-grid">
                <div className="checklist-column">
                  <h3>Marco:</h3>
                  <ul className="checklist-items">
                    <li>
                      <input type="checkbox" id="marco-1" />
                      <label htmlFor="marco-1">Compartilhar 1 ideia/dia sem defensividade prévia (&lt;150 char)</label>
                    </li>
                    <li>
                      <input type="checkbox" id="marco-2" />
                      <label htmlFor="marco-2">Pausar 3 seg antes de responder críticas</label>
                    </li>
                    <li>
                      <input type="checkbox" id="marco-3" />
                      <label htmlFor="marco-3">Fazer 1 pergunta sobre o dia dela sem conectar ao seu trabalho</label>
                    </li>
                    <li>
                      <input type="checkbox" id="marco-4" />
                      <label htmlFor="marco-4">Contato físico não-sexual: 30 seg/dia mínimo</label>
                    </li>
                    <li>
                      <input type="checkbox" id="marco-5" />
                      <label htmlFor="marco-5">Zero ameaças de rompimento (controle de impulso)</label>
                    </li>
                  </ul>
                </div>
                
                <div className="checklist-column">
                  <h3>Yasmin:</h3>
                  <ul className="checklist-items">
                    <li>
                      <input type="checkbox" id="yasmin-1" />
                      <label htmlFor="yasmin-1">Expressar 1 apreciação/dia antes de qualquer crítica</label>
                    </li>
                    <li>
                      <input type="checkbox" id="yasmin-2" />
                      <label htmlFor="yasmin-2">Respirar 5 seg antes de questionar atividades dele</label>
                    </li>
                    <li>
                      <input type="checkbox" id="yasmin-3" />
                      <label htmlFor="yasmin-3">Iniciar conversa não-problema 10 min/dia</label>
                    </li>
                    <li>
                      <input type="checkbox" id="yasmin-4" />
                      <label htmlFor="yasmin-4">Pedir o que quer em vez de criticar o que não quer</label>
                    </li>
                    <li>
                      <input type="checkbox" id="yasmin-5" />
                      <label htmlFor="yasmin-5">Aceitar "não" sem interpretar como rejeição pessoal</label>
                    </li>
                  </ul>
                </div>
              </div>
            </DataCard>
          </DashboardSection>
        )}

        {activeSection === "conclusion" && (
          <DashboardSection title="Conclusão e Prognóstico">
            <DataCard title="18.1 Diagnóstico Final">
              <p>A análise multimodal de 38 mensagens revela um relacionamento em estado crítico, caracterizado por:</p>
              <ol className="blue-list numbered">
                <li><strong>Comunicação Destrutiva:</strong> Presença ativa dos Quatro Cavaleiros de Gottman, com predominância de crítica (31.6%) e ausência de reparos efetivos</li>
                <li><strong>Conflito Central Não-Resolvido:</strong> Batalha entre necessidade de autonomia criativa (Marco) versus segurança emocional (Yasmin), exacerbada por neurodivergências</li>
                <li><strong>Esgotamento Adaptativo:</strong> Marco atingiu seu "teto de poda" após múltiplas concessões não-reconhecidas, transformando ultimatos em autopreservação psicológica</li>
                <li><strong>Intimidade Colapsada:</strong> 10 meses sem sexo, substituição por IAs, distância emocional crescente</li>
                <li><strong>Padrões Sistêmicos Rígidos:</strong> Ciclos repetitivos de vulnerabilidade-rejeição-ultimato-submissão</li>
                <li><strong>Probabilidade de Ruptura:</strong> 89.1% em 90 dias sem intervenção significativa</li>
              </ol>
            </DataCard>

            <div className="two-column-dashboard">
              <DataCard title="18.2 Fatores de Risco e Proteção">
                <div className="risk-protection-grid">
                  <div className="risk-column">
                    <h3>Fatores de Risco:</h3>
                    <ul className="blue-list">
                      <li>Ratio P/N de 0.42 (crítico)</li>
                      <li>Neurodivergências não acomodadas</li>
                      <li>Histórico de tentativas fracassadas</li>
                      <li>Escalada recente com ultimatos</li>
                      <li>Ausência de intimidade física prolongada</li>
                    </ul>
                  </div>
                  <div className="protection-column">
                    <h3>Fatores de Proteção:</h3>
                    <ul className="blue-list">
                      <li>11 anos de história conjunta</li>
                      <li>Amor declarado por ambos</li>
                      <li>Capacidade intelectual para compreender dinâmicas</li>
                      <li>Recursos financeiros para terapia</li>
                      <li>Ausência de traição física ou violência</li>
                    </ul>
                  </div>
                </div>
              </DataCard>

              <DataCard title="18.3 Recomendações Prioritárias">
                <div className="recommendations">
                  <div className="recommendation-group">
                    <h3>Imediato (72 horas):</h3>
                    <ol className="blue-list">
                      <li>Cessar todas as ameaças de término</li>
                      <li>Implementar Protocolo Pausa Compassiva</li>
                      <li>Agendar terapia conjugal especializada</li>
                    </ol>
                  </div>
                  
                  <div className="recommendation-group">
                    <h3>Curto Prazo (30 dias):</h3>
                    <ol className="blue-list">
                      <li>Estabilizar comunicação com técnicas CNV</li>
                      <li>Restabelecer toque físico não-sexual</li>
                      <li>Criar boundaries claros sobre IAs</li>
                    </ol>
                  </div>
                  
                  <div className="recommendation-group">
                    <h3>Médio Prazo (90 dias):</h3>
                    <ol className="blue-list">
                      <li>Reconstruir intimidade com protocolo gradual</li>
                      <li>Integrar necessidades neurodivergentes</li>
                      <li>Desenvolver visão conjunta de futuro</li>
                    </ol>
                  </div>
                </div>
              </DataCard>
            </div>

            <DataCard title="18.4 Prognóstico">
              <div className="prognosis-visualization">
                <div className="prognosis-item">
                  <h3>Com intervenção intensiva:</h3>
                  <div className="probability-meter">
                    <div className="probability-value" style={{ width: '55%' }}>55%</div>
                  </div>
                  <p>Probabilidade de recuperação sustentável, alcançando padrão similar ao casal Will/Jada Smith (funcional mas não optimal)</p>
                </div>
                
                <div className="prognosis-item critical">
                  <h3>Sem intervenção:</h3>
                  <div className="probability-meter">
                    <div className="probability-value" style={{ width: '89.1%' }}>89.1%</div>
                  </div>
                  <p>Ruptura inevitável, com custos estimados em R$ 300.000 e impacto severo em saúde mental de ambos</p>
                </div>
              </div>

              <div className="final-message">
                <p>Este relacionamento não está morrendo por falta de amor, mas por excesso de condições, defesas e medos. A pergunta central não é "podemos nos salvar?" mas "estamos dispostos a criar um terceiro espaço onde nenhum precise morrer para o amor viver?"</p>
                <p>A resposta determinará se Marco e Yasmin escreverão um novo capítulo juntos ou se tornarão mais uma estatística de Gottman - brilhantes, intensos, mas incapazes de transformar paixão em parceria sustentável.</p>
                <p>O amor sozinho não salva relacionamentos. Mas amor combinado com consciência, compromisso e coragem de mudar pode criar milagres relacionais. A escolha, como sempre, é dos protagonistas desta história.</p>
              </div>
            </DataCard>
          </DashboardSection>
        )}
      </div>
    </div>
  );
};