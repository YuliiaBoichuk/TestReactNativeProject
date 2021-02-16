import { combineReducers } from 'redux';
import redirect from './redirect';
import example from './exampleReducer';
import eventReducer from './eventReducer';
import tabReducer from './tabReducer';
import auth from './auth';
import contactsReducer from './contactsReducer';
import organization from './organization';
import invitationReducer from './invitationReducer'
import ticketsReducer from './ticketsReducer'
import questReducer from './questReducer'
import favorites from './favorites'
import { Uploads } from "../../components";
import timelineReducer from "./timelineReducer";
import themeReducer from "./themeReducer";
import chatReducer from "./chat";
import offersReducer from "./offersReducer";
import personImagesReducer from "./personImages";
import subscriptionReducer from './subscriptionReducer'

const reducers = {
    redirect,
    example,
    auth,
    eventReducer,
    tabReducer,
	organization,
    contactsReducer,
    invitationReducer,
    ticketsReducer,
    questReducer,
    favorites,
    uploads: Uploads.reducers.uploads,
    themeReducer,
    timelineReducer,
    chatReducer,
    offersReducer,
    personImagesReducer,
    subscriptionReducer
};

export default combineReducers(reducers)