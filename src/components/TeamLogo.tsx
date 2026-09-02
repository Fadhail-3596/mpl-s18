import React, { useState } from 'react';
import { TeamId } from '../types';
import { getTeam } from '../data/teams';

interface TeamLogoProps {
  teamId: TeamId | string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  className?: string;
  alt?: string;
}

const sizeClasses = {
  sm: 'w-6 h-6 text-[9px]',
  md: 'w-9 h-9 text-xs',
  lg: 'w-13 h-13 sm:w-14 sm:h-14 text-sm',
  xl: 'w-18 h-18 sm:w-20 sm:h-20 text-base font-black',
  custom: ''
};

export const TeamLogo: React.FC<TeamLogoProps> = ({
  teamId,
  size = 'md',
  className = '',
  alt
}) => {
  const [srcIndex, setSrcIndex] = useState(0);
  const [imgError, setImgError] = useState(false);
  const team = getTeam(teamId);
  const sizeClass = sizeClasses[size];
  const altText = alt || `${team.name} Logo`;
  
  // Prioritize user-provided .png files, fallback to .svg, then CSS avatar
  const sources = [
    `/teams/${team.id.toLowerCase()}.png`,
    `/teams/${team.id.toLowerCase()}.svg`
  ];

  // Reset error when teamId changes
  React.useEffect(() => {
    setSrcIndex(0);
    setImgError(false);
  }, [team.id]);

  const handleImgError = () => {
    if (srcIndex < sources.length - 1) {
      setSrcIndex((prev) => prev + 1);
    } else {
      setImgError(true);
    }
  };

  if (imgError || !team.id) {
    return (
      <div
        className={`relative inline-flex items-center justify-center rounded-xl font-bold uppercase tracking-wider select-none shrink-0 shadow-sm transition-transform duration-200 ${sizeClass} ${className}`}
        style={{
          background: `linear-gradient(135deg, ${team.primaryColor}25, ${team.secondaryColor || team.primaryColor}55)`,
          border: `1.5px solid ${team.primaryColor}80`,
          color: team.accentColor || '#ffffff'
        }}
        title={team.name}
      >
        <span>{team.shortName || team.id?.toUpperCase() || '??'}</span>
      </div>
    );
  }

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-xl overflow-hidden bg-slate-900/60 shrink-0 border border-slate-700/50 shadow-sm transition-transform duration-200 hover:scale-105 ${sizeClass} ${className}`}
      style={{
        boxShadow: `0 0 12px ${team.primaryColor}20`
      }}
    >
      <img
        src={sources[srcIndex]}
        alt={altText}
        className="w-full h-full object-contain p-0.5"
        onError={handleImgError}
        loading="lazy"
      />
    </div>
  );
};
