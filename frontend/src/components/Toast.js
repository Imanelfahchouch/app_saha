import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  
  const iconMap = { 
    success: "bi-check-circle-fill text-success", 
    error: "bi-x-circle-fill text-danger", 
    info: "bi-info-circle-fill text-primary" 
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 60, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.9 }}
      className={`toast-saha toast-${type}`}
    >
      <i className={`bi ${iconMap[type]} toast-icon`} />
      <div className="flex-grow-1">
        <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{message}</div>
      </div>
      <i className="bi bi-x" style={{ cursor: "pointer", color: "#999" }} onClick={onClose} />
    </motion.div>
  );
}