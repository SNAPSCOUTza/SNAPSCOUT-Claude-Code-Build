#!/usr/bin/env python3
"""
Generate iPhone device frame template PNG.
Output: assets/device_frame.png — standalone device image (not positioned on canvas).
compose.py positions this dynamically based on text height.
"""

from PIL import Image, ImageDraw, ImageChops

# ── Device dimensions (styled after iPhone 16 Pro proportions) ──────
# Width is ~80% of 1290 canvas, matching reference screenshots
DEVICE_W = 1030
DEVICE_H = 2800           # tall enough to bleed off any canvas
DEVICE_CORNER_R = 82      # slightly rounder squircle, closer to 16 Pro
BEZEL = 11                # thinner bezel - 16 Pro has the thinnest bezels yet
SCREEN_CORNER_R = 68
DI_W = 150               # Dynamic Island is wider/more pill-shaped on 16 Pro
DI_H = 40
DI_TOP = 16              # offset from top of screen

SCREEN_W = DEVICE_W - 2 * BEZEL
SCREEN_H = DEVICE_H - 2 * BEZEL

# Black Titanium finish - a dark warm-neutral grey, not flat black
TITANIUM_OUTER = (58, 56, 54, 255)
TITANIUM_INNER = (24, 23, 22, 255)
TITANIUM_EDGE_HIGHLIGHT = (82, 80, 77, 255)


def generate():
    frame = Image.new("RGBA", (DEVICE_W, DEVICE_H), (0, 0, 0, 0))
    fd = ImageDraw.Draw(frame)

    # ── Device body (titanium outer edge, near-black inner bezel) ───
    fd.rounded_rectangle(
        [0, 0, DEVICE_W - 1, DEVICE_H - 1],
        radius=DEVICE_CORNER_R,
        fill=TITANIUM_OUTER,
    )
    # Thin brushed-titanium highlight ring, 2px in from the outer edge
    fd.rounded_rectangle(
        [2, 2, DEVICE_W - 3, DEVICE_H - 3],
        radius=DEVICE_CORNER_R - 2,
        outline=TITANIUM_EDGE_HIGHLIGHT,
        width=2,
    )
    fd.rounded_rectangle(
        [5, 5, DEVICE_W - 6, DEVICE_H - 6],
        radius=DEVICE_CORNER_R - 5,
        fill=TITANIUM_INNER,
    )

    # ── Screen cutout (transparent) ─────────────────────────────────
    screen_x = BEZEL
    screen_y = BEZEL

    cutout = Image.new("L", (DEVICE_W, DEVICE_H), 255)
    ImageDraw.Draw(cutout).rounded_rectangle(
        [screen_x, screen_y, screen_x + SCREEN_W, screen_y + SCREEN_H],
        radius=SCREEN_CORNER_R,
        fill=0,
    )
    frame.putalpha(ImageChops.multiply(frame.getchannel("A"), cutout))

    # ── Dynamic Island ──────────────────────────────────────────────
    di_x = (DEVICE_W - DI_W) // 2
    di_y = screen_y + DI_TOP
    ImageDraw.Draw(frame).rounded_rectangle(
        [di_x, di_y, di_x + DI_W, di_y + DI_H],
        radius=DI_H // 2,
        fill=(0, 0, 0, 255),
    )

    # ── Side buttons (titanium-toned, not flat black plastic) ───────
    btn_color = (70, 68, 65, 255)
    fd2 = ImageDraw.Draw(frame)

    # Power button (right side)
    fd2.rounded_rectangle(
        [DEVICE_W, 340, DEVICE_W + 4, 460],
        radius=2, fill=btn_color,
    )
    # Camera Control button (right side, below power - new on iPhone 16/16 Pro)
    fd2.rounded_rectangle(
        [DEVICE_W, 510, DEVICE_W + 4, 580],
        radius=3, fill=btn_color,
    )
    # Volume up (left side)
    fd2.rounded_rectangle(
        [-4, 280, 0, 360],
        radius=2, fill=btn_color,
    )
    # Volume down (left side)
    fd2.rounded_rectangle(
        [-4, 380, 0, 460],
        radius=2, fill=btn_color,
    )
    # Action button (left side, replaced the mute switch from iPhone 15 Pro onward)
    fd2.rounded_rectangle(
        [-4, 180, 0, 220],
        radius=2, fill=btn_color,
    )

    out = "assets/device_frame.png"
    frame.save(out, "PNG")
    print(f"✓ {out} ({DEVICE_W}×{DEVICE_H})")
    print(f"  BEZEL={BEZEL}, SCREEN_W={SCREEN_W}, SCREEN_H={SCREEN_H}")
    print(f"  SCREEN_CORNER_R={SCREEN_CORNER_R}")


if __name__ == "__main__":
    generate()
