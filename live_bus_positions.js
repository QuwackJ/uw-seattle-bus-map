// importing static route data for lookups
import { routesById } from "./routes_uw_static.js";

// constant for proxy to S3 AWS link of live bus positions JSON data
export const LIVE_BUS_POSITIONS_URL = 'https://kcm-proxy.quwackj.workers.dev/';

// constant for bus routes to filter
export const ROUTE_IDS_OF_INTEREST = [
    "100223",
    "100224",
    "100225",
    "100228",
    "100447",
    "100254",
    "100259",
    "100264"
];

// constructing object to hold live bus positions from S3 AWS link
export class LiveBusData {
    constructor(route_id, route_num, headsign_primary, headsign_secondary, label, direction_id, lat, lon) {
        this.route_id = route_id;
        this.route_num = route_num;
        this.headsign_primary = headsign_primary;
        this.headsign_secondary = headsign_secondary;
        this.label = label;
        this.direction_id = direction_id;
        this.coordinates = [lon, lat];
    }
}

// fetch and filter data from S3 AWS link
export async function fetchLiveBusPositions(routeIds = ROUTE_IDS_OF_INTEREST) {
    const response = await fetch(LIVE_BUS_POSITIONS_URL);
    const busPositions = await response.json();
    
    // filter bus positions based on route IDs of interest
    const allowedBuses = new Set(routeIds.map(String));

    const filteredBusPositions = busPositions.entity.filter(e => {
        const routeIdToCheck = e.vehicle.trip.route_id;
        return allowedBuses.has(String(routeIdToCheck));
    });

    // return filtered data in same format as original
    return {
        header: busPositions.header,
        entity: filteredBusPositions
    }
}

// convert fetched data into array of LiveBusData objects
export function convertToLiveBusObjects(filteredBusPositionsJson) {
    if (!filteredBusPositionsJson || !filteredBusPositionsJson.entity) {
        return [];
    }

    const buses = [];

    for (const e of filteredBusPositionsJson.entity) {
        const trip = e.vehicle.trip;
        const position = e.vehicle.position;
        const routeIdString = String(trip.route_id);
        const directionIdString = String(trip.direction_id);

        // look up route_short_name and trip_headsigns
        let routeShortName = "";
        let tripHeadsignPrimary = "";
        let tripHeadsignSecondary = "";

        const routeInfo = routesById[routeIdString];

        if (routeInfo) {
            routeShortName = routeInfo.route_short_name;

            const directionInfo = routeInfo.directions?.[directionIdString];

            if (directionInfo && Array.isArray(directionInfo.trip_headsign)) {
                tripHeadsignPrimary = directionInfo.trip_headsign[0] || "";
                tripHeadsignSecondary = directionInfo.trip_headsign[1] || "";
            }
        }

        buses.push(new LiveBusData(
            trip.route_id,
            routeShortName,
            tripHeadsignPrimary,
            tripHeadsignSecondary,
            e.vehicle.vehicle.label,
            trip.direction_id,
            position.latitude,
            position.longitude
        ));
    }

    // print array of LiveBusData objects to console for debugging
    console.log("First 5 LiveBusData objects:", buses.slice(0, 5));
    console.log(buses.length)

    return buses;
}

// combining fetching and converting into single function + converting to GeoJSON format
export async function getLiveBusGeoJSON() {
    const busPositionsJson = await fetchLiveBusPositions(ROUTE_IDS_OF_INTEREST);
    const busObjectArray = convertToLiveBusObjects(busPositionsJson);

    return {
        type: "FeatureCollection",
        features: busObjectArray.map(bus => ({
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: bus.coordinates
            },
            properties: {
                route_id: bus.route_id,
                route_num: bus.route_num,
                headsign_primary: bus.headsign_primary,
                headsign_secondary: bus.headsign_secondary,
                label: bus.label,
                direction_id: bus.direction_id
            }
        }))
    }
}
