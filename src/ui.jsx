import EventEmitter from 'eventemitter2'

import { h, Fragment, render } from 'preact'
import { useRef } from 'preact/hooks'
import { signal } from '@preact/signals'

function getRelativeLuminance(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function LinkIcon() {
    /* Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. */
    return <svg fill="#ffffff" xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 640 512"><path d="M579.8 267.7c56.5-56.5 56.5-148 0-204.5c-50-50-128.8-56.5-186.3-15.4l-1.6 1.1c-14.4 10.3-17.7 30.3-7.4 44.6s30.3 17.7 44.6 7.4l1.6-1.1c32.1-22.9 76-19.3 103.8 8.6c31.5 31.5 31.5 82.5 0 114L422.3 334.8c-31.5 31.5-82.5 31.5-114 0c-27.9-27.9-31.5-71.8-8.6-103.8l1.1-1.6c10.3-14.4 6.9-34.4-7.4-44.6s-34.4-6.9-44.6 7.4l-1.1 1.6C206.5 251.2 213 330 263 380c56.5 56.5 148 56.5 204.5 0L579.8 267.7zM60.2 244.3c-56.5 56.5-56.5 148 0 204.5c50 50 128.8 56.5 186.3 15.4l1.6-1.1c14.4-10.3 17.7-30.3 7.4-44.6s-30.3-17.7-44.6-7.4l-1.6 1.1c-32.1 22.9-76 19.3-103.8-8.6C74 372 74 321 105.5 289.5L217.7 177.2c31.5-31.5 82.5-31.5 114 0c27.9 27.9 31.5 71.8 8.6 103.9l-1.1 1.6c-10.3 14.4-6.9 34.4 7.4 44.6s34.4 6.9 44.6-7.4l1.1-1.6C433.5 260.8 427 182 377 132c-56.5-56.5-148-56.5-204.5 0L60.2 244.3z"/></svg>
}

function XMarkIcon() {
    /* Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. */
    return <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>
}

function Controls({ state, ui }) {
    const status = state.status.value

    const loginRef = useRef(null)

    return <div class="controls">
        {status === STATUS_IDLE && <>
            <input ref={loginRef} class="controls__input" placeholder="Root account" />
            <button class="button button-green" onClick={() => {
                state.status.value = STATUS_PROCESSING
                ui.emit('start', loginRef.current.value)
            }}>
                Start
            </button>
            <button class="button button-blue" onClick={() => {
                ui.emit('clearGraph')
            }}>
                Clear graph
            </button>
        </>}

        {status === STATUS_PROCESSING && <>
            <button class="button button-red" onClick={() => {
                state.status.value = STATUS_IDLE
                ui.emit('stop')
            }}>
                Stop
            </button>
        </>}
    </div>
}

function UserView({ state }) {
    const user = state.userView.value
    const accentColor = '#' + (user?.primaryColorHex || '6441a5')
    const luminance = getRelativeLuminance(accentColor)

    return user ? <div class="userView" style={luminance > 0.5 ? {
        background: 'rgba(0, 0, 0, 0.8)',
        color: '#ffffff'
    } : {
        background: 'rgba(0, 0, 0, 0.1)',
        color: '#000000'
    }}>
        <div
            class="userView__close"
            onClick={() => state.userView.value = null }
            style={{
                fill: luminance > 0.5 ? '#ffffff' : '#000000'
            }}
        >
            <XMarkIcon />
        </div>

        <div class="userView__top">
            <div class="top__image">
                <img src={user.profileImageURL} style={{
                    borderColor: accentColor
                }} width="70px" height="70px" />
            </div>
            <div class="top__displayName">
                <span class="displayName__name" style={{
                    color: accentColor
                }}>
                    {user.displayName}
                </span>

                <a href={'https://twitch.tv/' + user.login} class="link" target="_blank">
                    <span class="displayName__twitchTag">
                        Channel
                        &nbsp;
                        <LinkIcon />
                    </span>
                </a>
            </div>
            <div class="top__totalFollowers">
                {user.followers.totalCount} follower{user.followers.totalCount === 1 ? '' : 's'}
            </div>
        </div>

        <p>
            {user.description}
        </p>
    </div> : <></>
}

function Message({ state }) {
    const message = state.message.value

    return message ? <div class="messageContainer">
        <div class="message">
            <div>
                {message}
            </div>

            <div class="message__close" onClick={() => state.message.value = null}>
                <XMarkIcon />
            </div>
        </div>
    </div> : <></>
}

function Prelude({ state }) {
    return state.preludeShown.value ? <div class="prelude">
        <h1>What is this?</h1>
        <p class="prelude__phrasing" align="justify">
            On Twitch a streamer can suggest other streamers.
            This tool builds a graph based on these suggestions.
            First, you provide a name of a streamer. The tool will pull
            suggested streamers from the account, place them onto a graph,
            and then continue doing this recursively with other streamers.
        </p>
        <h1>How do I use it?</h1>
        <p class="prelude__phrasing" align="justify">
            Type in the Twitch link or the handle of a streamer into <strong>Root account</strong>.
            To start building a graph press <span class="green">Start</span>.
            To finish building a graph press <span class="red">Stop</span>.
            You can then specify another channel and continue the graph off it, or you can
            clear the graph by pressing <span class="blue">Clear graph</span>.
        </p>
        <p class="prelude__phrasing" align="center">
            <a href="https://github.com/realicedicerice/twitch-suggested-graph" class="link">Github</a>   
        </p>
    </div> : <></>
}

function App({ state, ui }) {
    return <>
        <Prelude state={state} />

        <Controls state={state} ui={ui} />

        <UserView state={state} />

        <Message state={state} />
    </>
}

const STATUS_IDLE = 0
const STATUS_PROCESSING = 1

const ui = new EventEmitter()

const state = {
    status: signal(STATUS_IDLE),
    preludeShown: signal(true),
    message: signal(null),
    userView: signal(null)
}

render(<App state={state} ui={ui} />, document.querySelector('#appui'))

ui.once('start', function() {
    state.preludeShown.value = false
})

ui.on('start', function() {
    state.message.value = null
})

ui.on('idle', function() {
    state.status.value = STATUS_IDLE
})

ui.on('showUserView', function (user) {
    state.userView.value = user
})

ui.on('hideUserView', function() {
    state.userView.value = null
})

ui.on('message', function(text) {
    state.message.value = text
})

export { ui }