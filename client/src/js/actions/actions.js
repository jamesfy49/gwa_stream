import { createActions } from 'redux-actions';

export const settingsActions = createActions(
    {
        TOGGLE_DARKMODE: dark => ({ dark }),
        CHANGE_VOLUME: volume => ({ volume }),
        TOGGLE_MUTE: m => ({ muted: !m }),
        TOGGLE_SHUFFLE: shuffleOn => ({ shuffleOn }),
        ROTATE_LOOP: mode => ({ mode })
    }
)

export const viewActions = createActions(
    {
        HIDE_BROWSE: () => {},
        SHOW_BROWSE: () => {},
        HIDE_PLAYLIST_ADD: () => {},
        SHOW_PLAYLIST_ADD: () => {}
    }
)

export const queueActions = createActions(
    {
        ADD_TO_QUEUE: songs => ({ songs }),
        ADD_TO_UPNEXT: (songs, index) => ({ songs, index }),
        REMOVE_FROM_QUEUE: index => ({ index }),
        SET_QUEUE: songs => ({ songs })
    }
)

export const browseActions = createActions(
    {
        SEARCH: searchTerm => ({ searchTerm }),
        UPDATE_RESULTS: results => ({ results }),
        UPDATE_TIME: time => ({ time }),
        UPDATE_SORT: sort => ({ sort })
    }
)

export const nowPlayingActions = createActions(
    {
        SET_PLAYING: (item, index) => ({ item, index }),
        SET_ACTIVE: index => ({ index }),
        SEEK_TO: time => ({ time }),
        TOGGLE_PLAY: isPlaying => ({ isPlaying }),
        SET_DURATION: duration => ({ duration }),
        UPDATE_TIME: time => ({ time }),
        SET_BUFFER: bufferTime => ({ bufferTime })
    },
    'PLAY',
    'PAUSE',
    'END_PLAYBACK'
)

export const playlistActions = createActions(
    {
        SET_PLAYLISTS: (items) => ({ items }),
        SET_ITEM_STORE: (item) => ({ item }),
        ADD_PLAYLIST: (name) => ({ name }),
        REMOVE_PLAYLIST: (name) => ({ name }),
        ADD_TO_PLAYLIST: (name, audios) => ({ name, audios }),
        REMOVE_FROM_PLAYLIST: (name, index) => ({ name, index }),
        RENAME_PLAYLIST: (name, newName) => ({ name, newName })
    }
)
