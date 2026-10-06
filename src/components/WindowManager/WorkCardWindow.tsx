import { useEffect, useState } from 'react';
import type { ProjectCard } from '../../constants/work';
import { useWindow, useWindowManagerStore, type WindowId } from '../../store/windowManagerStore';
import DraggableWindow from './DraggableWindow';

export default function WorkCardWindow({ windowId }: { windowId: WindowId }) {
  const win = useWindow(windowId);
  const [feedback, setFeedback] = useState('');
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const store = useWindowManagerStore.getState();
      if (event.key === 'Escape' && store.focusOrder[store.focusOrder.length - 1] === windowId) store.closeWindow(windowId);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [windowId]);
  if (!win) return null;
  const { cardData, modalData } = win.meta as ProjectCard;
  const shareUrl = new URL(window.location.href);
  shareUrl.hash = `project=${encodeURIComponent(cardData.id)}`;
  const copy = async () => {
    try { await navigator.clipboard.writeText(shareUrl.href); setFeedback('Project link copied.'); }
    catch { setFeedback('Select and copy the link below.'); }
  };
  return <DraggableWindow windowId={windowId} title={cardData.title} className="workcard-window">
    <article className="workcard-window__content">
      <img src={cardData.imgUrl} alt={`${cardData.title} project illustration`} className="project-banner" />
      <h2 className="heading">{modalData.title}</h2>
      <section><h3>About this project</h3><p className="desc">{modalData.desc}</p></section>
      <section><h3>Tech stack</h3><ul className="project-stack">{modalData.infoArr.map(tech => <li key={tech}>{tech}</li>)}</ul></section>
      <section><h3>Explore &amp; share</h3>
        <div className="project-actions">
          <a href={cardData.url.githubUrl} target="_blank" rel="noopener noreferrer">View source ↗</a>
          {cardData.url.liveUrl && <a href={cardData.url.liveUrl} target="_blank" rel="noopener noreferrer">Live demo ↗</a>}
          <button onClick={copy}>Copy project link</button>
        </div>
        <label className="project-share">Shareable link<input readOnly value={shareUrl.href} onFocus={e => e.target.select()} /></label>
        <p role="status">{feedback}</p>
      </section>
    </article>
  </DraggableWindow>;
}
