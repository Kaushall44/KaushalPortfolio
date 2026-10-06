import type { ProjectCard } from '../constants/work';
import { useWindowManagerStore } from '../store/windowManagerStore';

export function openProject(data: ProjectCard) {
  const width = Math.min(880, window.innerWidth - 32);
  const height = Math.min(720, window.innerHeight - 64);
  useWindowManagerStore.getState().openWindow({
    id: `project-${data.cardData.id}`, title: data.cardData.title, type: 'workcard',
    status: 'open', size: { width, height },
    position: { x: (window.innerWidth - width) / 2, y: (window.innerHeight - height) / 2 },
    meta: data,
  });
}
