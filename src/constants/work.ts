import profile from '../data/portfolio.json';
export const work = ['Featured', 'Web Apps', 'Experiments'].map(group =>
  profile.projects.filter(project => project.group === group).map(project => ({
    cardData: { id: project.id, title: project.name, imgUrl: '/assets/projects/' + project.id + '.svg', url: { githubUrl: project.repositoryUrl, liveUrl: project.url } },
    modalData: { title: project.name, desc: project.description, infoHeading: 'Built with', infoArr: project.technologies },
  }))
);
export type ProjectCard = (typeof work)[number][number];
