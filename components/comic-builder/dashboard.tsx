// src/components/dashboard.tsx
import React from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Divider,
} from "@heroui/react";
import { Icon } from "@iconify/react";

interface DashboardProps {
  onNavigate: (section: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Welcome Banner */}
      <div className="rounded-xl overflow-hidden border border-primary/20">
        <div className="bg-gradient-to-r from-primary-100/50 to-primary-50/50 p-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-shrink-0 bg-white/90 rounded-full p-5 shadow-lg">
              <Icon icon="lucide:book-open" className="text-5xl text-primary" />
            </div>
            <div className="space-y-4 text-center md:text-left">
              <h1 className="text-4xl font-bold text-primary-600">
                Bem-vindo ao Comic Builder
              </h1>
              <p className="text-xl text-default-700">
                Crie histórias em quadrinhos consistentes com ajuda de IA
              </p>
              <p className="text-default-600 max-w-2xl">
                O Comic Builder ajuda você a estruturar personagens, suas características e cenas para manter a consistência visual ao longo de toda a história em quadrinhos.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* General Settings Card */}
        <Card shadow="sm" className="border border-default-200 flex flex-col">
          <CardHeader className="flex gap-3">
            <div className="p-2 bg-primary-50 rounded-lg">
              <Icon icon="lucide:settings" className="text-xl text-primary" />
            </div>
            <div className="flex flex-col">
              <p className="text-xl font-semibold">Configurações Gerais</p>
              <p className="text-small text-default-500">
                Defina o estilo e personagens
              </p>
            </div>
          </CardHeader>
          <Divider />
          <CardBody className="py-6 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <p className="text-default-600">
                Configure o estilo visual da sua história em quadrinhos e crie personagens com diferentes fases de vida.
              </p>
              <ul className="list-disc list-inside space-y-2 text-default-600 pl-2">
                <li>Defina o estilo visual geral dos quadrinhos</li>
                <li>Crie e gerencie personagens</li>
                <li>Adicione múltiplas fases para cada personagem</li>
                <li>Descreva detalhes específicos como cabelo, roupas e expressões</li>
              </ul>
            </div>
            <Button
              color="primary"
              className="w-full mt-6"
              startContent={<Icon icon="lucide:settings" />}
              onPress={() => onNavigate("general")}
            >
              Ir para Configurações
            </Button>
          </CardBody>
        </Card>

        {/* Scenes Card */}
        <Card shadow="sm" className="border border-default-200 flex flex-col">
          <CardHeader className="flex gap-3">
            <div className="p-2 bg-primary-50 rounded-lg">
              <Icon icon="lucide:layout-grid" className="text-xl text-primary" />
            </div>
            <div className="flex flex-col">
              <p className="text-xl font-semibold">Cenas</p>
              <p className="text-small text-default-500">
                Crie e organize suas cenas
              </p>
            </div>
          </CardHeader>
          <Divider />
          <CardBody className="py-6 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <p className="text-default-600">
                Organize sua história em cenas sequenciais, cada uma com painéis superior e inferior.
              </p>
              <ul className="list-disc list-inside space-y-2 text-default-600 pl-2">
                <li>Crie cenas com identificadores sequenciais (A, B, C...)</li>
                <li>Defina descrições e legendas para cada painel</li>
                <li>Selecione quais personagens aparecem em cada cena</li>
                <li>Gere prompts específicos para ferramentas de IA</li>
              </ul>
            </div>
            <Button
              color="primary"
              className="w-full mt-6"
              startContent={<Icon icon="lucide:layout-grid" />}
              onPress={() => onNavigate("scenes")}
            >
              Ir para Cenas
            </Button>
          </CardBody>
        </Card>
      </div>

      {/* Usage Instructions */}
      <Card shadow="sm" className="border border-default-200">
        <CardHeader className="flex gap-3">
          <div className="p-2 bg-primary-50 rounded-lg">
            <Icon icon="lucide:info" className="text-xl text-primary" />
          </div>
          <div className="flex flex-col">
            <p className="text-xl font-semibold">Como Usar o Comic Builder</p>
            <p className="text-small text-default-500">
              Instruções passo a passo
            </p>
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="py-6">
          <div className="space-y-8">
            {/* Passo 1 */}
            <div className="flex flex-col md:flex-row gap-6">
              <div className="bg-default-100 p-5 rounded-xl text-center flex items-center justify-center md:w-24">
                <span className="text-4xl font-bold text-primary">1</span>
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="text-lg font-semibold">Configure o Estilo e Personagens</h3>
                <p className="text-default-600">
                  Na seção de <strong>Configurações Gerais</strong>, defina o estilo visual da sua história e crie seus personagens. Para cada personagem, você pode adicionar diferentes fases (idades) e descrever características detalhadas como cabelo, roupas e acessórios.
                </p>
              </div>
            </div>
            <Divider />

            {/* Passo 2 */}
            <div className="flex flex-col md:flex-row gap-6">
              <div className="bg-default-100 p-5 rounded-xl text-center flex items-center justify-center md:w-24">
                <span className="text-4xl font-bold text-primary">2</span>
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="text-lg font-semibold">Crie suas Cenas</h3>
                <p className="text-default-600">
                  Na seção de <strong>Cenas</strong>, adicione cenas sequenciais para sua história. Cada cena possui painéis superior e inferior, onde você pode descrever o que acontece e adicionar legendas. Selecione quais personagens aparecem em cada cena e em qual fase.
                </p>
              </div>
            </div>
            <Divider />

            {/* Passo 3 */}
            <div className="flex flex-col md:flex-row gap-6">
              <div className="bg-default-100 p-5 rounded-xl text-center flex items-center justify-center md:w-24">
                <span className="text-4xl font-bold text-primary">3</span>
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="text-lg font-semibold">Gere Prompts para IA</h3>
                <p className="text-default-600">
                  Use o botão <strong>"Copiar Prompt"</strong> em cada cena para gerar um prompt estruturado para ferramentas de IA. Isso ajuda a manter a consistência visual entre as imagens geradas, garantindo que personagens mantenham suas características ao longo da história.
                </p>
              </div>
            </div>
            <Divider />

            {/* Passo 4 */}
            <div className="flex flex-col md:flex-row gap-6">
              <div className="bg-default-100 p-5 rounded-xl text-center flex items-center justify-center md:w-24">
                <span className="text-4xl font-bold text-primary">4</span>
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="text-lg font-semibold">Salve seu Projeto</h3>
                <p className="text-default-600">
                  Use o botão <strong>"Salvar"</strong> no cabeçalho para exportar seu projeto como arquivo JSON. Você pode importá-lo posteriormente para continuar seu trabalho ou compartilhar com outras pessoas.
                </p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default Dashboard;
