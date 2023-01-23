import basedata from "../basedata.json" assert { type: "JSON" };
import { Client, Construction, Crafter, Entity, Mover } from "./entities";

const worker = new Worker("/src/ts/canvasWorker.ts");

// Globals
let overlayCanvas: HTMLCanvasElement;
let mainCanvas: HTMLCanvasElement;
let staticCanvas: HTMLCanvasElement;

let oCtx: CanvasRenderingContext2D;
let offscreenCanvas: OffscreenCanvas;
let sCtx: CanvasRenderingContext2D;

let dpi = window.devicePixelRatio;
let canvasDimensions: { width: number; height: number; dpi: number };

let selectionRect = {
  startX: NaN,
  startY: NaN,
  endX: NaN,
  endY: NaN,
};

let selection: Entity[] = [];
let drag = false;

let isPlaying: boolean = true;

// Lists
let entities: Record<string, Entity[]> = {
  movers: new Array<Mover>(),
  crafters: new Array<Crafter>(),
  constructions: new Array<Construction>(),
};

// Cache

export function init(
  overlayLayer: HTMLCanvasElement,
  mainLayer: HTMLCanvasElement,
  staticLayer: HTMLCanvasElement
) {
  // Setup overlay canvas
  overlayCanvas = overlayLayer;
  oCtx = overlayCanvas.getContext("2d", { alpha: true })!;

  // Setup main canvas
  mainCanvas = mainLayer;
  offscreenCanvas = mainCanvas.transferControlToOffscreen();

  // Setup static canvas
  staticCanvas = staticLayer;
  sCtx = staticCanvas.getContext("2d", { alpha: false })!;

  overlayCanvas.addEventListener(
    "mousedown",
    function (e) {
      selection = [];

      const point = getMousePos(this, e);
      entities.crafters.find((crafter) => {
        let crafterRect = {
          startX: crafter.pos.x,
          startY: crafter.pos.y,
          endX: crafter.pos.x + 50,
          endY: crafter.pos.y + 50,
        };

        if (pointInRect(point, crafterRect)) selection.push(crafter);
      });

      selectionRect.startX = point.x;
      selectionRect.startY = point.y;

      drag = true;
    },
    false
  );
  overlayCanvas.addEventListener(
    "mouseup",
    function (e) {
      (entities.movers as Mover[]).forEach((mover) => {
        if (pointInRect({ x: mover.pos.x, y: mover.pos.y }, selectionRect))
          selection.push(mover);
      });

      clearSelectionArea();

      drag = false;
      // console.log(selection);
    },
    false
  );
  overlayCanvas.addEventListener(
    "mousemove",
    function (e) {
      if (drag) {
        const { x: x, y: y } = getMousePos(this, e);

        clearSelectionArea();

        selectionRect.endX = x;
        selectionRect.endY = y;

        drawSelectionArea();
      }
    },
    false
  );

  // Adds global canvas fix
  window.addEventListener("resize", fixSize, false);
  document.addEventListener(
    "visibilitychange",
    () => (isPlaying = document.visibilityState == "visible")
  );

  // Load data
  initCrafter("processing unit", 500, 500);
  initCrafter("processing unit", 200, 100);
  // entities.crafters[0].inventory = [{ type: "metal", quantity: 100 }];

  for (let i = 0; i < 1; i++) {
    initMover(400 + i * 10, 50 + ((i * 10) % 300));

    const mover = (entities["movers"] as Mover[])[i];

    if (!mover) return;
    mover.tasks[0] = {
      client: entities.crafters[0] as Client,
      order: "recieve",
    };
    mover.tasks[1] = {
      client: entities.crafters[1] as Client,
      order: "deposit",
    };

    mover.setTask(0);
  }

  // Setup worker
  canvasDimensions = {
    width: mainCanvas.clientWidth,
    height: mainCanvas.clientHeight,
    dpi: dpi,
  };

  worker.postMessage(
    {
      _canvas: offscreenCanvas,
      _dimensions: canvasDimensions,
    },
    [offscreenCanvas]
  );

  fixSize();

  // Start loop
  requestAnimationFrame((timestamp) => tick(timestamp, 0));
}

function initCrafter(type: string, x: number, y: number) {
  if (entities["crafters"].length < basedata["entity_limits"]["crafters"]) {
    const crafter = new Crafter(type, x, y);

    entities["crafters"].push(crafter);

    // renderCrafter(crafter);
  }
}
function initMover(x: number, y: number) {
  if (entities["movers"].length < basedata["entity_limits"]["movers"]) {
    const mover = new Mover(x, y);
    entities["movers"].push(mover);
  }
}

function tick(timestamp: number, lastUpdate: number) {
  const deltaTime = (timestamp - lastUpdate) / 1000;

  if (isPlaying) {
    update(deltaTime);
    render();
  }

  requestAnimationFrame((_timestamp) => tick(_timestamp, timestamp));
}

function update(dt: number) {
  (entities["movers"] as Mover[]).forEach((mover) => mover.update(dt));
}
function render() {
  if (
    selection.length &&
    selection.every((entity) => entity instanceof Mover)
  ) {
    console.log("pass");
    worker.postMessage({ _entities: entities, _selected: selection });
  } else {
    worker.postMessage({ _entities: entities });
  }
}

function renderCrafter(crafter: Crafter) {
  sCtx.beginPath();
  sCtx.fillStyle = "#FFFFFF";

  sCtx.moveTo(crafter.pos.x + 50, crafter.pos.y);
  sCtx.rect(crafter.pos.x, crafter.pos.y, 50, 50);

  sCtx.fill();
  sCtx.closePath();
}
function batchRenderCrafters() {
  sCtx.beginPath();
  sCtx.fillStyle = "#FFFFFF";

  entities.crafters.forEach((crafter) => {
    sCtx.moveTo(crafter.pos.x + 50, crafter.pos.y);
    sCtx.rect(crafter.pos.x, crafter.pos.y, 50, 50);
  });

  sCtx.fill();
  sCtx.closePath();
}

function clearSelectionArea() {
  let xbuffer =
    Math.floor(selectionRect.endX - selectionRect.startX) >= 0 ? 2 : -2;
  let ybuffer =
    Math.floor(selectionRect.endY - selectionRect.startY) >= 0 ? 2 : -2;

  oCtx.clearRect(
    selectionRect.startX + xbuffer,
    selectionRect.startY + ybuffer,
    selectionRect.endX - selectionRect.startX + xbuffer,
    selectionRect.endY - selectionRect.startY + ybuffer
  );
}
function drawSelectionArea() {
  console.log(
    "draw: ",
    Math.floor(selectionRect.startX),
    Math.floor(selectionRect.startY),
    Math.floor(selectionRect.endX - selectionRect.startX),
    Math.floor(selectionRect.endY - selectionRect.startY)
  );
  oCtx.fillStyle = "rgba(0, 255, 0, 0.5)";
  oCtx.beginPath();
  oCtx.rect(
    Math.floor(selectionRect.startX),
    Math.floor(selectionRect.startY),
    Math.floor(selectionRect.endX - selectionRect.startX),
    Math.floor(selectionRect.endY - selectionRect.startY)
  );
  oCtx.fill();
}

function fixSize() {
  // Correct Canvases
  const WIDTH = window.innerWidth;
  const HEIGHT = window.innerHeight;

  staticCanvas.width = WIDTH;
  staticCanvas.height = HEIGHT;

  overlayCanvas.width = WIDTH;
  overlayCanvas.height = HEIGHT;

  canvasDimensions = {
    width: window.innerWidth,
    height: window.innerHeight,
    dpi: dpi,
  };

  worker.postMessage({ _dimensions: canvasDimensions });

  oCtx.scale(dpi, dpi);
  sCtx.scale(dpi, dpi);

  // Resizing clears canvases so needs repainting
  batchRenderCrafters();
}

function getMousePos(canvas: HTMLCanvasElement, e: MouseEvent) {
  let rect = canvas.getBoundingClientRect();

  return {
    x:
      (((e.clientX - rect.left) / (rect.right - rect.left)) * canvas.width) /
      dpi,
    y:
      (((e.clientY - rect.top) / (rect.bottom - rect.top)) * canvas.height) /
      dpi,
  };
}
function checkRectCollision(
  rect1: { startX: number; startY: number; endX: number; endY: number },
  rect2: { startX: number; startY: number; endX: number; endY: number }
): boolean {
  return (
    rect1.startX >= rect2.endY &&
    rect1.endY <= rect2.startX &&
    rect1.startY >= rect2.endY &&
    rect1.endY <= rect2.startY
  );
}
function pointInRect(
  point: { x: number; y: number },
  rect: { startX: number; startY: number; endX: number; endY: number }
): boolean {
  return (
    point.x >= rect.startX &&
    point.x <= rect.endX &&
    point.y >= rect.startY &&
    point.y <= rect.endY
  );
}
