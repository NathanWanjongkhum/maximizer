// To satsify --isolatedModules error
export type {};

import { Client, Construction, Crafter, Entity, Mover } from "./entities";

const interval = 1 / 120;
const PI2 = 2 * Math.PI;

self.onmessage = async (msg) => {
  const { canvas, dpi, entities } = msg.data;

  const ctx = canvas.getContext("2d");

  const img = await createImageBitmap(
    canvas,
    0,
    0,
    canvas.width,
    canvas.height,
    {
      resizeWidth: canvas.width * dpi,
      resizeHeight: canvas.height * dpi,
      resizeQuality: "high",
    }
  );

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.beginPath();
  ctx.fillStyle = "#FFFFFF";

  ctx.rect(100, 100, 500, 500);

  //   batchUpdateMovers();
  //   batchRenderCrafters();

  ctx.fill();
  const imgData = ctx.getImageData(0, 0, img.width, img.height);

  ctx.putImageData(imgData, 0, 0);

  function batchUpdateMovers() {
    let _x: number;
    let _y: number;

    (entities["movers"] as Mover[]).forEach((mover) => {
      //   mover.update(interval);

      _x = Math.round(mover.pos.x);
      _y = Math.round(mover.pos.y);

      ctx.moveTo(_x + 5, _y);
      ctx.arc(_x, _y, 5, 0, PI2);
    });
  }
  function batchRenderCrafters() {
    (entities["crafters"] as Crafter[]).forEach((crafter) => {
      ctx.moveTo(crafter.pos.x + 50, crafter.pos.y);
      ctx.rect(crafter.pos.x, crafter.pos.y, 50, 50);
      // ctx.arc(crafter.pos.x, crafter.pos.y, crafter.range, 0, PI2);
    });
  }

  self.postMessage({ text: "worker" });
};
