import React, { useState } from 'react';
import { TeamId } from '../types';
import { getTeam } from '../data/teams';

interface TeamLogoProps {
  teamId: TeamId | string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'match' | 'custom';
  className?: string;
  alt?: string;
}

const sizeClasses = {
  xs: 'w-7 h-7 min-w-[28px] min-h-[28px] text-[9px]',
  sm: 'w-8 h-8 min-w-[32px] min-h-[32px] text-[10px]',
  match: 'w-8 h-8 sm:w-10 sm:h-10 min-w-[32px] min-h-[32px] sm:min-w-[40px] sm:min-h-[40px] text-xs',
  md: 'w-8 h-8 sm:w-10 sm:h-10 min-w-[32px] min-h-[32px] sm:min-w-[40px] sm:min-h-[40px] text-xs',
  lg: 'w-10 h-10 sm:w-12 sm:h-12 min-w-[40px] min-h-[40px] sm:min-w-[48px] sm:min-h-[48px] text-sm',
  xl: 'w-12 h-12 sm:w-14 sm:h-14 min-w-[48px] min-h-[48px] sm:min-w-[56px] sm:min-h-[56px] text-base font-black',
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
