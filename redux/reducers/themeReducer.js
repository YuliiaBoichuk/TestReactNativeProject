import {createReducer} from '../../utils';
import {AppConfig} from "../../config";

const initialState = {
  currentTheme: 'default',
  isGold: false
};

export default createReducer(initialState, {
  'CHANGE_CURRENT_THEME': (state, payload) => {
    console.log(payload)
    return Object.assign({}, state, {
      currentTheme: payload.theme,
      isGold: payload.isGold
    });
  }
});



