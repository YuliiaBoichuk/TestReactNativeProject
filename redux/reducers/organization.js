import { createReducer } from "../../utils";
import * as type from '../../constants/organization.types';

const initialState = {
    data: {},
    alliancesList: [],
    alliancesListForRender: [],
    pendingInvitations: [],
    submitted: false,
    loading: false,
    error: '',
    members: [],
    membersForRanking:[],
    bandsList: [],
    bandsListForRender: [],
};

export default createReducer(initialState, {
    [type.GET_ORGANIZATION_REQUEST](state) {
        return { ...state, loading: true, error: '' };
    },

    [type.GET_ORGANIZATION_SUCCESS](state, payload) {
        return { ...state, loading: false, error: '', data: { ...payload } };
    },

    [type.GET_ORGANIZATION_FAILURE](state, payload) {
        return { ...state, loading: false, error: payload.message };
    },
    [type.GET_ALLIANCES_REQUEST](state) {
      return { ...state, loading: true, error: '' };
    },
    
    [type.GET_ALLIANCES_SUCCESS](state, payload) {
      return { ...state, loading: false, error: '', alliancesList: [ ...payload.data ], alliancesListForRender: [...payload.data] };
    },
    
    [type.GET_ALLIANCES_FAILURE](state, payload) {
      return { ...state, loading: false, error: payload.message };
    },

    [type.FETCH_ORGANIZATION_REQUEST](state) {
        return { ...state, loading: true, submitted: false, error: '' };
    },

    [type.FETCH_ORGANIZATION_SUCCESS](state) {
        return { ...state, loading: false, submitted: true, error: '' };
    },

    [type.FETCH_ORGANIZATION_FAILURE](state, payload) {
        return { ...state, loading: false, submitted: false, error: payload.message };
    },

    [type.UPDATE_ORGANIZATION_REQUEST](state) {
        return { ...state, loading: true, submitted: false, error: '' };
    },

    [type.UPDATE_ORGANIZATION_SUCCESS](state) {
        return { ...state, loading: false, submitted: true, error: '' };
    },

    [type.UPDATE_ORGANIZATION_FAILURE](state, payload) {
        return { ...state, loading: false, submitted: false, error: payload.message };
    },
    [type.SEND_PENDING_INVITATION_REQUEST](state) {
      return { ...state, loading: true, error: '' };
    },
    
    [type.SEND_PENDING_INVITATION_SUCCESS](state, payload) {
      // return { ...state, loading: false, error: ''};
      return { ...state, loading: false, error: '', alliancesList: state.alliancesList.map((item)=>{
          if(item.id == payload.data){
              item.inAlliance =2
          }
          return item
      }) };
    },
    [type.SEND_LEAVE_ALLIANCE_SUCCESS](state, payload){
       return {...state, loading: false,alliancesList: state.alliancesList.map((item)=>{
         console.log(item)
         if(item.id == payload.data) {
           item.inAlliance = 0;
         }
         return item
       }) };
    },
    
    [type.SEND_PENDING_INVITATION_FAILURE](state, payload) {
      return { ...state, loading: false, error: payload.message };
    },
  
    [type.GET_PENDING_INVITATIONS_REQUEST](state) {
      return { ...state, loading: true, error: '' };
    },
    
    [type.GET_PENDING_INVITATIONS_SUCCESS](state, payload) {
      return { ...state, loading: false, error: '', pendingInvitations: [ ...payload.data ] };
    },
    
    [type.GET_PENDING_INVITATIONS_FAILURE](state, payload) {
      return { ...state, loading: false, error: payload.message };
    },
  
    [type.APPROVE_PENDING_INVITATION_REQUEST](state) {
      return { ...state, loading: true, error: '' };
    },
    
    [type.APPROVE_PENDING_INVITATION_SUCCESS](state, payload) {
      return { ...state, loading: false, error: '', pendingInvitations: [ ...state.pendingInvitations.filter((item)=>{return item.id != payload.data.userId}) ]};
    },
    
    [type.APPROVE_PENDING_INVITATION_FAILURE](state, payload) {
      return { ...state, loading: false, error: payload.message };
    },
  
    [type.GET_ALLIANCE_MEMBERS_REQUEST](state) {
      return { ...state, loading: true, error: '' };
    },
    
    [type.GET_ALLIANCE_MEMBERS_SUCCESS](state, payload) {
      return { ...state, loading: false, error: '', members: [ ...payload.data ] };
    },
    [type.UPDATE_ALLIANCE_MEMBER](state, payload) {
      const members = [...state.members];
      const index = members.findIndex((member) => {
        return member.id == payload.id;
      });
      members[index] = {...members[index], ...payload.objToUpdate};
      return { ...state, members:members}
    },
    [type.GET_ALLIANCE_MEMBERS_FAILURE](state, payload) {
      return { ...state, loading: false, error: payload.message };
    },
    [type.GET_ALLIANCE_MEMBERS_FOR_RANKING_REQUEST](state) {
      return { ...state, loading: true, error: '' };
    },
    
    [type.GET_ALLIANCE_MEMBERS_FOR_RANKING_SUCCESS](state, payload) {
      return { ...state, loading: false, error: '', membersForRanking: [ ...payload.data ] };
    },
    
    [type.GET_ALLIANCE_MEMBERS_FOR_RANKING_FAILURE](state, payload) {
      return {...state, loading: false, error: payload.message};
    },
    [type.SET_FILTERED_ALLIANCES](state, payload) {
        return {...state, loading: false, alliancesListForRender: [...payload.data]}
    },
    [type.GET_BANDS_REQUEST](state) {
      return { ...state, loading: true, error: '' };
    },
  
    [type.GET_BANDS_SUCCESS](state, payload) {
      return { ...state, loading: false, error: '', bandsList: [ ...payload.data ], bandsListForRender: [...payload.data] };
    },
  
    [type.GET_BANDS_FAILURE](state, payload) {
      return { ...state, loading: false, error: payload.message };
    },
    [type.SET_FILTERED_BANDS](state, payload) {
      return {...state, loading: false, bandsListForRender: [...payload.data]}
    },
});
