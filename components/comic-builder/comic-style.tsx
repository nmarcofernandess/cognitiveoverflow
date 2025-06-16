import React from "react";
import { Card, CardHeader, CardBody, Textarea, Button } from "@heroui/react";
import { Icon } from "@iconify/react";

interface ComicStyleProps {
  value: string;
  onChange: (value: string) => void;
}

const ComicStyle: React.FC<ComicStyleProps> = ({ value, onChange }) => {
  const [isExpanded, setIsExpanded] = React.useState(true);
  
  const toggleAccordion = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Card shadow="md">
      <CardHeader className="flex justify-between items-center gap-2">
        <div className="flex items-center gap-2">
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
          <Icon icon="lucide:palette" className="text-primary text-lg" />
          <h2 className="text-lg font-semibold">Estilo dos Quadrinhos</h2>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardBody>
          <div className="space-y-4">
            <p className="text-sm text-default-600">
              Defina o estilo visual geral que será aplicado a todas as cenas.
              Isso pode incluir estilo de traço, paleta de cores, referências visuais, etc.
              Este estilo será incluído automaticamente em todos os prompts de cenas.
            </p>
            <Textarea
              label="Estilo Visual"
              placeholder="Exemplo: Estilo de arte mangá, cores vibrantes, traço limpo e definido, inspirado nos trabalhos de Akira Toriyama..."
              value={value}
              onValueChange={onChange}
              minRows={4}
              maxRows={8}
              classNames={{
                input: "resize-y",
                label: "font-medium"
              }}
            />
          </div>
        </CardBody>
      )}
    </Card>
  );
};

export default ComicStyle;