const jsnx = require('jsnetworkx');

export const computeBetweennessCentralities = (circles, connections) => {
    const G = new jsnx.Graph();
    G.addNodesFrom(circles.keys());
    G.addEdgesFrom(connections.map((connection) => [connection.get('source'), connection.get('target')]));
    const bc = jsnx.betweennessCentrality(G);
    for (const [key, b] of bc) {
        circles = circles.setIn([key, 'centrality'], b);
    }
    return circles;
};