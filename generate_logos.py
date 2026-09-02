import os
import zlib
import struct
import math

os.makedirs('public/teams', exist_ok=True)

def create_png(width, height, draw_fn, filename):
    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0) # Filter type 0 (None)
        for x in range(width):
            r, g, b, a = draw_fn(x, y, width, height)
            raw_data.extend([r, g, b, a])
            
    compressed = zlib.compress(bytes(raw_data))
    
    def chunk(chunk_type, data):
        c = chunk_type + data
        crc = zlib.crc32(c) & 0xffffffff
        return struct.pack('>I', len(data)) + c + struct.pack('>I', crc)
        
    png = bytearray(b'\x89PNG\r\n\x1a\n')
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    png.extend(chunk(b'IHDR', ihdr_data))
    png.extend(chunk(b'IDAT', compressed))
    png.extend(chunk(b'IEND', b''))
    
    with open(filename, 'wb') as f:
        f.write(png)
    print(f"Generated {filename}")

W, H = 256, 256

# 1. AE (Alter Ego: Red & Charcoal Shield)
def draw_ae(x, y, w, h):
    nx, ny = (x - w/2) / (w/2), (y - h/2) / (h/2)
    dist = math.sqrt(nx*nx + ny*ny)
    if dist > 0.92: return 0, 0, 0, 0
    # Shield background
    if abs(nx) < 0.85 and ny > -0.85 and ny < 0.6 + 0.35 * (1 - abs(nx)):
        if dist > 0.82: return 220, 38, 38, 255 # Red border
        if dist > 0.76: return 20, 20, 24, 255
        # Red center motif
        if abs(nx) < 0.4 and abs(ny) < 0.45:
            return 239, 68, 68, 255
        return 30, 32, 40, 255
    return 0, 0, 0, 0

# 2. BTR (Bigetron by Vitality: Red Robot Emblem)
def draw_btr(x, y, w, h):
    nx, ny = (x - w/2) / (w/2), (y - h/2) / (h/2)
    dist = math.sqrt(nx*nx + ny*ny)
    if dist > 0.9: return 0, 0, 0, 0
    # Red circle
    if dist < 0.85:
        # Antenna wings
        if (nx < -0.3 or nx > 0.3) and ny < -0.2:
            return 225, 29, 72, 255
        # Outer ring
        if dist > 0.55 and dist < 0.78:
            return 225, 29, 72, 255
        # Head core
        if math.sqrt(nx*nx + (ny+0.1)*(ny+0.1)) < 0.28:
            return 255, 255, 255, 255
        if math.sqrt(nx*nx + (ny-0.25)*(ny-0.25)) < 0.35:
            return 225, 29, 72, 255
        return 225, 29, 72, 255
    return 0, 0, 0, 0

# 3. DEWA (Dewa United: Gold & Black Crown Shield)
def draw_dewa(x, y, w, h):
    nx, ny = (x - w/2) / (w/2), (y - h/2) / (h/2)
    if abs(nx) < 0.85 and ny > -0.8 and ny < 0.75 - 0.5 * (nx*nx):
        # Gold border
        if abs(nx) > 0.72 or ny < -0.7 or ny > 0.62 - 0.5 * (nx*nx):
            return 234, 179, 8, 255
        # Inner black shield
        if abs(nx) < 0.45 and abs(ny + 0.1) < 0.25:
            return 250, 204, 21, 255 # Gold DEWA text band
        return 18, 18, 22, 255
    return 0, 0, 0, 0

# 4. EVOS (EVOS: Sky Blue & White Roaring Tiger Crest)
def draw_evos(x, y, w, h):
    nx, ny = (x - w/2) / (w/2), (y - h/2) / (h/2)
    dist = math.sqrt(nx*nx + ny*ny)
    if dist > 0.9: return 0, 0, 0, 0
    # Blue shield
    if dist < 0.85:
        if dist > 0.75: return 14, 165, 233, 255
        # White tiger mane
        if nx > -0.4 and nx < 0.5 and ny < 0.3:
            if math.sin(nx*8 + ny*8) > 0.2:
                return 255, 255, 255, 255
            return 56, 189, 248, 255
        return 3, 105, 161, 255
    return 0, 0, 0, 0

# 5. GEEK (Geek Fam: Red & Black Stylized Gentleman)
def draw_geek(x, y, w, h):
    nx, ny = (x - w/2) / (w/2), (y - h/2) / (h/2)
    dist = math.sqrt(nx*nx + ny*ny)
    if dist > 0.9: return 0, 0, 0, 0
    if dist < 0.85:
        if dist > 0.75: return 220, 38, 38, 255
        # Head / glasses / bow tie
        if ny < -0.3 and abs(nx) < 0.35: # Hair
            return 220, 38, 38, 255
        if abs(ny + 0.05) < 0.12 and abs(nx) < 0.4: # Glasses
            return 239, 68, 68, 255
        if ny > 0.3 and abs(nx) < 0.35: # Bowtie
            return 220, 38, 38, 255
        return 24, 24, 27, 255
    return 0, 0, 0, 0

# 6. NAVI (Natus Vincere: Slanted Bright Yellow)
def draw_navi(x, y, w, h):
    # Slanted parallelogram
    skew_x = (x - w/2) / (w/2) - 0.25 * ((y - h/2) / (h/2))
    ny = (y - h/2) / (h/2)
    if abs(skew_x) < 0.75 and abs(ny) < 0.65:
        if abs(skew_x) > 0.62 or abs(ny) > 0.52:
            return 15, 15, 18, 255 # Black border
        # Yellow NAVI block
        return 250, 204, 21, 255
    return 0, 0, 0, 0

# 7. ONIC (ONIC: Hedgehog Silhouette)
def draw_onic(x, y, w, h):
    nx, ny = (x - w/2) / (w/2), (y - h/2) / (h/2)
    dist = math.sqrt(nx*nx + ny*ny)
    if dist > 0.9: return 0, 0, 0, 0
    # Yellow circular badge
    if dist < 0.85:
        # Black hedgehog silhouette
        if (nx < 0.4 and ny > -0.5 and ny < 0.5):
            # spikes
            if (nx - 0.2*ny) < 0.3:
                return 15, 23, 42, 255
        return 234, 179, 8, 255
    return 0, 0, 0, 0

# 8. RRQ (RRQ Hoshi: King Orange Monogram)
def draw_rrq(x, y, w, h):
    nx, ny = (x - w/2) / (w/2), (y - h/2) / (h/2)
    dist = math.sqrt(nx*nx + ny*ny)
    if dist > 0.9: return 0, 0, 0, 0
    if dist < 0.85:
        # Orange background / RRQ double-R crown
        if abs(nx) < 0.65 and abs(ny) < 0.65:
            if (nx > -0.5 and nx < -0.05 and ny > -0.4 and ny < 0.4) or (nx > 0.05 and nx < 0.5 and ny > -0.4 and ny < 0.4):
                return 255, 255, 255, 255
            return 249, 115, 22, 255
        return 234, 88, 12, 255
    return 0, 0, 0, 0

# 9. TLID (Team Liquid ID: Navy Warhorse Shield)
def draw_tlid(x, y, w, h):
    nx, ny = (x - w/2) / (w/2), (y - h/2) / (h/2)
    if abs(nx) < 0.8 and ny > -0.8 and ny < 0.8 - 0.4 * (nx*nx):
        # White/Silver border
        if abs(nx) > 0.7 or ny < -0.72 or ny > 0.7 - 0.4 * (nx*nx):
            return 14, 165, 233, 255
        # Navy blue shield with horse head silhouette
        if (nx < 0.3 and ny > -0.4 and ny < 0.4):
            return 240, 249, 255, 255
        return 15, 32, 67, 255
    return 0, 0, 0, 0

create_png(W, H, draw_ae, 'public/teams/ae.png')
create_png(W, H, draw_btr, 'public/teams/btr.png')
create_png(W, H, draw_dewa, 'public/teams/dewa.png')
create_png(W, H, draw_evos, 'public/teams/evos.png')
create_png(W, H, draw_geek, 'public/teams/geek.png')
create_png(W, H, draw_navi, 'public/teams/navi.png')
create_png(W, H, draw_onic, 'public/teams/onic.png')
create_png(W, H, draw_rrq, 'public/teams/rrq.png')
create_png(W, H, draw_tlid, 'public/teams/tlid.png')
print("All 9 MPL ID S18 team logos successfully created in public/teams/!")
