import { Graphics, type Application, type ICanvas } from "pixi.js";
import type MapNode from "./MapNode";
import type { MapBounds } from "./MapBounds";

export class PIXIMapEdge{
    app: Application<ICanvas>;
    mapBounds: MapBounds;
    mapEdge: MapNode[];
    
    PIXIGraphic: Graphics;
    color: string;
    alpha: number;
    width: number;
    zIndex: number;

    constructor(app: Application<ICanvas>, mapBounds: MapBounds, mapEdge: MapNode[], color?: string, alpha?: number, width?: number, zIndex?: number){
        this.app = app;
        this.mapBounds = mapBounds;
        this.mapEdge = mapEdge;
        this.color = color ?? "#ff4400";
        this.alpha = alpha ?? .3;
        this.width = width ?? 3;
        this.zIndex = zIndex ?? 0;
     
        this.PIXIGraphic = new Graphics();
        this.app.stage.addChild(this.PIXIGraphic);
        
        this.normalizePosition(mapBounds);
    }

    setColorAlpha(color?: string, alpha?: number){
        this.color = color ?? this.color;
        this.alpha = alpha ?? this.alpha;
        this.createGraphic();
    }

    createGraphic(){
        this.PIXIGraphic.clear();
        this.PIXIGraphic.zIndex = this.zIndex;
        this.PIXIGraphic.lineStyle(this.width, this.color, this.alpha);
        this.mapEdge.forEach((node: MapNode, index: number) => {
            if(index === 0) this.PIXIGraphic.moveTo(node.xpos, node.ypos);
            else            this.PIXIGraphic.lineTo(node.xpos, node.ypos);
        });
    }

    normalizePosition(mapBounds: MapBounds, canvasWidth?: number, canvasHeight?: number) {
        this.mapBounds = mapBounds;
        const width = canvasWidth ?? this.app.view.width;
        const height = canvasHeight ?? this.app.view.height;

        this.mapEdge.forEach((node: MapNode) => {
            const xpos = width * ((node.lon - this.mapBounds.minlon) / (this.mapBounds.maxlon - this.mapBounds.minlon));
            const ypos = height - (height * ((node.lat - this.mapBounds.minlat) / (this.mapBounds.maxlat - this.mapBounds.minlat)));
            node.setPos(xpos, ypos);
        });
        this.createGraphic();
    }

    destroy(){
        this.app.stage.removeChild(this.PIXIGraphic);
        this.PIXIGraphic.destroy();
    }
}
