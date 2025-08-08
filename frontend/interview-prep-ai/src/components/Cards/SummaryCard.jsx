import React, { useState } from "react";
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

  const handleCardClick = () => {
    onSelect();
  };

  // Check if description exists and has content
  const hasDescription = description && description.trim().length > 0;

  return (
    <motion.div
      className="relative aspect-square group"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Main Card Container */}
      <motion.div
        className="relative h-full w-full bg-white rounded-2xl overflow-hidden cursor-pointer border border-gray-100 shadow-sm"
        style={{
          boxShadow: isHovered
            ? "0 20px 40px -8px rgba(0, 0, 0, 0.12), 0 8px 24px -4px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.8)"
            : "0 4px 16px -2px rgba(0, 0, 0, 0.06), 0 2px 8px -1px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(255, 255, 255, 0.5)"
        }}
        onClick={handleCardClick}
      >
        {/* Subtle Gradient Overlay */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: `linear-gradient(135deg, ${colors.bgcolor}08 0%, ${colors.bgcolor}04 50%, ${colors.bgcolor}06 100%)`
          }}
        />

        {/* Animated Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Floating Elements */}
          <motion.div
            className="absolute top-4 right-4 w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"
            animate={{ 
              scale: isHovered ? [1, 1.5, 1] : 1,
              opacity: isHovered ? [0.6, 1, 0.6] : 0.6,
              y: isHovered ? [0, -2, 0] : 0
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-6 left-6 w-1.5 h-1.5 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
            animate={{ 
              scale: isHovered ? [1, 1.3, 1] : 1,
              opacity: isHovered ? [0.5, 0.8, 0.5] : 0.5,
              y: isHovered ? [0, 1, 0] : 0
            }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
          />
          
          {/* Subtle moving lines */}
          <motion.div
            className="absolute top-1/4 left-2 w-8 h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent"
            animate={{ 
              opacity: isHovered ? [0, 0.3, 0] : 0,
              scaleX: isHovered ? [0, 1, 0] : 0
            }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
          />
          <motion.div
            className="absolute bottom-1/4 right-2 w-6 h-px bg-gradient-to-r from-transparent via-emerald-300 to-transparent"
            animate={{ 
              opacity: isHovered ? [0, 0.3, 0] : 0,
              scaleX: isHovered ? [0, 1, 0] : 0
            }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0.8 }}
          />
        </div>

        {/* Content Container */}
        <div className="relative z-10 h-full w-full flex flex-col p-4">
          {/* Header Section */}
          <div className="flex items-start justify-between mb-3">
            {/* Role Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                {/* Innovative Avatar */}
                <motion.div
                  className="relative flex-shrink-0"
                  whileHover={{ scale: 1.1, rotate: 2 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <div 
                    className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center shadow-sm border border-slate-200"
                  >
                    <span className="text-base font-bold bg-gradient-to-r from-slate-600 to-slate-800 bg-clip-text text-transparent">
                      {getInitials(role)}
                    </span>
                  </div>
                  {/* Animated glow */}
                  <motion.div
                    className="absolute inset-0 w-10 h-10 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-xl"
                    animate={{ 
                      opacity: isHovered ? [0.3, 0.6, 0.3] : 0.3,
                      scale: isHovered ? [1, 1.05, 1] : 1
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>

                {/* Role Title */}
                <div className="flex-1 min-w-0">
                  <motion.h3 
                    className="text-sm font-bold text-slate-800 leading-tight mb-1"
                    animate={{ 
                      color: isHovered ? "#1e293b" : "#334155"
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {role}
                  </motion.h3>
                  <motion.div 
                    className="inline-flex items-center px-2 py-0.5 bg-slate-50 text-slate-600 rounded-lg text-xs font-medium border border-slate-200"
                    whileHover={{ scale: 1.05 }}
                    animate={{
                      backgroundColor: isHovered ? "#f8fafc" : "#f1f5f9",
                      borderColor: isHovered ? "#cbd5e1" : "#e2e8f0"
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {topicsToFocus}
                  </motion.div>
                </div>
              </div>
            </div>

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

          {/* Compact Stats Row */}
          <motion.div 
            className="flex justify-between items-center mb-3 p-2 bg-slate-50 rounded-xl border border-slate-100"
            animate={{
              backgroundColor: isHovered ? "#f8fafc" : "#f1f5f9",
              borderColor: isHovered ? "#cbd5e1" : "#e2e8f0"
            }}
            transition={{ duration: 0.3 }}
          >
            {/* Experience */}
            <motion.div 
              className="flex items-center space-x-1"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div 
                className="w-5 h-5 bg-blue-100 rounded-lg flex items-center justify-center"
                animate={{
                  backgroundColor: isHovered ? "#dbeafe" : "#dbeafe"
                }}
                transition={{ duration: 0.3 }}
              >
                <LuUsers size={10} className="text-blue-600" />
              </motion.div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Exp</p>
                <p className="text-xs font-semibold text-slate-800">
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
                className="w-5 h-5 bg-emerald-100 rounded-lg flex items-center justify-center"
                animate={{
                  backgroundColor: isHovered ? "#d1fae5" : "#d1fae5"
                }}
                transition={{ duration: 0.3 }}
              >
                <LuFileText size={10} className="text-emerald-600" />
              </motion.div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Q's</p>
                <p className="text-xs font-semibold text-slate-800">{questions}</p>
              </div>
            </motion.div>

            {/* Updated */}
            <motion.div 
              className="flex items-center space-x-1"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div 
                className="w-5 h-5 bg-orange-100 rounded-lg flex items-center justify-center"
                animate={{
                  backgroundColor: isHovered ? "#fed7aa" : "#fed7aa"
                }}
                transition={{ duration: 0.3 }}
              >
                <LuClock size={10} className="text-orange-600" />
              </motion.div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Updated</p>
                <p className="text-xs font-semibold text-slate-800">{lastUpdated}</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Description Section - Always Show */}
          <motion.div 
            className="mb-0 flex-1"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="bg-white rounded-xl p-2 border border-slate-100 h-full overflow-hidden"
              animate={{
                borderColor: isHovered ? "#cbd5e1" : "#e2e8f0"
              }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                {hasDescription ? description : "No Description"}
              </p>
            </motion.div>
          </motion.div>

          {/* Action Button */}
          <motion.div
            className="flex justify-center mt-2"
            animate={{ y: isHovered ? -2 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-slate-600 to-slate-700 text-white px-4 py-2 rounded-xl shadow-sm font-semibold text-sm"
              whileHover={{ scale: 1.05 }}
              animate={{
                boxShadow: isHovered 
                  ? "0 4px 12px -2px rgba(0, 0, 0, 0.15)" 
                  : "0 2px 8px -2px rgba(0, 0, 0, 0.1)"
              }}
              transition={{ duration: 0.3 }}
            >
              <span>Open</span>
              <motion.div
                animate={{ x: isHovered ? 2 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <LuArrowRight size={12} />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* Hover Border Effect */}
        <motion.div
          className="absolute inset-0 rounded-2xl border-2 border-transparent"
          animate={{ 
            borderColor: isHovered ? "rgba(99, 102, 241, 0.3)" : "transparent"
          }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
    </motion.div>
  );
};

export default SummaryCard;