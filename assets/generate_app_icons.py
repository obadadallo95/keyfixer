import os
import subprocess

def create_svg():
    svg_content = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <defs>
    <!-- Background Squircle Gradient -->
    <linearGradient id="bgG" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1E1E24"/>
      <stop offset="100%" stop-color="#0B0B0E"/>
    </linearGradient>

    <!-- Keycap Face Gradient -->
    <linearGradient id="keyG" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#2D2D35"/>
      <stop offset="100%" stop-color="#16161A"/>
    </linearGradient>

    <!-- Gold Accent Gradient -->
    <linearGradient id="goldG" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FCD34D"/>
      <stop offset="50%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#D97706"/>
    </linearGradient>

    <!-- Top Edge Highlight -->
    <linearGradient id="highlightG" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.25"/>
      <stop offset="20%" stop-color="#FFFFFF" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
    </linearGradient>

    <!-- Keycap Glow Drop Shadow -->
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="24" stdDeviation="36" flood-color="#000000" flood-opacity="0.6"/>
      <feDropShadow dx="0" dy="0" stdDeviation="40" flood-color="#F59E0B" flood-opacity="0.2"/>
    </filter>
  </defs>

  <!-- macOS Dock Squircle Base (1024x1024, rx=230) -->
  <rect x="32" y="32" width="960" height="960" rx="220" ry="220" fill="url(#bgG)"/>
  
  <!-- Outer Subtle Rim Highlight -->
  <rect x="32" y="32" width="960" height="960" rx="220" ry="220" fill="none" stroke="url(#highlightG)" stroke-width="4"/>

  <!-- Center Keycap (3D Keyboard Key) -->
  <g filter="url(#shadow)">
    <!-- Keycap Base / Side Depth -->
    <rect x="192" y="200" width="640" height="640" rx="130" fill="#0D0D10"/>
    <!-- Keycap Top Face -->
    <rect x="192" y="180" width="640" height="630" rx="125" fill="url(#keyG)" stroke="rgba(255,255,255,0.1)" stroke-width="3"/>
    <rect x="192" y="180" width="640" height="630" rx="125" fill="url(#highlightG)"/>
  </g>

  <!-- Arabic Glyph "ع" (Left Side) -->
  <text x="350" y="580" 
        font-family="'SF Arabic', 'Noto Naskh Arabic', 'Cairo', 'Arial Unicode MS', sans-serif" 
        font-size="280" 
        font-weight="900" 
        fill="url(#goldG)" 
        text-anchor="middle" 
        dominant-baseline="middle">ع</text>

  <!-- Conversion Arrow (Center) -->
  <g stroke="url(#goldG)" stroke-width="26" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <!-- Top Arrow: Right to Left -->
    <line x1="440" y1="460" x2="584" y2="460"/>
    <path d="M470 425 L435 460 L470 495"/>
    
    <!-- Bottom Arrow: Left to Right -->
    <line x1="440" y1="530" x2="584" y2="530"/>
    <path d="M554 495 L589 530 L554 565"/>
  </g>

  <!-- English Glyph "A" (Right Side) -->
  <text x="674" y="565" 
        font-family="'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" 
        font-size="270" 
        font-weight="900" 
        fill="url(#goldG)" 
        text-anchor="middle" 
        dominant-baseline="middle">A</text>
</svg>
'''
    with open("master-icon.svg", "w", encoding="utf-8") as f:
        f.write(svg_content)
    print("Created master-icon.svg")

def generate_icons():
    create_svg()

    # Create iconset directory for macOS iconutil
    iconset_dir = "KeyFixer.iconset"
    os.makedirs(iconset_dir, exist_ok=True)
    os.makedirs("src-tauri/icons", exist_ok=True)
    os.makedirs("public", exist_ok=True)

    sizes = [
        ("icon_16x16.png", 16),
        ("icon_16x16@2x.png", 32),
        ("icon_32x32.png", 32),
        ("icon_32x32@2x.png", 64),
        ("icon_128x128.png", 128),
        ("icon_128x128@2x.png", 256),
        ("icon_256x256.png", 256),
        ("icon_256x256@2x.png", 512),
        ("icon_512x512.png", 512),
        ("icon_512x512@2x.png", 1024),
    ]

    for fname, size in sizes:
        out_path = os.path.join(iconset_dir, fname)
        cmd = f"rsvg-convert -w {size} -h {size} master-icon.svg -o '{out_path}'"
        subprocess.run(cmd, shell=True, check=True)

    print("Generated all iconset PNGs")

    # Generate native macOS .icns file
    icns_cmd = f"iconutil -c icns {iconset_dir} -o src-tauri/icons/icon.icns"
    subprocess.run(icns_cmd, shell=True, check=True)
    print("Created src-tauri/icons/icon.icns")

    # Copy files to src-tauri/icons
    subprocess.run(f"cp {iconset_dir}/icon_512x512@2x.png src-tauri/icons/icon.png", shell=True, check=True)
    subprocess.run(f"cp {iconset_dir}/icon_512x512.png src-tauri/icons/icon_512x512.png", shell=True, check=True)
    subprocess.run(f"cp {iconset_dir}/icon_256x256.png src-tauri/icons/icon_256x256.png", shell=True, check=True)
    subprocess.run(f"cp {iconset_dir}/icon_128x128.png src-tauri/icons/icon_128x128.png", shell=True, check=True)
    subprocess.run(f"cp {iconset_dir}/icon_32x32.png src-tauri/icons/icon_32x32.png", shell=True, check=True)
    subprocess.run(f"cp {iconset_dir}/icon_16x16.png src-tauri/icons/icon_16x16.png", shell=True, check=True)

    # Copy files to public/ for web
    subprocess.run(f"cp {iconset_dir}/icon_512x512.png public/icon-512.png", shell=True, check=True)
    subprocess.run(f"cp {iconset_dir}/icon_128x128.png public/apple-touch-icon.png", shell=True, check=True)
    subprocess.run(f"cp {iconset_dir}/icon_32x32.png public/favicon-32x32.png", shell=True, check=True)
    subprocess.run(f"cp {iconset_dir}/icon_16x16.png public/favicon-16x16.png", shell=True, check=True)
    subprocess.run(f"cp master-icon.svg public/logo-icon.svg", shell=True, check=True)

    print("All icons successfully generated and placed!")

if __name__ == "__main__":
    generate_icons()
