import React from "react";
import CharacterCard from "./character-card";
import { Character } from "./ComicBuilderMain";
import { addToast } from "@heroui/react";
import { Icon } from "@iconify/react";

interface CharacterListProps {
  characters: Character[];
  onUpdateCharacters: (characters: Character[]) => void;
}

const CharacterList: React.FC<CharacterListProps> = ({ characters, onUpdateCharacters }) => {
  const updateCharacter = (updatedCharacter: Character) => {
    const updatedCharacters = characters.map((c) =>
      c.id === updatedCharacter.id ? updatedCharacter : c
    );
    onUpdateCharacters(updatedCharacters);
  };

  const deleteCharacter = (characterId: string) => {
    const character = characters.find(c => c.id === characterId);
    if (!character) return;
    
    const updatedCharacters = characters.filter((c) => c.id !== characterId);
    onUpdateCharacters(updatedCharacters);
    
    addToast({
      title: "Personagem excluído",
      description: `"${character.name}" foi removido.`,
      icon: <Icon icon="lucide:trash" className="text-danger" />
    });
  };

  return (
    <div className="space-y-5">
      {characters.map((character) => (
        <CharacterCard
          key={character.id}
          character={character}
          onUpdate={updateCharacter}
          onDelete={deleteCharacter}
        />
      ))}
    </div>
  );
};

export default CharacterList;