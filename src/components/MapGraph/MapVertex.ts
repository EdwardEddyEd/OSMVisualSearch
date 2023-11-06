import { Graphics, type Graphics as GraphicsType, type Application, type ICanvas } from "pixi.js";
import type { MapBounds } from "./MapBounds";
import type MapNode from "./MapNode";

export class PIXIMapVertex {
    app: Application<ICanvas>;
    mapBounds: MapBounds;
    mapVertex: MapNode;

    PIXIGraphic: GraphicsType;
    color: string;
    alpha: number;
    radius: number;
    zIndex: number;

    constructor(app: Application<ICanvas>, mapBounds: MapBounds, mapVertex: MapNode, color?: string, alpha?: number, radius?: number, zIndex?: number) {
        this.app = app;
        this.mapBounds = mapBounds;
        this.mapVertex = mapVertex;
        this.color = color ?? "#00ffaa";
        this.alpha = alpha ?? 1;
        this.radius = radius ?? 2;
        this.zIndex = 5;

        this.PIXIGraphic = new Graphics();
        this.app.stage.addChild(this.PIXIGraphic);
        
        this.normalizePosition(mapBounds);
    }

    setColorAlpha(color?: string, alpha?: number) {
        this.color = color ?? this.color;
        this.alpha = alpha ?? this.alpha;
        this.createGraphic();
    }

    createGraphic() {
        this.PIXIGraphic.clear();
        this.PIXIGraphic.zIndex = this.zIndex;
        this.PIXIGraphic.lineStyle(0);
        this.PIXIGraphic.beginFill(this.color, this.alpha);
        this.PIXIGraphic.drawCircle(this.mapVertex.xpos, this.mapVertex.ypos, this.radius);
        this.PIXIGraphic.endFill();
    }

    normalizePosition(mapBounds: MapBounds, canvasWidth?: number, canvasHeight?: number) {
        this.mapBounds = mapBounds;
        const width = canvasWidth ?? this.app.view.width;
        const height = canvasHeight ?? this.app.view.height;

        const node = this.mapVertex;
        const xpos = width * ((node.lon - this.mapBounds.minlon) / (this.mapBounds.maxlon - this.mapBounds.minlon));
        const ypos = height - (height * ((node.lat - this.mapBounds.minlat) / (this.mapBounds.maxlat - this.mapBounds.minlat)));
        node.setPos(xpos, ypos);

        this.createGraphic();
    }

    destroy() {
        this.app.stage.removeChild(this.PIXIGraphic);
        this.PIXIGraphic.destroy();
    }
}