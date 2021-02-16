import { Platform } from 'react-native';
import { NavigationActions, DrawerActions, StackActions } from '../Routing';
import store from '../redux/configureStore'
import { redirectTo } from '../redux/actions/redirect';

// todo access props inside file : goBack history for web, getParams for both platform

let _navigator;
let isFullScreen = false;
const setTopLevelNavigator = (navigatorRef) => {
    _navigator = navigatorRef;
};

export const navigateTo = (route, params) => {
    if (Platform.OS === 'web') {
        store.dispatch(redirectTo(`/${route}`, params))
    } else {
        _navigator.dispatch(
            NavigationActions.navigate({
                routeName: route,
                params
            })
        );
    }
};

export const goBack = (props) => {
    if (Platform.OS === 'web') {
        props.history.goBack();
    } else {
        _navigator.dispatch(
            NavigationActions.back()
        );
    }
};

export const getParams = (props) => {
    if (Platform.OS === 'web') {
        return props && props.match && Object.keys(props.match.params).length && props.match.params
            || store.getState().redirect.params;
    } else {
        return props.navigation.state.params;
    }
};


// specials functions

export const navigateToLogin = () => {
    if (Platform.OS === 'web') {
        store.dispatch(redirectTo('/login'))
    } else {
        _navigator.dispatch(
            NavigationActions.navigate({
                routeName: 'login'
            })
        );
    }
};

export const navigateToApp = () => {
    if (Platform.OS === 'web') {
        store.dispatch(redirectTo('/profileTMP'))
    } else {
        _navigator.dispatch(
            NavigationActions.navigate({
                routeName: 'AuthLoading'
            })
        );
    }
};

export const openDrawer = () => {
    _navigator.dispatch(
        DrawerActions.openDrawer()
    )
};

export const closeDrawer = () => {
    _navigator.dispatch(
        DrawerActions.closeDrawer()
    )
};

export const openVideoPlayer = (url) => {
    _navigator.dispatch(
        NavigationActions.navigate({
            routeName: 'player_full_screen',
            params: url
        })
    )
};

export const openEditUserPhoto = (userPhoto) => {
    setFullScreen();
    _navigator.dispatch(
        NavigationActions.navigate({
            routeName: 'edit_photo_user',
            params: userPhoto
        })
    )
};

export const setFullScreen = (bool: boolean = true) => {
    isFullScreen = bool;
};

export const getFullScreenState = () => {
    return isFullScreen;
};

export const navigateToAppUpdate = () => {
    if (Platform.OS === 'web') {
        store.dispatch(redirectTo('/appUpdate'))
    } else {
        _navigator.dispatch(
            NavigationActions.navigate({
                routeName: 'appUpdate'
            })
        )
    }
};
export const resetNavigator = () => {
  const resetAction = StackActions.reset({
    index: 1,  // it means change state to C which can goBack to previousView A
    actions: [
      NavigationActions.navigate({ routeName: 'profile_settings'}),
      NavigationActions.navigate({ routeName: 'profileTMP'}),
    ]
  })
  if(_navigator) {
    _navigator.dispatch(resetAction);
  }
}


export default {
    getFullScreenState,
    setTopLevelNavigator,
    resetNavigator
}