import React from "react";
import { Button, Card, CardBody, CardFooter, CardHeader, Input, Textarea } from "@heroui/react";
import { Icon } from "@iconify/react";
import DescriptionHelperModal from "./description-helper-modal";
import { CharacterPhase as CharacterPhaseType } from "./ComicBuilderMain";

interface CharacterPhaseProps {
  phase: CharacterPhaseType;
  isFirstPhase: boolean;
  onUpdate: (phase: CharacterPhaseType) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

const CharacterPhase: React.FC<CharacterPhaseProps> = ({
  phase,
  isFirstPhase,
  onUpdate,
  onDuplicate,
  onDelete,
}) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const updateField = (field: keyof CharacterPhaseType, value: string) => {
    onUpdate({
      ...phase,
      [field]: value,
    });
  };

  const updateDetails = (details: CharacterPhaseType["details"]) => {
    onUpdate({
      ...phase,
      details,
    });
  };

  return (
    <Card shadow="sm" className="border border-default-200">
      <CardHeader className="px-5 pb-0 pt-5">
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <Input
            label="Idade"
            placeholder="Ex: 18"
            value={phase.age}
            onValueChange={(v) => updateField("age", v)}
            className="sm:max-w-[120px]"
          />
          <Input
            label="Título da Fase"
            placeholder="Ex: Adolescência"
            value={phase.title}
            onValueChange={(v) => updateField("title", v)}
            className="flex-1"
          />
        </div>
      </CardHeader>
      <CardBody className="gap-4 px-5 py-3">
        <Textarea
          label="Descrição Detalhada"
          placeholder="Descreva características físicas, personalidade, roupas típicas, etc..."
          value={phase.description}
          onValueChange={(v) => updateField("description", v)}
          minRows={3}
          maxRows={6}
          classNames={{
            input: "resize-y",
          }}
        />
      </CardBody>
      <CardFooter className="justify-between flex-wrap gap-2 px-5 pb-5">
        <Button
          color="primary"
          variant="flat"
          startContent={<Icon icon="lucide:help-circle" />}
          onPress={() => setIsModalOpen(true)}
        >
          Ajuda na Descrição
        </Button>
        <div className="flex gap-2">
          <Button
            color="default"
            variant="flat"
            startContent={<Icon icon="lucide:copy" />}
            onPress={onDuplicate}
          >
            Duplicar
          </Button>
          {!isFirstPhase && (
            <Button
              color="danger"
              variant="light"
              startContent={<Icon icon="lucide:trash" />}
              onPress={onDelete}
            >
              Excluir
            </Button>
          )}
        </div>
      </CardFooter>
      <DescriptionHelperModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        details={phase.details || {}}
        onUpdateDetails={updateDetails}
        onGenerateDescription={(description) => {
          updateField("description", description);
          setIsModalOpen(false);
        }}
      />
    </Card>
  );
};

export default CharacterPhase;