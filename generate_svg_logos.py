import os

os.makedirs('public/teams', exist_ok=True)

# 1. Alter Ego (AE)
ae_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="100%" height="100%">
  <defs>
    <linearGradient id="ae-bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#E50914" />
      <stop offset="100%" stop-color="#8B0000" />
    </linearGradient>
  </defs>
  <!-- Outer Shield Crest -->
  <path d="M 40 40 L 216 40 L 236 120 C 236 180 180 230 128 245 C 76 230 20 180 20 120 Z" fill="#111317" stroke="url(#ae-bg)" stroke-width="10" stroke-linejoin="round" />
  
  <!-- ALTER text arch banner -->
  <path d="M 48 48 Q 128 20 208 48 L 202 85 Q 128 65 54 85 Z" fill="#990000" />
  <text x="128" y="70" font-family="'Impact', 'Arial Black', sans-serif" font-size="34" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="4">AL<tspan fill="#E50914">T</tspan>ER</text>
  
  <!-- Three Masks in Center -->
  <!-- Left Mask (Angled Smile) -->
  <g transform="translate(68, 130) rotate(-10) scale(0.6)">
    <path d="M -40 -50 C 40 -50 45 30 0 65 C -45 30 -40 -50 -40 -50 Z" fill="#9CA3AF" stroke="#1F2937" stroke-width="4"/>
    <!-- Eyes -->
    <ellipse cx="-18" cy="-10" rx="8" ry="5" fill="#111827"/>
    <circle cx="-18" cy="-10" r="3" fill="#EF4444"/>
    <ellipse cx="18" cy="-10" rx="8" ry="5" fill="#111827"/>
    <circle cx="18" cy="-10" r="3" fill="#EF4444"/>
    <!-- Smirk -->
    <path d="M -15 25 Q 0 42 20 20" stroke="#111827" stroke-width="4" fill="none" stroke-linecap="round"/>
  </g>
  
  <!-- Right Mask (Angled Sad/Stern) -->
  <g transform="translate(188, 130) rotate(10) scale(0.6)">
    <path d="M -40 -50 C 40 -50 45 30 0 65 C -45 30 -40 -50 -40 -50 Z" fill="#9CA3AF" stroke="#1F2937" stroke-width="4"/>
    <!-- Eyes -->
    <ellipse cx="-18" cy="-10" rx="8" ry="5" fill="#111827"/>
    <circle cx="-18" cy="-10" r="3" fill="#EF4444"/>
    <ellipse cx="18" cy="-10" rx="8" ry="5" fill="#111827"/>
    <circle cx="18" cy="-10" r="3" fill="#EF4444"/>
    <!-- Down mouth -->
    <path d="M -18 30 Q 0 15 18 30" stroke="#111827" stroke-width="4" fill="none" stroke-linecap="round"/>
  </g>
  
  <!-- Center Main Mask -->
  <g transform="translate(128, 135) scale(0.72)">
    <path d="M -45 -55 C 45 -55 50 35 0 75 C -50 35 -45 -55 -45 -55 Z" fill="#D1D5DB" stroke="#111827" stroke-width="5"/>
    <!-- Brow & Eyes -->
    <path d="M -30 -20 L -8 -15 M 8 -15 L 30 -20" stroke="#111827" stroke-width="4" stroke-linecap="round" />
    <ellipse cx="-20" cy="-6" rx="9" ry="6" fill="#111827"/>
    <circle cx="-20" cy="-6" r="3.5" fill="#DC2626"/>
    <ellipse cx="20" cy="-6" rx="9" ry="6" fill="#111827"/>
    <circle cx="20" cy="-6" r="3.5" fill="#DC2626"/>
    <!-- Nose line -->
    <path d="M 0 -8 L -4 15 L 4 15 Z" fill="#9CA3AF" />
    <!-- Straight firm mouth -->
    <path d="M -16 35 L 16 35" stroke="#111827" stroke-width="4" stroke-linecap="round"/>
  </g>
  
  <!-- EGO Bottom Banner -->
  <rect x="74" y="198" width="108" height="34" rx="6" fill="#111317" stroke="#E50914" stroke-width="4" />
  <text x="128" y="223" font-family="'Impact', 'Arial Black', sans-serif" font-size="24" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="4">EGO</text>
</svg>"""

# 2. Bigetron by Vitality (BTR)
btr_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="100%" height="100%">
  <!-- Top Antennas / Vitality Horns -->
  <path d="M 64 35 L 78 85 L 60 90 L 52 40 Z" fill="#E50914"/>
  <path d="M 192 35 L 178 85 L 196 90 L 204 40 Z" fill="#E50914"/>
  
  <!-- Outer Red Robot Circle -->
  <circle cx="128" cy="100" r="75" fill="none" stroke="#E50914" stroke-width="18"/>
  
  <!-- Top Head Arc -->
  <path d="M 76 68 Q 128 35 180 68" stroke="#E50914" stroke-width="14" fill="none" stroke-linecap="round"/>
  
  <!-- Inner Robot Visor / Figure -->
  <path d="M 128 65 C 114 65 106 75 106 90 C 106 108 128 118 128 118 C 128 118 150 108 150 90 C 150 75 142 65 128 65 Z" fill="#E50914"/>
  <circle cx="128" cy="85" r="16" fill="#FFFFFF"/>
  <circle cx="128" cy="85" r="8" fill="#E50914"/>
  
  <!-- Bottom Robot Chin / Wings -->
  <path d="M 104 128 L 128 150 L 152 128 L 140 120 L 128 132 L 116 120 Z" fill="#E50914"/>
  
  <!-- by VITALITY text -->
  <text x="35" y="180" font-family="'Arial', sans-serif" font-style="italic" font-weight="bold" font-size="18" fill="#E50914">by</text>
  <text x="128" y="222" font-family="'Impact', 'Arial Black', sans-serif" font-size="38" font-weight="900" fill="#E50914" text-anchor="middle" letter-spacing="4">VITALITY</text>
</svg>"""

# 3. Dewa United (DEWA)
dewa_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="100%" height="100%">
  <!-- Dewa Gold Border Shield -->
  <path d="M 25 75 C 25 55 45 50 128 45 C 211 50 231 55 231 75 L 231 160 C 231 195 180 220 128 225 C 76 220 25 195 25 160 Z" fill="#0C0D10" stroke="#C5A059" stroke-width="9" stroke-linejoin="round"/>
  
  <!-- Crown Icon on Top -->
  <path d="M 128 65 L 146 100 L 170 80 L 160 115 L 96 115 L 86 80 L 110 100 Z" fill="#D4AF37"/>
  <polygon points="128,78 138,110 118,110" fill="#FFFFFF"/>
  
  <!-- DEWA Big Block Letters -->
  <text x="128" y="110" font-family="'Impact', 'Arial Black', sans-serif" font-size="44" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3" stroke="#000000" stroke-width="2">DE<tspan fill="#C5A059">W</tspan>A</text>
  
  <!-- Gold Center Banner -->
  <rect x="36" y="122" width="184" height="52" rx="4" fill="#C5A059" stroke="#E6CA65" stroke-width="2"/>
  
  <!-- Stars -->
  <polygon points="56,148 59,140 62,148 54,143 64,143" fill="#0C0D10"/>
  <polygon points="200,148 203,140 206,148 198,143 208,143" fill="#0C0D10"/>
  
  <!-- UNITED Text -->
  <text x="128" y="160" font-family="'Impact', 'Arial Black', sans-serif" font-size="34" font-weight="900" fill="#0C0D10" text-anchor="middle" letter-spacing="4">UNITED</text>
  
  <!-- E-SPORTS Bottom Ribbon -->
  <text x="128" y="200" font-family="'Impact', 'Arial Black', sans-serif" font-size="18" font-weight="bold" fill="#C5A059" text-anchor="middle" letter-spacing="2">E - SPORTS</text>
</svg>"""

# 4. EVOS Glory (EVOS)
evos_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="100%" height="100%">
  <!-- EVOS Blue Crest Shield -->
  <path d="M 30 50 L 220 30 L 235 150 C 235 195 170 230 128 245 C 80 230 20 190 20 140 Z" fill="#0F2438" stroke="#38BDF8" stroke-width="6"/>
  
  <!-- Roaring White Tiger Head Profile -->
  <g transform="translate(15, 10)">
    <!-- Tiger Ears & Head Outline -->
    <path d="M 125 35 L 145 60 L 165 40 L 180 80 L 210 110 L 180 120 L 205 145 L 155 160 L 125 190 L 110 170 L 80 185 L 60 160 L 75 140 L 45 145 L 35 120 L 70 100 L 50 80 L 85 70 Z" fill="#FFFFFF"/>
    
    <!-- Tiger Black/Navy Fur Stripes & Jaw -->
    <path d="M 105 75 L 130 95 L 95 105 Z" fill="#0F2438"/>
    <path d="M 140 100 L 170 115 L 135 130 Z" fill="#0F2438"/>
    <path d="M 85 125 L 120 140 L 75 155 Z" fill="#0F2438"/>
    <path d="M 115 150 L 150 165 L 110 175 Z" fill="#0F2438"/>
    
    <!-- Tiger Cyan Eye -->
    <polygon points="145,95 165,85 155,100" fill="#38BDF8"/>
    
    <!-- Open Roaring Mouth & Fangs -->
    <path d="M 145 135 L 180 155 L 135 175 Z" fill="#0F2438"/>
    <polygon points="148,135 155,148 160,138" fill="#FFFFFF"/>
    <polygon points="140,172 148,160 155,170" fill="#FFFFFF"/>
    <path d="M 152 150 Q 165 152 175 158" stroke="#38BDF8" stroke-width="4" fill="none"/>
  </g>
  
  <!-- EVOS Cyan Badge at Bottom -->
  <path d="M 105 175 L 225 145 L 210 220 L 95 240 Z" fill="#0F2438" stroke="#38BDF8" stroke-width="4"/>
  <text x="160" y="215" transform="rotate(-12 160 215)" font-family="'Impact', 'Arial Black', sans-serif" font-size="42" font-weight="900" fill="#38BDF8" text-anchor="middle" letter-spacing="3">EVOS</text>
</svg>"""

# 5. Geek Fam (GEEK)
geek_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="100%" height="100%">
  <!-- Geek Shield Background -->
  <path d="M 30 70 L 128 35 L 226 70 L 215 165 C 215 195 170 225 128 235 C 86 225 41 195 41 165 Z" fill="#18181B" stroke="#DC2626" stroke-width="6"/>
  
  <!-- Pompadour Hair Style -->
  <path d="M 128 40 C 95 40 85 70 85 95 C 95 85 110 80 128 80 C 145 80 160 85 170 95 C 170 70 160 40 128 40 Z" fill="#1C1917"/>
  <!-- Red Quiff highlight -->
  <path d="M 115 42 C 105 45 110 65 128 65 C 135 65 145 55 140 45 C 132 40 122 40 115 42 Z" fill="#EF4444"/>
  
  <!-- Face (White Silhouette) -->
  <path d="M 88 95 L 168 95 C 168 135 150 155 128 155 C 106 155 88 135 88 95 Z" fill="#F4F4F5"/>
  
  <!-- Red Sunglasses -->
  <rect x="92" y="102" width="32" height="20" rx="4" fill="#EF4444" stroke="#18181B" stroke-width="3"/>
  <rect x="132" y="102" width="32" height="20" rx="4" fill="#EF4444" stroke="#18181B" stroke-width="3"/>
  <line x1="124" y1="110" x2="132" y2="110" stroke="#18181B" stroke-width="4"/>
  
  <!-- Red Bowtie -->
  <polygon points="112,160 128,168 112,176" fill="#EF4444"/>
  <polygon points="144,160 128,168 144,176" fill="#EF4444"/>
  <circle cx="128" cy="168" r="4" fill="#991B1B"/>
  
  <!-- GEEK FAM Banner Bottom -->
  <path d="M 20 155 Q 128 140 236 155 L 226 230 Q 128 245 30 230 Z" fill="#DC2626" stroke="#FFFFFF" stroke-width="3"/>
  <text x="128" y="195" font-family="'Impact', 'Arial Black', sans-serif" font-size="44" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="2">GEEK</text>
  <text x="128" y="225" font-family="'Impact', 'Arial Black', sans-serif" font-size="24" font-weight="900" fill="#18181B" text-anchor="middle" letter-spacing="3">FAM</text>
</svg>"""

# 6. NAVI (NAVI)
navi_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="100%" height="100%">
  <!-- Slanted Yellow Parallelogram -->
  <g transform="translate(15, 45) rotate(-12 110 80)">
    <!-- Black shadow / back plate -->
    <polygon points="15,15 225,15 195,145 -15,145" fill="#0C0D0E" stroke="#FFF200" stroke-width="6"/>
    
    <!-- Bold Yellow Letters: NAVI -->
    <!-- N -->
    <path d="M 22 125 L 22 35 L 44 35 L 68 95 L 68 35 L 86 35 L 86 125 L 64 125 L 40 65 L 40 125 Z" fill="#FFF200"/>
    
    <!-- A -->
    <path d="M 94 125 L 118 35 L 140 35 L 164 125 L 142 125 L 136 102 L 122 102 L 116 125 Z M 125 58 L 129 84 L 133 84 Z" fill="#FFF200"/>
    
    <!-- V -->
    <path d="M 166 35 L 184 35 L 198 100 L 212 35 L 230 35 L 208 125 L 188 125 Z" fill="#FFF200"/>
    
    <!-- I -->
    <rect x="236" y="35" width="18" height="90" fill="#FFF200"/>
  </g>
</svg>"""

# 7. FNATIC ONIC (ONIC)
onic_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="100%" height="100%">
  <!-- Fnatic ONIC Hedgehog Silhouette -->
  <!-- Aggressive Black Spikes / Hedgehog Head pointing right -->
  <path d="M 140 38 
           L 115 55 L 135 62 L 95 80 L 120 90 L 70 115 L 105 125 L 50 155 L 90 162 L 40 195 L 100 195
           C 110 175 130 175 140 195 L 160 195
           C 160 180 180 160 195 170
           L 245 80
           L 210 110
           L 215 75
           L 185 100
           L 175 60
           L 155 80 Z" 
        fill="#0A0B0E" stroke="#FACC15" stroke-width="5" stroke-linejoin="round"/>
        
  <!-- Hedgehog eye slit -->
  <polygon points="175,98 215,88 190,105" fill="#FFFFFF"/>
</svg>"""

# 8. RRQ Hoshi (RRQ)
rrq_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="100%" height="100%">
  <!-- RRQ Signature King Orange Crown Monogram (Stylized RR) -->
  <g transform="translate(10, 20)">
    <!-- Left R / Crown wing -->
    <path d="M 25 15 L 85 85 L 85 120 C 85 155 60 175 25 175 L 80 175 C 105 175 120 155 120 130 L 120 85 L 60 15 Z" fill="#F59E0B"/>
    
    <!-- Main Crown Slash & Interlocking Right R -->
    <path d="M 85 45 L 145 45 C 185 45 215 70 215 110 C 215 145 190 170 155 175 L 225 215 L 180 215 L 125 175 L 85 175 Z" fill="#F59E0B"/>
    
    <!-- Diagonal White Cutout Through RR -->
    <polygon points="45,150 145,50 155,50 55,150" fill="#08090D"/>
    
    <!-- Right R Loop Cutout -->
    <ellipse cx="150" cy="110" rx="28" ry="25" fill="#08090D"/>
  </g>
</svg>"""

# 9. Team Liquid ID (TLID)
tlid_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="100%" height="100%">
  <!-- Navy Blue Shield Container -->
  <path d="M 35 40 L 221 40 L 221 140 C 221 190 160 225 128 238 C 96 225 35 190 35 140 Z" fill="#0A182E" stroke="#003566" stroke-width="8" stroke-linejoin="round"/>
  
  <!-- Silver / White Mane Spikes in Arch -->
  <!-- Mane Segment 1 -->
  <polygon points="55,85 75,55 95,95" fill="#E2E8F0"/>
  <!-- Mane Segment 2 -->
  <polygon points="85,60 115,45 125,90" fill="#E2E8F0"/>
  <!-- Mane Segment 3 -->
  <polygon points="125,50 160,50 150,95" fill="#E2E8F0"/>
  <!-- Mane Segment 4 -->
  <polygon points="160,60 190,75 170,110" fill="#E2E8F0"/>
  
  <!-- Warhorse Head Silhouette (Dark Navy) -->
  <path d="M 75 170 
           C 75 120 100 90 145 90 
           L 155 70 
           L 175 95 
           C 185 110 190 130 180 145
           L 190 155
           L 175 165
           L 165 155
           C 155 170 140 180 120 185
           L 135 150
           L 115 155
           L 95 190 Z" fill="#E2E8F0"/>
           
  <!-- Horse Eye -->
  <polygon points="165,120 178,125 168,130" fill="#0A182E"/>
</svg>"""

with open('public/teams/ae.svg', 'w') as f: f.write(ae_svg)
with open('public/teams/btr.svg', 'w') as f: f.write(btr_svg)
with open('public/teams/dewa.svg', 'w') as f: f.write(dewa_svg)
with open('public/teams/evos.svg', 'w') as f: f.write(evos_svg)
with open('public/teams/geek.svg', 'w') as f: f.write(geek_svg)
with open('public/teams/navi.svg', 'w') as f: f.write(navi_svg)
with open('public/teams/onic.svg', 'w') as f: f.write(onic_svg)
with open('public/teams/rrq.svg', 'w') as f: f.write(rrq_svg)
with open('public/teams/tlid.svg', 'w') as f: f.write(tlid_svg)

print("Generated all 9 SVG team logos successfully!")
