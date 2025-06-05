"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Icon } from '@iconify/react';
import Link from "next/link";
import { motion } from "framer-motion";

interface RecursosLoginProps {
  onAuth: (authenticated: boolean) => void;
}

export default function RecursosLogin({ onAuth }: RecursosLoginProps) {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simular delay de validação para efeito Matrix
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (password === 'followtherabit') {
      sessionStorage.setItem('recursos_auth', 'followtherabit_validated');
      sessionStorage.setItem('recursos_auth_timestamp', Date.now().toString());
      onAuth(true);
    } else {
      setError('ACCESS DENIED - Try again, Neo...');
      setPassword('');
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    // Matrix rain effect
    const canvas = document.getElementById('matrix-rain') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()';
    const charArray = chars.split('');
    const fontSize = 14;
    const columns = canvas.width / fontSize;

    const drops: number[] = [];
    for (let i = 0; i < columns; i++) {
      drops[i] = 1;
    }

    function draw() {
      if (!ctx) return;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#00ff00';
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

    const interval = setInterval(draw, 35);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Matrix Rain Background */}
      <canvas 
        id="matrix-rain" 
        className="absolute inset-0 z-0"
        style={{ opacity: 0.3 }}
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
          transition={{ duration: 0.8 }}
          className="bg-black/80 backdrop-blur-lg border border-green-500/50 p-8 rounded-lg shadow-2xl shadow-green-500/20"
        >
          <div className="text-center mb-8">
            <motion.h1 
              className="text-4xl font-mono font-bold text-green-400 mb-2"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              RECURSOS VAULT
            </motion.h1>
            <motion.p 
              className="text-green-300/70 font-mono"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              This is your last chance...
            </motion.p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
            >
              <Input
                type="password"
                label="Access Code"
                placeholder="Follow the white rabbit..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                variant="bordered"
                size="lg"
                classNames={{
                  input: "font-mono text-green-400",
                  inputWrapper: "border-green-500/50 hover:border-green-400 data-[focus=true]:border-green-400",
                  label: "font-mono text-green-300"
                }}
                startContent={<Icon icon="lucide:key" className="text-green-500" />}
                isDisabled={isLoading}
              />
            </motion.div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 font-mono text-center text-sm bg-red-500/10 border border-red-500/30 p-2 rounded"
              >
                {error}
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
            >
              <Button
                type="submit"
                size="lg"
                className="w-full bg-green-600 hover:bg-green-500 text-black font-mono font-bold text-lg"
                isLoading={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Icon icon="lucide:loader-2" className="animate-spin" />
                    ACCESSING...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Icon icon="lucide:unlock" />
                    ENTER THE MATRIX
                  </span>
                )}
              </Button>
            </motion.div>
          </form>

          <motion.div 
            className="text-center mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            <p className="text-green-300/50 font-mono text-xs">
              "There is no spoon" - Only knowledge
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
} 