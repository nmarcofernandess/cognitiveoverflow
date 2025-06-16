import React from "react";
import { Button, Navbar, NavbarBrand, NavbarContent, NavbarMenuToggle, NavbarMenu, NavbarMenuItem, Tabs, Tab } from "@heroui/react";
import { Icon } from "@iconify/react";
import ThemeSwitcher from "./theme-switcher";
import { ComicBuilderData } from "./ComicBuilderMain";

interface HeaderProps {
  onImport: (data: ComicBuilderData) => void;
  onExport: () => void;
  onCopyGeneralPrompt: () => void;
  selected: string;
  onNavigate: (section: string) => void;
}

const Header: React.FC<HeaderProps> = ({ 
  onImport, 
  onExport, 
  onCopyGeneralPrompt,
  selected,
  onNavigate
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        onImport(data);
        console.log("Projeto importado com sucesso");
      } catch (error) {
        console.error("Erro ao importar arquivo:", error);
      }
    };
    reader.readAsText(file);
  };
  
  const handleExport = () => {
    onExport();
    console.log("Projeto exportado com sucesso");
  };
  
  const handleCopyPrompt = () => {
    onCopyGeneralPrompt();
    console.log("Prompt geral copiado para a área de transferência");
  };
  
  return (
    <div>
      <Navbar 
        className="border-b" 
        onMenuOpenChange={setIsMenuOpen}
        isMenuOpen={isMenuOpen}
      >
        <NavbarContent>
          <NavbarMenuToggle
            aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
            className="sm:hidden"
          />
          <NavbarBrand 
            className="cursor-pointer" 
            onClick={() => onNavigate("dashboard")}
          >
            <Icon icon="lucide:book-open" className="text-2xl text-primary" />
            <p className="font-bold text-inherit ml-2">Comic Builder</p>
          </NavbarBrand>
        </NavbarContent>
        
        <NavbarContent justify="end">
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <Button 
              color="default" 
              variant="flat" 
              startContent={<Icon icon="lucide:upload" />}
              onPress={() => fileInputRef.current?.click()}
              className="hidden sm:flex"
            >
              Importar
            </Button>
            <Button 
              color="default" 
              variant="flat" 
              startContent={<Icon icon="lucide:download" />}
              onPress={handleExport}
              className="hidden sm:flex"
            >
              Salvar
            </Button>
            <Button 
              color="primary" 
              variant="flat" 
              startContent={<Icon icon="lucide:copy" />}
              onPress={handleCopyPrompt}
              className="hidden sm:flex"
            >
              Copiar Prompt Geral
            </Button>
          </div>
        </NavbarContent>
        
        <NavbarMenu>
          <NavbarMenuItem className="mt-2">
            <Button 
              color="default" 
              variant="flat" 
              startContent={<Icon icon="lucide:upload" />}
              onPress={() => {
                fileInputRef.current?.click();
                setIsMenuOpen(false);
              }}
              className="w-full justify-start"
            >
              Importar
            </Button>
          </NavbarMenuItem>
          <NavbarMenuItem>
            <Button 
              color="default" 
              variant="flat" 
              startContent={<Icon icon="lucide:download" />}
              onPress={() => {
                handleExport();
                setIsMenuOpen(false);
              }}
              className="w-full justify-start"
            >
              Salvar
            </Button>
          </NavbarMenuItem>
          <NavbarMenuItem>
            <Button 
              color="primary" 
              variant="flat" 
              startContent={<Icon icon="lucide:copy" />}
              onPress={() => {
                handleCopyPrompt();
                setIsMenuOpen(false);
              }}
              className="w-full justify-start"
            >
              Copiar Prompt Geral
            </Button>
          </NavbarMenuItem>
        </NavbarMenu>
      </Navbar>
      
      <div className="bg-content1/40 mt-4 pt-2 pb-1">
        <div className="container mx-auto max-w-5xl">
          <Tabs 
            aria-label="Navigation Tabs" 
            selectedKey={selected} 
            onSelectionChange={(key) => onNavigate(key as string)}
            variant="underlined"
            color="primary"
            classNames={{
              base: "w-full",
              tabList: "gap-6 justify-center",
              tab: "h-12 px-4 font-medium",
              cursor: "bg-primary",
              tabContent: "flex items-center gap-2 text-base"
            }}
          >
            <Tab 
              key="dashboard" 
              title={
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:layout-dashboard" />
                  <span>Início</span>
                </div>
              }
            />
            <Tab 
              key="general" 
              title={
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:settings" />
                  <span>Configurações</span>
                </div>
              }
            />
            <Tab 
              key="scenes" 
              title={
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:layout-grid" />
                  <span>Cenas</span>
                </div>
              }
            />
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Header;