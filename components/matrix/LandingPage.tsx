import React from 'react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';

interface LandingPageProps {
  onChooseRedPill: () => void;
  onChooseBluePill: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onChooseRedPill, onChooseBluePill }) => {
  return (
    <div className="landing-container">
      <motion.div 
        className="landing-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      >
        <h1 className="landing-title">MATRIX RELATIONSHIP ANALYSIS</h1>
        
        <p className="landing-subtitle">Escolha seu caminho</p>
        
        <div className="landing-quote">
          <p>"Depois disso, não há como voltar. Tome a pílula azul e a história acaba. 
          Tome a pílula vermelha e você permanece no País das Maravilhas, 
          e eu te mostro até onde vai a toca do coelho."</p>
          <p className="quote-author">— Morpheus</p>
        </div>
        
        <div className="pills-container">
          <motion.div 
            className="pill-choice blue"
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            onClick={onChooseBluePill}
          >
            <div className="pill-icon">
              <Icon icon="lucide:pill" width={60} height={60} />
            </div>
            <h2>BLUE PILL</h2>
            <p>A ilusão confortável</p>
            <div className="pill-description">
              <p>Escolha este caminho para ver a versão em que acreditamos no que queremos ouvir.</p>
            </div>
          </motion.div>

          <motion.div 
            className="pill-choice red"
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            onClick={onChooseRedPill}
          >
            <div className="pill-icon">
              <Icon icon="lucide:pill" width={60} height={60} />
            </div>
            <h2>RED PILL</h2>
            <p>A verdade devastadora</p>
            <div className="pill-description">
              <p>Escolha este caminho para ver a análise real dos padrões destrutivos.</p>
            </div>
          </motion.div>
        </div>
        
        <motion.div 
          className="landing-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 1.5, duration: 1 }}
        >
          <p>Digite "WAKE_UP" para mostrar as duas opções</p>
        </motion.div>
      </motion.div>
    </div>
  );
};