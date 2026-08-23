import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smile, X } from 'lucide-react';

const EMOJIS = ['🥑', '☕', '🍎', '🍔', '🍕', '🥗', '🥦', '💧', '💪', '🏋️', '⭐', '🔥', '💖', '🎉'];

export default function StickerPad({ onAddSticker }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 100 }}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="glass-panel"
            style={{
              padding: '16px',
              marginBottom: '16px',
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '8px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
            }}
          >
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  // Put the sticker at the center of the screen initially
                  const x = window.innerWidth / 2;
                  const y = window.scrollY + (window.innerHeight / 2);
                  onAddSticker(emoji, x, y);
                  setIsOpen(false);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '8px',
                  transition: 'background 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                {emoji}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        className="btn-premium glass-panel"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}
      >
        {isOpen ? <X size={24} color="var(--color-text)" /> : <Smile size={24} color="var(--color-text)" />}
      </motion.button>
    </div>
  );
}
