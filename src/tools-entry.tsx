import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import Tools from './components/Home/Tools';
import { useThemeStore } from './store/themeStore';
import './styles/index.scss';

function ToolsPage() {
  const { darkMode, toggleDarkMode } = useThemeStore();
  useEffect(() => { document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light'); }, [darkMode]);
  return <main className="tools-page"><nav className="tools-page-nav" aria-label="Tools navigation"><a href="/">← Kaushal. / Portfolio</a><button onClick={toggleDarkMode} aria-label="Toggle color theme">{darkMode ? 'Light mode' : 'Dark mode'}</button></nav><Tools /><footer className="tools-page-footer"><a href="/privacy">Privacy</a><span>Built for everyday curiosity. Runs locally, except URL shortening.</span></footer></main>;
}
createRoot(document.getElementById('root')!).render(<ToolsPage />);
