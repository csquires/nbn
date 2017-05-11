const jsnx = require('jsnetworkx');

export const toGraph = (circles, connections) => {
    const G = new jsnx.Graph();
    G.addNodesFrom(circles.keys());
    G.addEdgesFrom(connections.map((connection) => [connection.get('source'), connection.get('target')]));
    return G;
};

export const computeBetweennessCentralities = (circles, connections) => {
    const G = toGraph(circles, connections);
    const bc = jsnx.betweennessCentrality(G);
    for (const [key, b] of bc) {
        circles = circles.setIn([key, 'centrality'], b);
    }
    return circles;
};

export const computeShortestPath = (circles, connections, node1, node2) => {
    const G = toGraph(circles, connections);
    const path = jsnx.bidirectionalShortestPath(G, node1, node2);
    for (const nodeKey of path) {
        circles = circles.setIn([nodeKey, 'onShortestPath'], true);
    }
    return circles;
};