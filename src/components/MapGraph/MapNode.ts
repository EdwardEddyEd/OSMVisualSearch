export default class MapNode{
    id: string;
    lat: number;
    lon: number;
    xpos: number;
    ypos: number;
    isVertex: boolean;

    constructor(id: string, lat: number, lon: number, xpos: number, ypos: number, isVertex: boolean = false){
        this.id = id;
        this.lat = lat;
        this.lon = lon;
        this.xpos = xpos;
        this.ypos = ypos;
        this.isVertex = isVertex;
    }

    setPos(xpos: number, ypos: number){
        this.xpos = xpos;
        this.ypos = ypos;
    }

    setIsVertex(isVertex: boolean){
        this.isVertex = isVertex;
    }
}