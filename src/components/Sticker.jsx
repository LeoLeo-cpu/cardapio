import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function Sticker({ id, emoji, initialX, initialY, onUpdatePosition, onRemove }) {
  // Use state to manage position, or just rely on motion's internal state + onDragEnd
  return (
    <motion.div
      drag
      dragMomentum={false}
      initial={{ x: initialX, y: initialY, scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      onDragEnd={(event, info) => {
        onUpdatePosition(id, info.point.x, info.point.y);
      }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        fontSize: '2rem',
        cursor: 'grab',
        zIndex: 50,
        userSelect: 'none',
        display: 'inline-block'
      }}
      whileHover={{ scale: 1.2 }}
      whileDrag={{ cursor: 'grabbing', scale: 1.1, zIndex: 60 }}
      onDoubleClick={() => onRemove(id)}
      title="Arraste livremente! Clique duplo para remover."
    >
      {emoji}
    </motion.div>
  );
}
