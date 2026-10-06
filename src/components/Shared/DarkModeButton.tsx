import { motion } from "motion/react";
import React from "react";
import { IoMoonOutline, IoSunnyOutline } from "react-icons/io5";
import { useThemeStore } from "../../store/themeStore";

const DarkModeButton: React.FC = () => {
  const { darkMode, toggleDarkMode } = useThemeStore();

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1, transition: { delay: 0.6, duration: 0.3, ease: "easeOut" } }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleDarkMode}
      className="toggle-button"
      data-color-inverted={"true"}
    >
      {darkMode ? <IoSunnyOutline /> : <IoMoonOutline />}
    </motion.button>
  );
};

export default DarkModeButton;
