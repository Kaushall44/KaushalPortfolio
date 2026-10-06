import { motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { FiVideoOff, FiX } from 'react-icons/fi';
import { IoMoonOutline, IoSunnyOutline } from 'react-icons/io5';
import useIsMobile from '../../hooks/useIsMobile';
import { useHandsfreeStore } from '../../store/handsfreeStore';
import { useThemeStore } from '../../store/themeStore';
import { scrollToComponent } from '../../utils/scrollToComponent';
import MenuIcon from './MenuIcon';

const supportsCamera =
  typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;

function Navbar() {
  const isMobile = useIsMobile();
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const { darkMode, toggleDarkMode } = useThemeStore();
  const {
    isEnabled: cameraEnabled,
    hasSeenIntro,
    setEnabled: setCameraEnabled,
    setShowIntroModal,
    setShowGestureTutorial,
  } = useHandsfreeStore();

  useEffect(() => {
    if (isMobile) {
      document.body.classList.toggle('nav-expanded', isHovered);
    }
    return () => {
      document.body.classList.remove('nav-expanded');
    };
  }, [isHovered, isMobile]);

  const handleCameraClick = () => {
    if (!hasSeenIntro) {
      setShowIntroModal(true);
      return;
    }
    if (cameraEnabled) {
      setCameraEnabled(false);
    } else {
      setCameraEnabled(true);
      setTimeout(() => setShowGestureTutorial(true), 1500);
    }
  };

  const links = [
    {
      name: 'Skills.',
      href: '#skills',
      top: 40,
    },
    {
      name: 'Work.',
      href: '#work',
    },
    {
      name: 'Tools.',
      href: '/tools',
    },
    {
      name: 'LinkedIn.',
      href: 'https://www.linkedin.com/in/kaushalrajgupta/',
    },
    {
      name: 'Github.',
      href: 'https://github.com/Kaushall44',
    },
  ];
  const collapsedWidth = isMobile ? '215px' : 'auto';
  const expandedWidth = isMobile ? 'calc(100vw - 32px)' : 'min(800px, calc(100vw - 32px))';

  const handleLinkClick = (link: { href: string; top?: number }) => {
    if (link.href.startsWith('/')) {
      window.location.assign(link.href);
    } else if (link.href.includes('#')) {
      scrollToComponent(link.href.split('#')[1], link.top);
    } else {
      window.open(link.href, '_blank');
    }
  };

  return (
    <motion.div
      className="navbar"
      onMouseEnter={!isMobile ? () => setIsHovered(true) : undefined}
      onMouseLeave={!isMobile ? () => setIsHovered(false) : undefined}
      onClick={() => setIsHovered(!isHovered)}
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        width: isHovered ? expandedWidth : collapsedWidth,
      }}
      transition={{
        opacity: { delay: 0.5, duration: 0.6, ease: 'easeOut' },
        width: isMobile
          ? { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }
          : { type: 'spring', stiffness: 100, damping: 15 },
      }}
      style={{
        justifyContent: isHovered ? 'flex-start' : 'center',
      }}
    >
      <MenuIcon isHovered={isHovered} setIsHovered={setIsHovered} />
      {isMobile ? (
        <h1
          className="heading"
          style={{ visibility: isHovered ? 'hidden' : 'visible' }}
        >
          Kaushal.
        </h1>
      ) : (
        <motion.h1
          className="heading"
          layout
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        >
          Kaushal.
        </motion.h1>
      )}
      <motion.div
        className="links"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{
          delay: isHovered ? 0.15 : 0,
          duration: 0.2,
        }}
        style={{ pointerEvents: isHovered ? 'auto' : 'none' }}
      >
        {links.map((link, i) => (
          <a
            href={link.href}
            target={link.href.startsWith('https:') ? '_blank' : undefined}
            rel={link.href.startsWith('https:') ? 'noopener noreferrer' : undefined}
            onClick={event => { if (link.href.startsWith('#')) { event.preventDefault(); handleLinkClick(link); } }}
            key={`link-${i}`}
          >
            {link.name}
          </a>
        ))}
      </motion.div>
      {isMobile && (
        <motion.div
          className="navbar-toggles"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{
            delay: isHovered ? 0.15 : 0,
            duration: 0.2,
          }}
          style={{ pointerEvents: isHovered ? 'auto' : 'none' }}
        >
          {supportsCamera && (
            <button
              className={`navbar-toggle-btn ${cameraEnabled ? 'active' : ''}`}
              onClick={e => {
                e.stopPropagation();
                handleCameraClick();
              }}
              title={cameraEnabled ? 'Disable camera' : 'Enable camera'}
            >
              {cameraEnabled ? <FiX /> : <FiVideoOff />}
            </button>
          )}
          <button
            className="navbar-toggle-btn"
            onClick={e => {
              e.stopPropagation();
              toggleDarkMode();
            }}
          >
            {darkMode ? <IoSunnyOutline /> : <IoMoonOutline />}
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}

export default Navbar;
