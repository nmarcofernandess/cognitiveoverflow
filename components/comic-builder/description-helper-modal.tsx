import React from "react";
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Textarea, addToast } from "@heroui/react";
import { CharacterPhase } from "./ComicBuilderMain";
import { Icon } from "@iconify/react";

interface DescriptionHelperModalProps {
  isOpen: boolean;
  onClose: () => void;
  details: Partial<CharacterPhase["details"]>;
  onUpdateDetails: (details: CharacterPhase["details"]) => void;
  onGenerateDescription: (description: string) => void;
}

const DescriptionHelperModal: React.FC<DescriptionHelperModalProps> = ({
  isOpen,
  onClose,
  details = {},
  onUpdateDetails,
  onGenerateDescription,
}) => {
  const updateField = (
    field: 'hair' | 'clothes' | 'expression' | 'beard' | 'tattoos' | 'body' | 'visualStyle' | 'accessories',
    value: string
  ) => {
    onUpdateDetails({
      ...details,
      [field]: value,
    });
  };

  const generateDescription = () => {
    const sections = [
      details.hair ? `Cabelo: ${details.hair}` : "",
      details.clothes ? `Roupa: ${details.clothes}` : "",
      details.expression ? `Expressão: ${details.expression}` : "",
      details.beard ? `Barba: ${details.beard}` : "",
      details.tattoos ? `Tatuagens: ${details.tattoos}` : "",
      details.body ? `Corpo: ${details.body}` : "",
      details.visualStyle ? `Estilo Visual: ${details.visualStyle}` : "",
      details.accessories ? `Acessórios: ${details.accessories}` : "",
    ].filter(Boolean);

    const description = sections.join(". ");
    onGenerateDescription(description);
    
    addToast({
      title: "Descrição gerada",
      description: "A descrição detalhada foi gerada com sucesso.",
      icon: <Icon icon="lucide:check-circle" className="text-success" />
    });
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size="3xl">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Icon icon="lucide:pencil" className="text-primary text-xl" />
                Assistente de Descrição
              </div>
            </ModalHeader>
            <ModalBody className="gap-4">
              <p className="text-sm text-default-600">
                Preencha os campos abaixo para construir uma descrição detalhada e padronizada. 
                Quando terminar, clique em "Gerar Descrição" para consolidar as informações.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Textarea
                  label="Cabelo"
                  placeholder="Cor, estilo, comprimento..."
                  value={details.hair || ""}
                  onValueChange={(v) => updateField("hair", v)}
                  variant="flat"
                />
                <Textarea
                  label="Roupa"
                  placeholder="Estilo, cores, peças características..."
                  value={details.clothes || ""}
                  onValueChange={(v) => updateField("clothes", v)}
                  variant="flat"
                />
                <Textarea
                  label="Expressão"
                  placeholder="Facial, postura, atitude..."
                  value={details.expression || ""}
                  onValueChange={(v) => updateField("expression", v)}
                  variant="flat"
                />
                <Textarea
                  label="Barba"
                  placeholder="Estilo, comprimento..."
                  value={details.beard || ""}
                  onValueChange={(v) => updateField("beard", v)}
                  variant="flat"
                />
                <Textarea
                  label="Tatuagens"
                  placeholder="Localização, imagens, significados..."
                  value={details.tattoos || ""}
                  onValueChange={(v) => updateField("tattoos", v)}
                  variant="flat"
                />
                <Textarea
                  label="Corpo"
                  placeholder="Estrutura, altura, porte físico..."
                  value={details.body || ""}
                  onValueChange={(v) => updateField("body", v)}
                  variant="flat"
                />
                <Textarea
                  label="Estilo Visual"
                  placeholder="Preferências gerais, influências..."
                  value={details.visualStyle || ""}
                  onValueChange={(v) => updateField("visualStyle", v)}
                  variant="flat"
                />
                <Textarea
                  label="Acessórios"
                  placeholder="Joias, chapéus, óculos, objetos característicos..."
                  value={details.accessories || ""}
                  onValueChange={(v) => updateField("accessories", v)}
                  variant="flat"
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Cancelar
              </Button>
              <Button color="primary" onPress={generateDescription}>
                Gerar Descrição
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default DescriptionHelperModal;