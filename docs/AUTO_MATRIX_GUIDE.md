# 🔐 MATRIX AUTO-AUTH SYSTEM GUIDE

## 🚀 Como Adicionar Novos Projetos com Auth Automático

### **1. ADICIONAR PROJETO NO CONFIG:**

```tsx
// config/projects.ts
{
  id: 'yasmin-project',
  title: "YASMIN PROJECT",
  subtitle: "Exclusive Content Engine",
  description: "Projeto exclusivo da Yasmin com conteúdo protegido e experiências únicas.",
  path: "/yasmin-project",
  status: "ACTIVE",
  protected: true, // 🔥 MATRIX AUTH ENABLED
  tags: ["Exclusive", "Creative", "Protected"],
  colors: {
    primary: "from-pink-500/20 to-rose-500/20",
    secondary: "pink-500",
    accent: "rose-500",
    borderColor: "border-pink-500/40",
    glowColor: "shadow-pink-500/30"
  },
  emoji: "👑",
  authConfig: {
    title: "YASMIN PROJECT ACCESS",
    subtitle: "Enter the Matrix to access exclusive content"
  }
}
```

### **2. CRIAR LAYOUT AUTOMATICAMENTE PROTEGIDO:**

```tsx
// app/yasmin-project/layout.tsx
"use client";

import AutoMatrixLayout from '../../components/matrix/AutoMatrixLayout';

export default function YasminProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AutoMatrixLayout>
      {children}
    </AutoMatrixLayout>
  );
}
```

### **3. CRIAR PÁGINA DO PROJETO:**

```tsx
// app/yasmin-project/page.tsx
"use client";

import React from 'react';
import { Button } from "@heroui/button";
import { Icon } from '@iconify/react';
import Link from "next/link";
import MatrixLogoutButton from '../../components/matrix/MatrixLogoutButton';

export default function YasminProject() {
  return (
    <>
      {/* Navigation */}
      <div className="fixed top-6 left-6 z-50">
        <Link href="/">
          <Button
            size="lg"
            className="font-mono font-bold backdrop-blur-lg bg-gray-500/20 border border-gray-500/50 text-gray-300 hover:bg-gray-500/30"
          >
            <Icon icon="lucide:arrow-left" width={20} height={20} />
            COGNITIVE OVERFLOW
          </Button>
        </Link>
      </div>

      {/* Logout Button */}
      <div className="fixed top-6 right-6 z-50">
        <MatrixLogoutButton redirectTo="/yasmin-project" />
      </div>

      {/* Project Content */}
      <div className="min-h-screen p-6">
        <h1 className="text-4xl font-bold text-center text-pink-400 mb-8">
          👑 YASMIN PROJECT
        </h1>
        {/* Seu conteúdo aqui */}
      </div>
    </>
  );
}
```

## 🎯 **RESULTADO AUTOMÁTICO:**

✅ **Projeto aparece na dashboard** (seção protegida)
✅ **Matrix Auth aplicado automaticamente**
✅ **Login uma vez libera todos os protegidos**
✅ **Tela de login customizada** (título/subtítulo específicos)
✅ **Logout unificado** funciona em qualquer lugar
✅ **Ícone de cadeado** aparece automaticamente no card

## 🔄 **PARA TORNAR PROJETO PÚBLICO:**

```tsx
// config/projects.ts
{
  // ... outras configs
  protected: false, // 🌍 TORNA PÚBLICO
  // authConfig não é necessário
}
```

E **remova** o `AutoMatrixLayout` do layout.tsx!

## 🎪 **FLUXO MATRIX UNIFICADO:**

```
🔑 Password: "redpill"
📱 Storage: "matrix_global_auth" 
⏰ Expiry: 7 dias
🚪 Scope: TODOS os projetos protegidos

EXPERIÊNCIA:
1. Click em qualquer projeto protegido
2. Tela Matrix Auth (customizada por projeto)
3. Digite "redpill"
4. Libera TODOS os projetos protegidos
5. Navega livremente
6. Logout bloqueia tudo novamente
```

---

**É literalmente plug-and-play! Adiciona no config, cria layout com AutoMatrixLayout, e BOOM - Matrix Auth automático! 🔥** 