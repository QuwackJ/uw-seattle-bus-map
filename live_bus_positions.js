// constant for S3 AWS link to live bus positions JSON data
export const LIVE_BUS_POSITIONS_URL = 'https://s3.amazonaws.com/kcm-alerts-realtime-prod/vehiclepositions_pb.json';

// constructing object to hold live bus positions from S3 AWS link
export class LiveBusData {
    constructor(label, route_id, direction_id, lat, lon) {
        this.label = label;
        this.route_id = route_id;
        this.direction_id = direction_id;
        this.coordinates = [lon, lat];
    }
}

// fetch data from S3 AWS link
export async function fetchLiveBusPositions() {
    const response = await fetch(LIVE_BUS_POSITIONS_URL);
    const busPositions = await response.json();
    return busPositions;
}

// convert fetched data into array of LiveBusData objects
export function convertToLiveBusObjects(busPositions) {
    if (!busPositions || !busPositions.entity) {
        return [];
    }

    return busPositions.entity.map(e => {
        const trip = e.vehicle.trip;
        const position = e.vehicle.position;

        return new LiveBusData(
            e.vehicle.vehicle.label,
            trip.route_id,
            trip.direction_id,
            position.latitude,
            position.longitude
        );
    });
}

// might delete this function later - depends on if the one below works
// combining fetching and converting into single function
// export async function getLiveBusData() {
//     const busPositionsJson = await fetchLiveBusPositions();
//     return convertToLiveBusObjects(busPositionsJson);
// }

// combining fetching and converting into single function + converting to GeoJSON format
export async function getLiveBusGeoJSON() {
    const busPositionsJson = await fetchLiveBusPositions();
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
