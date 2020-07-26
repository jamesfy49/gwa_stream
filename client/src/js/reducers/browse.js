import { handleActions } from 'redux-actions';
import categories from '../../categories_list.js';

const browse = handleActions(
    {
        ADD_ACTIVE_CATEGORY: (state, action) => ({
            activeCategories: [...state.activeCategories, action.payload.category]
        }),
        REMOVE_ACTIVE_CATEGORY: (state, action) => {
            let removed = state.activeCategories.filter(c =>
                c !== action.payload.category
            );
            return {
                activeCategories: removed
            }
        }
    },
    {
        categories: categories,
        activeCategories: [],
        search: '',
        time: '',
        sort: '',
        results: []
    }
)

export { browse as default }