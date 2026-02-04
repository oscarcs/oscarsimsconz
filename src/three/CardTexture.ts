import { CanvasTexture, SRGBColorSpace } from 'three/webgpu';

const WIDTH = 1024;
const HEIGHT = 1434; // Playing card ratio 2.5:3.5

function roundRect(
    ctx: OffscreenCanvasRenderingContext2D,
    x: number, y: number, w: number, h: number, r: number,
) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

export async function createCardTexture(): Promise<CanvasTexture> {
    await document.fonts.ready;

    const canvas = new OffscreenCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext('2d')!;

    // Background — off-white card face
    const r = 40;
    roundRect(ctx, 0, 0, WIDTH, HEIGHT, r);
    ctx.fillStyle = '#f5f2eb';
    ctx.fill();

    // Thin border
    roundRect(ctx, 8, 8, WIDTH - 16, HEIGHT - 16, r - 4);
    ctx.strokeStyle = '#c8c4ba';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Inner border
    const inset = 48;
    roundRect(ctx, inset, inset, WIDTH - inset * 2, HEIGHT - inset * 2, 24);
    ctx.strokeStyle = '#d8d4ca';
    ctx.lineWidth = 2;
    ctx.stroke();

    const cx = WIDTH / 2;

    // Name
    ctx.fillStyle = '#1a1a1a';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = "bold 82px 'DM Sans', sans-serif";
    ctx.fillText('Oscar Sims', cx, 320);

    // Title
    ctx.fillStyle = '#444';
    ctx.font = "italic 48px 'Cormorant', serif";
    ctx.fillText('Software Engineer', cx, 420);

    // Divider
    const divY = 510;
    const divW = 320;
    ctx.beginPath();
    ctx.moveTo(cx - divW / 2, divY);
    ctx.lineTo(cx + divW / 2, divY);
    ctx.strokeStyle = '#c8c4ba';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Contact lines
    ctx.fillStyle = '#555';
    ctx.font = "36px 'DM Sans', sans-serif";
    const lines = [
        'Melbourne, Australia',
        'oscar@oscarsims.co.nz',
        'Antipodean Systems OÜ',
        'github.com/oscarcs',
    ];
    lines.forEach((line, i) => {
        ctx.fillText(line, cx, 610 + i * 70);
    });

    // Small decorative dots (card suit motif)
    ctx.fillStyle = '#c8c4ba';
    ctx.font = '48px serif';
    ctx.fillText('♠', cx, 1000);

    // Bottom decorative text
    ctx.fillStyle = '#999';
    ctx.font = "italic 30px 'Cormorant', serif";
    ctx.fillText('oscarsims.co.nz', cx, 1120);

    const texture = new CanvasTexture(canvas as unknown as HTMLCanvasElement);
    texture.colorSpace = SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
}
