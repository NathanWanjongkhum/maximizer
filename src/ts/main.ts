import basedata from "../basedata.json" assert { type: "JSON" };
import { Client, Construction, Crafter, Entity, Mover } from "./entities";

const worker = new Worker("/src/ts/canvasWorker.ts");

// Globals
let canvas: HTMLCanvasElement;
let offscreenCanvas: OffscreenCanvas;

let dpi = window.devicePixelRatio;
let canvasDimensions: { width: number; height: number; dpi: number };

// Lists
let entities: Record<string, Entity[]> = {
  movers: new Array<Mover>(),
  crafters: new Array<Crafter>(),
  constructions: new Array<Construction>(),
};

// Cache
const interval = 1 / 120;

export function init(canvas_: HTMLCanvasElement) {
  canvas = canvas_;

  offscreenCanvas = canvas.transferControlToOffscreen();

  canvas.addEventListener("mousemove", onMouseMove, false);
  window.addEventListener("resize", fixSize, false);

  initCrafter("processing unit", 500, 500);
  initCrafter("processing unit", 1000, 800);

  for (let i = 0; i < 100; i++) {
    initMover(400 + i * 10, 50 + ((i * 10) % 300));

    const mover = (entities["movers"] as Mover[])[i];

    if (!mover) return;
    // mover.tasks[0] = {
    //   client: entities.crafters[0] as Client,
    //   order: "recieve",
    // };
    // mover.tasks[1] = {
    //   client: entities.crafters[1] as Client,
    //   order: "deposit",
    // };

    mover.setTask(0);
  }

  canvasDimensions = {
    width: canvas.clientWidth,
    height: canvas.clientHeight,
    dpi: dpi,
  };

  worker.postMessage(
    {
      _canvas: offscreenCanvas,
      _dimensions: canvasDimensions,
      _entities: entities,
    },
    [offscreenCanvas]
  );

  requestAnimationFrame(tick);
}

function initCrafter(type: string, x: number, y: number) {
  if (entities["crafters"].length < basedata["entity_limits"]["crafters"]) {
    const crafter = new Crafter(type, x, y);
    entities["crafters"].push(crafter);
  }
}
function initMover(x: number, y: number) {
  if (entities["movers"].length < basedata["entity_limits"]["movers"]) {
    const mover = new Mover(x, y);
    entities["movers"].push(mover);
  }
}

function tick() {
  update();
  render();

  requestAnimationFrame(tick);
}

function update() {
  (entities["movers"] as Mover[]).forEach((mover) => {
    mover.update(interval);
  });
}

function render() {
  worker.postMessage({ _entities: entities });
}

function onMouseMove(e: Event) {}

function fixSize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  canvasDimensions = {
    width: canvas.clientWidth,
    height: canvas.clientHeight,
    dpi: dpi,
  };

  worker.postMessage({ _dimensions: canvasDimensions });
}
