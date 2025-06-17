# 🕵️ DATABASE FORENSIC AUDIT RESULTS

**Auditoria executada em:** 2025-06-17T04:55:12.151Z

## 📊 RESUMO EXECUTIVO

- **Tabelas testadas:** 8
- **Tabelas existentes:** 6  
- **Tabelas inexistentes:** 2
- **Total de registros:** 28

## 🎯 TABELAS EXISTENTES

### people
- **Registros:** 4
- **Campos:** id, name, relation, tldr, created_at, updated_at
- **Exemplos:** 
```json
[
  {
    "id": "6fab4413-70fa-4956-ad3f-234b5358e49d",
    "name": "Yasmin",
    "relation": "esposa",
    "tldr": "Designer e modelo focada em comunicação e crescimento do Sofia Lutt",
    "created_at": "2025-06-16T04:14:07.470249",
    "updated_at": "2025-06-16T04:14:07.470249"
  },
  {
    "id": "a88622a0-9546-4b65-9ea5-e79d9e5e7061",
    "name": "Bruno",
    "relation": "irmão",
    "tldr": "Desenvolvedor com ideias malucas de tech, gosta de debates sobre arquitetura",
    "created_at": "2025-06-16T04:14:07.470249",
    "updated_at": "2025-06-16T04:14:07.470249"
  },
  {
    "id": "53d23788-d0fe-4a78-9acf-7aa1d815fd87",
    "name": "fdfgd",
    "relation": "amigo",
    "tldr": "fdfd",
    "created_at": "2025-06-16T20:02:43.096596",
    "updated_at": "2025-06-16T20:02:43.096596"
  }
]
```

### person_notes
- **Registros:** 3
- **Campos:** id, person_id, title, content, tags, created_at
- **Exemplos:** 
```json
[
  {
    "id": "a0b4a400-bcee-4232-880b-4fe508d69cd1",
    "person_id": "6fab4413-70fa-4956-ad3f-234b5358e49d",
    "title": "Conversa sobre Sofia Lutt expansion",
    "content": "Ela quer expandir o OnlyFans com feet art vintage. Tem visão clara do nicho e audience. Precisa de suporte técnico para site próprio.",
    "tags": [
      "trabalho",
      "objetivos",
      "suporte"
    ],
    "created_at": "2025-06-16T04:14:07.470249"
  },
  {
    "id": "5e573c32-496c-401c-9163-112a3be1c4fc",
    "person_id": "6fab4413-70fa-4956-ad3f-234b5358e49d",
    "title": "Discussão sobre comunicação no relacionamento",
    "content": "Conversamos sobre como melhorar nossa comunicação. Ela sugeriu mais check-ins semanais sobre feelings e projetos.",
    "tags": [
      "relacionamento",
      "comunicacao",
      "crescimento"
    ],
    "created_at": "2025-06-16T04:14:07.470249"
  },
  {
    "id": "1be50244-414d-4328-a88d-31841f751287",
    "person_id": "a88622a0-9546-4b65-9ea5-e79d9e5e7061",
    "title": "Ideia de startup de IA para pets",
    "content": "Bruno teve ideia de app que identifica humor do pet por foto. Tem potencial mas precisa validar mercado.",
    "tags": [
      "startup",
      "ia",
      "pets",
      "mvp"
    ],
    "created_at": "2025-06-16T04:14:07.470249"
  }
]
```

### projects
- **Registros:** 5
- **Campos:** id, name, tldr, created_at, updated_at
- **Exemplos:** 
```json
[
  {
    "id": "5a023575-6bca-4dc5-a89b-3aeb754cb212",
    "name": "Knowledge",
    "tldr": "Base de conhecimento pessoal - ideias, insights e aprendizados gerais",
    "created_at": "2025-06-16T04:14:07.470249",
    "updated_at": "2025-06-16T04:14:07.470249"
  },
  {
    "id": "fd4ec028-f5b4-41a3-b31a-31c699625c60",
    "name": "DietFlow",
    "tldr": "SaaS de nutrição com IA - plataforma principal de trabalho",
    "created_at": "2025-06-16T04:14:07.470249",
    "updated_at": "2025-06-16T04:14:07.470249"
  },
  {
    "id": "57fe1b29-7978-48e5-9318-020f381ffd1f",
    "name": "kk",
    "tldr": "jj",
    "created_at": "2025-06-16T20:03:47.973158",
    "updated_at": "2025-06-16T20:03:47.973158"
  }
]
```

### sprints
- **Registros:** 6
- **Campos:** id, project_id, name, tldr, status, created_at, updated_at
- **Exemplos:** 
```json
[
  {
    "id": "622fae44-7ef3-44ce-9c75-b6a47d302810",
    "project_id": "5a023575-6bca-4dc5-a89b-3aeb754cb212",
    "name": "Setup Neural System",
    "tldr": "Organizando sistema neural e definindo arquitetura para MCP",
    "status": "active",
    "created_at": "2025-06-16T04:14:07.470249",
    "updated_at": "2025-06-16T04:14:07.470249"
  },
  {
    "id": "4557709c-d8bc-4f93-896f-07d75dabd736",
    "project_id": "fd4ec028-f5b4-41a3-b31a-31c699625c60",
    "name": "Auth v2",
    "tldr": "Implementar OAuth e melhorar UX do sistema de login",
    "status": "active",
    "created_at": "2025-06-16T04:14:07.470249",
    "updated_at": "2025-06-16T04:14:07.470249"
  },
  {
    "id": "15878738-336f-4d97-aed3-3979f1ea57de",
    "project_id": "fd4ec028-f5b4-41a3-b31a-31c699625c60",
    "name": "Dashboard Analytics",
    "tldr": "Métricas e relatórios para nutricionistas acompanharem pacientes",
    "status": "archived",
    "created_at": "2025-06-16T04:14:07.470249",
    "updated_at": "2025-06-16T20:59:43.460854"
  }
]
```

### tasks
- **Registros:** 8
- **Campos:** id, sprint_id, title, description, status, priority, created_at, completed_at
- **Exemplos:** 
```json
[
  {
    "id": "337bedfb-20ff-45fb-b171-14dfc9b6260b",
    "sprint_id": "622fae44-7ef3-44ce-9c75-b6a47d302810",
    "title": "Definir estrutura de dados",
    "description": "Criar schema SQL e definir relações",
    "status": "completed",
    "priority": 4,
    "created_at": "2025-06-16T04:14:07.470249",
    "completed_at": null
  },
  {
    "id": "a8fa18b9-8562-4494-955d-413e8f89317e",
    "sprint_id": "622fae44-7ef3-44ce-9c75-b6a47d302810",
    "title": "Criar protótipo interface",
    "description": "Desenvolver UI components principais",
    "status": "in_progress",
    "priority": 4,
    "created_at": "2025-06-16T04:14:07.470249",
    "completed_at": null
  },
  {
    "id": "190b2830-06fc-4fe0-96d1-8d52445c65bf",
    "sprint_id": "622fae44-7ef3-44ce-9c75-b6a47d302810",
    "title": "Testar integração MCP",
    "description": "Validar funcionamento com Claude",
    "status": "pending",
    "priority": 3,
    "created_at": "2025-06-16T04:14:07.470249",
    "completed_at": null
  }
]
```

### sprint_notes
- **Registros:** 2
- **Campos:** id, sprint_id, title, content, tags, created_at
- **Exemplos:** 
```json
[
  {
    "id": "332d0378-0e30-441e-bd8a-6c92fbefa741",
    "sprint_id": "622fae44-7ef3-44ce-9c75-b6a47d302810",
    "title": "Insights sobre arquitetura de software",
    "content": "A simplicidade é mais importante que flexibilidade prematura. Better done than perfect.",
    "tags": [
      "arquitetura",
      "simplicidade"
    ],
    "created_at": "2025-06-16T04:14:07.470249"
  },
  {
    "id": "c2e17b7c-3351-4f81-848e-6e97604d588b",
    "sprint_id": "4557709c-d8bc-4f93-896f-07d75dabd736",
    "title": "OAuth redirect_uri bug",
    "content": "Google OAuth tá dando erro de redirect_uri. Problema é que localhost não tá na whitelist. Precisa configurar ngrok.",
    "tags": [
      "oauth",
      "bug",
      "google"
    ],
    "created_at": "2025-06-16T04:14:07.470249"
  }
]
```


## ❌ TABELAS INEXISTENTES

- **recursos:** relation "public.recursos" does not exist
- **pessoas:** relation "public.pessoas" does not exist

## 📐 DIAGRAMA PLANTUML - REALIDADE

```plantuml
@startuml Neural_Database_Reality_Check
!define ENTITY class

title NEURAL SYSTEM DATABASE - REALIDADE ATUAL
note top : Auditoria executada em 2025-06-17T04:55:13.665Z

ENTITY people {
  +id
  +name
  +relation
  +tldr
  +created_at
  +updated_at
  --
  records: 4
}

ENTITY person_notes {
  +id
  +person_id
  +title
  +content
  +tags
  +created_at
  --
  records: 3
}

ENTITY projects {
  +id
  +name
  +tldr
  +created_at
  +updated_at
  --
  records: 5
}

ENTITY sprints {
  +id
  +project_id
  +name
  +tldr
  +status
  +created_at
  +updated_at
  --
  records: 6
}

ENTITY tasks {
  +id
  +sprint_id
  +title
  +description
  +status
  +priority
  +created_at
  +completed_at
  --
  records: 8
}

ENTITY sprint_notes {
  +id
  +sprint_id
  +title
  +content
  +tags
  +created_at
  --
  records: 2
}

@enduml
```

---
*Relatório gerado automaticamente pelo script de auditoria forense*
