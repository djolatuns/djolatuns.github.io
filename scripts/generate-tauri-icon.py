#!/usr/bin/env python3
"""Generate the DJ Olatuns black-and-gold native app icon without third-party packages."""
from pathlib import Path
import math
import struct
import zlib

SIZE = 512
BLACK = (7, 7, 7)
GOLD = (214, 178, 87)
pixels = bytearray(BLACK * (SIZE * SIZE))

def set_pixel(x, y, color):
    if 0 <= x < SIZE and 0 <= y < SIZE:
        offset = (y * SIZE + x) * 3
        pixels[offset:offset + 3] = bytes(color)

# Circular gold frame.
cx = cy = SIZE // 2
for y in range(SIZE):
    for x in range(SIZE):
        distance = (x - cx) ** 2 + (y - cy) ** 2
        if 218 ** 2 <= distance <= 230 ** 2:
            set_pixel(x, y, GOLD)
        elif 204 ** 2 <= distance <= 207 ** 2:
            set_pixel(x, y, (110, 82, 32))

# Bold 5x7 bitmap lettering.
font = {
    "D": ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
    "J": ["00111", "00010", "00010", "00010", "10010", "10010", "01100"],
}
scale = 34
gap = scale
text_width = 11 * scale
start_x = (SIZE - text_width) // 2
start_y = 132
for letter_index, letter in enumerate("DJ"):
    pattern = font[letter]
    base_x = start_x + letter_index * (5 * scale + gap)
    for row, line in enumerate(pattern):
        for col, bit in enumerate(line):
            if bit == "1":
                x0 = base_x + col * scale
                y0 = start_y + row * scale
                for yy in range(y0, y0 + scale):
                    for xx in range(x0, x0 + scale):
                        set_pixel(xx, yy, GOLD)

# Equalizer bars beneath the initials.
heights = [18, 30, 44, 30, 18]
bar_width = 16
bar_gap = 12
total_width = 5 * bar_width + 4 * bar_gap
bar_x = (SIZE - total_width) // 2
base_y = 430
for index, height in enumerate(heights):
    x0 = bar_x + index * (bar_width + bar_gap)
    for y in range(base_y - height, base_y):
        for x in range(x0, x0 + bar_width):
            set_pixel(x, y, GOLD)

def png_chunk(kind, data):
    return (
        struct.pack(">I", len(data))
        + kind
        + data
        + struct.pack(">I", zlib.crc32(kind + data) & 0xFFFFFFFF)
    )

rows = bytearray()
stride = SIZE * 3
for y in range(SIZE):
    rows.append(0)
    start = y * stride
    rows.extend(pixels[start:start + stride])

header = struct.pack(">IIBBBBB", SIZE, SIZE, 8, 2, 0, 0, 0)
png = (
    b"\x89PNG\r\n\x1a\n"
    + png_chunk(b"IHDR", header)
    + png_chunk(b"IDAT", zlib.compress(bytes(rows), 9))
    + png_chunk(b"IEND", b"")
)
output = Path("src-tauri/icons/icon.png")
output.parent.mkdir(parents=True, exist_ok=True)
output.write_bytes(png)
print(f"Generated valid {SIZE}x{SIZE} DJ Olatuns PNG icon: {output} ({len(png)} bytes)")
