import React from 'react';

const SERVICE_ICONS = {
  palette: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
    </svg>
  ),
  printer: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
    </svg>
  ),
  wrench: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
    </svg>
  ),
  briefcase: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
    </svg>
  ),
  sparkles: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
    </svg>
  ),
  lightbulb: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
    </svg>
  ),
};

export const ServiceCard = ({ index, title, description, icon, accent, tags }) => {
  const iconNode = SERVICE_ICONS[icon] ?? SERVICE_ICONS.lightbulb;
  const formattedIndex = String(index).padStart(2, '0');

  return (
    <article
      className="landing-service-card"
      style={{ '--service-accent': accent }}
    >
      <div className="landing-service-card-accent" aria-hidden="true" />
      <span className="landing-service-card-index">{formattedIndex}</span>
      <div className="landing-service-card-icon">
        {iconNode}
      </div>
      <h3 className="landing-service-card-title">{title}</h3>
      <p className="landing-service-card-description">{description}</p>
      {tags?.length > 0 && (
        <ul className="landing-service-card-tags">
          {tags.map((tag) => (
            <li key={tag} className="landing-service-card-tag">{tag}</li>
          ))}
        </ul>
      )}
    </article>
  );
};
