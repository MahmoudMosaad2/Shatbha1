import React from 'react';

export type AvatarStyle = 'professional' | 'modern' | 'minimal' | 'futuristic';
export type AvatarState = 'idle' | 'hover' | 'active' | 'thinking' | 'responding';

interface AdamAvatarProps {
  state: AvatarState;
  style: AvatarStyle;
  theme?: 'light' | 'dark';
  className?: string;
  isMuted?: boolean;
}

export const AdamAvatar: React.FC<AdamAvatarProps> = ({
  state,
  style,
  theme = 'light',
  className = '',
}) => {
  const isThinking = state === 'thinking';
  const isResponding = state === 'responding';
  const isHovered = state === 'hover';
  const isActive = state === 'active' || isResponding || isThinking;

  // Ambient aura glow parameters based on state
  let glowColor = 'rgba(218, 192, 163, 0.25)'; // Premium warm gold ambient by default to match corporate border
  let glowIntensity = 'blur-lg opacity-75 scale-100';
  
  if (isThinking) {
    glowColor = 'rgba(245, 158, 11, 0.5)'; // Warm Amber Processing
    glowIntensity = 'blur-xl opacity-80 scale-105 animate-pulse';
  } else if (isResponding) {
    glowColor = 'rgba(59, 130, 246, 0.45)'; // Sleek response engineering blue ripple
    glowIntensity = 'blur-2xl opacity-90 scale-110 animate-ping [animation-duration:3s]';
  } else if (isHovered) {
    glowColor = 'rgba(218, 192, 163, 0.4)'; 
    glowIntensity = 'blur-lg opacity-85 scale-105';
  }

  return (
    <div className={`relative flex items-center justify-center shrink-0 select-none ${className}`}>
      
      {/* 1. Backdrop Ambient Glow Aura */}
      <div 
        className={`absolute inset-2 rounded-full transition-all duration-700 ease-in-out -z-10 ${glowIntensity}`}
        style={{
          backgroundColor: glowColor,
          boxShadow: `0 0 24px 6px ${glowColor}`,
        }}
      />

      {/* 2. Premium SVG Animation Style definitions */}
      <style>{`
        @keyframes avatarFloating {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-4px) rotate(0.4deg); }
        }
        @keyframes eyesBlink {
          0%, 8%, 92%, 100% { transform: scaleY(1); }
          4%, 96% { transform: scaleY(0.08); }
        }
        @keyframes mouthMove {
          0%, 100% { transform: scaleY(0.85); }
          50% { transform: scaleY(1.35); }
        }
        @keyframes spinnerRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .anim-char-float {
          animation: avatarFloating 5.5s ease-in-out infinite;
        }
        .anim-blink-left-eye {
          animation: eyesBlink 4.2s ease-in-out infinite;
          transform-origin: 172px 188px;
        }
        .anim-blink-right-eye {
          animation: eyesBlink 4.2s ease-in-out infinite;
          transform-origin: 228px 188px;
        }
        .anim-mouth-speaking {
          animation: mouthMove 0.35s ease-in-out infinite alternate;
          transform-origin: 200px 222px;
        }
        .anim-consulting-pulse {
          animation: spinnerRotate 30s linear infinite;
          transform-origin: 200px 200px;
        }
      `}</style>

      {/* 3. The Portrait-Matching SVG Component */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 anim-char-float"
      >
        <defs>
          {/* Gradients and Filters to capture 3D-shaded Disney/Pixar soft volumetric look */}
          
          {/* Gold champagne double background frame gradient */}
          <linearGradient id="goldFrameGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#E5DEC9" />
            <stop offset="30%" stopColor="#C5B499" />
            <stop offset="70%" stopColor="#DECFAF" />
            <stop offset="100%" stopColor="#9C896B" />
          </linearGradient>

          {/* White hardhat shininess shading gradient */}
          <linearGradient id="whiteHardhatGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="25%" stopColor="#F7F8F9" />
            <stop offset="68%" stopColor="#E9EBEE" />
            <stop offset="100%" stopColor="#CFD3DC" />
          </linearGradient>

          {/* Soft technical blue logo gradient */}
          <linearGradient id="logoBlueGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#437BB5" />
            <stop offset="100%" stopColor="#2F5FA0" />
          </linearGradient>

          {/* Rich black styling curles hairs gradient */}
          <linearGradient id="curlyHairGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#312E2B" />
            <stop offset="50%" stopColor="#1E1A17" />
            <stop offset="100%" stopColor="#0B0908" />
          </linearGradient>

          {/* Beautiful warm healthy human skin tone gradient */}
          <linearGradient id="softSkinGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFF2EC" />
            <stop offset="35%" stopColor="#FCD5C6" />
            <stop offset="75%" stopColor="#ECC0AB" />
            <stop offset="100%" stopColor="#DB9F8A" />
          </linearGradient>

          {/* Gorgeous Pixar-like warm brown/amber 3D iris gradient */}
          <radialGradient id="pixarIrisGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#EAA56B" />
            <stop offset="55%" stopColor="#B36531" />
            <stop offset="90%" stopColor="#753712" />
            <stop offset="100%" stopColor="#331200" />
          </radialGradient>

          {/* Executive Charcoal/Slaty Grey Blazer suit jacket */}
          <linearGradient id="charcoalBlazerGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6C7882" />
            <stop offset="40%" stopColor="#4D555D" />
            <stop offset="100%" stopColor="#2E3339" />
          </linearGradient>

          {/* Corporate Sky blue button-up dress shirt */}
          <linearGradient id="skyShirtGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ECF3FC" />
            <stop offset="50%" stopColor="#C9DFF9" />
            <stop offset="100%" stopColor="#A0C6F5" />
          </linearGradient>

          {/* Stylus stylus / pen visual details */}
          <linearGradient id="metalStylusBody" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#435263" />
            <stop offset="50%" stopColor="#8294A9" />
            <stop offset="100%" stopColor="#2C3745" />
          </linearGradient>

          {/* Clean dropshadow filter */}
          <filter id="softDepthShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#010A15" floodOpacity="0.12" />
          </filter>
        </defs>

        {/* 1. EXTRA-PREMIUM CHIC DOUBLE CIRCULAR GOLD REGENCY FRAME */}
        {/* Soft background solid underlayer */}
        <circle cx="200" cy="200" r="185" fill="#FAFAF9" />
        
        {/* Symmetrical golden flourishes in the framing style */}
        <g stroke="url(#goldFrameGrad)" strokeWidth="1" fill="none" opacity="0.6">
          <path d="M42 120 C 35 100, 50 80, 80 82 C 60 70, 40 85, 42 120" />
          <path d="M50 100 C 45 92, 58 84, 70 90" />
          <path d="M358 120 C 365 100, 350 80, 320 82 C 340 70, 360 85, 358 120" />
          <path d="M350 100 C 355 92, 342 84, 330 90" />
        </g>
        
        {/* Double regency circles */}
        <circle cx="200" cy="200" r="188" stroke="url(#goldFrameGrad)" strokeWidth="1.2" opacity="0.75" />
        <circle cx="200" cy="200" r="183" stroke="url(#goldFrameGrad)" strokeWidth="2.8" />
        <circle cx="200" cy="200" r="178" stroke="url(#goldFrameGrad)" strokeWidth="1" opacity="0.5" />

        {/* 2. THE PORTRAIT RECONSTRUCTION GROUP (Faithful to photo) */}
        <g id="avatar-portrait" filter="url(#softDepthShadow)">
          
          {/* A. TAILORED SUIT JACKET BLAZER & SHIRT (No safety vest!) */}
          {/* Charcoal grey elite blazer suit jacket */}
          <path 
            d="M75 350 C75 292, 110 256, 200 256 C290 256, 325 292, 325 350 L330 400 H70 Z" 
            fill="url(#charcoalBlazerGrad)" 
          />

          {/* Perfect Blazer Lapels - Left side fold */}
          <path 
            d="M125 256 L175 320 L163 400 H110 Z" 
            fill="#3F464E" 
            stroke="#2E3339" 
            strokeWidth="0.8"
          />
          {/* Perfect Blazer Lapels - Right side fold */}
          <path 
            d="M275 256 L225 320 L237 400 H290 Z" 
            fill="#3F464E" 
            stroke="#2E3339" 
            strokeWidth="0.8"
          />

          {/* Clean V-neck opening for sky blue shirt */}
          <path 
            d="M165 256 L200 312 L235 256 Z" 
            fill="url(#skyShirtGrad)" 
          />
          {/* Soft shirt shadow beneath neck */}
          <path d="M182 256 L200 282 L218 256 Z" fill="#A5CEF8" opacity="0.45" />

          {/* Light-blue crisp formal collars */}
          <path 
            d="M163 241 L195 287 L180 241 Z" 
            fill="#F2F7FE" 
            stroke="#9AC2F5" 
            strokeWidth="0.8" 
          />
          <path 
            d="M237 241 L205 287 L220 241 Z" 
            fill="#F2F7FE" 
            stroke="#9AC2F5" 
            strokeWidth="0.8" 
          />

          {/* Button strip down the shirt chest */}
          <line x1="200" y1="287" x2="200" y2="400" stroke="#7E8B9C" strokeWidth="1" opacity="0.3" />
          
          {/* Exquisite tiny button details */}
          <circle cx="200" cy="308" r="2.5" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="0.5" />
          <circle cx="200" cy="342" r="2.5" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="0.5" />
          <circle cx="200" cy="376" r="2.5" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="0.5" />


          {/* B. DETAILED SKIN SHADED HUMAN NECK */}
          <path 
            d="M172 192 L172 255 C172 255, 200 270, 228 255 L228 192 Z" 
            fill="url(#softSkinGrad)" 
          />
          {/* Realistic gradient chin shadow line */}
          <path 
            d="M172 192 C 182 206, 218 206, 228 192 C 228 206, 172 206, 172 192 Z" 
            fill="#D5957C" 
            opacity="0.6" 
          />


          {/* C. HEAD LAYER, JAW, AND EARS */}
          {/* Left Human Ear */}
          <path 
            d="M138 168 C126 168, 118 184, 127 196 C131 201, 137 198, 139 196" 
            stroke="#D3927A" 
            strokeWidth="1.2" 
            fill="url(#softSkinGrad)" 
          />
          {/* Right Human Ear */}
          <path 
            d="M262 168 C274 168, 282 184, 273 196 C269 201, 263 198, 261 196" 
            stroke="#D3927A" 
            strokeWidth="1.2" 
            fill="url(#softSkinGrad)" 
          />

          {/* Smooth, cute rounded face contour matching Pixar style */}
          <path 
            d="M136 156 Q136 233, 200 233 Q264 233, 264 156 Z" 
            fill="url(#softSkinGrad)" 
          />


          {/* D. NATURAL ADORABLE NOSE, SMILE, AND BLUSH */}
          <circle cx="158" cy="192" r="9" fill="#ED8936" opacity="0.12" />
          <circle cx="242" cy="192" r="9" fill="#ED8936" opacity="0.12" />

          {/* Shaded little nose tip with light white reflection highlight */}
          <path 
            d="M192 183 C192 177, 208 177, 208 183 Q200 187, 192 183" 
            stroke="#D3927A" 
            strokeWidth="1.2" 
            fill="#FFF2EC" 
          />
          
          {/* Warm, gentle satisfied closed-mouth human smile, exactly like the picture! */}
          <g id="avatar-mouth">
            {isResponding ? (
              <g className="anim-mouth-talk">
                <path d="M187 210 C 187 210, 189 220, 200 220 C 211 220, 213 210, 213 210 Z" fill="#6C2E15" />
                <path d="M190 211 H210 Q200 214 190 211" fill="#FFFFFF" />
              </g>
            ) : isHovered ? (
              <path d="M184 208 Q200 221, 216 208" stroke="#6C2E15" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            ) : (
              /* Soft closed smile from portrait */
              <path d="M185 208 Q200 215, 215 208" stroke="#6C2E15" strokeWidth="2" strokeLinecap="round" fill="none" />
            )}
          </g>


          {/* E. EMBARRASSINGLY BEAUTIFUL BROWN EYES & BOLD EYEBROWS */}
          <g id="human-gaze-eyes">
            {/* Arched soft black expressive eyebrows */}
            <path d="M152 163 C160 155, 175 155, 183 161" stroke="#2B1D13" strokeWidth="3.2" strokeLinecap="round" fill="none" />
            <path d="M248 163 C240 155, 225 155, 217 161" stroke="#2B1D13" strokeWidth="3.2" strokeLinecap="round" fill="none" />

            {/* Left Eye (Scaled for picture proportion: cx=172) */}
            <g className="anim-blink-left-eye">
              {/* Eyelash frame border thickness */}
              <ellipse cx="172" cy="188" rx="10.5" ry="8.5" fill="#1A202C" />
              {/* Healthy Sclera White */}
              <ellipse cx="172" cy="189" rx="9" ry="6.6" fill="#FFFFFF" />
              {/* Warm 3D Shaded Caramel Iris */}
              <circle cx="172" cy="189" r="5.6" fill="url(#pixarIrisGrad)" />
              {/* Dark Core Pupil */}
              <circle cx="172" cy="189" r="3" fill="#0B0501" />
              {/* Brilliant Volumetric Highlights */}
              <circle cx="170.2" cy="186.6" r="1.6" fill="#FFFFFF" />
              <circle cx="174" cy="191.2" r="0.8" fill="#FFFFFF" />
            </g>

            {/* Right Eye (cx=228) */}
            <g className="anim-blink-right-eye">
              <ellipse cx="228" cy="188" rx="10.5" ry="8.5" fill="#1A202C" />
              <ellipse cx="228" cy="189" rx="9" ry="6.6" fill="#FFFFFF" />
              <circle cx="228" cy="189" r="5.6" fill="url(#pixarIrisGrad)" />
              <circle cx="228" cy="189" r="3" fill="#0B0501" />
              <circle cx="226.2" cy="186.6" r="1.6" fill="#FFFFFF" />
              <circle cx="230" cy="191.2" r="0.8" fill="#FFFFFF" />
            </g>
          </g>


          {/* F. THICK, DENSE CURLY HAIR SYSTEM (Massive curls on sides and forehead) */}
          <g id="voluminous-curly-fringe">
            {/* Back base locks behind neck and shoulders */}
            <path d="M115 160 C110 180, 100 200, 110 220 Q122 200, 128 170 Z" fill="url(#curlyHairGrad)" />
            <path d="M285 160 C290 180, 300 200, 290 220 Q278 200, 272 170 Z" fill="url(#curlyHairGrad)" />

            {/* Forehead center curls peeking from helmet */}
            <path d="M158 132 C150 142, 142 153, 154 156 C162 148, 168 140, 158 132 Z" fill="url(#curlyHairGrad)" />
            <path d="M242 132 C250 142, 258 153, 246 156 C238 148, 232 140, 242 132 Z" fill="url(#curlyHairGrad)" />

            {/* Top edge curls rolling out nicely */}
            <path d="M120 141 C110 156, 118 174, 128 178 C131 162, 134 150, 120 141 Z" fill="url(#curlyHairGrad)" stroke="#1E1A17" strokeWidth="0.5" />
            <path d="M280 141 C290 156, 282 174, 272 178 C269 162, 266 150, 280 141 Z" fill="url(#curlyHairGrad)" stroke="#1E1A17" strokeWidth="0.5" />

            {/* Cheek curls framing the face */}
            <path d="M124 176 C114 186, 110 198, 120 206 C126 195, 130 185, 124 176 Z" fill="url(#curlyHairGrad)" />
            <path d="M276 176 C286 186, 290 198, 280 206 C274 195, 270 185, 276 176 Z" fill="url(#curlyHairGrad)" />

            <path d="M126 198 C118 206, 115 218, 125 224 C132 215, 134 205, 126 198 Z" fill="url(#curlyHairGrad)" />
            <path d="M274 198 C282 206, 285 218, 275 224 C268 215, 266 205, 274 198 Z" fill="url(#curlyHairGrad)" />

            <path d="M132 220 C124 228, 126 238, 136 242 C141 230, 138 222, 132 220 Z" fill="url(#curlyHairGrad)" />
            <path d="M268 220 C276 228, 274 238, 264 242 C259 230, 262 222, 268 220 Z" fill="url(#curlyHairGrad)" />

            {/* Fine forehead locks linking in the middle */}
            <path d="M174 135 C176 142, 182 147, 188 143 Q195 138, 174 135 Z" fill="url(#curlyHairGrad)" />
            <path d="M226 135 C224 142, 218 147, 212 143 Q205 138, 226 135 Z" fill="url(#curlyHairGrad)" />
          </g>


          {/* G. THE GLOSSY COGNITIVE WHITE CONSTRUCTION HELMET WITH DRAFTING EMBLEM */}
          <g id="expert-white-hardhat">
            {/* Hardhat voluminous dome shell back body */}
            <path 
              d="M128 120 C128 42, 272 42, 272 120 Z" 
              fill="url(#whiteHardhatGrad)" 
              stroke="#CFD2D9" 
              strokeWidth="1.2"
            />
            
            {/* Front safety visor brim curving out naturally */}
            <path 
              d="M116 120 C118 114, 126 110, 200 110 C274 110, 282 114, 284 120 L274 125 H126 Z" 
              fill="url(#whiteHardhatGrad)" 
              stroke="#B8BDC6" 
              strokeWidth="0.8"
            />

            {/* Vertical structural hat ribs */}
            <path d="M162 65 C 157 82, 159 102, 162 116" stroke="#CFD3DC" strokeWidth="1.5" fill="none" opacity="0.6" />
            <path d="M238 65 C 243 82, 241 102, 238 116" stroke="#CFD3DC" strokeWidth="1.5" fill="none" opacity="0.6" />

            <path d="M190 52 L190 110 L210 110 L210 52 Z" fill="url(#whiteHardhatGrad)" opacity="0.25" />

            {/* Lateral hardhat slot locks */}
            <rect x="135" y="108" width="7" height="6.2" rx="1" fill="#CFD3DC" stroke="#9FA6B2" strokeWidth="0.5" />
            <rect x="258" y="108" width="7" height="6.2" rx="1" fill="#CFD3DC" stroke="#9FA6B2" strokeWidth="0.5" />

            {/* Top reflective light glare */}
            <path d="M145 84 Q200 50 255 84 C255 84, 200 60, 145 84 Z" fill="#FFFFFF" opacity="0.45" />

            {/* ========================================================== */}
            {/* MASTERFULLY DETAILED ENGINEERING BLUE DRAFTING COMPASS LOGO */}
            {/* Identical to the picture logo: elegant drawing compass on circular gear */}
            <g id="drafting-compass-blueprint-logo" transform="translate(182, 65)" stroke="none" fill="url(#logoBlueGrad)">
              {/* Outer Circular Cogwheel Ring */}
              <circle cx="18" cy="18" r="11" stroke="url(#logoBlueGrad)" strokeWidth="2.5" fill="none" />
              
              {/* Cogwheel Gear Teeth (Symmetrical projection blocks) */}
              <rect x="16.5" y="4.2" width="3" height="3" rx="0.5" />
              <rect x="16.5" y="28.8" width="3" height="3" rx="0.5" />
              <rect x="4.2" y="16.5" width="3" height="3" rx="0.5" />
              <rect x="28.8" y="16.5" width="3" height="3" rx="0.5" />
              
              {/* Diagonals Gear teeth */}
              <g transform="rotate(45 18 18)">
                <rect x="16.5" y="4.2" width="3" height="3" rx="0.5" />
                <rect x="16.5" y="28.8" width="3" height="3" rx="0.5" />
                <rect x="4.2" y="16.5" width="3" height="3" rx="0.5" />
                <rect x="28.8" y="16.5" width="3" height="3" rx="0.5" />
              </g>

              {/* Inside core backdrop to make compass stand out */}
              <circle cx="18" cy="18" r="7.5" fill="#F3F5F8" />

              {/* Precise Drafting Compass Shape (فرجار) */}
              {/* Pivot joint head cap */}
              <circle cx="18" cy="9" r="1.8" fill="url(#logoBlueGrad)" />
              
              {/* Left leg of the compass */}
              <path d="M17.5 9.5 L12 28.5 L14.5 28.5 L18 15 Z" fill="url(#logoBlueGrad)" />
              {/* Right leg of the compass */}
              <path d="M18.5 9.5 L24 28.5 L21.5 28.5 L18 15 Z" fill="url(#logoBlueGrad)" />
              
              {/* Adjustable screw thread horizontal shaft */}
              <rect x="12" y="17.5" width="12" height="1.2" rx="0.3" fill="url(#logoBlueGrad)" />
              {/* Dial bolt in the center */}
              <circle cx="18" cy="18" r="1.1" fill="url(#logoBlueGrad)" />
            </g>
            {/* ========================================================== */}
          </g>


          {/* 3. SHIFTED ARTIFACTS AND PROPS (Exactly as modeled in picture) */}
          
          {/* A. RIGHT HAND HOLDING DETAILED ARCHITECTURAL BLUEPRINT TABLET (Left boundary) */}
          <g id="architectural-tablet" transform="translate(42, 275)" filter="url(#softDepthShadow)">
            {/* Tablet frame bezel rotated -15 degrees */}
            <rect 
              x="0" 
              y="0" 
              width="78" 
              height="102" 
              rx="6" 
              fill="#1F242F" 
              stroke="#A0AEC0" 
              strokeWidth="1.5" 
              transform="rotate(-15)" 
            />
            {/* White glowing screen displaying blueprint layout */}
            <rect 
              x="3.2" 
              y="3.2" 
              width="71.6" 
              height="95.6" 
              rx="4" 
              fill="#F8FAFC" 
              transform="rotate(-15)" 
            />

            {/* Blue floorplan drawing blueprint lines */}
            <g transform="rotate(-15)" opacity="0.85" stroke="#2B6CB0" strokeWidth="0.8" fill="none">
              <rect x="10" y="14" width="55" height="72" strokeWidth="1.2" />
              
              {/* Partition divisions */}
              <line x1="10" y1="38" x2="45" y2="38" />
              <line x1="45" y1="38" x2="45" y2="86" />
              <line x1="32" y1="38" x2="32" y2="14" />
              <line x1="45" y1="58" x2="65" y2="58" />
              
              {/* Swing doors indicators */}
              <path d="M32 30 A 8 8 0 0 1 40 38" />
              <path d="M18 38 A 8 8 0 0 1 10 46" />

              {/* Blueprint scale grids */}
              <g stroke="#718096" strokeWidth="0.5" opacity="0.6">
                <line x1="8" y1="10" x2="67" y2="10" />
                <line x1="8" y1="9" x2="8" y2="11" />
                <line x1="32" y1="9" x2="32" y2="11" />
                <line x1="67" y1="9" x2="67" y2="11" />
              </g>

              {/* Tablet camera dot */}
              <circle cx="39" cy="-1.5" r="0.8" fill="#4B5563" />
            </g>

            {/* Hands wrapping tablet borders */}
            <g id="hand-left-tablet" transform="translate(18, 75)">
              <rect x="-8" y="2" width="15" height="15" rx="6" fill="#FCDBC6" stroke="#DCA28E" strokeWidth="0.6" />
              <circle cx="-2" cy="11" r="5.2" fill="#ECC0AB" />
              <circle cx="5" cy="13" r="5.2" fill="#ECC0AB" />
              <circle cx="12" cy="15" r="4.6" fill="#DCA28E" />
            </g>
          </g>


          {/* B. LEFT HAND HOLDING THE EXECUTIVE PEN/STYLUS (Right boundary) */}
          <g id="engineering-stylus" transform="translate(242, 310)" filter="url(#softDepthShadow)">
            {/* Stylus body tilted -62 degrees gracefully */}
            <g transform="rotate(-62 25 15)">
              <rect x="0" y="3" width="7" height="65" rx="2" fill="url(#metalStylusBody)" />
              {/* Silver metal pen tip head */}
              <path d="M0 3 L3.5 -5 L7 3 Z" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="0.5" />
              {/* Blue micro ink point */}
              <polygon points="2.5,-3 3.5,-7 4.5,-2" fill="#2B6CB0" />
              {/* Stylus silver grips details */}
              <rect x="-0.5" y="12" width="8" height="2.5" fill="#CBD5E1" />
              <rect x="-0.5" y="17" width="8" height="2.5" fill="#CBD5E1" />
              {/* Silver pocket clip pin */}
              <rect x="2.2" y="38" width="2.5" height="16" fill="#94A3B8" />
            </g>

            {/* Flesh fingers wrapping the stylus pen */}
            <g id="hand-right-stylus" transform="translate(32, 22)">
              <ellipse cx="-15" cy="-2" rx="7.5" ry="5.5" fill="#FCDBC6" transform="rotate(-15)" stroke="#DB9F8A" strokeWidth="0.5" />
              {/* Index finger wrapping */}
              <rect x="-24" y="2" width="16" height="9.5" rx="4" fill="#ECC0AB" stroke="#DB9F8A" strokeWidth="0.5" transform="rotate(12)" />
              {/* Other supporting fingers */}
              <circle cx="-16" cy="12" r="5.2" fill="#ECC0AB" />
              <circle cx="-11" cy="17" r="4.6" fill="#DB9F8A" />
            </g>
          </g>

        </g>

        {/* 4. ACTIVE COMMUNICATION OVERLAYS */}
        {isResponding && (
          /* Sleek modern equalizer waves pulsing elegantly */
          <g id="chatbot-equalizer" opacity="0.9" transform="translate(142, 375)">
            <rect x="10" y="4" width="2.2" height="10" rx="1" fill="#4299E1" className="anim-mouth-speaking" />
            <rect x="18" y="4" width="2.2" height="16" rx="1" fill="#3182CE" className="anim-mouth-speaking" style={{ animationDelay: '0.1s' }} />
            <rect x="26" y="4" width="2.2" height="22" rx="1" fill="#63B3ED" className="anim-mouth-speaking" style={{ animationDelay: '0.2s' }} />
            <rect x="34" y="4" width="2.2" height="15" rx="1" fill="#3182CE" className="anim-mouth-speaking" style={{ animationDelay: '0.15s' }} />
            <rect x="42" y="4" width="2.2" height="9" rx="1" fill="#4299E1" className="anim-mouth-speaking" />
          </g>
        )}

        {isThinking && (
          /* Spinning technical concentric dashed rings on processing states */
          <g id="thinking-concentric-circles" opacity="0.3" stroke="url(#goldFrameGrad)" strokeWidth="1" fill="none" className="anim-consulting-pulse">
            <circle cx="200" cy="200" r="168" strokeDasharray="6, 30" />
            <circle cx="200" cy="200" r="158" strokeDasharray="3, 15" />
          </g>
        )}

      </svg>
    </div>
  );
};
