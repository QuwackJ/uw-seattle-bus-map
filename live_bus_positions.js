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
    constructor(label, route_id, direction_id, lat, lon) {
        this.label = label;
        this.route_id = route_id;
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

        buses.push(new LiveBusData(
            e.vehicle.vehicle.label,
            trip.route_id,
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
                label: bus.label,
                route_id: bus.route_id,
                direction_id: bus.direction_id
            }
        }))
    }
}
