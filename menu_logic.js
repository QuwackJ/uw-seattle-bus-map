// importing static route data for lookups
import { routesById } from "./routes_uw_static.js";

// menu logic for route selection and stop fading
export function menuLogic(map) {
    const routeButtons = document.querySelectorAll('.route-btn');
    let activeRouteId = null;

    function getStopsIdsforRoute(route_id) {
        const route = routesById[route_id];
        const ids = new Set();

        // find all stops for a route in both directions
        for (const direction of ["0", "1"]) {
            const directionInfo = route.directions?.[direction];

            for (const stopSequence of directionInfo?.stops_ordered) {
                for (const stopId of stopSequence) {
                    ids.add(stopId);
                }
            }
        }

        return Array.from(ids);
    }

    function fadeUnselectedRoutes(routeId) {
        const stopIds = getStopsIdsforRoute(routeId);

        // set opacity for stops along unselected routes
        map.setPaintProperty('uw-stops', 'circle-opacity', [
            'case',
            ['in', ['get', 'stop_id'], ['literal', stopIds]],
            1, // stops on a selected route are fully visible
            0.2
        ]);
    }

    function resetStopOpacity() {
        // reset stop opacity to fully visible for all stops when no route is selected
        map.setPaintProperty('uw-stops', 'circle-opacity', 1);
    }

    routeButtons.forEach(b => {
        b.addEventListener('click', () => {
            const routeId = b.getAttribute('data-route-id');

            // when the same route is selected again, reset the opacity of bus stops (map should go back to default state)
            if (activeRouteId === routeId) {
                resetStopOpacity();
                activeRouteId = null;
                routeButtons.forEach(btn => btn.classList.remove('active'));
                return;
            }

            // when a route is selected, fade bus stops that are not along selected route
            activeRouteId = routeId;
            fadeUnselectedRoutes(routeId);
            routeButtons.forEach(btn => btn.classList.remove('active'));
            b.classList.add('active');
        });
    });
}
