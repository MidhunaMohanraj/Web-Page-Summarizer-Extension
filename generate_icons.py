#!/usr/bin/env python3
"""Generate simple placeholder PNG icons for the extension."""
import os, struct, zlib

def make_png(size, color=(124, 111, 239)):
    """Create a minimal solid-color PNG."""
    def chunk(name, data):
        c = zlib.crc32(name + data) & 0xFFFFFFFF
        return struct.pack(">I", len(data)) + name + data + struct.pack(">I", c)

    ihdr = struct.pack(">IIBBBBB", size, size, 8, 2, 0, 0, 0)
    raw = b""
    for _ in range(size):
        row = b"\x00" + bytes(color) * size
        raw += row
    idat = zlib.compress(raw)

    return (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", ihdr)
        + chunk(b"IDAT", idat)
        + chunk(b"IEND", b"")
    )

os.makedirs("icons", exist_ok=True)
for s in [16, 48, 128]:
    with open(f"icons/icon{s}.png", "wb") as f:
        f.write(make_png(s))
    print(f"Created icons/icon{s}.png")
