import struct
import zlib
import os

def create_png(width, height, draw_func, filename):
    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0) # filter type 0
        for x in range(width):
            r, g, b, a = draw_func(x, y, width, height)
            raw_data.extend([r, g, b, a])
    
    compressed = zlib.compress(bytes(raw_data))
    
    def make_chunk(chunk_type, data):
        length = len(data)
        crc = zlib.crc32(chunk_type + data) & 0xffffffff
        return struct.pack('>I', length) + chunk_type + data + struct.pack('>I', crc)
    
    png = bytearray(b'\x89PNG\r\n\x1a\n')
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    png.extend(make_chunk(b'IHDR', ihdr_data))
    png.extend(make_chunk(b'IDAT', compressed))
    png.extend(make_chunk(b'IEND', b''))
    
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    with open(filename, 'wb') as f:
        f.write(png)
    print(f"Generated {filename} ({width}x{height})")

def draw_keyfixer_icon(x, y, w, h):
    # Normalized coordinates 0.0 to 1.0
    nx = x / (w - 1) if w > 1 else 0.5
    ny = y / (h - 1) if h > 1 else 0.5
    
    # Outer rounded box bounds (padding 10%)
    pad = 0.08
    corner_r = 0.2
    
    # Distance from rounded rect
    dx = max(0, abs(nx - 0.5) - (0.5 - pad - corner_r))
    dy = max(0, abs(ny - 0.5) - (0.5 - pad - corner_r))
    dist = (dx*dx + dy*dy)**0.5
    
    inside_bg = dist <= corner_r
    
    if not inside_bg:
        return (0, 0, 0, 0) # Transparent outside
    
    # Border check
    border_dist = abs(dist - corner_r) if (abs(nx - 0.5) > (0.5 - pad - corner_r) and abs(ny - 0.5) > (0.5 - pad - corner_r)) else max(abs(nx - 0.5) - (0.5 - pad), abs(ny - 0.5) - (0.5 - pad))
    
    # Dark slate background #0f172a
    bg_r, bg_g, bg_b = 15, 23, 42
    
    # Amber accent #f59e0b
    amb_r, amb_g, amb_b = 245, 158, 11
    
    # Draw keycap shape inside (0.25 to 0.75)
    kx = (nx - 0.5) / 0.35
    ky = (ny - 0.5) / 0.35
    
    is_keycap = abs(kx) <= 1.0 and abs(ky) <= 1.0
    is_keycap_border = is_keycap and (abs(abs(kx) - 1.0) < 0.15 or abs(abs(ky) - 1.0) < 0.15)
    
    # Top amber bar for keyboard key aesthetic
    is_top_bar = abs(kx) <= 0.6 and ky >= -0.6 and ky <= -0.2
    
    if is_top_bar or is_keycap_border:
        return (amb_r, amb_g, amb_b, 255)
    elif is_keycap:
        # Keycap inner fill: darker amber #451a03
        return (50, 30, 10, 255)
    
    # Background fill
    return (bg_r, bg_g, bg_b, 255)

for size in [16, 32, 48, 128]:
    create_png(size, size, draw_keyfixer_icon, f'extension/assets/icon{size}.png')
