import type MapEdge from "./MapEdge";
import type MapVertex from "./MapVertex";

export default class MapGraph {
    vertices: MapVertex[];
    edges: MapEdge[];
    graph: Map<MapVertex, [MapVertex, MapEdge][]>;

    constructor(){
        this.vertices = [];
        this.edges = [];
        this.graph = new Map<MapVertex, [MapVertex, MapEdge][]>();
    }

    addVertex(vertex: MapVertex){
        if(this.vertices.find(graphVertex => graphVertex.node.id === vertex.node.id) === undefined){
            this.vertices.push(vertex);
            this.graph.set(vertex, []);
        }
    }

    addVertices(vertices: MapVertex[]){
        vertices.forEach(vertex => this.addVertex(vertex));
    }

    getVertexByNodeId(id: string){
        return this.vertices.find(graphVertex => graphVertex.node.id === id);
    }

    addEdge(startVertex: MapVertex, endVertex: MapVertex, edge: MapEdge){
        this.edges.push(edge);
        this.graph.get(startVertex)?.push([endVertex, edge]);
        this.graph.get(endVertex)?.push([startVertex, edge]);
    }

    drawVertices(ctx: CanvasRenderingContext2D, color?: string, radius?: number){
        this.vertices.forEach(vertex => vertex.drawVertex(ctx, color, radius));
    }

    drawEdges(ctx: CanvasRenderingContext2D, color?: string, lineWidth?: number){
        this.edges.forEach(edge => edge.drawEdge(ctx, color, lineWidth));
    }
}