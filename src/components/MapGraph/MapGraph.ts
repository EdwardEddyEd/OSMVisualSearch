import type { PIXIMapVertex } from "./MapVertex";
import type { PIXIMapEdge } from "./MapEdge";
import type { MapBounds } from "./MapBounds";
import { Application, Container, type ICanvas } from "pixi.js";

export class PIXIMapGraph {
    app: Application<ICanvas>;
    vertices: PIXIMapVertex[];
    edges: PIXIMapEdge[];
    graph: Map<PIXIMapVertex, [PIXIMapVertex, PIXIMapEdge][]>;

    constructor(app: Application<ICanvas>){
        this.app = app;
        this.vertices = [];
        this.edges = [];
        this.graph = new Map<PIXIMapVertex, [PIXIMapVertex, PIXIMapEdge][]>();

    }

    addVertex(vertex: PIXIMapVertex){
        if(this.vertices.find(PIXIVertex => PIXIVertex.mapVertex.id === vertex.mapVertex.id) === undefined){
            this.vertices.push(vertex);
            this.graph.set(vertex, []);
        }
    }

    addVertices(vertices: PIXIMapVertex[]){
        vertices.forEach(vertex => this.addVertex(vertex));
    }

    getVertexByNodeId(id: string){
        return this.vertices.find(PIXIVertex => PIXIVertex.mapVertex.id === id);
    }

    addEdge(startVertex: PIXIMapVertex, endVertex: PIXIMapVertex, edge: PIXIMapEdge){
        this.edges.push(edge);
        this.graph.get(startVertex)?.push([endVertex, edge]);
        this.graph.get(endVertex)?.push([startVertex, edge]);
    }

    normalizeGraphPositions(mapBounds: MapBounds, canvasWidth?: number, canvasHeight?: number){
        this.vertices.forEach(vertex => vertex.normalizePosition(mapBounds, canvasWidth, canvasHeight));
        this.edges.forEach(edge => edge.normalizePosition(mapBounds, canvasWidth, canvasHeight));
    }

    destroy(){
        this.vertices.forEach(vertex => vertex.destroy());
        this.edges.forEach(edge => edge.destroy());
    }
}