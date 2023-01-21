// To satsify --isolatedModules error
export type {};

import { Client, Construction, Crafter, Entity, Mover } from "./entities";

let canvas: OffscreenCanvas;
let ctx: OffscreenCanvasRenderingContext2D;

const PI2 = 2 * Math.PI;

self.onmessage = async (msg) => {
  const { _canvas, _dimensions, _entities, _selected } = msg.data;

  if (_canvas) {
    canvas = _canvas;
    ctx = canvas.getContext("2d", {
      alpha: true,
    })! as OffscreenCanvasRenderingContext2D;
  }

  if (_dimensions) fixSize(_dimensions);

  if (!ctx || !_entities) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  batchUpdateMovers(_entities.movers, "#FFFFFF");
  if (_selected) batchUpdateMovers(_selected, "#00FF00");
};

function batchUpdateMovers(movers: Mover[], color: string) {
  let _x: number;
  let _y: number;

  ctx.beginPath();
  ctx.fillStyle = color;

  movers.forEach((mover) => {
    _x = Math.round(mover.pos.x);
    _y = Math.round(mover.pos.y);

    ctx.moveTo(_x + 5, _y);
    ctx.arc(_x, _y, 5, 0, PI2);
  });

  ctx.fill();
  ctx.closePath();
}

interface canvasDimensions {
  width: number;
  height: number;
  dpi: number;
}

function fixSize(dimensions: canvasDimensions) {
  if (!canvas) return;

  const { width, height, dpi } = dimensions;

  canvas.width = width;
  canvas.height = height;

  ctx.scale(dpi, dpi);
}
