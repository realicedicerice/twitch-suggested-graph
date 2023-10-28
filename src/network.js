import { Network } from 'vis-network'
import { DataSet } from 'vis-data'

function createNetwork(container, { nodes, edges }) {
    return new Network(container, {
        nodes,
        edges
    }, {
        edges: {
            selectionWidth: w => w * 4
        },
        physics: {
            barnesHut: {
                gravitationalConstant: -10000,
                centralGravity: 0.1,
                springLength: 200
            }
        }
    })
}

function createNetworkData() {
    return {
        nodes: new DataSet([]),
        edges: new DataSet([])
    }
}

function addUserNode(networkData, user) {
    networkData.nodes.add({
        id: user.id,
        shape: "circularImage", 
        image: user.profileImageURL,
        label: user.displayName,
        color: {
            border: '#' + (user.primaryColorHex || '0000AA')
        },
        borderWidth: 8,
        size: Math.min(30 + 0.1 * Math.sqrt(user.followers.totalCount), 100)
    })
}

function addUserLink(networkData, link) {
    networkData.edges.add({
        from: link.from,
        to: link.to,
        arrows: 'to'
    })
}
export { addUserNode, addUserLink, createNetworkData, createNetwork }