import { handleActions } from 'redux-actions';

const nowPlaying = handleActions(
    {
        PLAY: (state) => ({
            ...state,
            playing: true
        }),

        PAUSE: (state) => ({
            ...state,
            playing: false
        }),

        TOGGLE_PLAY: (state, action) => ({
            ...state,
            playing: !action.payload.isPlaying
        }),

        SET_PLAYING: (state, action) => ({
            ...state,
            playing: true,
            current: action.payload.index,
            audio: action.payload.item,
            currentTime: 0
        }),

        SET_ACTIVE: (state, action) => ({
            ...state,
            current: action.payload.index
        }),

        SEEK_TO: (state, action) => ({
            ...state,
            currentTime: action.payload.time
        }),

        END_PLAYBACK: (state, action) => ({
            playing: false,
            current: undefined,
            audio: undefined,
            length: undefined,
            currentTime: undefined,
            bufferTime: undefined
        }),

        SET_DURATION: (state, action) => ({
            ...state,
            length: action.payload.duration
        }),

        UPDATE_TIME: (state, action) => ({
            ...state,
            currentTime: action.payload.time
        }),

        SET_BUFFER: (state, action) => ({
            ...state,
            bufferTime: action.payload.bufferTime
        })
    },
    {
        playing: false,
        audio: undefined,
        current: undefined,
        length: undefined,
        currentTime: undefined,
        bufferTime: undefined
    }
)

export { nowPlaying as default }