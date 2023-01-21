import basedata from "../basedata.json" assert { type: "JSON" };

export type Entity = Mover | Crafter | Construction;

interface Posistion {
  x: number;
  y: number;
}
interface Stack {
  quantity: number;
  type: string;
}
interface Task {
  client: Client;
  order: string;
}

export class Client {
  pos: Posistion;
  range: number;
  inventory: Stack[];
  filter: Stack[];

  constructor(x: number, y: number) {
    this.pos = { x, y };
    this.range = 75;

    this.inventory = [];
    this.filter = [];
  }

  transfer(order: string, items: Stack[]) {
    switch (order) {
      case "recieve":
        if (!items) return;

        items.forEach((item) => {
          const stack = this.inventory.find((i) => i.type === item.type);
        });
        break;
      case "deposit":
        if (!items) return;

        items.forEach((item) => {
          const stack = this.inventory.find((i) => i.type === item.type);
        });
        break;

      default:
        break;
    }
  }
}

export class Mover {
  [key: string]: any;

  pos: Posistion;
  angle: number;
  tasks: Task[];
  currentTask: Task | null;
  inventory: Stack[];
  capacity: number;
  speed: number;
  selected: boolean;

  constructor(x: number, y: number) {
    this.pos = { x, y };
    this.angle = 0;

    this.tasks = [];
    this.currentTask = null;

    this.inventory = [];

    this.capacity = 1;
    this.speed = 500;

    this.selected = false;
  }

  update(dt: number) {
    if (!this.currentTask) return;

    this.pos.x += this.speed * Math.cos(this.angle) * dt;
    this.pos.y += this.speed * Math.sin(this.angle) * dt;

    const client = this.currentTask.client;
    if (this.inRange(client)) {
      client.transfer(this.currentTask.order, this.inventory);

      const id = (this.tasks.indexOf(this.currentTask) + 1) % this.tasks.length;

      this.setTask(id);
    }
  }

  private inRange(client: Client) {
    const xDiff = Math.abs(this.pos.x + 5 - (client.pos.x + 25));
    const yDiff = Math.abs(this.pos.y + 5 - (client.pos.y + 25));

    return xDiff < client.range && yDiff < client.range;
  }

  setTask(i: number) {
    this.currentTask = this.tasks[i];
    if (this.currentTask) {
      this.angle = radiansOfTwoPoints(this.pos, this.currentTask.client.pos);
    }
  }

  getX() {
    return Math.round(this.pos.x);
  }
  getY() {
    return Math.round(this.pos.y);
  }
}
export class Crafter extends Client {
  type: string;
  recipeRequirements: Stack[];
  craftSpeed: number;
  progress: number;

  constructor(type: string, x: number, y: number) {
    super(x, y);

    this.type = type;
    this.recipeRequirements = basedata["recipes"][type as keyof {}];

    this.craftSpeed = 1;
    this.progress = 0;
  }

  update(diff: number) {}

  onComplete() {}
}
export class Construction extends Client {
  completionState: string;
  completionRequirements: Stack[];

  constructor(x: number, y: number, completionStateRef: string) {
    super(x, y);

    this.completionState = completionStateRef;
    this.completionRequirements =
      basedata["recipes"][completionStateRef as keyof {}];
  }

  onComplete() {}
}

function radiansOfTwoPoints(p1: Posistion, p2: Posistion) {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}
