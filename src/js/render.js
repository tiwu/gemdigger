// ── Canvas rendering ─────────────────────────────────────────────────────────
import { TILES, getBiome } from './game-logic.js';
import { TILE_SIZE, GRID_WIDTH, GRID_HEIGHT, TILE_COLORS, TILE_BORDER_COLORS } from './constants.js';
import { state } from './state.js';

let canvas, ctx;
export function initRenderDom(canvasEl) {
    canvas = canvasEl;
    ctx = canvas.getContext('2d');
}

function pseudoRandom(x, y) {
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return n - Math.floor(n);
}

export function draw() {
    const player = state.player, grid = state.grid;
    const depthFrac = Math.max(0,(player.gridY-2)/(GRID_HEIGHT-3));
    const biome = getBiome(depthFrac);
    ctx.fillStyle = biome.bg;
    ctx.fillRect(0,0,canvas.width,canvas.height);

    const camX = player.x+TILE_SIZE/2-canvas.width/2;
    const camY = player.y+TILE_SIZE/2-canvas.height/2;
    const maxCamX = GRID_WIDTH*TILE_SIZE-canvas.width;
    const maxCamY = GRID_HEIGHT*TILE_SIZE-canvas.height;
    const clampedCamX = Math.max(0, Math.min(camX, maxCamX));
    const clampedCamY = Math.max(0, Math.min(camY, maxCamY));

    ctx.save();
    ctx.translate(-clampedCamX, -clampedCamY);

    const startTileX = Math.max(0, Math.floor(clampedCamX/TILE_SIZE));
    const endTileX = Math.min(GRID_WIDTH-1, Math.ceil((clampedCamX+canvas.width)/TILE_SIZE));
    const startTileY = Math.max(0, Math.floor(clampedCamY/TILE_SIZE));
    const endTileY = Math.min(GRID_HEIGHT-1, Math.ceil((clampedCamY+canvas.height)/TILE_SIZE));

    for (let y=startTileY; y<=endTileY; y++) {
        for (let x=startTileX; x<=endTileX; x++) {
            const type = grid[y][x];
            const px = x*TILE_SIZE, py = y*TILE_SIZE;
            const tileDepth = Math.max(0,(y-2)/(GRID_HEIGHT-3));
            const tileBiome = getBiome(tileDepth);
            if (type === TILES.STONE) { ctx.fillStyle = tileBiome.stoneColor; }
            else if (type === TILES.DIRT) { ctx.fillStyle = tileBiome.dirtColor; }
            else { ctx.fillStyle = TILE_COLORS[type] || '#111'; }
            ctx.fillRect(px,py,TILE_SIZE,TILE_SIZE);

            // Procedural Textures
            if (type === TILES.DIRT) {
                ctx.fillStyle = 'rgba(0,0,0,0.1)';
                for (let i=0; i<4; i++) {
                    const rx = pseudoRandom(x, y + i) * TILE_SIZE;
                    const ry = pseudoRandom(x + i, y) * TILE_SIZE;
                    ctx.fillRect(px + rx, py + ry, 2, 2);
                }
            } else if (type === TILES.STONE) {
                ctx.strokeStyle = 'rgba(255,255,255,0.1)';
                ctx.beginPath();
                ctx.moveTo(px + pseudoRandom(x, y)*10, py + pseudoRandom(y, x)*10);
                ctx.lineTo(px + TILE_SIZE - pseudoRandom(x+1, y)*10, py + TILE_SIZE - pseudoRandom(y+1, x)*10);
                ctx.stroke();
            }

            if (type !== TILES.EMPTY) {
                if (type === TILES.STONE) ctx.strokeStyle = tileBiome.stoneBorder;
                else if (type === TILES.DIRT) ctx.strokeStyle = tileBiome.dirtBorder;
                else ctx.strokeStyle = TILE_BORDER_COLORS[type] || '#000';
                ctx.lineWidth = 1;
                ctx.strokeRect(px+0.5,py+0.5,TILE_SIZE-1,TILE_SIZE-1);
            }

            if ([TILES.GOLD,TILES.DIAMOND,TILES.RUBY,TILES.EMERALD,TILES.SAPPHIRE, TILES.UNOBTAINIUM].includes(type)) {
                ctx.save();
                const emojis = {
                    [TILES.GOLD]: '🪙',
                    [TILES.DIAMOND]: '💎',
                    [TILES.RUBY]: '💍',
                    [TILES.EMERALD]: '💹',
                    [TILES.SAPPHIRE]: '💠',
                    [TILES.UNOBTAINIUM]: '🔮'
                };
                const scale = type === TILES.UNOBTAINIUM ? 0.7 : 0.55;
                ctx.font = `${TILE_SIZE * scale}px sans-serif`;
                ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.globalAlpha = type === TILES.UNOBTAINIUM ? 0.8 + 0.2*Math.sin(Date.now()/150) : 1.0;
                ctx.fillText(emojis[type], px+TILE_SIZE/2, py+TILE_SIZE/2);
                ctx.restore();
            }

            if (type === TILES.LAVA) {
                ctx.save();
                ctx.globalAlpha = 0.4+0.3*Math.sin(Date.now()/200+x*0.5);
                ctx.fillStyle = '#ff6600';
                ctx.fillRect(px+3,py+3,TILE_SIZE-6,TILE_SIZE-6);
                ctx.restore();
                ctx.save();
                ctx.fillStyle='#fff'; ctx.font=`bold ${TILE_SIZE*0.5}px sans-serif`;
                ctx.textAlign='center'; ctx.textBaseline='middle';
                ctx.fillText('🌋', px+TILE_SIZE/2, py+TILE_SIZE/2);
                ctx.restore();
            }

            if (type === TILES.UNSTABLE) {
                ctx.save();
                ctx.strokeStyle='#ff8c00'; ctx.lineWidth=1.5; ctx.globalAlpha=0.6;
                ctx.beginPath(); ctx.moveTo(px+8,py+5); ctx.lineTo(px+20,py+20); ctx.lineTo(px+15,py+35); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(px+25,py+8); ctx.lineTo(px+18,py+22); ctx.stroke();
                ctx.restore();
            }

            if (type === TILES.FUEL) {
                ctx.save();
                ctx.globalAlpha = 0.85+0.15*Math.sin(Date.now()/400);
                ctx.fillStyle='#fff'; ctx.font=`bold ${TILE_SIZE*0.55}px sans-serif`;
                ctx.textAlign='center'; ctx.textBaseline='middle';
                ctx.fillText('⛽', px+TILE_SIZE/2, py+TILE_SIZE/2);
                ctx.restore();
            }

            if (type === TILES.BASE) {
                ctx.save();
                ctx.fillStyle='#fff'; ctx.font=`bold ${TILE_SIZE*0.55}px sans-serif`;
                ctx.textAlign='center'; ctx.textBaseline='middle';
                ctx.fillText('🏠', px+TILE_SIZE/2, py+TILE_SIZE/2);
                ctx.restore();
            }

            if (type === TILES.OUTPOST) {
                ctx.save();
                ctx.globalAlpha = 0.85+0.15*Math.sin(Date.now()/350);
                ctx.fillStyle='#fff'; ctx.font=`bold ${TILE_SIZE*0.55}px sans-serif`;
                ctx.textAlign='center'; ctx.textBaseline='middle';
                ctx.fillText('🚧', px+TILE_SIZE/2, py+TILE_SIZE/2);
                ctx.restore();
            }
        }
    }

    // Biome tint overlay
    if (biome.tint) {
        ctx.fillStyle = biome.tint;
        ctx.fillRect(clampedCamX, clampedCamY, canvas.width, canvas.height);
    }

    // Particles
    for (const p of state.particles) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life/50);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
        ctx.fill();
        ctx.restore();
    }

    // Floating texts
    state.floatingTexts = state.floatingTexts.filter(ft=>ft.life>0);
    for (const ft of state.floatingTexts) {
        ctx.save();
        ctx.globalAlpha = ft.alpha;
        ctx.fillStyle = ft.color;
        ctx.font = 'bold 13px Segoe UI, sans-serif';
        ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
        ft.y += ft.vy; ft.life--; ft.alpha = ft.life/60;
    }

    // Player (Drill)
    const px = player.x+TILE_SIZE/2, py = player.y+TILE_SIZE/2, r = TILE_SIZE/2.5;
    ctx.save();
    ctx.translate(px,py);
    const rotations = { right:0, down:Math.PI/2, left:Math.PI, up:-Math.PI/2 };
    ctx.rotate(rotations[player.facing]||0);
    ctx.fillStyle='#c0392b'; ctx.beginPath(); ctx.arc(0,0,r,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#e8e8e8'; ctx.beginPath();
    ctx.moveTo(r,0); ctx.lineTo(r*0.3,-r*0.5); ctx.lineTo(r*0.3,r*0.5); ctx.closePath(); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.25)'; ctx.beginPath(); ctx.arc(-r*0.2,-r*0.3,r*0.4,0,Math.PI*2); ctx.fill();
    ctx.restore();

    ctx.restore();
}
