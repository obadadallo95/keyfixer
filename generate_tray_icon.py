import subprocess
import os

def create_tray_svg():
    # 36x36 canvas (for @2x Retina Status Bar)
    # Pure black shapes on transparent background for macOS Template Image
    svg_content = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" width="36" height="36">
  <!-- Key outline -->
  <rect x="2" y="2" width="32" height="32" rx="7" ry="7" fill="none" stroke="#000000" stroke-width="2.5"/>
  
  <!-- "ع" vector path / text -->
  <text x="11" y="24" font-family="'SF Arabic', sans-serif" font-size="16" font-weight="900" fill="#000000" text-anchor="middle">ع</text>

  <!-- Arrow -->
  <path d="M 16 18 L 20 18 M 18 16 L 20 18 L 18 20" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>

  <!-- "A" text -->
  <text x="26" y="24" font-family="'SF Pro Display', sans-serif" font-size="15" font-weight="900" fill="#000000" text-anchor="middle">A</text>
</svg>
'''
    with open("tray-master.svg", "w", encoding="utf-8") as f:
        f.write(svg_content)

    os.makedirs("src-tauri/icons", exist_ok=True)
    
    # Generate 18x18 and 36x36 PNGs
    subprocess.run("rsvg-convert -w 18 -h 18 tray-master.svg -o src-tauri/icons/tray-icon.png", shell=True, check=True)
    subprocess.run("rsvg-convert -w 36 -h 36 tray-master.svg -o src-tauri/icons/tray-icon@2x.png", shell=True, check=True)
    print("Tray icons generated successfully!")

if __name__ == "__main__":
    create_tray_svg()
