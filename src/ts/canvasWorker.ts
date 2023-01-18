// To satsify --isolatedModules error
export type {};

import { Client, Construction, Crafter, Entity, Mover } from "./entities";

let canvas: OffscreenCanvas;
let ctx: OffscreenCanvasRenderingContext2D;

const PI2 = 2 * Math.PI;

self.onmessage = async (msg) => {
  const { _canvas, _dimensions, _entities } = msg.data;

  if (_canvas) {
    canvas = _canvas;
    ctx = canvas.getContext("2d")! as OffscreenCanvasRenderingContext2D;

    fixSize(_dimensions);
  }
  if (_dimensions) {
    fixSize(_dimensions);
  }

  if (!ctx || !_entities) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.beginPath();
  ctx.fillStyle = "#FFFFFF";

  const movers: Mover[] = _entities["movers"];
  batchUpdateMovers(movers);

  const crafters: Crafter[] = _entities["crafters"];
  batchRenderCrafters(crafters);

  ctx.fill();

  self.postMessage({ text: "worker" });
};

function batchUpdateMovers(movers: Mover[]) {
  if (!movers) return;

  let _x: number;
  let _y: number;

  movers.forEach((mover) => {
    _x = Math.round(mover.pos.x);
    _y = Math.round(mover.pos.y);

    ctx.moveTo(_x + 5, _y);
    ctx.arc(_x, _y, 5, 0, PI2);
  });
}
function batchRenderCrafters(crafters: Crafter[]) {
  if (!crafters) return;

  crafters.forEach((crafter) => {
    ctx.moveTo(crafter.pos.x + 50, crafter.pos.y);
    ctx.rect(crafter.pos.x, crafter.pos.y, 50, 50);
    // ctx.arc(crafter.pos.x, crafter.pos.y, crafter.range, 0, PI2);
  });
}

interface canvasDimensions {
  width: number;
  height: number;
  dpi: number;
}

function fixSize(dimensions: canvasDimensions) {
  canvas.width = Math.floor(dimensions.width * dimensions.dpi);
  canvas.height = Math.floor(dimensions.height * dimensions.dpi);
  ctx.scale(dimensions.dpi, dimensions.dpi);
}
