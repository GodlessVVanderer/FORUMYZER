import React from 'react';
import './LandingPage.css';

// Golden Ratio constant
const PHI = 1.618033988749895;

interface Feature {
  icon: string;
  title: string;
  description: string;
  highlighted?: boolean;
}

const features: Feature[] = [
  {
    icon: '👑',
    title: 'AI Categorization',
    description: 'Automatically sorts comments. Discussion, Questions, Feedback, Genuine, Bot, Spam, Toxic',
  },
  {
    icon: '🎚️',
    title: 'Advanced Filtering',
    description: 'Filter by sentiment, confidence, category. Sort by newest, oldest, or engagement.',
  },
  {
    icon: '🚫',
    title: 'Spam Protection',
    description: 'Detects spam, bots, and toxic content using Gemini AI analysis.',
    highlighted: true,
  },
  {
    icon: '📚',
    title: 'Forum Library',
    description: 'Save and organize boards from all your favorite videos.',
  },
  {
    icon: '📺',
    title: 'Live Stream Support',
    description: 'Real-time message board updates for YouTube live streams.',
  },
  {
    icon: '📈',
    title: 'Analytics',
    description: 'View sentiment distribution, bot detection, engagement metrics.',
  },
];

const LandingPage: React.FC = () => {
  return (
    <div className="landing-page">
      <div className="landing-hero">
        <h1 className="landing-title">FORUMYZER</h1>
        <p className="landing-subtitle">Transform YouTube Comments into Organized Forums</p>
      </div>

      <div className="features-grid">
        {features.map((feature, index) => (
          <div
            key={index}
            className={`feature-card ${feature.highlighted ? 'feature-highlighted' : ''}`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="feature-icon">{feature.icon}</div>
            <h3 className="feature-title">{feature.title}</h3>
            <p className="feature-description">{feature.description}</p>
          </div>
        ))}
      </div>

      <div className="landing-cta">
        <button className="cta-button">Get Started</button>
      </div>
    </div>
  );
};

export default LandingPage;
