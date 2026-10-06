import profile from '../../data/portfolio.json';
export const bio = { name: profile.name, title: profile.headline, summary: profile.summary, interests: profile.interests };
export const education = profile.education;
export const experience = profile.experience;
export const skills = profile.skills;
export const contact = { email: profile.email || 'Contact via LinkedIn', ...profile.links };
