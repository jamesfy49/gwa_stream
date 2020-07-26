import { handleActions } from 'redux-actions';

const view = handleActions(
    {
        HIDE_BROWSE: (state, action) => ({
            ...state,
            browseVisible: false
        }),
        SHOW_BROWSE: (state, action) => ({
            ...state,
            browseVisible: true
        }),
        HIDE_PLAYLIST_ADD: (state, action) => ({
            ...state,
            playlistAddVisible: false
        }),
        SHOW_PLAYLIST_ADD: (state, action) => ({
            ...state,
            playlistAddVisible: true
        })
    },
    {
        browseVisible: true,
        playlistAddVisible: false
    }
)

export { view as default }