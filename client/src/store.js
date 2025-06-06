import {
    createStore,
    combineReducers
} from 'redux';

import settings from './js/reducers/settings.js';
import browse from './js/reducers/browse.js';
import queue from './js/reducers/queue.js';
import view from './js/reducers/view.js';
import playlists from './js/reducers/playlists.js';
import nowPlaying from './js/reducers/nowPlaying.js';

const initState = {
    settings: {
        darkMode: false,
        loop: 0,
        shuffle: false,
        volume: 1,
        muted: false
    },
    view: {
        browseVisible: true,
        playlistAddVisible: false
    },
    browse: {
        search: '',
        time: '',
        sort: '',
        results: []
    },
    playlists: {
        items: {},
        itemStore: undefined
    },
    queue: [],
    nowPlaying: {
        playing: false,
        audio: undefined,
        current: undefined,
        length: undefined,
        currentTime: undefined,
        bufferTime: undefined,
        seekTo: undefined,
        loadingAudio: false,
        currentSrc: undefined
    }
}

const reducerMain = combineReducers({
    settings,
    view,
    browse,
    queue,
    playlists,
    nowPlaying
});

const configureStore = (reducer, initState) => {
    return createStore(reducer, initState);
}

export default configureStore(reducerMain, initState);
