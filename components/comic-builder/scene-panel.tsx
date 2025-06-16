import React from "react";
import { Textarea } from "@heroui/react";
import { ScenePanel as ScenePanelType } from "./ComicBuilderMain";

interface ScenePanelProps {
  panel: ScenePanelType;
  onChange: (panel: ScenePanelType) => void;
}

const ScenePanel: React.FC<ScenePanelProps> = ({ panel, onChange }) => {
  const updateField = (field: keyof ScenePanelType, value: string) => {
    onChange({
      ...panel,
      [field]: value,
    });
  };

  return (
    <div className="space-y-4">
      <Textarea
        label="Descrição da Cena"
        placeholder="Detalhe o ambiente, ação, posicionamento..."
        value={panel.description}
        onValueChange={(v) => updateField("description", v)}
        minRows={3}
        maxRows={5}
        classNames={{
          input: "resize-y",
        }}
      />
      <Textarea
        label="Legenda"
        placeholder="Texto que aparecerá na legenda do quadrinho..."
        value={panel.caption}
        onValueChange={(v) => updateField("caption", v)}
        minRows={2}
        maxRows={3}
        classNames={{
          input: "resize-y",
        }}
      />
    </div>
  );
};

export default ScenePanel;