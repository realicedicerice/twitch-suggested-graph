import EventEmitter from 'eventemitter2'

import { request, gql } from 'graphql-request'

const CLIENT_ID = 'kimne78kx3ncx6brgo4mv6wki5h1ko'

const USER_QUERY_DOC = gql`query($login: String) {
    user(login: $login) {
        id
        login
        displayName
        description
        createdAt
        primaryColorHex
        profileImageURL(width: 70)

        followers {
            totalCount
        }

        roles {
            isPartner
        }

        channel {
            id
            home {
                shelves {
                    streamerShelf {
                        type
                        edges {
                            trackingID
                            node {
                                id
                                displayName
                                login
                                description
                                primaryColorHex
                                profileImageURL(width: 70)
                                followers {
                                    totalCount
                                }
                            }
                        }
                    }
                }    
            }
        }

        stream {
            id
            title
            type
            viewersCount
            createdAt
            game {
                name				
            }
        }
    }
}`

function getUser(login) {
    return request({
        url: 'https://gql.twitch.tv/gql',
    
        document: USER_QUERY_DOC,
    
        variables: {
            login
        },
        
        requestHeaders: {
            'Client-Id': CLIENT_ID
        }
    })
}

function createCrawler() {
    const ee = new EventEmitter()

    const queue = []

    const processed = []

    let nextTimer = null

    let stopped = false

    async function next() {
        if (!queue.length) {
            ee.emit('endOfQueue')

            nextTimer = null

            return
        }

        const login = queue.shift()

        const { user } = await getUser(login)

        if (stopped) {
            return
        }

        const shelf = user.channel.home.shelves.streamerShelf
    
        const suggested = shelf.type === 'AUTOHOST' ? shelf.edges
            .filter(e => !!e.node)
            .map(e => e.node) : []
        
        const users = [user, ...suggested]
            .filter(({ id }) => !processed.includes(Number(id)))
        
        const links = suggested.map((suggestedUser) => ({
            from: user.id,
            to: suggestedUser.id
        }))
        
        processed.push(Number(user.id))    
        
        for (const suggestedUser of suggested) {
            const id = Number(suggestedUser.id)

            if (processed.includes(id)) {
                continue
            }

            queue.push(suggestedUser.login)
        }

        ee.emit('data', {
            users,
            links
        })
        
        nextTimer = setTimeout(next, 1000)
    }

    ee.on('start', function(login) {
        if (login) {
            queue.unshift(login)
        }

        if (!nextTimer) {
            setTimeout(next, 0)
        }

        stopped = false
    })

    ee.on('stop', function() {
        if (nextTimer) {
            clearTimeout(nextTimer)

            nextTimer = null
            stopped = true
        }
    })

    return ee
}

export { createCrawler }