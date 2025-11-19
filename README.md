# UW Seattle Bus Map

## Description
For our final project in GEOG 328, we decided to make a webmap showing live-updating positions of buses in Seattle, specifically those that go to and from UW. We chose to display the following routes: 43, 44, 45, 48, 49, 65, 67, and 70.

[Check out the map here!]() -> ADD LINK WHEN EVERYTHING IS DONE; DOES NOTHING RIGHT NOW

## Goal
We intend for this webmap to be used as a fun yet realistic display of a few buses that serve the UW Seattle campus. The webmap is not meant to be used for actual navigational purposes.

## Main Functions
When users first load the webmap, they will see a map consisting of a custom basemap centered over UW Seattle and the University District that contains 8 bus routes.

[insert screenshot of this working]

On the bus routes, there will be moving circles to represent the current positions of buses on the routes. The positions of these circles will be updated every 7.5 seconds. The moving buses display a pop-up that shows their route number, headsign(s), and label when clicked.

[insert screenshot of this working]

When users zoom into the map and reach zoom level 14, they will see bus stops along the routes, which are represented as gray circles. The bus stops display a pop-up that shows their address when clicked.

[insert screenshot of this working]

At zoom level 15, users can see buildings drawn in 3D. By holding CTRL while dragging the map, users can see the map at different angles. This impacts the shading of the buildings.

[insert screenshot of this working]

To the left of the map, there will be a menu that has 8 buttons, one for each route displayed on the map. The buttons will be color-coded in the same way as the moving buses. By clicking on a button, users can see one route at a time in its specified color and the bus stops associated with the route. All other routes and bus stops will become faded.

[insert screenshot of this working]

## Data Sources
Our webmap utilizes General Transit Feed Specification (GTFS) data from [King County Metro](https://kingcounty.gov/en/dept/metro/rider-tools/mobile-and-web-apps#toc-developer-resources) that comes in two forms: static and real-time (GTFS-RT). The static GTFS data is a collection of 11 CSVs represented as .txt files that describe a variety of characteristics for King County Metro Transit Services, such as scheduling, fares, routes, stops, and trips. The GTFS-RT data comes from [King County Metro’s S3 AWS link](https://s3.amazonaws.com/kcm-alerts-realtime-prod/vehiclepositions_pb.json), which we pull from every 7.5 seconds. The data that comes from the link describes the live positions of individual buses for all of King County and is in JSON.

## Applied Libraries and Webservices

### MapBox
[insert here]

### Cloudflare
Due to a Cross-Origin Resource Sharing (CORS) error, we were not able to pull from King County Metro's S3 AWS link directly. To work around this, we used Cloudflare Workers to create a [third-party proxy](https://kcm-proxy.quwackj.workers.dev/) that helps us pull data indirectly.

## Acknowledgements
[insert here]

## AI Disclosure - how have we used AI?
- (for the front end), we used AI to help us make the menu look fancier, also, it did teach us how to filter the routes we want.
