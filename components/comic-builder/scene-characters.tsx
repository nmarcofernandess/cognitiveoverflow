import React from "react";
import { Button, Card, CardBody, CardHeader, Select, SelectItem, addToast } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Character, Scene } from "./ComicBuilderMain";

interface SceneCharactersProps {
  sceneCharacters: Scene["characters"];
  allCharacters: Character[];
  onChange: (characters: Scene["characters"]) => void;
}

const SceneCharacters: React.FC<SceneCharactersProps> = ({
  sceneCharacters,
  allCharacters,
  onChange,
}) => {
  const addCharacter = () => {
    const availableCharacters = allCharacters.filter(
      (c) => !sceneCharacters.some((sc) => sc.characterId === c.id)
    );
    
    if (availableCharacters.length === 0) {
      addToast({
        title: "Não há personagens disponíveis",
        description: "Todos os personagens já foram adicionados a esta cena.",
        icon: <Icon icon="lucide:info" className="text-default" />
      });
      return;
    }
    
    const firstChar = availableCharacters[0];
    const firstPhase = firstChar.phases[0];
    
    onChange([
      ...sceneCharacters,
      {
        characterId: firstChar.id,
        phaseId: firstPhase.id,
      },
    ]);
    
    addToast({
      title: "Personagem adicionado",
      description: `"${firstChar.name}" foi adicionado à cena.`,
      icon: <Icon icon="lucide:user-plus" className="text-success" />
    });
  };

  const updateCharacter = (index: number, characterId: string) => {
    const updatedCharacters = [...sceneCharacters];
    const character = allCharacters.find((c) => c.id === characterId);
    
    if (!character) return;
    
    updatedCharacters[index] = {
      characterId,
      phaseId: character.phases[0].id,
    };
    
    onChange(updatedCharacters);
  };

  const updatePhase = (index: number, phaseId: string) => {
    const updatedCharacters = [...sceneCharacters];
    updatedCharacters[index] = {
      ...updatedCharacters[index],
      phaseId,
    };
    
    onChange(updatedCharacters);
  };

  const removeCharacter = (index: number) => {
    const characterToRemove = sceneCharacters[index];
    if (!characterToRemove) return;
    
    const character = allCharacters.find(c => c.id === characterToRemove.characterId);
    if (!character) return;
    
    const updatedCharacters = sceneCharacters.filter((_, i) => i !== index);
    onChange(updatedCharacters);
    
    addToast({
      title: "Personagem removido",
      description: `"${character.name}" foi removido da cena.`,
      icon: <Icon icon="lucide:user-minus" className="text-danger" />
    });
  };

  const getAvailableCharacters = () => {
    return allCharacters.filter(
      (c) => !sceneCharacters.some((sc) => sc.characterId === c.id)
    );
  };

  return (
    <Card className="border border-default-200" shadow="sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon icon="lucide:users" className="text-lg text-primary" />
          <h3 className="text-lg font-medium text-primary">Personagens na Cena</h3>
        </div>
      </CardHeader>
      <CardBody className="gap-5">
        {sceneCharacters.length === 0 ? (
          <p className="text-default-500 text-center py-3">
            Nenhum personagem adicionado a esta cena. Adicione personagens para incluí-los no prompt.
          </p>
        ) : (
          sceneCharacters.map((sc, index) => {
            const character = allCharacters.find((c) => c.id === sc.characterId);
            if (!character) return null;
            
            return (
              <div key={index} className="flex flex-wrap gap-3 items-center">
                <Select
                  label="Personagem"
                  selectedKeys={[sc.characterId]}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    updateCharacter(index, selected);
                  }}
                  className="flex-1 min-w-[200px]"
                >
                  {[
                    <SelectItem key={character.id}>{character.name}</SelectItem>,
                    ...getAvailableCharacters().map((c) => (
                      <SelectItem key={c.id}>{c.name}</SelectItem>
                    ))
                  ]}
                </Select>
                
                <Select
                  label="Idade/Fase"
                  selectedKeys={[sc.phaseId]}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    updatePhase(index, selected);
                  }}
                  className="flex-1 min-w-[200px]"
                >
                  {character.phases.map((phase) => (
                    <SelectItem key={phase.id}>
                      {phase.title} {phase.age ? `(${phase.age})` : ""}
                    </SelectItem>
                  ))}
                </Select>
                
                <Button
                  isIconOnly
                  color="danger"
                  variant="light"
                  onPress={() => removeCharacter(index)}
                  className="mt-6"
                >
                  <Icon icon="lucide:trash" />
                </Button>
              </div>
            );
          })
        )}
        
        <Button
          color="primary"
          variant="flat"
          startContent={<Icon icon="lucide:plus" />}
          onPress={addCharacter}
          isDisabled={getAvailableCharacters().length === 0}
          className="mt-2"
        >
          Adicionar Personagem
        </Button>
      </CardBody>
    </Card>
  );
};

export default SceneCharacters;