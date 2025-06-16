export interface ProjectMetadata {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  path: string;
  status: 'ACTIVE' | 'DEVELOPMENT' | 'ARCHIVED';
  protected: boolean; // 🔥 NOVA FLAG MATRIX AUTH
  tags: string[];
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    borderColor: string;
    glowColor: string;
  };
  emoji: string;
  authConfig?: { // 🔥 CONFIGURAÇÃO AUTH CUSTOMIZADA
    title?: string;
    subtitle?: string;
  };
}

export const projects: ProjectMetadata[] = [
  {
    id: 'marco',
    title: "MARCO'S PERSONALITY TRIP",
    subtitle: "Neural Analysis Protocol",
    description: "Mergulhe na análise multidimensional da mente de Marco. Uma viagem psicodélica pelos padrões de personalidade, temperamentos e arquétipos comportamentais.",
    path: "/marco",
    status: "ACTIVE",
    protected: false, // 🌍 PÚBLICO
    tags: ["Personality", "Psychology", "Analysis"],
    colors: {
      primary: "from-purple-500/20 to-pink-500/20",
      secondary: "purple-500",
      accent: "pink-500",
      borderColor: "border-purple-500/40",
      glowColor: "shadow-purple-500/30"
    },
    emoji: "🧠"
  },
  {
    id: 'matrix',
    title: "THE MATRIX",
    subtitle: "Reality Simulation Engine",
    description: "Entre na Matrix. Questione a realidade. Decodifique os algoritmos que governam nossa percepção. Você está pronto para a pílula vermelha?",
    path: "/matrix",
    status: "ACTIVE",
    protected: true, // 🔐 MATRIX PROTECTED
    tags: ["Reality", "Simulation", "Philosophy"],
    colors: {
      primary: "from-green-500/20 to-emerald-500/20",
      secondary: "green-500",
      accent: "emerald-500",
      borderColor: "border-green-500/40",
      glowColor: "shadow-green-500/30"
    },
    emoji: "💊",
    authConfig: {
      title: "REALITY ENGINE ACCESS",
      subtitle: "Enter the Matrix to see how deep the rabbit hole goes"
    }
  },
  {
    id: 'neural-system',
    title: "NEURAL SYSTEM",
    subtitle: "Marco's Neural Database",
    description: "Sistema neural avançado para gestão de conhecimento, pessoas e projetos. Seu segundo cérebro digital com IA integrada.",
    path: "/neural",
    status: "ACTIVE",
    protected: true, // 🔐 MATRIX PROTECTED
    tags: ["Neural", "AI", "Knowledge", "Database"],
    colors: {
      primary: "from-emerald-500/20 to-green-500/20",
      secondary: "emerald-500",
      accent: "green-500",
      borderColor: "border-emerald-500/40",
      glowColor: "shadow-emerald-500/30"
    },
    emoji: "🧠",
    authConfig: {
      title: "NEURAL SYSTEM ACCESS",
      subtitle: "Enter the Matrix to access your Neural Database"
    }
  },
  {
    id: 'tokenflow',
    title: "TOKENFLOW",
    subtitle: "Chat Analysis Engine",
    description: "Motor de análise avançada para conversas de IA. Importa, filtra, analisa e exporta suas conversas do ChatGPT e Claude com inteligência.",
    path: "/tokenflow",
    status: "ACTIVE",
    protected: false, // 🌍 PÚBLICO
    tags: ["AI", "Analysis", "Chat"],
    colors: {
      primary: "from-blue-500/20 to-cyan-500/20",
      secondary: "blue-500",
      accent: "cyan-500",
      borderColor: "border-blue-500/40",
      glowColor: "shadow-blue-500/30"
    },
    emoji: "🧠"
  },
  {
    id: 'comic-builder',
    title: "COMIC BUILDER",
    subtitle: "Visual Storytelling Engine",
    description: "Ferramenta para criação de histórias em quadrinhos com suporte a IA. Organize personagens, cenas e gere prompts estruturados para manter consistência visual.",
    path: "/comic-builder",
    status: "ACTIVE",
    protected: false, // 🌍 PÚBLICO
    tags: ["Creative", "AI", "Comics"],
    colors: {
      primary: "from-indigo-500/20 to-violet-500/20",
      secondary: "indigo-500",
      accent: "violet-500",
      borderColor: "border-indigo-500/40",
      glowColor: "shadow-indigo-500/30"
    },
    emoji: "📚"
  },
  {
    id: 'apatia',
    title: "APATIA LANDING",
    subtitle: "Anti-Motivation Protocol",
    description: "Uma landing page única criada a partir dos slides do Manus.ia. Uma jornada visual sobre desmotivação, propósito e a arte de não dar a mínima.",
    path: "/apatia",
    status: "ACTIVE",
    protected: false, // 🌍 PÚBLICO
    tags: ["Landing", "Psychology", "Anti-Motivation"],
    colors: {
      primary: "from-slate-500/20 to-gray-500/20",
      secondary: "slate-500",
      accent: "gray-500",
      borderColor: "border-slate-500/40",
      glowColor: "shadow-slate-500/30"
    },
    emoji: "😶"
  }
];

// 🔥 HELPER FUNCTIONS
export const getProjectById = (id: string) => projects.find(p => p.id === id);
export const getPublicProjects = () => projects.filter(p => !p.protected);
export const getProtectedProjects = () => projects.filter(p => p.protected);
export const getActiveProjects = () => projects.filter(p => p.status === 'ACTIVE'); 