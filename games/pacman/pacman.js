/** Pac-Man+ by you + GPT
 *  Improvements:
 *  - Fixed: portals, UI score/lives bug, ghost wall bounce/reverse, map parsing
 *  - Added: power pellets, frightened mode, simple chase/scatter AI,
 *           difficulty, pause/restart, mobile controls, level progression,
 *           optional Frenzy Mode (post-level turbo dots for bonus)
 *  - QoL: grid-aware turning, collision safety, HUD, toast messages
 */

//////////////////////////
// Config & Constants
//////////////////////////
const TILE = 32;
const ROWS = 21;
const COLS = 19;
const BOARD_W = COLS * TILE;
const BOARD_H = ROWS * TILE;
const DIRECTIONS = { U: [0, -1], D: [0, 1], L: [-1, 0], R: [1, 0] };
const DIR_KEYS = { ArrowUp: 'U', KeyW: 'U', ArrowDown: 'D', KeyS: 'D', ArrowLeft: 'L', KeyA: 'L', ArrowRight: 'R', KeyD: 'R' };
// Frightened visuals
const FRIGHT_FLASH_MS = 2000;                 // last 2s: white flash
const FRIGHT_TINT = 'rgba(15,50,255,0.70)';   // deep blue
const FRIGHT_FLASH_TINT = 'rgba(255,255,255,0.85)';
// --- Add below your existing TILE/ROWS/COLS constants ---
// --- tuning ---
const TURN_EPS = 10; // was 6; allow earlier corner turns
const SNAP_EPS = 3;  // was 2; a bit more forgiving

function actorCenter(a) { return [a.x + a.w / 2, a.y + a.h / 2]; }
function tileCoordsFromCenter(cx, cy) { return [Math.floor(cx / TILE), Math.floor(cy / TILE)]; }
function tileCenter(c, r) { return [c * TILE + TILE / 2, r * TILE + TILE / 2]; }
function reverseOf(d) { return d === 'U' ? 'D' : d === 'D' ? 'U' : d === 'L' ? 'R' : 'L'; }
function openDirsAtTile(c, r) {
    const dirs = [];
    if (!isWallAt(c, r - 1)) dirs.push('U');
    if (!isWallAt(c - 1, r)) dirs.push('L');
    if (!isWallAt(c, r + 1)) dirs.push('D');
    if (!isWallAt(c + 1, r)) dirs.push('R');
    return dirs;
}
function seedGhostDirection(gh) {
    const [c, r] = gh.tilePos();
    if (!isWallAt(c, r - 1)) { gh.y -= 1; }
    const exits = openDirsAtTile(c, r);
    if (exits.length) {
        // prefer UP then LEFT then DOWN then RIGHT like classic spawn
        const pref = ['U', 'L', 'D', 'R'];
        gh.dir = pref.find(d => exits.includes(d)) || exits[0];
        gh.nextDir = null;
    }
}

function openDirsAtTile(c, r) {
    const dirs = [];
    if (!isWallAt(c, r - 1)) dirs.push('U');
    if (!isWallAt(c - 1, r)) dirs.push('L');
    if (!isWallAt(c, r + 1)) dirs.push('D');
    if (!isWallAt(c + 1, r)) dirs.push('R');
    return dirs;
}

function kickGhostOutIfStuck(gh) {
    // Don’t kick during READY pause
    if (now() < state.readyUntil) return;

    // If the ghost hasn’t left its spawn tile for a bit, teleport it one tile out
    const t = now();
    const [c, r] = gh.tilePos();
    const stuckLong = (t - gh.lastProgressAt) > 900;  // ~0.9s after READY
    if (!stuckLong) return;

    const exits = openDirsAtTile(c, r);
    if (!exits.length) return;

    // Prefer UP like the arcade; otherwise first open dir
    const d = exits.includes('U') ? 'U' : exits[0];
    const [dc, dr] = DIRECTIONS[d];

    // Move ghost to the CENTER of the next tile and set its heading
    const [tx, ty] = tileCenter(c + dc, r + dr);
    gh.x = tx - gh.w / 2;
    gh.y = ty - gh.h / 2;
    gh.dir = d;
    gh.nextDir = null;
    gh.lastTileC = c + dc;
    gh.lastTileR = r + dr;
    gh.lastProgressAt = t;
}

// only require alignment along the axis PERPENDICULAR to the turn
function nearAxisCenter(a, axis) {
    const [cx, cy] = actorCenter(a);
    const [tc, tr] = tileCoordsFromCenter(cx, cy);
    const [tx, ty] = tileCenter(tc, tr);
    return axis === 'x'
        ? Math.abs(cx - tx) <= TURN_EPS
        : Math.abs(cy - ty) <= TURN_EPS;
}

function canTurnHere(a, nextDir) {
    // turning L/R -> must be centered on Y; turning U/D -> centered on X
    return (nextDir === 'L' || nextDir === 'R')
        ? nearAxisCenter(a, 'y')
        : nearAxisCenter(a, 'x');
}

function canTurnToTile(actor, dir) {
    const [cx, cy] = [actor.x + actor.w / 2, actor.y + actor.h / 2];
    const [tc, tr] = [Math.floor(cx / TILE), Math.floor(cy / TILE)];
    const step = (dir === 'U') ? [0, -1] : (dir === 'D') ? [0, 1] : (dir === 'L') ? [-1, 0] : [1, 0];
    const nc = tc + step[0], nr = tr + step[1];
    return !isWallAt(nc, nr);
}


function snapActorToTileCenter(a) {
    const [cx, cy] = actorCenter(a);
    const [tc, tr] = tileCoordsFromCenter(cx, cy);
    const [tx, ty] = tileCenter(tc, tr);
    a.x = tx - a.w / 2;
    a.y = ty - a.h / 2;
}

function alignToCorridor(a) {
    // keep perpendicular axis centered so corners feel smooth
    const [cx, cy] = actorCenter(a);
    const [tc, tr] = tileCoordsFromCenter(cx, cy);
    const [tx, ty] = tileCenter(tc, tr);
    if (a.dir === 'L' || a.dir === 'R') {
        if (Math.abs((a.y + a.h / 2) - ty) <= SNAP_EPS) a.y = ty - a.h / 2;
    } else {
        if (Math.abs((a.x + a.w / 2) - tx) <= SNAP_EPS) a.x = tx - a.w / 2;
    }
}

function canMoveFrom(actor, dir, startX, startY) {
    const [dx, dy] = DIRECTIONS[dir];
    const nx = startX + dx * actor.speed;
    const ny = startY + dy * actor.speed;
    const left = Math.floor((nx) / TILE);
    const right = Math.floor((nx + actor.w - 1) / TILE);
    const top = Math.floor((ny) / TILE);
    const bottom = Math.floor((ny + actor.h - 1) / TILE);
    return !(
        isWallAt(left, top) || isWallAt(right, top) ||
        isWallAt(left, bottom) || isWallAt(right, bottom)
    );
}

function tryDash() {
    const t = now();
    if (t < state.dash.until || t < state.dash.nextReady) return;
    // snap to corridor before bursting
    alignToCorridor(state.pac);
    state.dash.until = t + state.dash.durationMs;  // 260ms is fine
    state.dash.nextReady = t + state.dash.cooldownMs;
    showToast('Dash!');
}

function isDashing() { return selMode.value === 'dash' && now() < state.dash.until; }
function dashReadyInMs() { return Math.max(0, state.dash.nextReady - now()); }

function visionRectForGhost(gh) {
    // extend straight ahead until wall
    const [gc, gr] = gh.tilePos();
    let c = gc, r = gr;
    const [dc, dr] = (gh.dir === 'U') ? [0, -1] : (gh.dir === 'D') ? [0, 1] : (gh.dir === 'L') ? [-1, 0] : [1, 0];
    let len = 0;
    // limit to avoid infinite loops
    for (let i = 0; i < 20; i++) {
        const nc = c + dc, nr = r + dr;
        if (nc < 0 || nr < 0 || nc >= COLS || nr >= ROWS || isWallAt(nc, nr)) break;
        c = nc; r = nr; len++;
    }
    if (len === 0) return null;

    // pixel rectangle
    const px = gc * TILE, py = gr * TILE;
    if (gh.dir === 'L') return new Rect((gc - len) * TILE, py + TILE * 0.15, len * TILE, TILE * 0.7);
    if (gh.dir === 'R') return new Rect((gc + 1) * TILE, py + TILE * 0.15, len * TILE, TILE * 0.7);
    if (gh.dir === 'U') return new Rect(px + TILE * 0.15, (gr - len) * TILE, TILE * 0.7, len * TILE);
    /* D */            return new Rect(px + TILE * 0.15, (gr + 1) * TILE, TILE * 0.7, len * TILE);
}

function drawGhostVision(gh) {
    if (selMode.value !== 'stealth') return;
    const vr = visionRectForGhost(gh);
    if (!vr) return;
    ctx.save();
    ctx.globalAlpha = 0.16;                // soft highlight
    ctx.fillStyle = '#ff5252';             // reddish cone
    ctx.fillRect(vr.x, vr.y, vr.w, vr.h);
    ctx.restore();
}

const DIFF = {
    easy: { pac: 6, ghost: 2, scatterMs: 7000, chaseMs: 2500, frightMs: 8000 },
    normal: { pac: 6, ghost: 3, scatterMs: 6000, chaseMs: 3500, frightMs: 7000 }, // <-- default
    hard: { pac: 6, ghost: 4, scatterMs: 4500, chaseMs: 5500, frightMs: 6000 },
    insane: { pac: 7, ghost: 6, scatterMs: 1500, chaseMs: 7000, frightMs: 4000 }
};

const MAP = [
    "XXXXXXXXXXXXXXXXXXX",
    "X        X        X",
    "X XX XXX X XXX XX X",
    "X    *            X",
    "X XX X XXXXX X XX X",
    "X    X   *   X    X",
    "XXXX XXXX XXXX XXXX",
    "O  X X       X X  O",
    "XXXX X XXrXX X XXXX",
    "X   *   bpo   *   X",
    "XXXX X XXXXX X XXXX",
    "O  X X       X X  O",
    "XXXX X XXXXX X XXXX",
    "X        X        X",
    "X XX XXX X XXX XX X",
    "X  X     P     X  X",
    "XX X X XXXXX X X XX",
    "X    X * X * X    X",
    "X XXXXXX X XXXXXX X",
    "X      *        * X",
    "XXXXXXXXXXXXXXXXXXX"
];
// Legend:
// X wall, space dot, * power pellet, O tunnel/portal (need exactly 2),
// b/p/r/o ghosts, P pacman

//////////////////////////
// Canvas & DOM
//////////////////////////
const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
canvas.width = BOARD_W; canvas.height = BOARD_H;

const elDash = document.getElementById('dash');
const elScore = document.getElementById('score');
const elLevel = document.getElementById('level');
const elLives = document.getElementById('lives');
const btnPause = document.getElementById('btn-pause');
const btnRestart = document.getElementById('btn-restart');
const selDiff = document.getElementById('difficulty');
const selMode = document.getElementById('mode');
const toast = document.getElementById('toast');

//////////////////////////
// Assets
//////////////////////////
const img = {
    pacU: loadImg("pacmanUp.png"),
    pacD: loadImg("pacmanDown.png"),
    pacL: loadImg("pacmanLeft.png"),
    pacR: loadImg("pacmanRight.png"),
    wall: loadImg("wall.png"),
    ghostB: loadImg("blueGhost.png"),
    ghostO: loadImg("orangeGhost.png"),
    ghostP: loadImg("pinkGhost.png"),
    ghostR: loadImg("redGhost.png"),
};

function loadImg(src) { const i = new Image(); i.src = src; return i; }

//////////////////////////
// Game State
//////////////////////////
let state = {
    dash: {
        cooldownMs: 5000,
        durationMs: 260,
        speedBoost: 9,
        until: 0,
        nextReady: 0
    },
    score: 0,
    level: 1,
    lives: 3,
    paused: false,
    over: false,
    stage: 'title',    // 'title' | 'playing' | 'paused' | 'over'
    dotsLeft: 0,
    frightenedUntil: 0,
    phaseUntil: 0,
    phase: 'scatter',
    diffKey: 'normal',
    readyUntil: 0,     // short freeze showing "READY!" at level start
    portals: [],
    walls: [],
    dots: new Set(),
    powers: new Set(),
    ghosts: [],
    pac: null,
    lastTick: 0,
    ghostChain: 0,
};

function startGame() {
    state.stage = 'playing';
    state.paused = false;
    btnPause.textContent = 'Pause';
    state.over = false;
    state.readyUntil = now() + 1200; // short READY pause
    showToast('Start!');
}

//////////////////////////
// Entities
//////////////////////////
class Rect {
    constructor(x, y, w, h) { this.x = x; this.y = y; this.w = w; this.h = h; }
}

class Actor {
    constructor(x, y, w, h, speed) {
        this.startX = x; this.startY = y;
        this.x = x; this.y = y; this.w = w; this.h = h;
        this.dir = 'L'; this.nextDir = null; this.speed = speed;
    }
    reset() { this.x = this.startX; this.y = this.startY; this.dir = 'L'; this.nextDir = null; }
    tilePos() { return [Math.floor((this.x + this.w / 2) / TILE), Math.floor((this.y + this.h / 2) / TILE)]; }
}

class Pac extends Actor {
    constructor(x, y) { super(x, y, TILE, TILE, DIFF[state.diffKey].pac); this.img = img.pacR; }
    setDir(d) {
        if (isReverse(this.dir, d)) {       // immediate reverse feels snappy
            this.dir = d;
            this.nextDir = null;
            alignToCorridor(this);
            return;
        }
        this.nextDir = d;                    // otherwise, queue it for the next intersection
    }
    applyDirImages() {
        this.img = (this.dir === 'U') ? img.pacU : (this.dir === 'D') ? img.pacD : (this.dir === 'L') ? img.pacL : img.pacR;
    }
}



class Ghost extends Actor {
    constructor(x, y, kind) {
        super(x, y, TILE, TILE, DIFF[state.diffKey].ghost);
        this.kind = kind;    // 'B','O','P','R'
        this.mode = 'normal'; // 'normal' | 'frightened' | 'eyes'
        this.homeTile = [Math.floor(x / TILE), Math.floor(y / TILE)];
        this.invulnUntil = 0; // tiny grace after being eaten
        this.scatterTarget = this.pickCorner();
        this.lastTileC = Math.floor(x / TILE);
        this.lastTileR = Math.floor(y / TILE);
        this.lastProgressAt = now();
        this.spawnC = Math.floor(x / TILE);
        this.spawnR = Math.floor(y / TILE);
        this.eyeTint = null; // used in frightened mode
    }
    pickCorner() {
        // Simple target corners by kind
        switch (this.kind) {
            case 'R': return [COLS - 2, 1];
            case 'P': return [1, 1];
            case 'O': return [1, ROWS - 2];
            case 'B': return [COLS - 2, ROWS - 2];
            default: return [COLS - 2, ROWS - 2];
        }
    }
}

//////////////////////////
// Map & Helpers
//////////////////////////
function isWallAt(col, row) {
    if (col < 0 || row < 0 || col >= COLS || row >= ROWS) return true;
    return MAP[row][col] === 'X';
}

function rectsOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function snapToGrid(actor) {
    // keeps actor aligned on turns to avoid tiny collisions
    const cx = Math.round((actor.x) / TILE) * TILE;
    const cy = Math.round((actor.y) / TILE) * TILE;
    if (Math.abs(actor.x - cx) < 0.5) actor.x = cx;
    if (Math.abs(actor.y - cy) < 0.5) actor.y = cy;
}

function canMove(actor, dir) {
    const [dx, dy] = DIRECTIONS[dir];
    const nx = actor.x + dx * actor.speed;
    const ny = actor.y + dy * actor.speed;
    // expand a little collision box to tile coords
    const left = Math.floor((nx) / TILE);
    const right = Math.floor((nx + actor.w - 1) / TILE);
    const top = Math.floor((ny) / TILE);
    const bottom = Math.floor((ny + actor.h - 1) / TILE);
    return !(
        isWallAt(left, top) || isWallAt(right, top) ||
        isWallAt(left, bottom) || isWallAt(right, bottom)
    );
}

function centerInTile(col, row, w = TILE, h = TILE) {
    return [col * TILE, row * TILE];
}

//////////////////////////
// Build World
//////////////////////////
function buildWorld() {
    state.walls = [];
    state.dots = new Set();
    state.powers = new Set();
    state.portals = [];
    state.ghosts = [];
    state.pac = null;
    state.dotsLeft = 0;

    // ---- PASS 1: scan map, collect positions, find pac start ----
    let pacTile = null;
    const passable = Array.from({ length: ROWS }, () => Array(COLS).fill(false));

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const ch = MAP[r][c];
            const [x, y] = [c * TILE, r * TILE];
            if (ch === 'X') {
                state.walls.push(new Rect(x, y, TILE, TILE));
            } else {
                passable[r][c] = true; // everything not a wall is navigable
            }
            if (ch === 'O') { state.portals.push(new Rect(x, y, TILE, TILE)); }
            if (ch === 'P') { pacTile = [c, r]; }
            if ('bpor'.includes(ch)) {
                const kind = (ch === 'b') ? 'B' : (ch === 'p') ? 'P' : (ch === 'o') ? 'O' : 'R';
                state.ghosts.push(new Ghost(x, y, kind));
                const gh = state.ghosts[state.ghosts.length - 1];
                seedGhostDirection(gh);
                if (isWallAt(Math.floor(gh.x / TILE), Math.floor(gh.y / TILE))) {
                    const around = [[1, 0], [-1, 0], [0, 1], [0, -1]];
                    for (const [dx, dy] of around) {
                        const c = Math.floor(gh.x / TILE) + dx, r = Math.floor(gh.y / TILE) + dy;
                        if (!isWallAt(c, r)) { gh.x = c * TILE; gh.y = r * TILE; break; }
                    }
                }
            }
        }
    }
    // Safety: exactly 2 portals else disable tunneling
    if (state.portals.length !== 2) state.portals = [];

    // ---- PASS 2: BFS from Pac to mark only REACHABLE floor tiles ----
    const reachable = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
    if (!pacTile) { // fallback to center if P missing
        pacTile = [Math.floor(COLS / 2), Math.floor(ROWS / 2)];
    }
    const q = [pacTile];
    reachable[pacTile[1]][pacTile[0]] = true;

    const deltas = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    while (q.length) {
        const [c, r] = q.shift();
        for (const [dc, dr] of deltas) {
            const nc = c + dc, nr = r + dr;
            if (nc < 0 || nr < 0 || nc >= COLS || nr >= ROWS) continue;
            if (!passable[nr][nc] || reachable[nr][nc]) continue;
            reachable[nr][nc] = true;
            q.push([nc, nr]);
        }
    }

    // ---- PASS 3: place Pac, dots, and power pellets ONLY if reachable ----
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const ch = MAP[r][c];
            const [x, y] = [c * TILE, r * TILE];

            if (ch === 'P') { state.pac = new Pac(x, y); }

            if (reachable[r][c]) {
                if (ch === ' ') {
                    const dot = new Rect(x + 13, y + 13, 6, 6);
                    state.dots.add(dot);
                    state.dotsLeft++;
                } else if (ch === '*') {
                    const p = new Rect(x + 10, y + 10, 12, 12);
                    state.powers.add(p);
                    state.dotsLeft++;
                }
            }
        }
    }

    // Phase timer
    schedulePhase('scatter', DIFF[state.diffKey].scatterMs);

    // READY pause before movement
    state.readyUntil = now() + 1200; // 1.2s "READY!"
}


//////////////////////////
// Phase & Timers
//////////////////////////
function now() { return performance.now(); }

function schedulePhase(phase, ms) {
    state.phase = phase;
    state.phaseUntil = now() + ms;
}

function togglePause() {
    if (state.stage !== 'playing') return;
    state.paused = !state.paused;
    btnPause.textContent = state.paused ? 'Resume' : 'Pause';
    showToast(state.paused ? 'Paused' : 'Resumed');
}

function showToast(text, ms = 1200) {
    toast.textContent = text;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), ms);
}

//////////////////////////
// Movement
//////////////////////////
function moveActor(actor) {
    // 1) Commit queued turn as soon as we're centered on the *perpendicular* axis
    if (actor.nextDir && canTurnHere(actor, actor.nextDir) && canTurnToTile(actor, actor.nextDir)) {
        snapActorToTileCenter(actor);
        actor.dir = actor.nextDir;
        actor.nextDir = null;
    }

    // 2) If blocked ahead, try to pivot to queued dir at the intersection
    if (!canMove(actor, actor.dir)) {
        snapActorToTileCenter(actor);
        if (actor.nextDir && canTurnToTile(actor, actor.nextDir)) {
            actor.dir = actor.nextDir;
            actor.nextDir = null;
        } else if (!canMove(actor, actor.dir)) {
            // still blocked; don't move this frame
            return;
        }
    }

    // 3) Keep perpendicular axis centered to avoid micro-grazes with walls
    alignToCorridor(actor);

    // 4) Move in current direction
    const [dx, dy] = DIRECTIONS[actor.dir];
    actor.x += dx * actor.speed;
    actor.y += dy * actor.speed;
}


function tunnelIfNeeded(actor) {
    if (state.portals.length !== 2) return;
    const [A, B] = state.portals;
    const ra = new Rect(actor.x, actor.y, actor.w, actor.h);
    if (rectsOverlap(ra, A)) {
        actor.x = B.x + (B.w - actor.w) / 2;
        actor.y = B.y + (B.h - actor.h) / 2;
    } else if (rectsOverlap(ra, B)) {
        actor.x = A.x + (A.w - actor.w) / 2;
        actor.y = A.y + (A.h - actor.h) / 2;
    }
}

function moveGhost(gh) {
    // If blocked, adopt ANY legal exit immediately (prefer queued)
    if (!canMove(gh, gh.dir)) {
        const [c, r] = gh.tilePos();
        const exits = openDirsAtTile(c, r);
        if (exits.length) {
            const pick = (gh.nextDir && exits.includes(gh.nextDir)) ? gh.nextDir : exits[0];
            snapActorToTileCenter(gh);
            gh.dir = pick;
            gh.nextDir = null;
        } else {
            return;
        }
    }

    // Commit queued turn when aligned OR still blocked
    if (gh.nextDir && canTurnToTile(gh, gh.nextDir) &&
        (canTurnHere(gh, gh.nextDir) || !canMove(gh, gh.dir))) {
        snapActorToTileCenter(gh);
        gh.dir = gh.nextDir;
        gh.nextDir = null;
    }

    alignToCorridor(gh);
    const [dx, dy] = DIRECTIONS[gh.dir];
    gh.x += dx * gh.speed;
    gh.y += dy * gh.speed;
}


//////////////////////////
// Ghost AI (simple but fun)
//////////////////////////
function ghostSpeed() {
    // slower when frightened
    const base = DIFF[state.diffKey].ghost;
    return (now() < state.frightenedUntil) ? Math.max(2, base - 2) : base;
}

function hasLineOfSight(gh, pac) {
    const [gc, gr] = gh.tilePos();
    const [pc, pr] = pac.tilePos();
    // Bresenham's line
    let x = gc, y = gr;
    const dx = Math.abs(pc - gc), dy = Math.abs(pr - gr);
    const sx = (gc < pc) ? 1 : -1;
    const sy = (gr < pr) ? 1 : -1;
    let err = dx - dy;
    while (true) {
        if (x === pc && y === pr) return true;
        if (isWallAt(x, y) && !(x === gc && y === gr)) return false;
        const e2 = 2 * err;
        if (e2 > -dy) { err -= dy; x += sx; }
        if (e2 < dx) { err += dx; y += sy; }
        if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return false;
    }
}

function updateGhost(gh) {
    const t = now();

    // Mode state
    if (gh.mode !== 'eyes') gh.mode = (t < state.frightenedUntil) ? 'frightened' : 'normal';

    kickGhostOutIfStuck(gh);

    // Stealth LOS
    const inStealth = (selMode.value === 'stealth');
    const seesPac = inStealth ? hasLineOfSight(gh, state.pac) : true;

    // Speeds
    const base = DIFF[state.diffKey].ghost;
    if (gh.mode === 'eyes') gh.speed = base + 2;
    else if (gh.mode === 'frightened') gh.speed = Math.max(2, base - 2);
    else if (inStealth) gh.speed = seesPac ? base + 2 : Math.max(2, base - 1);
    else gh.speed = base;

    // Targets
    let target;
    if (gh.mode === 'eyes') {
        target = gh.homeTile;
        const [gc, gr] = gh.tilePos(), [hc, hr] = gh.homeTile;
        if (gc === hc && gr === hr) { gh.mode = 'normal'; gh.invulnUntil = t + 300; }
    } else if (gh.mode === 'frightened') {
        const [pc, pr] = state.pac.tilePos();
        target = clampToWalkable([COLS - 1 - pc, ROWS - 1 - pr]);
    } else {
        if (inStealth && !seesPac) target = gh.scatterTarget;
        else if (state.phase === 'scatter') target = gh.scatterTarget;
        else { const [pc, pr] = state.pac.tilePos(); target = [pc, pr]; }
    }

    // Pick best direction by TILE (don’t use pixel-step here)
    const dirs = ['U', 'L', 'D', 'R'];
    const rev = reverseOf(gh.dir);
    let bestDir = null, bestScore = Infinity, haveValid = false;

    const [tc, tr] = gh.tilePos();
    for (const d of dirs) {
        if (!canTurnToTile(gh, d)) continue;    // tile must be open
        haveValid = true;
        const [dc, dr] = DIRECTIONS[d];
        const nc = tc + dc, nr = tr + dr;       // next tile if we turn that way
        // small penalty to avoid instant reverses unless necessary
        const penalty = (d === rev) ? 0.49 : 0;
        const score = manhattan(nc, nr, target[0], target[1]) + penalty;
        if (score < bestScore) { bestScore = score; bestDir = d; }
    }

    if (haveValid && bestDir) gh.nextDir = bestDir;

    // Progress watchdog (prevents corner idling)
    const [cc, rr] = gh.tilePos();
    if (cc !== gh.lastTileC || rr !== gh.lastTileR) {
        gh.lastTileC = cc; gh.lastTileR = rr; gh.lastProgressAt = t;
    } else if (t - gh.lastProgressAt > 1000) {
        // Hard nudge: snap & allow reverse to break deadlocks
        snapActorToTileCenter(gh);
        const exits = dirs.filter(d => canTurnToTile(gh, d));
        if (exits.length) gh.nextDir = exits[0];
        gh.lastProgressAt = t;
    }

    // Move (ghost-friendly)
    moveGhost(gh);
    tunnelIfNeeded(gh);
}


function clampToWalkable([c, r]) {
    c = Math.min(Math.max(c, 1), COLS - 2);
    r = Math.min(Math.max(r, 1), ROWS - 2);
    if (isWallAt(c, r)) {
        // naive: nudge right/down
        if (!isWallAt(c + 1, r)) c++;
        else if (!isWallAt(c, r + 1)) r++;
    }
    return [c, r];
}
function manhattan(x1, y1, x2, y2) { return Math.abs(x1 - x2) + Math.abs(y1 - y2); }
function isReverse(a, b) {
    return (a === 'U' && b === 'D') || (a === 'D' && b === 'U') || (a === 'L' && b === 'R') || (a === 'R' && b === 'L');
}

//////////////////////////
// Collisions / Eating
//////////////////////////
function eatDots() {
    const r = new Rect(state.pac.x, state.pac.y, state.pac.w, state.pac.h);

    for (const dot of [...state.dots]) {
        if (rectsOverlap(r, dot)) {
            state.dots.delete(dot);
            state.score += 10;
            state.dotsLeft--;
            updateHUD();             // <-- add this
            break;
        }
    }
    for (const p of [...state.powers]) {
        if (rectsOverlap(r, p)) {
            state.powers.delete(p);
            state.score += 50;
            state.dotsLeft--;
            state.frightenedUntil = now() + DIFF[state.diffKey].frightMs;
            state.ghostChain = 0;    // combo resets on new power
            showToast('Power mode!', 800);
            updateHUD();             // <-- add this
            break;
        }
    }
}


function checkGhostCollisions() {
    const pRect = new Rect(state.pac.x, state.pac.y, state.pac.w, state.pac.h);
    const t = now();

    for (const gh of state.ghosts) {
        const gRect = new Rect(gh.x, gh.y, gh.w, gh.h);
        if (!rectsOverlap(pRect, gRect)) continue;

        // Dash phases harmlessly (unless you WANT dash to still eat frightened ghosts)
        if (isDashing() && !(t < state.frightenedUntil)) continue;

        if (gh.mode === 'eyes' || t < gh.invulnUntil) {
            // touching eyes does nothing
            continue;
        }

        if (t < state.frightenedUntil) {
            // combo scoring
            state.ghostChain = Math.min(state.ghostChain + 1, 4);
            const comboValues = [0, 200, 400, 800, 1600];
            const add = comboValues[state.ghostChain];
            state.score += add;

            // turn into eyes; sprint home
            gh.mode = 'eyes';
            gh.invulnUntil = t + 250;
            showToast(`Ghost eaten! +${add}`, 700);
            updateHUD();
        } else {
            loseLife();
            return;
        }
    }
}


function loseLife() {
    state.lives--;
    state.ghostChain = 0;      // <-- reset combo
    updateLives();
    if (state.lives <= 0) {
        gameOver();
    } else {
        state.pac.reset();
        state.ghosts.forEach(g => { g.reset(); seedGhostDirection(g); });
        state.frightenedUntil = 0;
        showToast('Life lost!');
        state.readyUntil = now() + 900;
    }
}

function gameOver() {
    state.over = true;
    state.paused = true;
    btnPause.textContent = 'Resume';
    showToast(`Game Over — Score ${state.score}`, 2000);
}

//////////////////////////
// UI Updaters
//////////////////////////
function updateHUD() {
    elScore.textContent = `Score: ${state.score}`;
    elLevel.textContent = `Level: ${state.level}`;
    if (elDash) {
        const ms = (selMode.value === 'dash') ? dashReadyInMs() : 0;
        elDash.textContent = `Dash: ${(selMode.value !== 'dash') ? '—' : (ms <= 0 ? 'Ready' : (ms / 1000).toFixed(1) + 's')}`;
    }
}
function updateLives() {
    elLives.innerHTML = '❤️'.repeat(Math.max(0, state.lives));
}

//////////////////////////
// Draw
//////////////////////////
function drawGhost(g) {
    const t = now();
    const isFright = (t < state.frightenedUntil) && g.mode !== 'eyes';
    const flashPhase = (state.frightenedUntil - t) < FRIGHT_FLASH_MS && Math.floor(t / 120) % 2 === 0;

    // Wobble when frightened
    const wobble = isFright ? 0.06 * Math.sin(t / 90 + (g.x + g.y) * 0.01) : 0;
    const cx = g.x + g.w / 2, cy = g.y + g.h / 2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(1, 1 + wobble);
    ctx.translate(-cx, -cy);

    // Base sprite (normal), or use any ghost image even when frightened — we’ll tint it
    ctx.drawImage(ghostSprite(g.kind), g.x, g.y, g.w, g.h);

    if (g.mode === 'eyes') {
        // Overpaint big cartoon eyes
        ctx.fillStyle = '#fff';
        const ex = g.x + g.w * 0.28, ey = g.y + g.h * 0.30, ew = g.w * 0.18, eh = g.h * 0.22;
        ctx.beginPath(); ctx.ellipse(ex, ey, ew, eh, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(ex + g.w * 0.28, ey, ew, eh, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#1e88e5';
        ctx.beginPath(); ctx.arc(ex, ey, ew * 0.55, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(ex + g.w * 0.28, ey, ew * 0.55, 0, Math.PI * 2); ctx.fill();
    } else if (isFright) {
        // Strong tint; flash near the end
        ctx.globalCompositeOperation = 'source-atop';
        ctx.fillStyle = flashPhase ? FRIGHT_FLASH_TINT : FRIGHT_TINT;
        ctx.fillRect(g.x, g.y, g.w, g.h);
        ctx.globalCompositeOperation = 'source-over';
        // Outline
        ctx.strokeStyle = flashPhase ? '#fff' : '#294BFF';
        ctx.lineWidth = 2;
        ctx.strokeRect(g.x + 1, g.y + 1, g.w - 2, g.h - 2);
    }

    ctx.restore();
}

function drawWorld() {
    // clear
    ctx.clearRect(0, 0, BOARD_W, BOARD_H);

    // walls
    for (const w of state.walls) {
        ctx.drawImage(img.wall, w.x, w.y, w.w, w.h);
    }

    // dots
    ctx.fillStyle = '#fff';
    for (const d of state.dots) {
        ctx.fillRect(d.x, d.y, d.w, d.h);
    }
    // power pellets
    ctx.fillStyle = '#ffd54a';
    for (const p of state.powers) {
        ctx.beginPath();
        ctx.arc(p.x + p.w / 2, p.y + p.h / 2, p.w / 2, 0, Math.PI * 2);
        ctx.fill();
    }

    for (const g of state.ghosts) drawGhostVision(g);

    // pac & ghosts
    ctx.drawImage(state.pac.img, state.pac.x, state.pac.y, state.pac.w, state.pac.h);
    for (const g of state.ghosts) drawGhost(g);

    // overlays
    if (state.over) {
        drawCenterText('GAME OVER', '#ef5350');
        drawCenterText(`Score: ${state.score}`, '#fff', 28, +34);
    } else if (state.paused) {
        drawCenterText('PAUSED', '#ffd54a');
    }

    // overlays
    if (state.stage === 'title') {
        drawCenterText('PAC-MAN', '#ffd54a', 44, -16);
        drawCenterText('Press Enter or Space to Start', '#fff', 20, 18);
        return; // don't show paused/over messages on title
    }

    if (now() < state.readyUntil && !state.over) {
        drawCenterText('READY!', '#ffd54a', 36, 0);
    }

}

function ghostSprite(kind) {
    switch (kind) {
        case 'B': return img.ghostB;
        case 'O': return img.ghostO;
        case 'P': return img.ghostP;
        case 'R': return img.ghostR;
        default: return img.ghostR;
    }
}
function drawCenterText(t, color = '#fff', size = 36, yOffset = 0) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.font = `bold ${size}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 8;
    ctx.fillText(t, BOARD_W / 2, BOARD_H / 2 + yOffset);
    ctx.restore();
}

//////////////////////////
// Game Loop
//////////////////////////
function tick(ts) {
    if (!state.lastTick) state.lastTick = ts;
    state.lastTick = ts;

    const canPlay = state.stage === 'playing' && !state.paused && !state.over && now() >= state.readyUntil;

    if (canPlay) {
        if (now() > state.phaseUntil && now() >= state.frightenedUntil) {
            if (state.phase === 'scatter') schedulePhase('chase', DIFF[state.diffKey].chaseMs);
            else schedulePhase('scatter', DIFF[state.diffKey].scatterMs);
        }

        if (isDashing()) {
            state.pac.speed = DIFF[state.diffKey].pac + state.dash.speedBoost;
        } else {
            state.pac.speed = DIFF[state.diffKey].pac;
        }


        moveActor(state.pac);
        tunnelIfNeeded(state.pac);
        state.pac.applyDirImages();

        eatDots();
        for (const g of state.ghosts) updateGhost(g);
        checkGhostCollisions();

        if (state.dotsLeft <= 0) {
            state.level++;
            updateHUD();
            nextLevel();  // nextLevel() already rebuilds and sets READY
        }
    }

    updateHUD();
    drawWorld();
    requestAnimationFrame(tick);
}


function nextLevel() {
    showToast('Level Up!');
    state.score += 500;        // <-- small bonus for clearing
    buildWorld();
    updateHUD();               // <-- reflect the bonus immediately
}



//////////////////////////
// Input
//////////////////////////
document.addEventListener('keydown', (e) => {
    if (state.stage === 'title' && (e.code === 'Enter' || e.code === 'Space')) {
        e.preventDefault();
        startGame();
        return;
    }
    if (DIR_KEYS[e.code] && state.stage === 'playing') {
        state.pac.setDir(DIR_KEYS[e.code]);
        e.preventDefault();
    } else if (e.code === 'Space') {
        if (state.stage === 'playing') togglePause();
        e.preventDefault();
    } else if (e.code === 'Enter' && state.over) {
        doRestart();
    } else if (e.code === 'KeyE' && state.stage === 'playing' && selMode.value === 'dash') {
        e.preventDefault();
        tryDash();
    }
});


btnPause.addEventListener('click', togglePause);
btnRestart.addEventListener('click', doRestart);
selDiff.addEventListener('change', () => {
    state.diffKey = selDiff.value;
    // update speeds immediately
    state.pac.speed = DIFF[state.diffKey].pac;
    state.ghosts.forEach(g => g.speed = DIFF[state.diffKey].ghost);
    showToast(`Difficulty: ${selDiff.value}`);
});
document.querySelectorAll('.touch-controls [data-dir]').forEach(btn => {
    btn.addEventListener('click', () => state.pac.setDir(btn.dataset.dir));
});

function doRestart() {
    state.score = 0; state.level = 1; state.lives = 3;
    state.over = false; state.paused = false;
    state.frightenedUntil = 0; state.frenzyUntil = 0;
    state.diffKey = selDiff.value;
    buildWorld();
    updateLives(); updateHUD();
    btnPause.textContent = 'Pause';
    showToast('Restarted');
}

//////////////////////////
// Boot
//////////////////////////
function init() {
    // start with selected difficulty
    state.diffKey = selDiff.value;
    buildWorld();
    updateLives();
    updateHUD();
    requestAnimationFrame(tick);
}
init();
