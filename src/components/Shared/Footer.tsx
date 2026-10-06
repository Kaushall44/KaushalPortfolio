import profile from '../../data/portfolio.json';
function Footer() {
  const links = [{ name: 'LinkedIn.', href: profile.links.linkedin }, { name: 'GitHub.', href: profile.links.github },
    ...(profile.email ? [{ name: 'Email.', href: 'mailto:' + profile.email }] : []),
    { name: 'About.', href: '/about' }, { name: 'Contact.', href: '/contact' }, { name: 'llms.txt', href: '/llms.txt' }];
  return <footer className="footer"><div className="links">{links.map(link =>
    <a href={link.href} target={link.href.startsWith('/') ? '_self' : '_blank'} rel="noopener noreferrer" key={link.name}>{link.name}</a>
  )}</div></footer>;
}
export default Footer;
