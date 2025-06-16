import React from "react";
import { Button, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";
import ComicStyle from "./comic-style";
import CharacterList from "./character-list";
import { Character } from "./ComicBuilderMain";

interface GeneralSettingsProps {
  comicStyle: string;
  characters: Character[];
  onUpdateComicStyle: (style: string) => void;
  onUpdateCharacters: (characters: Character[]) => void;
}

const GeneralSettings: React.FC<GeneralSettingsProps> = ({
  comicStyle,
  characters,
  onUpdateComicStyle,
  onUpdateCharacters,
}) => {
  const addCharacter = () => {
    const newCharacter: Character = {
      id: `char-${Date.now()}`,
      name: "Novo Personagem",
      isProtagonist: false,
      phases: [
        {
          id: `phase-${Date.now()}`,
          age: "",
          title: "Fase Inicial",
          description: "",
        },
      ],
    };
    
    onUpdateCharacters([...characters, newCharacter]);
  };

  return (
    <div className="space-y-8 py-4 max-w-5xl mx-auto">
      <ComicStyle 
        value={comicStyle} 
        onChange={onUpdateComicStyle} 
      />
      
      <Divider className="my-8" />
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Personagens</h2>
        </div>
        
        <CharacterList 
          characters={characters}
          onUpdateCharacters={onUpdateCharacters}
        />
        
        <Button
          className="w-full"
          color="primary"
          variant="flat"
          startContent={<Icon icon="lucide:plus" />}
          onPress={addCharacter}
          size="lg"
        >
          Adicionar Novo Personagem
        </Button>
      </div>
    </div>
  );
};

export default GeneralSettings;