import {getConfigItem, setConfigItem} from "../../Services/configService";
import EStyleSheet from 'react-native-extended-stylesheet';
import {AppConfig} from "../../config"

export const changeCurrentTheme = (theme, isGold) =>{
  return (dispatch) => {
    setConfigItem('AccessTheme', getConfigItem('themes')[theme]);

    setConfigItem('currentTheme', theme);
    dispatch({
      type: "CHANGE_CURRENT_THEME",
      payload: {theme:null, isGold: null}
    })
    const colors = {...AppConfig.themes[theme].color};
    // if(isGold){
    //   colors['$mainColor'] = '#ffd400'
    // }else{
    //   colors['$mainColor'] = "#F83A3A"
    // }
    EStyleSheet.build(colors);
    setTimeout(()=>{
      dispatch({
        type: "CHANGE_CURRENT_THEME",
        payload: {theme:theme, isGold: isGold}
      })
    }, 10)
    
  }
};
