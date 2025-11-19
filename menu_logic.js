import { routesById } from "./routes_uw_static.js";

export function menuLogic(map) {
    const routeButtons = document.querySelectorAll('.route-btn');
    let activeRouteId = null;

    function getStopsIdsforRoute(route_id) {
        const route = routesById[route_id];
        const ids = new Set();

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

        map.setPaintProperty('uw-stops', 'circle-opacity', [
            'case',
            ['in', ['get', 'stop_id'], ['literal', stopIds]],
            1,
            0.2
        ]);
    }

    function resetStopOpacity() {
        map.setPaintProperty('uw-stops', 'circle-opacity', 1);
    }

    routeButtons.forEach(b => {
        b.addEventListener('click', () => {
            const routeId = b.getAttribute('data-route-id');

            if (activeRouteId === routeId) {
                resetStopOpacity();
                activeRouteId = null;
                routeButtons.forEach(btn => btn.classList.remove('active'));
                return;
            }

            activeRouteId = routeId;
            fadeUnselectedRoutes(routeId);
            routeButtons.forEach(btn => btn.classList.remove('active'));
            b.classList.add('active');
        });
    });
}
