"use client";

import React from 'react';
import { Button } from "@heroui/button";
import { Icon } from '@iconify/react';
import Link from "next/link";
import { TokenFlowMain } from '../../components/tokenflow/TokenFlowMain';

export default function TokenFlow() {
  return (
    <>
      {/* Botão de navegação obrigatório */}
      <div className="fixed top-6 left-6 z-50">
        <Link href="/">
          <Button
            size="lg"
            className="font-mono font-bold backdrop-blur-lg bg-gray-900/80 dark:bg-gray-500/20 border border-gray-700 dark:border-gray-500/50 text-gray-100 dark:text-gray-300 hover:bg-gray-800/90 dark:hover:bg-gray-500/30 shadow-lg"
          >
            <Icon icon="lucide:arrow-left" width={20} height={20} />
            COGNITIVE OVERFLOW
          </Button>
        </Link>
      </div>

      {/* Conteúdo do TokenFlow */}
      <TokenFlowMain />
    </>
  );
} 