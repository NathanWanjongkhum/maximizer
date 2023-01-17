import basedata from "../basedata.json" assert { type: "JSON" };
import { Client, Construction, Crafter, Entity, Mover } from "./entities";

const worker = new Worker("/src/ts/canvasWorker.ts");

// Globals
let canvas: HTMLCanvasElement;
let offscreenCanvas: OffscreenCanvas;

let dpi = window.devicePixelRatio;

// Lists
let entities: Record<string, Entity[]> = {
  movers: new Array<Mover>(),
  crafters: new Array<Crafter>(),
  constructions: new Array<Construction>(),
};

// Cache

export function init(canvas_: HTMLCanvasElement) {
  canvas = canvas_;
  // ctx = canvas.getContext("2d")!;

  offscreenCanvas = canvas.transferControlToOffscreen();

  // fix_dpi();

  canvas.addEventListener("mousemove", onMouseMove, false);

  initCrafter("processing unit", 500, 500);
  initCrafter("processing unit", 1000, 800);

  for (let i = 0; i < 500; i++) {
    initMover(400 + ((i * 10) % 100), 50 + ((i * 10) % 900));

    const mover = (entities["movers"] as Mover[])[i];

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
  render();

  // requestAnimationFrame(tick);
}

function render() {
  worker.postMessage(
    { canvas: offscreenCanvas, dpi: dpi, entities: entities },
    [offscreenCanvas]
  );
}

function onMouseMove(e: Event) {}
