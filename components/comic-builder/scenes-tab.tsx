import React, { useState } from "react";
import { Button, addToast } from "@heroui/react";
import { Icon } from "@iconify/react";
import SceneCard from "./scene-card";
import { Character, Scene } from "./ComicBuilderMain";
import { 
  DndContext, 
  closestCenter, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragStartEvent, 
  DragEndEvent 
} from '@dnd-kit/core';
import { 
  SortableContext, 
  rectSortingStrategy, 
  arrayMove 
} from '@dnd-kit/sortable';
import { DragOverlay } from '@dnd-kit/core';

interface ScenesTabProps {
  scenes: Scene[];
  characters: Character[];
  comicStyle: string;
  onUpdateScenes: (scenes: Scene[]) => void;
}

const ScenesTab: React.FC<ScenesTabProps> = ({
  scenes,
  characters,
  comicStyle,
  onUpdateScenes,
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [expandedStates, setExpandedStates] = useState<Record<string, boolean>>({});
  // Armazenar os estados antes do arrasto
  const [savedExpandedStates, setSavedExpandedStates] = useState<Record<string, boolean>>({});
  
  // Configuração dos sensores do DnD
  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8,
    },
  }));

  const addScene = () => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const nextLetter = scenes.length < letters.length 
      ? letters[scenes.length] 
      : `${letters[Math.floor(scenes.length / letters.length) - 1]}${letters[scenes.length % letters.length]}`;
    
    const newScene: Scene = {
      id: `scene-${Date.now()}`,
      letter: nextLetter,
      upperPanel: {
        description: "",
        caption: "",
      },
      lowerPanel: {
        description: "",
        caption: "",
      },
      characters: [],
      generatedImage: "", // Initialize with empty string
    };
    
    onUpdateScenes([...scenes, newScene]);
    
    addToast({
      title: "Nova cena criada",
      description: `Cena ${nextLetter} foi adicionada.`,
      icon: <Icon icon="lucide:plus-circle" className="text-success" />
    });
  };

  const updateScene = (updatedScene: Scene) => {
    const updatedScenes = scenes.map((s) =>
      s.id === updatedScene.id ? updatedScene : s
    );
    onUpdateScenes(updatedScenes);
  };

  const deleteScene = (sceneId: string) => {
    const sceneToDelete = scenes.find(s => s.id === sceneId);
    if (!sceneToDelete) return;
    
    const updatedScenes = scenes.filter((s) => s.id !== sceneId);
    onUpdateScenes(updatedScenes);
    
    addToast({
      title: "Cena excluída",
      description: `Cena ${sceneToDelete.letter} foi removida.`,
      icon: <Icon icon="lucide:trash" className="text-danger" />
    });
  };

  // Manipuladores para o dnd-kit
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    
    // Salvar o estado atual antes de fechar tudo
    setSavedExpandedStates({...expandedStates});
    
    // Fechar todos os cards durante o arrasto
    const closedStates = scenes.reduce<Record<string, boolean>>((acc, scene) => {
      acc[scene.id] = false;
      return acc;
    }, {});
    
    setExpandedStates(closedStates);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    
    if (over && active.id !== over.id) {
      // Reordenar os itens
      const oldIndex = scenes.findIndex(scene => scene.id === active.id);
      const newIndex = scenes.findIndex(scene => scene.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newScenes = arrayMove(scenes, oldIndex, newIndex);
        onUpdateScenes(newScenes);
        
        addToast({
          title: "Cenas reordenadas",
          description: "A ordem das cenas foi atualizada.",
          icon: <Icon icon="lucide:move" className="text-primary" />
        });
      }
    }
    
    // Restaurar os estados de expansão após um pequeno delay
    setTimeout(() => {
      setExpandedStates(savedExpandedStates);
    }, 100);
  };

  return (
    <div className="space-y-6 py-4 max-w-5xl mx-auto">
      {scenes.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg bg-content1/30">
          <Icon icon="lucide:layout-template" className="text-5xl text-default-300 mb-4" />
          <p className="text-lg text-default-500 mb-4 text-center">
            Nenhuma cena criada ainda. Comece adicionando sua primeira cena!
          </p>
          <Button
            color="primary"
            size="lg"
            startContent={<Icon icon="lucide:plus" />}
            onPress={addScene}
          >
            Criar Primeira Cena
          </Button>
        </div>
      ) : (
        <>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={scenes.map(scene => scene.id)} 
              strategy={rectSortingStrategy}
            >
              <div className="space-y-6">
                {scenes.map((scene) => (
                  <SceneCard
                    key={scene.id}
                    scene={scene}
                    characters={characters}
                    comicStyle={comicStyle}
                    onUpdate={updateScene}
                    onDelete={() => deleteScene(scene.id)}
                    isExpanded={Boolean(expandedStates[scene.id])}
                    onToggleExpand={(expanded) => {
                      setExpandedStates(prev => ({
                        ...prev,
                        [scene.id]: expanded
                      }));
                    }}
                  />
                ))}
              </div>
            </SortableContext>
            
            <DragOverlay>
              {activeId && scenes.find(scene => scene.id === activeId) && (
                <SceneCard
                  scene={scenes.find(scene => scene.id === activeId)!}
                  characters={characters}
                  comicStyle={comicStyle}
                  onUpdate={() => {}}
                  onDelete={() => {}}
                  isDragOverlay
                  isExpanded={false}
                  onToggleExpand={() => {}}
                />
              )}
            </DragOverlay>
          </DndContext>
          
          <Button
            className="w-full"
            color="primary"
            variant="flat"
            startContent={<Icon icon="lucide:plus" />}
            onPress={addScene}
            size="lg"
          >
            Adicionar Nova Cena
          </Button>
        </>
      )}
    </div>
  );
};

export default ScenesTab;