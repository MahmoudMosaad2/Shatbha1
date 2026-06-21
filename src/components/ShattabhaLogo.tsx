import React from 'react';

interface ShattabhaLogoProps {
  className?: string;       // Default size/style classes
  showText?: boolean;       // Whether to show "Shattabha" text
  textColor?: string;       // Custom classes for text color
  textSize?: string;        // Custom classes for text size
  iconOnly?: boolean;       // If true, render just the SVG icon without flex wrapper
}

export function ShattabhaLogo({
  className = "w-10 h-10",
  showText = false,
  textColor = "text-[#2B4D89]",
  textSize = "text-xl sm:text-2xl",
  iconOnly = false
}: ShattabhaLogoProps) {
  
  const svgIcon = (
    <svg
      className={className}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      referrerPolicy="no-referrer"
    >
      <defs>
        {/* Sky/Metallic Blue linear gradient with 4 stops for a high-gloss 3D effect */}
        <linearGradient id="blueRibbonGrad" x1="138" y1="55" x2="58" y2="110" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />     {/* Bright cyan-blue highlighting edge */}
          <stop offset="35%" stopColor="#0EA5E9" />    {/* Primary bright sky blue */}
          <stop offset="75%" stopColor="#0284C7" />    {/* Matte cobalt blue */}
          <stop offset="100%" stopColor="#1E3A8A" />   {/* Deep shadows at transition nodes */}
        </linearGradient>

        {/* Outer Highlight for 3D curved glow on Blue ribbon */}
        <linearGradient id="blueGlowGrad" x1="60" y1="110" x2="138" y2="55" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7DD3FC" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#0369A1" stopOpacity="0" />
        </linearGradient>
        
        {/* Shaded pocket gradient inside the blue ribbon loop */}
        <linearGradient id="blueShadowGrad" x1="58" y1="110" x2="88" y2="125" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0B1E43" />
          <stop offset="100%" stopColor="#1E40AF" stopOpacity="0.2" />
        </linearGradient>

        {/* Symmetrical cadmium-amber gold gradient for the bottom ribbon */}
        <linearGradient id="goldRibbonGrad" x1="62" y1="145" x2="142" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE047" />     {/* Brilliant yellow-gold highlighting edge */}
          <stop offset="35%" stopColor="#EAB308" />    {/* Rich classic golden hue */}
          <stop offset="75%" stopColor="#CA8A04" />    {/* Honeyed bronze tone */}
          <stop offset="100%" stopColor="#854D0E" />   {/* Burnt amber/shadowed gold */}
        </linearGradient>

        {/* Outer Highlight for 3D curved glow on Gold ribbon */}
        <linearGradient id="goldGlowGrad" x1="140" y1="90" x2="62" y2="145" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#85450A" stopOpacity="0" />
        </linearGradient>
        
        {/* Shaded pocket gradient inside the golden ribbon loop */}
        <linearGradient id="goldShadowGrad" x1="142" y1="90" x2="112" y2="75" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#451A03" />
          <stop offset="100%" stopColor="#B45309" stopOpacity="0.2" />
        </linearGradient>
        
        {/* Soft elegant drop shadow filter for clean depth */}
        <filter id="logoDepthShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="1" dy="3.5" stdDeviation="4.5" floodColor="#0F172A" floodOpacity="0.09" />
        </filter>
      </defs>

      <g filter="url(#logoDepthShadow)">
        {/* 1. BLUE RIBBON ASSEMBLY */}
        {/* Inside shaded fold of blue ribbon */}
        <path 
          d="M58,110 C50,126 68,132 88,125 C75,123 66,115 58,110 Z" 
          fill="url(#blueShadowGrad)" 
        />
        {/* Main outer blue ribbon body: Swoops and loops */}
        <path 
          d="M138,55 C108,63 70,85 58,110 C46,135 70,135 88,125 C102,117 114,107 122,100 C108,103 92,108 82,112 C68,118 62,114 65,103 C68,91 100,72 138,55 Z" 
          fill="url(#blueRibbonGrad)" 
        />
        {/* Blue Gloss/Glow highlight layer */}
        <path 
          d="M138,55 C108,63 70,85 58,110 C53,121 68,125 80,118 C70,112 68,105 70,101 C73,89 100,72 138,55 Z" 
          fill="url(#blueGlowGrad)" 
          opacity="0.65"
          style={{ mixBlendMode: 'overlay' }} 
        />

        {/* 2. GOLD RIBBON ASSEMBLY */}
        {/* Inside shaded fold of gold ribbon */}
        <path 
          d="M142,90 C150,74 132,68 112,75 C125,77 134,85 142,90 Z" 
          fill="url(#goldShadowGrad)" 
        />
        {/* Main outer gold ribbon body: Swoops and loops (Mathematical centroid symmetry mirror) */}
        <path 
          d="M62,145 C92,137 130,115 142,90 C154,65 130,65 112,75 C98,83 86,93 78,100 C92,97 108,92 118,88 C132,82 138,86 135,97 C132,109 100,128 62,145 Z" 
          fill="url(#goldRibbonGrad)" 
        />
        {/* Gold Gloss/Glow highlight layer */}
        <path 
          d="M62,145 C92,137 130,115 142,90 C147,79 132,75 120,82 C130,88 132,95 130,99 C127,111 100,128 62,145 Z" 
          fill="url(#goldGlowGrad)" 
          opacity="0.65"
          style={{ mixBlendMode: 'overlay' }} 
        />
      </g>
    </svg>
  );

  if (iconOnly) {
    return svgIcon;
  }

  return (
    <div className="flex items-center gap-2 select-none inline-flex shrink-0">
      {svgIcon}
      {showText && (
        <span className={`font-black tracking-tight font-sans ${textColor} ${textSize}`}>
          Shattbha
        </span>
      )}
    </div>
  );
}
