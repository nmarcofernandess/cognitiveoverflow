import React from "react";
import { Button, Card, CardHeader, CardBody, Input, Image, addToast } from "@heroui/react";
import { Icon } from "@iconify/react";
import ScenePanel from "./scene-panel";
import SceneCharacters from "./scene-characters";
import { Character, Scene, ScenePanel as ScenePanelType } from "./ComicBuilderMain";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SceneCardProps {
  scene: Scene;
  characters: Character[];
  comicStyle: string;
  onUpdate: (scene: Scene) => void;
  onDelete: () => void;
  isExpanded?: boolean;
  onToggleExpand?: (expanded: boolean) => void;
  isDragOverlay?: boolean;
}

const SceneCard: React.FC<SceneCardProps> = ({
  scene,
  characters,
  comicStyle,
  onUpdate,
  onDelete,
  isExpanded = false,
  onToggleExpand,
  isDragOverlay = false,
}) => {
  const updatePanel = (type: "upperPanel" | "lowerPanel", panel: ScenePanelType) => {
    onUpdate({
      ...scene,
      [type]: panel,
    });
  };

  const updateCharacters = (sceneCharacters: Scene["characters"]) => {
    onUpdate({
      ...scene,
      characters: sceneCharacters,
    });
  };

  const copyPrompt = () => {
    const sceneCharactersData = scene.characters.map((sc) => {
      const character = characters.find((c) => c.id === sc.characterId);
      const phase = character?.phases.find((p) => p.id === sc.phaseId);
      
      if (!character || !phase) return null;
      
      return {
        name: character.name,
        isProtagonist: character.isProtagonist,
        age: phase.age,
        title: phase.title,
        description: phase.description,
      };
    }).filter(Boolean);

    const promptData = {
      style: comicStyle,
      upperPanel: scene.upperPanel,
      lowerPanel: scene.lowerPanel,
      characters: sceneCharactersData,
    };
    
    navigator.clipboard.writeText(JSON.stringify(promptData, null, 2));
    addToast({
      title: "Prompt copiado",
      description: `Prompt da Cena ${scene.letter} foi copiado para a área de transferência.`,
      icon: <Icon icon="lucide:copy" className="text-primary" />
    });
  };

  const [editableTitle, setEditableTitle] = React.useState(scene.letter);

  const handleTitleChange = (value: string) => {
    setEditableTitle(value);
    onUpdate({
      ...scene,
      letter: value,
    });
  };

  const duplicateScene = () => {
    const duplicatedScene: Scene = {
      ...scene,
      id: `scene-${Date.now()}`,
      letter: `${scene.letter}'`,
    };
    
    onUpdate(duplicatedScene);
    
    addToast({
      title: "Cena duplicada",
      description: `Cena ${scene.letter} foi duplicada.`,
      icon: <Icon icon="lucide:copy" className="text-primary" />
    });
  };

  const toggleAccordion = () => {
    if (onToggleExpand) {
      onToggleExpand(!isExpanded);
    }
  };

  const updateImage = (imageUrl: string) => {
    onUpdate({
      ...scene,
      generatedImage: imageUrl,
    });
  };
  
  // Hook useSortable do dnd-kit
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ 
    id: scene.id,
    disabled: isDragOverlay
  });

  // Estilo para o elemento durante operações de arrasto
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative' as const,
    zIndex: isDragging ? 1 : 'auto'
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card shadow="md" className={isDragOverlay ? "shadow-lg" : ""}>
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
            
            <div 
              {...attributes} 
              {...listeners} 
              className="cursor-grab flex items-center justify-center"
              title="Arrastar para reordenar"
            >
              <Icon 
                icon="lucide:grip-vertical" 
                className="text-default-400" 
              />
            </div>
            
            <Icon icon="lucide:clapperboard" className="text-primary text-lg" />
            
            <Input 
              size="sm"
              value={editableTitle}
              onValueChange={handleTitleChange}
              placeholder="Título da cena"
              className="flex-1"
              variant="underlined"
              startContent={null}
              classNames={{
                input: "font-medium text-base"
              }}
            />
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              color="primary"
              variant="flat"
              startContent={<Icon icon="lucide:copy" />}
              onPress={copyPrompt}
            >
              Copiar Prompt
            </Button>
            <Button
              isIconOnly
              size="sm"
              color="default"
              variant="light"
              onPress={duplicateScene}
              aria-label="Duplicar cena"
            >
              <Icon icon="lucide:copy" className="text-default-600" />
            </Button>
            <Button
              isIconOnly
              size="sm"
              color="danger"
              variant="light"
              onPress={onDelete}
              aria-label="Excluir cena"
            >
              <Icon icon="lucide:trash" className="text-danger" />
            </Button>
          </div>
        </CardHeader>
        
        {isExpanded && (
          <CardBody>
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Card className="border border-default-200" shadow="sm">
                  <CardBody>
                    <h3 className="text-lg font-medium mb-4 text-primary">Painel Superior</h3>
                    <ScenePanel
                      panel={scene.upperPanel}
                      onChange={(panel) => updatePanel("upperPanel", panel)}
                    />
                  </CardBody>
                </Card>
                
                <Card className="border border-default-200" shadow="sm">
                  <CardBody>
                    <h3 className="text-lg font-medium mb-4 text-primary">Painel Inferior</h3>
                    <ScenePanel
                      panel={scene.lowerPanel}
                      onChange={(panel) => updatePanel("lowerPanel", panel)}
                    />
                  </CardBody>
                </Card>
              </div>
              
              <SceneCharacters
                sceneCharacters={scene.characters}
                allCharacters={characters}
                onChange={updateCharacters}
              />
              
              <Card className="border border-default-200" shadow="sm">
                <CardBody className={scene.generatedImage ? "p-4" : "p-0"}>
                  {scene.generatedImage ? (
                    <>
                      <h3 className="text-lg font-medium mb-4 text-primary">Imagem Gerada</h3>
                      <div className="relative">
                        <Image
                          src={scene.generatedImage}
                          alt="Imagem gerada por IA"
                          className="w-full h-auto rounded-lg object-cover max-h-[400px]"
                        />
                        <Button
                          isIconOnly
                          size="sm"
                          color="danger"
                          variant="solid"
                          className="absolute top-2 right-2"
                          onPress={() => updateImage("")}
                          aria-label="Remover imagem"
                        >
                          <Icon icon="lucide:x" />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-2">
                        <Icon icon="lucide:image" className="text-lg text-primary" />
                        <h3 className="text-lg font-medium text-primary">Imagem Gerada</h3>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id={`scene-image-upload-${scene.id}`}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              updateImage(event.target?.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        startContent={<Icon icon="lucide:upload" />}
                        onPress={() => {
                          document.getElementById(`scene-image-upload-${scene.id}`)?.click();
                        }}
                      >
                        Selecionar Imagem
                      </Button>
                    </div>
                  )}
                </CardBody>
              </Card>
            </div>
          </CardBody>
        )}
      </Card>
    </div>
  );
};

export default SceneCard;