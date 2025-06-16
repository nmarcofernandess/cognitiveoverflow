import React from "react";
import CharacterPhase from "./character-phase";
import { Character, CharacterPhase as CharacterPhaseType } from "./ComicBuilderMain";
import { Button, Card, CardHeader, CardBody, Chip, Input } from "@heroui/react";
import { Icon } from "@iconify/react";

interface CharacterCardProps {
  character: Character;
  onUpdate: (character: Character) => void;
  onDelete: (characterId: string) => void;
}

const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  onUpdate,
  onDelete,
}) => {
  const handleNameChange = (value: string) => {
    onUpdate({
      ...character,
      name: value,
    });
  };

  const addPhase = () => {
    const newPhase: CharacterPhaseType = {
      id: `phase-${Date.now()}`,
      age: "",
      title: "Nova Fase",
      description: "",
    };
    
    onUpdate({
      ...character,
      phases: [...character.phases, newPhase],
    });
  };

  const updatePhase = (updatedPhase: CharacterPhaseType) => {
    const updatedPhases = character.phases.map((p) =>
      p.id === updatedPhase.id ? updatedPhase : p
    );
    
    onUpdate({
      ...character,
      phases: updatedPhases,
    });
  };

  const duplicatePhase = (phaseId: string) => {
    const phaseToDuplicate = character.phases.find((p) => p.id === phaseId);
    if (!phaseToDuplicate) return;
    
    const duplicatedPhase: CharacterPhaseType = {
      ...phaseToDuplicate,
      id: `phase-${Date.now()}`,
      title: `${phaseToDuplicate.title} (Cópia)`,
    };
    
    onUpdate({
      ...character,
      phases: [...character.phases, duplicatedPhase],
    });
  };

  const deletePhase = (phaseId: string) => {
    if (character.phases.length <= 1) {
      return;
    }
    
    const phaseToDelete = character.phases.find(p => p.id === phaseId);
    if (!phaseToDelete) return;
    
    const updatedPhases = character.phases.filter((p) => p.id !== phaseId);
    onUpdate({
      ...character,
      phases: updatedPhases,
    });
  };

  const [isExpanded, setIsExpanded] = React.useState(false);

  const toggleAccordion = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Card shadow="md">
      <CardHeader className="flex justify-between items-center gap-2">
        <div className="flex items-center gap-2 flex-1">
          <Button
            isIconOnly
            variant="light"
            size="sm"
            className="p-0 min-w-0 w-8 h-8"
            onPress={toggleAccordion}
          >
            <Icon 
              icon={isExpanded ? "lucide:chevron-up" : "lucide:chevron-down"} 
              className="text-default-500"
            />
          </Button>
          
          <Icon icon="lucide:user" className="text-primary text-lg" />
          
          <Input
            size="sm"
            value={character.name}
            onValueChange={handleNameChange}
            placeholder={character.isProtagonist ? "Protagonista" : "Personagem"}
            className="flex-1"
            variant="underlined"
            classNames={{
              input: "font-medium text-base"
            }}
          />
        </div>
        
        <div className="flex items-center gap-3">
          <Chip color={character.isProtagonist ? "primary" : "default"} variant="flat">
            {character.isProtagonist ? "Protagonista" : "Personagem"}
          </Chip>
          <Button
            isIconOnly
            size="sm"
            color="default"
            variant="light"
            onPress={() => duplicatePhase(character.phases[0].id)}
            aria-label="Duplicar personagem"
          >
            <Icon icon="lucide:copy" className="text-default-600" />
          </Button>
          <Button
            isIconOnly
            size="sm"
            color="danger"
            variant="light"
            onPress={() => onDelete(character.id)}
            isDisabled={character.isProtagonist}
            aria-label="Excluir personagem"
          >
            <Icon icon="lucide:trash" className="text-danger" />
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardBody className="px-4 py-2">
          <div className="space-y-6 pt-2">
            <p className="text-sm text-default-600">
              Defina as diferentes fases ou idades deste personagem. Cada fase representa um período diferente 
              da vida do personagem e pode ser selecionada nas cenas.
            </p>
            
            {character.phases.map((phase, index) => (
              <CharacterPhase
                key={phase.id}
                phase={phase}
                isFirstPhase={index === 0}
                onUpdate={updatePhase}
                onDuplicate={() => duplicatePhase(phase.id)}
                onDelete={() => deletePhase(phase.id)}
              />
            ))}
            
            <Button
              className="w-full mt-6"
              variant="flat"
              color="primary"
              startContent={<Icon icon="lucide:plus" />}
              onPress={addPhase}
            >
              Adicionar Nova Fase
            </Button>
          </div>
        </CardBody>
      )}
    </Card>
  );
};

export default CharacterCard;