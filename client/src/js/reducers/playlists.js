import { handleActions } from 'redux-actions';

const updatePlaylist = handleActions(
    {
        ADD_TO_PLAYLIST: (state, action) => ([
            ...state,
            ...action.payload.audios
        ]),
        REMOVE_FROM_PLAYLIST: (state, action) => ([
            ...state.slice(0, action.payload.index),
            ...state.slice(action.payload.index + 1)
        ])
    },
    []
)

const updatePlaylists = handleActions(
    {
        ADD_PLAYLIST: (state, action) => ({
            ...state,
            [action.payload.name]:[]
        }),
        REMOVE_PLAYLIST: (state, action) => {
            const { [action.payload.name]:value, ...newObject } = state;
            return newObject;
        },
        RENAME_PLAYLIST: (state, action) => {
            /// es7 object destructuring assignment
            const { [action.payload.name]:value, ...newObject } = state;
            return {
                ...newObject,
                [action.payload.newName]: value
            }
        },
        ADD_TO_PLAYLIST: (state, action) => ({
            ...state,
            [action.payload.name]: updatePlaylist(state[action.payload.name], action)
        }),
        REMOVE_FROM_PLAYLIST: (state, action) => ({
            ...state,
            [action.payload.name]: updatePlaylist(state[action.payload.name], action)
        })
    },
    {}
)

const playlists = handleActions(
    {
        SET_PLAYLISTS: (state, action) => ({
            ...state,
            items: action.payload.items
        }),
        SET_ITEM_STORE: (state, action) => ({
            ...state,
            itemStore: action.payload.item
        }),
        ADD_PLAYLIST: (state, action) => ({
            ...state,
            items: updatePlaylists(state.items, action)
        }),
        REMOVE_PLAYLIST: (state, action) => ({
            ...state,
            items: updatePlaylists(state.items, action)
        }),
        ADD_TO_PLAYLIST: (state, action) => ({
            ...state,
            items: updatePlaylists(state.items, action)
        }),
        REMOVE_FROM_PLAYLIST: (state, action) => ({
            ...state, 
            items: updatePlaylists(state.items, action)
        }),
        RENAME_PLAYLIST: (state, action) => ({
            ...state, 
            items: updatePlaylists(state.items, action)
        })
    },
    {
        items: {},
        itemStore: undefined
    }
)

export { playlists as default }