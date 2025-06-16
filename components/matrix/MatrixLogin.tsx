"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Icon } from '@iconify/react';
import Link from "next/link";
import { motion } from "framer-motion";

interface MatrixLoginProps {
  onAuth: (authenticated: boolean) => void;
}

export default function MatrixLogin({ onAuth }: MatrixLoginProps) {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simular delay de validação para efeito Matrix
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (password === 'redpill') {
      sessionStorage.setItem('matrix_auth', 'redpill_validated');
      sessionStorage.setItem('matrix_auth_timestamp', Date.now().toString());
      onAuth(true);
    } else {
      setError('WRONG CHOICE - You took the blue pill...');
      setPassword('');
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    // Matrix rain effect
    const canvas = document.getElementById('matrix-login-rain') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    const charArray = chars.split('');
    const fontSize = 16;
    const columns = canvas.width / fontSize;

    const drops: number[] = [];
    for (let i = 0; i < columns; i++) {
      drops[i] = 1;
    }

    function draw() {
      if (!ctx) return;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#00ff41';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = charArray[Math.floor(Math.random() * charArray.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }

    const interval = setInterval(draw, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Matrix Rain Background */}
      <canvas 
        id="matrix-login-rain" 
        className="absolute inset-0 z-0"
        style={{ opacity: 0.4 }}
      />
      
      {/* Back Button */}
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

      {/* Login Form */}
      <div className="flex items-center justify-center min-h-screen z-10 relative">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2 }}
          className="bg-black/90 backdrop-blur-xl border border-green-400/60 p-10 rounded-lg shadow-2xl shadow-green-400/30"
        >
          <div className="text-center mb-10">
            <motion.h1 
              className="text-5xl font-mono font-bold text-green-400 mb-4"
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              THE MATRIX
            </motion.h1>
            <motion.p 
              className="text-green-300/80 font-mono text-lg mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              Welcome to the real world
            </motion.p>
            <motion.div 
              className="text-green-400/60 font-mono text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              Unfortunately, no one can be told what the Matrix is...
            </motion.div>
          </div>

          <form onSubmit={handleLogin} className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.6 }}
            >
              <Input
                type="password"
                label="Choose Your Pill"
                placeholder="Red or Blue?"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                variant="bordered"
                size="lg"
                classNames={{
                  input: "font-mono text-green-400 text-lg",
                  inputWrapper: "border-green-400/60 hover:border-green-300 data-[focus=true]:border-green-300",
                  label: "font-mono text-green-300"
                }}
                startContent={<Icon icon="lucide:pill" className="text-green-400" />}
                isDisabled={isLoading}
              />
            </motion.div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 font-mono text-center text-sm bg-red-500/10 border border-red-500/40 p-3 rounded"
              >
                {error}
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.0 }}
            >
              <Button
                type="submit"
                size="lg"
                className="w-full bg-green-500 hover:bg-green-400 text-black font-mono font-bold text-lg py-4"
                isLoading={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-3">
                    <Icon icon="lucide:loader-2" className="animate-spin" />
                    LOADING THE MATRIX...
                  </span>
                ) : (
                  <span className="flex items-center gap-3">
                    <Icon icon="lucide:zap" />
                    TAKE THE RED PILL
                  </span>
                )}
              </Button>
            </motion.div>
          </form>

          <motion.div 
            className="text-center mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.4 }}
          >
            <p className="text-green-300/50 font-mono text-xs">
              "What is real? How do you define real?"
            </p>
            <p className="text-green-400/40 font-mono text-xs mt-2">
              - Morpheus
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Glitch Effects */}
      <div className="absolute inset-0 pointer-events-none z-20">
        <motion.div 
          className="absolute top-1/4 left-1/4 w-2 h-40 bg-green-400/20"
          animate={{ 
            opacity: [0, 1, 0],
            x: [0, 100, 0] 
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            repeatDelay: 6
          }}
        />
        <motion.div 
          className="absolute bottom-1/3 right-1/3 w-1 h-60 bg-green-300/15"
          animate={{ 
            opacity: [0, 1, 0],
            y: [0, -150, 0] 
          }}
          transition={{ 
            duration: 5,
            repeat: Infinity,
            repeatDelay: 8,
            delay: 2
          }}
        />
      </div>
    </div>
  );
} 