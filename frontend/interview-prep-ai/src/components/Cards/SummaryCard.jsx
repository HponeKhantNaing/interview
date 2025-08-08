import React, { useState } from "react";
import { LuTrash2, LuArrowRight, LuClock, LuUsers, LuFileText } from "react-icons/lu";
import { motion, AnimatePresence } from "framer-motion";
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
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleCardClick = () => {
    setIsFlipped(true);
    setTimeout(() => {
      onSelect();
    }, 300); // Wait for flip animation to complete
  };

  return (
    <div className="relative perspective-1000 h-full overflow-hidden">
      <motion.div
        className="relative w-full h-full"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        style={{ transformStyle: "preserve-3d" }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        {/* Front of card */}
        <motion.div
          className="absolute inset-0 w-full h-full"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="relative h-full">
            {/* 3D Background with geometric shapes */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl">
                             {/* Animated geometric shapes */}
               <motion.div
                 className="absolute top-4 right-4 w-16 h-16 bg-white/20 rounded-full"
                 animate={{
                   scale: isHovered ? 1.2 : 1,
                   rotate: isHovered ? 180 : 0,
                   y: isHovered ? -5 : 0,
                 }}
                 transition={{ duration: 0.3 }}
               />
               <motion.div
                 className="absolute bottom-8 left-6 w-8 h-8 bg-white/15 rounded-lg"
                 animate={{
                   scale: isHovered ? 1.1 : 1,
                   rotate: isHovered ? -90 : 0,
                   x: isHovered ? 3 : 0,
                 }}
                 transition={{ duration: 0.4 }}
               />
               <motion.div
                 className="absolute top-1/2 right-8 w-12 h-12 bg-white/10 rounded-xl"
                 animate={{
                   scale: isHovered ? 1.15 : 1,
                   rotate: isHovered ? 45 : 0,
                   y: isHovered ? 5 : 0,
                 }}
                 transition={{ duration: 0.5 }}
               />
            </div>

            {/* Main card content */}
            <motion.div
              className="relative h-full bg-gradient-to-br from-white/95 to-white/85 backdrop-blur-sm border border-white/50 rounded-2xl p-6 cursor-pointer flex flex-col"
              style={{
                background: `linear-gradient(135deg, ${colors.bgcolor}15, ${colors.bgcolor}25)`,
                boxShadow: isHovered 
                  ? "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)"
                  : "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)"
              }}
              whileHover={{ 
                scale: 1.01,
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              onClick={handleCardClick}
            >
              {/* Header with role and avatar */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <motion.div
                    className="relative"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="w-14 h-14 bg-gradient-to-br from-white to-gray-50 rounded-xl flex items-center justify-center shadow-lg border border-white/50">
                      <span className="text-xl font-bold text-gray-800">
                        {getInitials(role)}
                      </span>
                    </div>
                    {/* Decorative elements */}
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-80" />
                    <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-gradient-to-r from-green-400 to-blue-500 rounded-full opacity-60" />
                  </motion.div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-1">{role}</h3>
                    <p className="text-sm text-gray-600 font-medium">{topicsToFocus}</p>
                  </div>
                </div>

                                 {/* Delete button */}
                 <motion.button
                   className="opacity-0 hover:opacity-100 p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                   whileHover={{ scale: 1.1 }}
                   onClick={(e) => {
                     e.stopPropagation();
                     onDelete();
                   }}
                 >
                   <LuTrash2 size={18} />
                 </motion.button>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <motion.div
                  className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-white/30"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <LuUsers size={16} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Experience</p>
                      <p className="text-sm font-bold text-gray-800">{experience} {experience == 1 ? "Year" : "Years"}</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-white/30"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                      <LuFileText size={16} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Questions</p>
                      <p className="text-sm font-bold text-gray-800">{questions}</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-white/30"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                      <LuClock size={16} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Updated</p>
                      <p className="text-sm font-bold text-gray-800">{lastUpdated}</p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Description */}
              <div className="mb-3">
                <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                  {description}
                </p>
              </div>

              {/* Action indicator */}
              <motion.div
                className="flex items-center justify-center space-x-2 text-blue-600 font-medium text-sm"
                animate={{ x: isHovered ? 5 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <span>Click to open</span>
                <LuArrowRight size={16} />
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Back of card (flip animation) */}
        <motion.div
          className="absolute inset-0 w-full h-full"
          style={{ 
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)"
          }}
        >
          <div className="h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <motion.div
              className="text-white text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                <LuArrowRight size={32} className="text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2">Opening Session</h3>
                                <p className="text-sm opacity-90">Preparing your coding test...</p>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SummaryCard;
