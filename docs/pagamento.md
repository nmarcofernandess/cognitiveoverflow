# Sistema de Pagamento e Bonificação

Este documento descreve como funciona o sistema de pagamentos e bonificações, contemplando:

- **Visão Geral** (estados Free/Pro e fluxo básico)
- **Fluxo de Bonificação** (como o sistema checa o CPF e oferece o período gratuito)
- **Fluxo de Pagamento Regular** (planos pagos via cartão, PIX ou boleto)
- **Fluxo Completo** (unindo bonificação e pagamento)
- **Explicação** de cada ponto-chave e regras de negócio

---

## 1. Visão Geral do Sistema

No diagrama abaixo, temos os estados do **Usuário** (subdividido em "Não Cadastrado", "Free" e "Pro") e as possíveis transições (cadastro, upgrade/bonificação e downgrade):

```plantuml
@startuml
skinparam state {
  BackgroundColor<<Free>> LightGreen
  BackgroundColor<<Pro>> LightBlue
}

state "Usuário" as User {
  state "Não Cadastrado" as NC
  state "Free" as Free <<Free>>
  state "Pro" as Pro <<Pro>>
}

NC --> Free : Cadastro
Free --> Pro : Upgrade/Bonificação
Pro --> Free : Downgrade

note right of Free
  Sistema automaticamente:
  * Checa CPF na lista de bonificações
  * Se encontrar, mostra opção de ativação
  * Se não, mostra planos normais
end note

note on link
  Regras de Downgrade:
  * Se +5 pacientes:
    - Visualização: Permitida
    - Exportação: Permitida
    - Edição: Bloqueada
end note
@enduml
```

### Resumo
1. **Não Cadastrado → Free**: Quando o usuário realiza o primeiro cadastro (obrigatoriamente com CPF).
2. **Free → Pro**: O usuário pode migrar para Pro seja por:
   - Bonificação (se o CPF estiver em uma lista especial).
   - Pagamento (escolhendo um plano e confirmando).
3. **Pro → Free**: Ocorre por expiração (não renovado), cancelamento ou downgrade manual. Se tiver mais de 5 pacientes, edição fica bloqueada até remover pacientes ou retomar Pro.

## 2. Fluxo de Bonificação

Este diagrama de sequência ilustra como o sistema verifica o CPF e oferece bonificação, seja durante o cadastro ou para quem já está logado. Também cobre o caso de quem já é Pro:

```plantuml
@startuml
participant "Usuário" as U
participant "Sistema" as S
database "Banco" as DB
queue "Emails" as E

== Novo Cadastro ==
U -> S: Cadastra com CPF
S -> DB: Valida CPF
alt CPF tem bonificação
    S -> U: Mostra modal de ativação
    alt Usuário aceita
        U -> S: Confirma ativação
        S -> DB: Registra ativação
        S -> E: Envia confirmação
    else Usuário adia
        U -> S: Escolhe "Ativar depois"
        S -> DB: Registra adiamento
        S -> E: Agenda lembrete
    end
else CPF sem bonificação
    S -> U: Segue como Free
end

== Já Cadastrado ==
U -> S: Acessa planos
S -> DB: Checa bonificação
alt Tem bonificação
    S -> U: Mostra ativação
    U -> S: Ativa
    S -> DB: Atualiza plano
    S -> E: Confirma
else Sem bonificação
    S -> U: Mostra planos normais
end

== Pro Existente ==
U -> S: Acessa planos
S -> DB: Checa bonificação
alt Tem bonificação
    S -> U: Mostra extensão
    U -> S: Aceita
    S -> DB: Estende período
    S -> E: Confirma
else Sem bonificação
    S -> U: Mostra status atual
end

@enduml
```

### Pontos de Destaque
1. **Verificação de CPF**:
   - Ao cadastrar ou ao acessar a tela de planos, o sistema checa no banco de dados se o CPF tem bonificação disponível.
2. **Modal de Ativação**:
   - Caso o CPF seja elegível, o sistema oferece um modal ou aviso com o período gratuito (ex.: 30, 60 ou 90 dias).
3. **Aceitação ou Adiamento**:
   - O usuário pode ativar na hora (virando Pro ou estendendo Pro existente)
   - Ou escolher "Ativar Depois" (mantendo-se Free ou continuando Pro do jeito que está).
   - Se ele adiar, o sistema pode enviar lembretes e tem de controlar a data de expiração da bonificação.
4. **Para Usuários já Pro**:
   - A bonificação estende a data de expiração. Se faltavam 10 dias e a bonificação é de 30, passa a vencer em 40 dias.
5. **Emails**:
   - Confirmação de ativação ou extensão.
   - Lembrete (caso adie) ou aviso de expiração se não ativar em X dias.

## 3. Fluxo de Pagamento Regular

Aqui ilustramos o pagamento de um plano Pro (sem bonificação). O usuário escolhe o período (mensal, trimestral, etc.) e a forma de pagamento (cartão, PIX ou boleto):

```plantuml
@startuml
participant "Usuário" as U
participant "Sistema" as S
participant "Gateway" as G
database "Banco" as DB
queue "Emails" as E

U -> S: Acessa tela de planos
S -> DB: Checa status do usuário

alt Não tem bonificação ou não quer usar
    S -> U: Mostra planos (mensal, trimestral etc.)
    U -> S: Seleciona plano/período
    U -> S: Escolhe pagamento

    alt Cartão
        S -> G: Solicita processamento
        G -> S: Resposta imediata (aprovado ou negado)
        alt Aprovado
            S -> DB: Atualiza status p/ Pro
            S -> E: Envia email de confirmação + recibo
        else Negado
            S -> U: Exibe erro
            S -> E: (Opcional) Envia email de falha de pagamento
        end
    else PIX/Boleto
        S -> G: Gera código de pagamento
        G -> U: Mostra instruções (QR Code, linha digitável)
        ... Aguardando confirmação ...
        G -> S: Retorna status (Pago ou Falha)
        alt Pago
            S -> DB: Atualiza p/ Pro
            S -> E: Envia email de confirmação + recibo
        else Falha
            S -> U: Notifica falha
            S -> E: (Opcional) Email de falha
        end
    end
else Usuário opta por bonificação
    S -> U: Direciona para Fluxo de Bonificação (já descrito)
end
@enduml
```

### Resumo do Pagamento
1. **Cartão**:
   - Confirmação quase imediata (gateway devolve aprovado/negado).
   - Se aprovado, usuário passa a Pro na hora; se negado, permanece Free.
2. **PIX/Boleto**:
   - O sistema gera um código ou boleto.
   - O usuário paga e a confirmação chega via webhook ou consulta programada.
   - Ao confirmar pagamento, o plano Pro é ativado e o usuário recebe email.
   - Se falhar (prazo expirado ou pagamento cancelado), não ativa o Pro.
3. **Emails**:
   - Confirmação e recibo após pagamento aprovado.
   - Lembretes de boleto, se configurado, e aviso de falha no pagamento (opcional).

## 4. Fluxo Completo do Sistema

Abaixo, um diagrama de estados mostrando, de forma mais macro, como o usuário entra (cadastro), checa se tem bonificação ou não, e conclui pagamento ou upgrade. Incluímos a ideia de "Tela de Planos", que apresenta Planos Regulares ou Planos + Bonificação:

```plantuml
@startuml
!theme plain
skinparam backgroundColor white
skinparam state {
  BackgroundColor<<Free>> LightGreen
  BackgroundColor<<Pro>> LightBlue
  BackgroundColor<<Bonificacao>> LightYellow
  BorderColor Black
}

' Estados principais
state "Não Cadastrado" as NC
state "Free" as Free <<Free>>
state "Pro" as Pro <<Pro>>
state "Tela de Planos" as Planos <<Bonificacao>> {
    state "Verifica CPF" as Check
    state "Planos Regulares" as Regular
    state "Planos + Bonificação" as Bonus
}

' Fluxo principal
NC --> Free : Cadastro com CPF
Free --> Planos : Acessa
Pro --> Planos : Acessa

' Verificação
Planos --> Check : Automaticamente
Check --> Regular : CPF sem bonificação
Check --> Bonus : CPF com bonificação

' Opções de Planos Regulares
Regular --> Pro : Escolhe plano\n(Mensal/Trimestral/\nSemestral/Anual)

' Opções com Bonificação
Bonus --> Pro : (Ativar agora)
Bonus --> Free : (Lembrar depois)

' Pagamentos
state "Pagamento" as Pay {
    state "Cartão" as Card
    state "PIX/Boleto" as Pix
}

Regular --> Pay : Escolhe forma
Pay --> Pro : Confirmado

' Notas explicativas
note right of NC
  Usuário acessa sistema:
  * Via link direto
  * Via campanha
  * Via indicação
end note

note right of Check
  Sistema automaticamente:
  1. Checa CPF na lista
  2. Se encontrar bonificação:
     * Mostra opção de ativação
     * Permite adiar
  3. Se não encontrar:
     * Exibe planos pagos
end note

note right of Pro
  Regras do Pro:
  * Pacientes ilimitados
  * Se voltar para Free e tiver +5 pacientes:
    - Visualizar: ok
    - Exportar: ok
    - Editar: bloqueado
end note

note right of Pay
  Formas de Pagamento:
  * Cartão: ativação imediata
  * PIX/Boleto: ativação pós-confirmação
  * Bonificação: ativação imediata (sem custo)
end note

@enduml
```

## 5. Explicação do Fluxo e Lógica de Negócio

1. **Entrada no Sistema**
   - O usuário acessa o sistema (como novo ou existente).
   - Se for novo, faz o cadastro com CPF – obrigatório para futuros checks de bonificação.

2. **Verificação Automática**
   - Ao entrar na Tela de Planos, o sistema confere se o CPF está numa lista de bonificações (importada por parceiros ou marketing).
   - Se encontrar, oferece ativar o período gratuito (ou estender, caso o usuário já seja Pro).
   - Se não encontrar, mostra apenas os planos pagos.

3. **Ativação da Bonificação**
   - Usuário pode aceitar de imediato e virar Pro (ou ter Pro estendido).
   - Pode também adiar, continuando no Free (ou no Pro atual se já tinha). O sistema pode enviar lembretes e há data de expiração da bonificação.

4. **Pagamento (Cartão / PIX / Boleto)**
   - Se o usuário não tiver ou não quiser a bonificação, escolhe um plano (mensal, trimestral, semestral, anual etc.) e a forma de pagamento.
   - Cartão: aprovação quase instantânea. Se aprovado, vira Pro na hora.
   - PIX/Boleto: gera QR code ou boleto. O sistema aguarda confirmação do pagamento. Somente então o usuário é liberado no Pro.
   - Em qualquer forma de pagamento, o sistema envia emails (confirmação, recibo, falha etc.).

5. **Downgrade e Expiração**
   - Se o usuário não renova ou cancela, volta a Free.
   - Caso possua mais de 5 pacientes, fica com visualização/exportação habilitadas, mas edição bloqueada até reduzir pacientes ou reativar Pro.
   - Emails de aviso podem ser enviados antes da expiração (7 dias/1 dia) e após o downgrade.

6. **Principais Vantagens**
   - Automação: Bonificação é detectada só pelo CPF (não precisa inserir código).
   - Experiência Simplificada: O usuário vê claramente as opções (gratuito ou pago) sem confusão.
   - Transparência: Quem não tem bonificação não fica vendo anúncios de "grátis"; quem tem, vê a oferta no momento certo.
   - Notificações: Sistema dispara emails de lembrete de ativação, confirmação de pagamento, nota fiscal, aviso de expiração, etc., garantindo envolvimento e reduzindo dúvidas.

## Conclusão

Esta arquitetura permite que Marketing e Parcerias simplesmente mantenham listas de CPFs ou importem dados dos participantes de cursos/eventos. O Usuário só precisa se cadastrar ou logar, e o Sistema cuida de oferecer a bonificação. Caso o usuário não tenha direito ou não queira usar a bonificação, pode optar por um plano pago, com pagamento online seguro e notificado por email.

Assim, temos um fluxo claro de cadastro → checagem de bonificação → bonificação ou pagamento → ativação Pro (ou extensão). Quando o plano expira ou o usuário não renova, downgrade acontece sem perda de dados, apenas restrições de edição se tiver mais de 5 pacientes.

Com estes quatro diagramas (Visão Geral, Fluxo de Bonificação, Fluxo de Pagamento Regular e Fluxo Completo) e a explicação didática, toda a equipe entende tanto a perspectiva do usuário quanto a lógica interna do sistema de pagamento e bonificação. 