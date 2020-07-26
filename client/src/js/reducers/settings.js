import { handleActions } from 'redux-actions';

const browse = handleActions(
    {
        TOGGLE_DARKMODE: (state, action) => ({
            ...state,
            darkMode: action.payload.dark
        }),

        CHANGE_VOLUME: (state, action) => ({
            ...state,
            muted: false,
            volume: action.payload.volume
        }),

        TOGGLE_MUTE: (state, action) => ({
            ...state,
            muted: action.payload.muted
        }),

        TOGGLE_SHUFFLE: (state, action) => ({
            ...state,
            shuffle: !action.payload.shuffleOn
        }),

        ROTATE_LOOP: (state, action) => ({
            ...state,
            loop: action.payload.mode
        })
    },
    {
        darkMode: false,
        loop: 0,
        shuffle: false,
        volume: 100,
        muted: false
    }
)

export { browse as default }