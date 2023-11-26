import type { Application, ICanvas } from "pixi.js";

import MapNode from "./MapNode"
import { PIXIMapGraph } from "./MapGraph";
import { PIXIMapVertex } from "./MapVertex";
import { PIXIMapEdge } from "./MapEdge";
import type { MapBounds } from "./MapBounds";

import { PIXIGraphStore, mapBoundsStore } from "src/ts/store";

const XML_WAY_VALUES = [
    "bus_stop",
    "crossing",
    // "cycleway",
    // "footway",
    "give_way",
    "living_street",
    "motorway",
    "motorway_junction",
    "motorway_link",
    "path",
    // "pedestrian",
    "primary",
    "primary_link",
    "residential",
    "rest_area",
    "secondary",
    "service",
    "steps",
    "stop",
    "street_lamp",
    "tertiary",
    "track",
    "traffic_signals",
    "trailhead",
    "trunk",
    "turning_circle",
    "unclassified",
];

const generatePIXIGraph = (app: Application<ICanvas>, file: File) => {
    const reader = new FileReader();
    reader.readAsText(file);

    reader.onload = function () {
        // Parse the XML file
        const parser = new DOMParser();
        if (typeof reader.result !== "string")
            throw new Error("FileReader did not contain a string for it's results");
        const xmlDoc = parser.parseFromString(reader.result, "text/xml");

        // Get elements, data, and tags from the xmlDoc
        const xmlBounds = xmlDoc.getElementsByTagName("bounds")[0];
        const nodes = Array.from(xmlDoc.getElementsByTagName("node"));
        // const ways = Array.from(
        //     xmlDoc.querySelectorAll(`way tag[k = 'highway']`),
        // ).map((val) => val.parentElement!);

        // NOTE: Another way to get ways based on their key="highway" value pair
        let ways: any[] = []
        for (let value of XML_WAY_VALUES) {
            const wayArray = Array.from(
                xmlDoc.querySelectorAll(
                    `way tag[k = 'highway'][v = '${value}']`,
                ),
            ).map((val) => val.parentElement!);
            ways = ways.concat(wayArray);
        }

        // Create MapBounds
        let minlat = parseFloat(xmlBounds.getAttribute("minlat")!);
        let maxlat = parseFloat(xmlBounds.getAttribute("maxlat")!);
        let minlon = parseFloat(xmlBounds.getAttribute("minlon")!);
        let maxlon = parseFloat(xmlBounds.getAttribute("maxlon")!);
        const mapBounds: MapBounds = { minlat, maxlat, minlon, maxlon };

        // Generate a map of nodes: id -> MapNode
        const nodesMap: { [id: string]: MapNode } = {};
        nodes.forEach((node) => {
            const id: string | null = node.getAttribute("id");
            let lat: string | number | null = node.getAttribute("lat");
            let lon: string | number | null = node.getAttribute("lon");

            if (id === null) {
                console.error(`A <node> was found to be missing an id attribute; Node was skipped`);
                return;
            }
            if (lat === null || lon === null) {
                console.error(`Missing lat or lon attribute for <node> with id ${id}. Node was skipped`);
                return;
            }

            lat = parseFloat(lat);
            lon = parseFloat(lon);
            nodesMap[id] = new MapNode(id, lat, lon, 0, 0); // The xpos and ypos will be calculated and normalized later
        });

        // Count how many connections each node has to another from the xml file
        const countMap: { [id: string]: number } = {};
        ways.forEach((way) => {
            if (way === null) {
                console.error(`A <way> was found to be null; Way was skipped`);
                return;
            }

            const nds: Element[] = Array.from(way.getElementsByTagName("nd"));
            let prevNode: { id: string | number } | null = null;
            nds.forEach((nd) => {
                const ref = nd.getAttribute("ref");
                if (ref === null) {
                    console.error(`A <way> was found to be missing a ref attribute; Way was skipped`);
                    return;
                }

                const currNode = nodesMap[ref];
                if (prevNode !== null) {
                    countMap[prevNode.id] = (countMap[prevNode.id] ?? 0) + 1;
                    countMap[currNode.id] = (countMap[currNode.id] ?? 0) + 1;
                }

                prevNode = currNode;
            });
        });

        /**
         * BEGIN CONSTRUCTING THE GRAPH
         * 
         * Identifying Vertices:
         *     1) A node that has only one connection (dead-end, the start and end of streets)
         *     2) A node that has more than two connections (a junction)
         *     3) By traversing xmlDoc's <way>, we can find the start and ends of streets and junctions.
         * 
         * Identifying Edges:
         *     1) By traversing xmlDoc's <way>, everytime we identify two vertices, all the nodes between them
         *        (inclusively) will be considered an edge.
         */
        const PIXIGraph: PIXIMapGraph = new PIXIMapGraph(app);
        const addVertex = (app: Application<ICanvas>, mapBounds: MapBounds, PIXIGraph: PIXIMapGraph, currNode: MapNode, vertexId: string) => {
            const existingVertex = PIXIGraph.getVertexByNodeId(vertexId);
            if (existingVertex === undefined) {
                currNode.setIsVertex(true);
                const PIXIVertex = new PIXIMapVertex(app, mapBounds, currNode);
                PIXIGraph.addVertex(PIXIVertex);
                return PIXIVertex;
            }
            return existingVertex;
        };
        const addEdge = (app: Application<ICanvas>, mapBounds: MapBounds, PIXIGraph: PIXIMapGraph, edge: MapNode[], startVertex: PIXIMapVertex, endVertex: PIXIMapVertex) => {
            const PIXIEdge = new PIXIMapEdge(app, mapBounds, edge);
            PIXIGraph.addEdge(startVertex, endVertex, PIXIEdge);
        }

        ways.forEach((way) => {
            if (way === null) {
                console.error(`A <way> was found to be null during edge generation; Way was skipped`);
                return;
            }
            const nds: Element[] = Array.from(way.getElementsByTagName("nd"));

            let edge: MapNode[] = [];
            let prevNode: MapNode | null = null;
            let startVertex: PIXIMapVertex | null = null;
            nds.forEach((nd, index, nds) => {
                const id = nd.getAttribute("ref")!;
                const currNode = nodesMap[id];

                // Case 1: At the first node (i.e., at the start of a street), ensure that it is marked as a vertex
                if (startVertex === null) {
                    startVertex = addVertex(app, mapBounds, PIXIGraph, currNode, id);
                }

                // Case 2: While traversing the street, you reach a node that is a vertex (a node with 1 or >2 connections)
                // OR
                // Case 3: If at the end of the street and an edge hasn't been added yet
                if (
                    (prevNode !== null && countMap[id] !== 2) ||
                    (index + 1 == nds.length)
                ) {
                    // Add this current node as a vertex
                    const endVertex = addVertex(app, mapBounds, PIXIGraph, currNode, id);

                    // Add the current node as the last node in this edge
                    edge.push(currNode);

                    // Create a new edge and add it to the graph
                    addEdge(app, mapBounds, PIXIGraph, edge, startVertex, endVertex);

                    // Clear out the edge and set the new starting vertex
                    edge = [];
                    startVertex = endVertex;
                }

                edge.push(currNode);
                prevNode = currNode;
            });
        });

        // Store the PIXIGraph and MapBounds
        PIXIGraphStore.set(PIXIGraph);
        mapBoundsStore.set(mapBounds);

        console.log(PIXIGraphStore.get());
    }
}
export default generatePIXIGraph;