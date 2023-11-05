import type MapNode from "./MapNode";

export default class MapVertex {
    node: MapNode;
    color: string;
    radius: number;

    constructor(node: MapNode, color: string = "#000000", radius: number = 3) {
        this.node = node;
        this.color = color;
        this.radius = radius;
    }

    drawVertex(ctx: CanvasRenderingContext2D, color: string = this.color, radius: number = this.radius) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(this.node.xpos, this.node.ypos, radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
    }
}