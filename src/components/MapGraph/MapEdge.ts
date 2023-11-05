import type MapNode from "./MapNode";

export default class MapEdge {
    nodes: MapNode[];
    color: string;

    constructor(nodes: MapNode[], color: string = "#ff0000") {
        this.nodes = nodes;
        this.color = color;
    }

    drawEdge(ctx: CanvasRenderingContext2D, color: string = this.color, lineWidth: number = 2) {
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;

        let prevPoint: MapNode = this.nodes[0];
        this.nodes.forEach((node, index) => {
            if(index !== 0){
                ctx.beginPath();
                ctx.moveTo(prevPoint.xpos, prevPoint.ypos);
                ctx.lineTo(node.xpos, node.ypos);
                ctx.stroke();
                ctx.closePath();
                
                prevPoint = node;
            }
        });
    }
}