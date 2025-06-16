import React from "react";
import Header from "./header";
import GeneralSettings from "./general-settings";
import ScenesTab from "./scenes-tab";
import Dashboard from "./dashboard";
import { useLocalStorage } from "./hooks/use-local-storage";

// Importar CSS específico do Comic Builder
import "../../styles/comic-builder.css";

export interface Character {
  id: string;
  name: string;
  isProtagonist: boolean;
  phases: CharacterPhase[];
}

export interface CharacterPhase {
  id: string;
  age: string;
  title: string;
  description: string;
  details?: {
    hair?: string;
    clothes?: string;
    expression?: string;
    beard?: string;
    tattoos?: string;
    body?: string;
    visualStyle?: string;
    accessories?: string;
  };
}

export interface ScenePanel {
  description: string;
  caption: string;
  image?: string;
}

export interface SceneCharacter {
  characterId: string;
  phaseId: string;
}

export interface Scene {
  id: string;
  letter: string;
  upperPanel: ScenePanel;
  lowerPanel: ScenePanel;
  characters: SceneCharacter[];
  generatedImage?: string;
}

export interface ComicBuilderData {
  comicStyle: string;
  characters: Character[];
  scenes: Scene[];
}

const initialData: ComicBuilderData = {
  comicStyle: "",
  characters: [
    {
      id: "char-1",
      name: "Protagonista",
      isProtagonist: true,
      phases: [
        {
          id: "phase-1",
          age: "",
          title: "Fase Inicial",
          description: "",
        },
      ],
    },
  ],
  scenes: [],
};

export function ComicBuilderMain() {
  const [selected, setSelected] = React.useState("dashboard");
  const [data, setData] = useLocalStorage<ComicBuilderData>("comic-builder-data", initialData);

  const handleImport = (importedData: ComicBuilderData) => {
    setData(importedData);
  };

  const handleExport = () => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "comic-builder-project.json";
    a.click();

    URL.revokeObjectURL(url);
  };

  const handleCopyGeneralPrompt = () => {
    const generalPrompt = {
      style: data.comicStyle,
      characters: data.characters.map((char) => ({
        name: char.name,
        isProtagonist: char.isProtagonist,
        phases: char.phases.map((phase) => ({
          age: phase.age,
          title: phase.title,
          description: phase.description,
        })),
      })),
    };

    navigator.clipboard.writeText(JSON.stringify(generalPrompt, null, 2));
  };

  const navigateToSection = (section: string) => {
    setSelected(section);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col" data-project="comic-builder">
      <Header
        onImport={handleImport}
        onExport={handleExport}
        onCopyGeneralPrompt={handleCopyGeneralPrompt}
        selected={selected}
        onNavigate={navigateToSection}
      />

      <main className="flex-grow p-4">
        <div className="container mx-auto">
          {selected === "dashboard" && <Dashboard onNavigate={navigateToSection} />}
          {selected === "general" && (
            <GeneralSettings
              comicStyle={data.comicStyle}
              characters={data.characters}
              onUpdateComicStyle={(style) => setData({ ...data, comicStyle: style })}
              onUpdateCharacters={(characters) => setData({ ...data, characters })}
            />
          )}
          {selected === "scenes" && (
            <ScenesTab
              scenes={data.scenes}
              characters={data.characters}
              comicStyle={data.comicStyle}
              onUpdateScenes={(scenes) => setData({ ...data, scenes })}
            />
          )}
        </div>
      </main>
    </div>
  );
} 