import React, { useState, useMemo } from "react";
import { LuTrash2, LuArrowRight, LuClock, LuUsers, LuFileText } from "react-icons/lu";
import { motion } from "framer-motion";
import { getInitials } from "../../utils/helper";

const SummaryCard = ({
  colors,
  role,
  topicsToFocus,
  experience,
  questions,
  description,
  lastUpdated,
  onSelect,
  onDelete,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Random fruit emoji for each card
  const randomFruit = useMemo(() => {
    const fruits = ['🍎', '🍌', '🍊', '🍇', '🍓', '🍑', '🥭', '🍍', '🥥', '🍒', '🍐', '🥝', '🍉', '🍈', '🥑', '🍋', '🍊', '🍎', '🍌', '🍇'];
    return fruits[Math.floor(Math.random() * fruits.length)];
  }, []);

  const handleCardClick = () => {
    onSelect();
  };

  // Check if description exists and has content
  const hasDescription = description && description.trim().length > 0;

  return (
    <motion.div
      className="relative w-97 h-90 group"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -12, scale: 1.03, rotateY: 2 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.6, 
        ease: [0.25, 0.46, 0.45, 0.94],
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
    >
      {/* Main Card Container */}
      <motion.div
        className="relative h-full w-full bg-gradient-to-br from-white via-slate-50 to-white rounded-3xl overflow-hidden cursor-pointer border border-slate-200/50 shadow-lg"
        style={{
          boxShadow: isHovered
            ? "0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 12px 32px -8px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.9)"
            : "0 8px 25px -4px rgba(0, 0, 0, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(255, 255, 255, 0.7)"
        }}
        onClick={handleCardClick}
        whileHover={{ 
          scale: 1.02,
          transition: { duration: 0.3, ease: "easeOut" }
        }}
        whileTap={{ 
          scale: 0.98,
          transition: { duration: 0.1 }
        }}
      >
        {/* Enhanced Gradient Overlay */}
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            background: `linear-gradient(135deg, ${colors.bgcolor}12 0%, ${colors.bgcolor}06 30%, ${colors.bgcolor}08 70%, ${colors.bgcolor}04 100%)`
          }}
        />

        {/* Animated Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Floating Elements */}
          <motion.div
            className="absolute top-4 right-4 w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"
            animate={{ 
              scale: isHovered ? [1, 1.8, 1] : 1,
              opacity: isHovered ? [0.4, 1, 0.4] : 0.4,
              y: isHovered ? [0, -4, 0] : 0,
              x: isHovered ? [0, 2, 0] : 0
            }}
            transition={{ 
              duration: 2.5, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-6 left-6 w-1.5 h-1.5 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
            animate={{ 
              scale: isHovered ? [1, 1.6, 1] : 1,
              opacity: isHovered ? [0.3, 0.9, 0.3] : 0.3,
              y: isHovered ? [0, 3, 0] : 0,
              x: isHovered ? [0, -2, 0] : 0
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              delay: 0.8,
              ease: "easeInOut"
            }}
          />
          
          {/* Enhanced moving lines */}
          <motion.div
            className="absolute top-1/4 left-2 w-10 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent"
            animate={{ 
              opacity: isHovered ? [0, 0.6, 0] : 0,
              scaleX: isHovered ? [0, 1.2, 0] : 0,
              x: isHovered ? [0, 4, 0] : 0
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              delay: 1.2,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-1/4 right-2 w-8 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent"
            animate={{ 
              opacity: isHovered ? [0, 0.6, 0] : 0,
              scaleX: isHovered ? [0, 1.2, 0] : 0,
              x: isHovered ? [0, -4, 0] : 0
            }}
            transition={{ 
              duration: 1.8, 
              repeat: Infinity, 
              delay: 0.6,
              ease: "easeInOut"
            }}
          />
        </div>

        {/* Content Container */}
        <div className="relative z-10 h-full w-full flex flex-col p-5">
          {/* Header Section */}
          <div className="flex items-start justify-between mb-2">
            {/* Role Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                {/* Enhanced Avatar */}
                <motion.div
                  className="relative flex-shrink-0"
                  whileHover={{ scale: 1.15, rotate: 3, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ 
                    duration: 0.4, 
                    ease: "easeOut",
                    type: "spring",
                    stiffness: 200
                  }}
                >
                  <div 
                    className="w-12 h-12 bg-gradient-to-br from-slate-100 via-slate-50 to-white rounded-2xl flex items-center justify-center shadow-md border border-slate-200/60"
                  >
                    <span className="text-lg font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                      {getInitials(role)}
                    </span>
                  </div>
                  {/* Enhanced animated glow */}
                  <motion.div
                    className="absolute inset-0 w-12 h-12 bg-gradient-to-br from-blue-400/30 to-purple-500/30 rounded-2xl"
                    animate={{ 
                      opacity: isHovered ? [0.2, 0.8, 0.2] : 0.2,
                      scale: isHovered ? [1, 1.1, 1] : 1,
                      rotate: isHovered ? [0, 180, 360] : 0
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </motion.div>

                {/* Role Title */}
                <div className="flex-1 min-w-0">
                  <motion.h3 
                    className="text-base font-bold text-slate-800 leading-tight mb-2 font-lexend"
                    animate={{ 
                      color: isHovered ? "#1e293b" : "#334155"
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {role}
                  </motion.h3>
                  <motion.div 
                    className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-slate-100 to-slate-50 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200/60 shadow-sm font-lexend"
                    whileHover={{ scale: 1.08, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                    animate={{
                      backgroundColor: isHovered ? "#f1f5f9" : "#f8fafc",
                      borderColor: isHovered ? "#cbd5e1" : "#e2e8f0"
                    }}
                    transition={{ 
                      duration: 0.3,
                      type: "spring",
                      stiffness: 150
                    }}
                  >
                    {topicsToFocus}
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Fruit Icon and Delete Button */}
            <div className="flex items-center space-x-2">
              {/* Random Fruit */}
              <motion.div
                className="text-2xl opacity-60"
                animate={{ 
                  scale: isHovered ? [1, 1.2, 1] : 1,
                  rotate: isHovered ? [0, 10, -10, 0] : 0,
                  y: isHovered ? [0, -2, 0] : 0
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {randomFruit}
              </motion.div>
              
              {/* Delete Button */}
              <motion.button
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 flex-shrink-0"
                whileHover={{ scale: 1.1, rotate: 5 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                <LuTrash2 size={14} />
              </motion.button>
            </div>
          </div>

          {/* Enhanced Stats Row */}
          <motion.div 
            className="flex justify-between items-center mb-4 p-3 bg-gradient-to-r from-slate-50 via-white to-slate-50 rounded-2xl border border-slate-200/60 shadow-sm"
            animate={{
              backgroundColor: isHovered ? "#f8fafc" : "#f1f5f9",
              borderColor: isHovered ? "#cbd5e1" : "#e2e8f0",
              y: isHovered ? -2 : 0,
              scale: isHovered ? 1.02 : 1
            }}
            transition={{ 
              duration: 0.4,
              type: "spring",
              stiffness: 100
            }}
          >
            {/* Experience */}
            <motion.div 
              className="flex items-center space-x-1"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
                          <motion.div 
              className="w-6 h-6 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center shadow-sm"
              animate={{
                backgroundColor: isHovered ? "#dbeafe" : "#dbeafe"
              }}
              transition={{ duration: 0.3 }}
            >
              <LuUsers size={12} className="text-blue-600" />
            </motion.div>
              <div>
                              <p className="text-xs text-slate-500 font-medium font-lexend">Exp</p>
              <p className="text-xs font-semibold text-slate-800 font-lexend">
                {experience} {experience == 1 ? "Yr" : "Yrs"}
              </p>
              </div>
            </motion.div>

            {/* Questions */}
            <motion.div 
              className="flex items-center space-x-1"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
                          <motion.div 
              className="w-6 h-6 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-xl flex items-center justify-center shadow-sm"
              animate={{
                backgroundColor: isHovered ? "#d1fae5" : "#d1fae5"
              }}
              transition={{ duration: 0.3 }}
            >
              <LuFileText size={12} className="text-emerald-600" />
            </motion.div>
              <div>
                <p className="text-xs text-slate-500 font-medium font-lexend">Questions</p>
                <p className="text-xs font-semibold text-slate-800 font-lexend">{questions}</p>
              </div>
            </motion.div>

            {/* Updated */}
            <motion.div 
              className="flex items-center space-x-1"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
                          <motion.div 
              className="w-6 h-6 bg-gradient-to-br from-orange-100 to-orange-50 rounded-xl flex items-center justify-center shadow-sm"
              animate={{
                backgroundColor: isHovered ? "#fed7aa" : "#fed7aa"
              }}
              transition={{ duration: 0.3 }}
            >
              <LuClock size={12} className="text-orange-600" />
            </motion.div>
              <div>
                <p className="text-xs text-slate-500 font-medium font-lexend">Updated</p>
                <p className="text-xs font-semibold text-slate-800 font-lexend">{lastUpdated}</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Description Section - Compact */}
          <motion.div 
            className="mb-2 flex-1"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="bg-gradient-to-br from-white via-slate-50 to-white rounded-2xl p-3 border border-slate-200/60 h-full overflow-hidden shadow-sm"
              animate={{
                borderColor: isHovered ? "#cbd5e1" : "#e2e8f0",
                y: isHovered ? -1 : 0,
                scale: isHovered ? 1.01 : 1
              }}
              transition={{ 
                duration: 0.4,
                type: "spring",
                stiffness: 80
              }}
            >
              <p className="text-sm text-slate-700 leading-relaxed line-clamp-3 font-lexend">
                {hasDescription ? description : "Description not provided."}
              </p>
            </motion.div>
          </motion.div>

          {/* Action Button */}
          <motion.div
            className="flex justify-center mt-1"
            animate={{ y: isHovered ? -2 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="inline-flex items-center space-x-2 text-white px-5 py-2.5 rounded-2xl shadow-lg font-semibold text-sm font-lexend"
              style={{
                background: "linear-gradient(to right, rgb(47, 114, 47), oklch(0.51 0.2 145.36))"
              }}
              whileHover={{ 
                scale: 1.08, 
                y: -2,
                transition: { 
                  duration: 0.3,
                  type: "spring",
                  stiffness: 200
                }
              }}
              whileTap={{ 
                scale: 0.95,
                transition: { duration: 0.1 }
              }}
              animate={{
                boxShadow: isHovered 
                  ? "0 12px 25px -6px rgba(0, 0, 0, 0.25)" 
                  : "0 4px 12px -2px rgba(0, 0, 0, 0.15)"
              }}
              transition={{ 
                duration: 0.4,
                type: "spring",
                stiffness: 150
              }}
            >
              <span>Click to Start</span>
              <motion.div
                animate={{ 
                  x: isHovered ? 4 : 0,
                  rotate: isHovered ? 15 : 0
                }}
                transition={{ 
                  duration: 0.3,
                  type: "spring",
                  stiffness: 200
                }}
              >
                <LuArrowRight size={14} />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* Enhanced Hover Border Effect */}
        <motion.div
          className="absolute inset-0 rounded-3xl border-2 border-transparent"
          animate={{ 
            borderColor: isHovered ? "rgba(99, 102, 241, 0.4)" : "transparent",
            scale: isHovered ? 1.02 : 1
          }}
          transition={{ 
            duration: 0.4,
            type: "spring",
            stiffness: 100
          }}
        />
      </motion.div>
    </motion.div>
  );
};

export default SummaryCard;