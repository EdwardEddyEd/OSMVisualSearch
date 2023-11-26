import { 
    Circle,
    Sprite, 
    Graphics, 
    type Sprite as SpriteType, 
    type Application, 
    type ICanvas, 
} from "pixi.js";
import type { MapBounds } from "./MapBounds";
import type MapNode from "./MapNode";

export class PIXIMapVertex {
    app: Application<ICanvas>;
    mapBounds: MapBounds;
    mapVertex: MapNode;

    sprite: SpriteType;
    color: string;
    alpha: number;
    radius: number;
    scale: number;
    zIndex: number;

    constructor(app: Application<ICanvas>, mapBounds: MapBounds, mapVertex: MapNode, color?: string, alpha?: number, radius?: number, zIndex?: number) {
        this.app = app;
        this.mapBounds = mapBounds;
        this.mapVertex = mapVertex;
        this.color = color ?? "#ffdd00";
        this.alpha = alpha ?? 0.5;
        this.radius = radius ?? 3.5;
        this.scale = 1;
        this.zIndex = 5;

        this.sprite = new Sprite();
        this.sprite.eventMode = "dynamic";   // Similar to interactive = true
        this.sprite.anchor.set(0.5, 0.5);
        this.app.stage.addChild(this.sprite);
        
        // Adding interactivity
        const onPointerOver = () => {
            this.setColorAlpha(undefined, 1);
            this.setScale(1.5);
            // this.app.renderer.render(this.sprite);
            console.log("Pointer Over");
        };
        const onPointerOut = () => {
            this.setColorAlpha(undefined, 0.5);
            this.setScale(1);

            // this.app.renderer.render(this.sprite);
            console.log("Pointer Out");
        };
        this.sprite.on("pointerover", onPointerOver);
        this.sprite.on("pointerout", onPointerOut);
        this.sprite.cursor = 'pointer';
        
        this.normalizePosition(mapBounds);
    }

    setColorAlpha(color?: string, alpha?: number) {
        this.color = color ?? this.color;
        this.alpha = alpha ?? this.alpha;
        this.generateSprite();
    }

    setScale(scale: number) {
        this.scale = scale;
        this.generateSprite();
    }

    generateSprite() {
        const PIXIGraphic = new Graphics();
        PIXIGraphic.clear();
        PIXIGraphic.lineStyle(0);
        PIXIGraphic.beginFill(this.color, this.alpha);
        PIXIGraphic.drawCircle(this.mapVertex.xpos, this.mapVertex.ypos, this.radius * this.scale);
        PIXIGraphic.endFill();
        
        const texture = this.app.renderer.generateTexture(PIXIGraphic);
        this.sprite.texture = texture;
        this.sprite.x = this.mapVertex.xpos;
        this.sprite.y = this.mapVertex.ypos;
        this.sprite.zIndex = this.zIndex;
        PIXIGraphic.destroy();
    }

    setHitArea() {
        const hitArea = new Circle(0, 0, this.radius * 3);
        this.sprite.hitArea = hitArea;
    }

    normalizePosition(mapBounds: MapBounds, canvasWidth?: number, canvasHeight?: number) {
        this.mapBounds = mapBounds;
        const width = canvasWidth ?? this.app.view.width;
        const height = canvasHeight ?? this.app.view.height;

        const node = this.mapVertex;
        const xpos = width * ((node.lon - this.mapBounds.minlon) / (this.mapBounds.maxlon - this.mapBounds.minlon));
        const ypos = height - (height * ((node.lat - this.mapBounds.minlat) / (this.mapBounds.maxlat - this.mapBounds.minlat)));
        node.setPos(xpos, ypos);

        this.generateSprite();
        this.setHitArea();
    }

    destroy() {
        this.app.stage.removeChild(this.sprite);
        this.sprite.destroy();
    }
}