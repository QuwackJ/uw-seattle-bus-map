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
