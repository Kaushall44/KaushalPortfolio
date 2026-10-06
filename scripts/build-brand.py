from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FONT = Path('C:/Windows/Fonts')
def font(size, bold=False):
    return ImageFont.truetype(str(FONT / ('arialbd.ttf' if bold else 'arial.ttf')), size)

def logo(size):
    im = Image.new('RGB', (size, size), '#10131b')
    d = ImageDraw.Draw(im)
    scale = size / 64
    d.line([(18*scale,15*scale),(18*scale,49*scale)], fill='#f0732d', width=round(7*scale))
    d.line([(43*scale,16*scale),(23*scale,32*scale),(45*scale,49*scale)], fill='#f0732d', width=round(7*scale), joint='curve')
    return im

for size, name in [(192,'logo192.png'), (512,'logo512.png'), (180,'apple-touch-icon.png')]:
    logo(size).save(ROOT / 'public' / name)
logo(256).save(ROOT / 'public/favicon.ico', sizes=[(16,16),(32,32),(48,48),(64,64),(256,256)])
im = Image.new('RGB', (1200,630), '#10131b')
d = ImageDraw.Draw(im)
for x in range(0,1200,40): d.line((x,0,x,630),fill='#181c26')
for y in range(0,630,40): d.line((0,y,1200,y),fill='#181c26')
d.rounded_rectangle((62,67,119,124),radius=14,fill='#f0732d')
d.text((79,72),'K',font=font(37,True),fill='#10131b')
d.text((143,82),'KAUSHALL44 / PORTFOLIO',font=font(23),fill='#f6ad7e')
d.text((63,213),'Kaushal Raj Gupta',font=font(77,True),fill='#f9fafb')
d.text((67,324),'Full Stack Developer & Cybersecurity Enthusiast',font=font(32),fill='#adb7c8')
d.line((67,455,1130,455),fill='#343945',width=2)
d.text((67,501),'Build. Learn. Secure.',font=font(33,True),fill='#f0732d')
d.text((734,511),'kaushalrajgupta.is-a.dev',font=font(25),fill='#adb7c8')
im.save(ROOT / 'public/og-image.png')
print('Created monogram icons and 1200 x 630 social preview.')
