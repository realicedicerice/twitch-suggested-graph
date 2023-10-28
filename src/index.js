import { createCrawler } from './crawler'

import { addUserNode, addUserLink, createNetwork, createNetworkData } from './network'

import { ui } from './ui'

const data = createNetworkData()
const network = createNetwork(document.querySelector('#network'), data)

const crawler = createCrawler()

const userData = new Map()

crawler.on('data', function({ users, links }) {
    for (const user of users) {
        userData.set(user.id, user)
        addUserNode(data, user)
    }
    for (const link of links) {
        addUserLink(data, link)
    }
})

crawler.on('endOfQueue', function() {
    ui.emit('idle')

    if (userData.size === 1) {
        ui.emit('message', 'Finished processing. It appears this user does not suggest any channels.')
    } else {
        ui.emit('message', 'Finished processing.')
    }
})

crawler.on('error', function({ message, fatal }) {
    if (fatal) {
        ui.emit('idle')
    }

    ui.emit('message', 'Error: ' + message)
})

ui.on('start', function(login) {
    crawler.emit('start', login)
})

ui.on('stop', function() {
    crawler.emit('stop')
})

ui.on('clearGraph', function() {
    data.nodes.clear()
    data.edges.clear()

    crawler.emit('reset')
})

network.on('click', function(event) {
    if (!event.nodes.length) {
        ui.emit('hideUserView')

        return
    }

    const user = userData.get(event.nodes[0])

    ui.emit('showUserView', user)
})