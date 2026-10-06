import { motion } from 'motion/react';
import { FiExternalLink, FiGithub } from 'react-icons/fi';
import type { ProjectCard } from '../../constants/work';
import { openProject } from '../../utils/openProject';

export default function WorkCard({ data }: { data: ProjectCard; cardIndex?: number }) {
  const { cardData } = data;
  return <article className="card-modal-component">
    <motion.div className="main-card" initial={{ opacity: 0, y: 35 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <button className="project-open" onClick={() => openProject(data)} aria-label={`View ${cardData.title} project details`}>
        <img src={cardData.imgUrl} alt={`${cardData.title} project illustration`} className="card-img" loading="lazy" />
      </button>
      <div className="card-heading-flex">
        <button className="project-open heading" onClick={() => openProject(data)}>{cardData.title}</button>
        <a href={cardData.url.githubUrl} target="_blank" rel="noopener noreferrer" aria-label={`${cardData.title} source code`}><FiGithub className="icon" /></a>
        {cardData.url.liveUrl && <a href={cardData.url.liveUrl} target="_blank" rel="noopener noreferrer" aria-label={`${cardData.title} live demo`}><FiExternalLink className="icon" /></a>}
      </div>
    </motion.div>
  </article>;
}
