import { CanvasTexture, SRGBColorSpace } from 'three/webgpu';
import QRCode from 'qrcode';

const WIDTH = 1024;
const HEIGHT = 1434; // Playing card ratio 2.5:3.5

const VCARD = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    'N:Sims;Oscar;;;',
    'FN:Oscar Sims',
    'TITLE:Software Engineer',
    'EMAIL:oscar@oscarsims.co.nz',
    'URL:https://oscarsims.co.nz',
    'URL:https://github.com/oscarcs',
    'ORG:Antipodean Systems',
    'END:VCARD',
].join('\n');

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

function drawQR(
    ctx: OffscreenCanvasRenderingContext2D,
    modules: { data: Uint8Array; size: number },
    x: number, y: number, size: number,
    fg: string,
) {
    const cellSize = size / modules.size;
    ctx.fillStyle = fg;

    for (let row = 0; row < modules.size; row++) {
        for (let col = 0; col < modules.size; col++) {
            if (modules.data[row * modules.size + col]) {
                ctx.fillRect(
                    x + col * cellSize,
                    y + row * cellSize,
                    Math.ceil(cellSize),
                    Math.ceil(cellSize),
                );
            }
        }
    }
}

export async function createCardTexture(): Promise<CanvasTexture> {
    await document.fonts.ready;

    const canvas = new OffscreenCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext('2d')!;

    const outerR = 48;
    const pad = 36; // padding inside outer border
    const innerL = pad;
    const innerT = pad;
    const innerW = WIDTH - pad * 2;
    const innerH = HEIGHT - pad * 2;
    const innerR = 32;
    const frameW = 8; // thick frame lines

    // === Outer card body — deep navy ===
    roundRect(ctx, 0, 0, WIDTH, HEIGHT, outerR);
    ctx.fillStyle = '#1a1f3d';
    ctx.fill();

    // === Gold outer border ===
    roundRect(ctx, 12, 12, WIDTH - 24, HEIGHT - 24, outerR - 6);
    ctx.strokeStyle = '#c9a84c';
    ctx.lineWidth = 6;
    ctx.stroke();

    // === Inner card panel — slightly lighter navy ===
    roundRect(ctx, innerL, innerT, innerW, innerH, innerR);
    ctx.fillStyle = '#232952';
    ctx.fill();

    // === Gold inner border ===
    roundRect(ctx, innerL, innerT, innerW, innerH, innerR);
    ctx.strokeStyle = '#c9a84c';
    ctx.lineWidth = frameW;
    ctx.stroke();

    // --- Layout regions ---
    const contentL = innerL + 40;
    const contentR = innerL + innerW - 40;
    const contentW = contentR - contentL;

    // === Title bar ===
    const titleBarY = innerT + frameW / 2 + 20;
    const titleBarH = 90;

    // Title bar background — darker band
    ctx.fillStyle = '#1a1f3d';
    ctx.fillRect(contentL, titleBarY, contentW, titleBarH);

    // Title bar borders (top and bottom gold lines)
    ctx.strokeStyle = '#c9a84c';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(contentL, titleBarY);
    ctx.lineTo(contentR, titleBarY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(contentL, titleBarY + titleBarH);
    ctx.lineTo(contentR, titleBarY + titleBarH);
    ctx.stroke();

    // Title text
    ctx.fillStyle = '#e8dcc8';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = "700 52px 'DM Sans', sans-serif";
    ctx.letterSpacing = '6px';
    ctx.fillText('OSCAR SIMS', WIDTH / 2, titleBarY + titleBarH / 2 + 2);

    // === Art window — QR code ===
    const artY = titleBarY + titleBarH + 30;
    const artH = 680;

    // Art window background — dark with subtle gradient
    const artGrad = ctx.createLinearGradient(contentL, artY, contentL, artY + artH);
    artGrad.addColorStop(0, '#1e2448');
    artGrad.addColorStop(0.5, '#161a38');
    artGrad.addColorStop(1, '#1e2448');
    ctx.fillStyle = artGrad;
    roundRect(ctx, contentL, artY, contentW, artH, 12);
    ctx.fill();

    // Art window gold border
    roundRect(ctx, contentL, artY, contentW, artH, 12);
    ctx.strokeStyle = '#c9a84c';
    ctx.lineWidth = 5;
    ctx.stroke();

    // QR code — centered in art window
    const qr = QRCode.create(VCARD, { errorCorrectionLevel: 'M' });
    const qrSize = Math.min(contentW - 100, artH - 80);
    const qrX = WIDTH / 2 - qrSize / 2;
    const qrY = artY + (artH - qrSize) / 2;
    drawQR(ctx, qr.modules, qrX, qrY, qrSize, '#c9a84c');

    // === Text box ===
    const textBoxY = artY + artH + 30;
    const textBoxH = HEIGHT - pad - frameW - textBoxY - 20;

    // Text box background
    ctx.fillStyle = '#1a1f3d';
    roundRect(ctx, contentL, textBoxY, contentW, textBoxH, 12);
    ctx.fill();

    // Text box gold border
    roundRect(ctx, contentL, textBoxY, contentW, textBoxH, 12);
    ctx.strokeStyle = '#c9a84c';
    ctx.lineWidth = 5;
    ctx.stroke();

    // Divider line inside text box
    const divY = textBoxY + textBoxH / 2;
    ctx.beginPath();
    ctx.moveTo(contentL + 30, divY);
    ctx.lineTo(contentR - 30, divY);
    ctx.strokeStyle = 'rgba(201, 168, 76, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // "SOFTWARE ENGINEER" — upper half of text box
    ctx.fillStyle = '#e8dcc8';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = "600 44px 'DM Sans', sans-serif";
    ctx.letterSpacing = '8px';
    ctx.fillText('SOFTWARE ENGINEER', WIDTH / 2, textBoxY + textBoxH * 0.25 + 2);

    // "ANTIPODEAN SYSTEMS" — lower half
    ctx.fillStyle = '#8a8170';
    ctx.font = "400 36px 'DM Sans', sans-serif";
    ctx.letterSpacing = '6px';
    ctx.fillText('ANTIPODEAN SYSTEMS', WIDTH / 2, textBoxY + textBoxH * 0.72);

    const texture = new CanvasTexture(canvas as unknown as HTMLCanvasElement);
    texture.colorSpace = SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
}
