import { bindActionCreators } from 'redux';
import store from '../configureStore';
import {API_URL, post, getById, put, getWithParams} from './http-request'
import * as types from '../../constants/organization.types.js'
import {checkHttpStatus, parseJSON} from "../../utils/index";
import { goBack, getParams, navigateTo } from '../../Services/navigationService';
import {authUserSelector} from '../../Services/authService';
import {refreshToken, addRole} from "./auth";

export function filterAlliances(filterText) {
    return function (dispatch) {
        const allAlliances = store.getState().organization.alliancesList;
        const filteredAlliances = allAlliances.filter(item => {
            return item.name.toLowerCase().indexOf(filterText.toLowerCase())>-1;
        })
        dispatch(setFilteredAlliances(filteredAlliances))
    }
}

export function setFilteredAlliances(data) {
    return { type: types.SET_FILTERED_ALLIANCES, payload: { data } };
}

export function getAllAlliances(data) {
  return function (dispatch) {
    dispatch(getAlliancesRequest());
    if(data.from ===0){
      dispatch(getAlliancesSuccess([]));
    }
      let url = '/alliance/paged';
      post( url, data)
          .then(checkHttpStatus)
          .then(parseJSON)
          .then(data => {
              console.log(data);
              const a = store.getState()
              data.map(item => {
                  if(authUserSelector.isUserMemberOfOrgSync(a, item.id)){
                      item.inAlliance = 1;
                  } else if(authUserSelector.isUserPendingOfOrgSync(a, item.id)){
                      item.inAlliance = 2;
                  } else if(authUserSelector.isUserAdminOfOrgSync(a, item.id)){
                      item.inAlliance = 3;
                  }else {
                      item.inAlliance = 0;
                  }
              });
              const newList = [...a.organization.alliancesListForRender, ...data]
              newList.sort(function (b, c) {
                  return b.inAlliance - c.inAlliance;
              }).reverse();
              dispatch(getAlliancesSuccess(newList));
          }).catch(error => {
          dispatch(getAlliancesFailure(error.message));
      })
    // getById(`${API_URL}/organization/alliance`)
    //   .then(checkHttpStatus)
    //   .then(parseJSON)
    //   .then(function (response) {
    //     const a = store.getState()
    //     // console.log(response);
    //     response.map(item => {
    //       if(authUserSelector.isUserMemberOfOrgSync(a, item.id)){
    //         item.inAlliance = 1;
    //       } else if(authUserSelector.isUserPendingOfOrgSync(a, item.id)){
    //         item.inAlliance = 2;
    //       } else if(authUserSelector.isUserAdminOfOrgSync(a, item.id)){
    //         item.inAlliance = 3;
    //       }else {
    //         item.inAlliance = 0;
    //       }
    //
    //     });
    //     response.sort(function (b, c) {
    //           return b.inAlliance - c.inAlliance;
    //       }).reverse();
    //     dispatch(getAlliancesSuccess(response));
    //   })
    //   .catch(function (error) {
    //     console.log(error.message);
    //     dispatch(getAlliancesFailure(error.message));
    //   });
  }
}
export function getAlliancesRequest() {
  return { type: types.GET_ALLIANCES_REQUEST };
}

export function getAlliancesSuccess(data) {
  return { type: types.GET_ALLIANCES_SUCCESS, payload: { data } };
}

export function getAlliancesFailure(message) {
  return { type: types.GET_ALLIANCES_FAILURE, payload: { message } };
}
export function leaveAlliance(orgId) {
  return function (dispatch) {
    post(`${API_URL}/person/alliance/${orgId}/leave`)
      .then(checkHttpStatus)
      .then(parseJSON)
      .then(function (response) {
        // console.log(response);
        dispatch(sendLeaveAllianceSuccess(orgId));
        dispatch(refreshToken())
      })
      .catch(e =>{
        console.log(e.response.data)
      })
  }
}
export function sendLeaveAllianceSuccess(data) {
  return { type: types.SEND_LEAVE_ALLIANCE_SUCCESS, payload: { data } };
}
export function sendPendingInvitation(data) {
  return function (dispatch) {
    dispatch(sendPendingInvitationRequest());
    post(`${API_URL}/invitation/invite`, data)
      .then(checkHttpStatus)
      .then(parseJSON)
      .then(function (response) {
        // console.log(response);
        dispatch(sendPendingInvitationSuccess(data.OrgId));
        dispatch(refreshToken())
      })
      .catch(function (error) {
        console.log(error.message);
        dispatch(sendPendingInvitationFailure(error.message));
      });
  }
}
export function sendPendingInvitationRequest() {
  return { type: types.SEND_PENDING_INVITATION_REQUEST };
}

export function sendPendingInvitationSuccess(data) {
  return { type: types.SEND_PENDING_INVITATION_SUCCESS, payload: { data } };
}

export function sendPendingInvitationFailure(message) {
  return { type: types.SEND_PENDING_INVITATION_FAILURE, payload: { message } };
}

export function approvePendingInvitation(data) {
  return function (dispatch) {
    dispatch(approvePendingInvitationRequest());
    post(`${API_URL}/invitation/invitationconfirm`, data)
      .then(checkHttpStatus)
      .then(parseJSON)
      .then(function (response) {
        // console.log(response);
        dispatch(approvePendingInvitationSuccess({data:response, userId:data.Id1}));
      })
      .catch(function (error) {
        console.log(error.message);
        dispatch(approvePendingInvitationFailure(error.message));
      });
  }
}

export function approvePendingInvitationRequest() {
  return { type: types.APPROVE_PENDING_INVITATION_REQUEST };
}

export function approvePendingInvitationSuccess(data) {
  return { type: types.APPROVE_PENDING_INVITATION_SUCCESS, payload: { data } };
}

export function approvePendingInvitationFailure(message) {
  return { type: types.APPROVE_PENDING_INVITATION_FAILURE, payload: { message } };
}

export function getPendingInvitations() {
  return function (dispatch) {
    dispatch(getPendingInvitationsRequest());
    getById(`${API_URL}/alliance/invitation/requests`)
      .then(checkHttpStatus)
      .then(parseJSON)
      .then(function (response) {
        console.log(response);
        dispatch(getPendingInvitationsSuccess(response));
      })
      .catch(function (error) {
        console.log(error.message);
        dispatch(getPendingInvitationsFailure(error.message));
      });
  }
}

export function getPendingInvitationsRequest() {
  return { type: types.GET_PENDING_INVITATIONS_REQUEST };
}

export function getPendingInvitationsSuccess(data) {
  return { type: types.GET_PENDING_INVITATIONS_SUCCESS, payload: { data } };
}

export function getPendingInvitationsFailure(message) {
  return { type: types.GET_PENDING_INVITATIONS_FAILURE, payload: { message } };
}
// GET
export function getOrganization(id) {
    return function (dispatch) {
        dispatch(getOrganizationRequest()); // todo refactor get followings in redux level
            getById(`${API_URL}/organization`, id)
                .then(checkHttpStatus)
                .then(parseJSON)
                .then(function (response) {
                    console.log(response);
                    console.log(mappedData);
                    dispatch(getOrganizationSuccess(response));
                })
                .catch(function (error) {
                    console.log(error.message);
                    dispatch(getOrganizationFailure(error.message));

                });

    }
}

export function getOrganizationRequest() {
    return { type: types.GET_ORGANIZATION_REQUEST };
}

export function getOrganizationSuccess(data) {
    return { type: types.GET_ORGANIZATION_SUCCESS, payload: { data } };
}

export function getOrganizationFailure(message) {
    return { type: types.GET_ORGANIZATION_FAILURE, payload: { message } };
}

export function getAllianceMembers(id) {
  return function (dispatch) {
    dispatch(getAllianceMembersRequest());
      getWithParams(API_URL + '/person/following')
          .then(checkHttpStatus)
          .then(parseJSON)
          .then(data => {
              const mappedData = data.map((data, index) => {
                  data.index = index + 1;
                  return data.id
              })
              return mappedData;
          }).catch(error => {
          console.log(error);
      }).then(mappedData=> {
          getById(`${API_URL}/organization/${id}/members`)
              .then(checkHttpStatus)
              .then(parseJSON)
              .then(function (response) {
                  console.log(response);
                  console.log(mappedData);
                  response.map((data)=>{
                      data.isFollow = mappedData.find((id)=>{
                          return data.id == id;
                      }) && true || false;
                  })
                  dispatch(getAllianceMembersSuccess(response));
              })
              .catch(function (error) {
                  console.log(error.message);
                  dispatch(getAllianceMemberssFailure(error.message));
              });
      })
  }
}

export function getAllianceMembersRequest() {
  return { type: types.GET_ALLIANCE_MEMBERS_REQUEST };
}

export function getAllianceMembersSuccess(data) {
  return { type: types.GET_ALLIANCE_MEMBERS_SUCCESS, payload: { data } };
}

export function getAllianceMemberssFailure(message) {
  return { type: types.GET_ALLIANCE_MEMBERS_FAILURE, payload: { message } };
}
export function updateAllianceMember(id, objToUpdate) {
  return { type: types.UPDATE_ALLIANCE_MEMBER, payload: { id, objToUpdate } };
}

export function getAllianceRanking(id) {
  return function (dispatch) {
    dispatch(getAllianceMembersForRankingRequest());
    getById(`${API_URL}/organization/${id}/members`)
      .then(checkHttpStatus)
      .then(parseJSON)
      .then(function (response) {
        const data = response.sort((a, b)=>{
          return (a.level && b.level && (a.level.id - b.level.id)) || a.experiencePoints - b.experiencePoints;
        }).reverse()
        dispatch(getAllianceMembersForRankingSuccess(data));
      })
      .catch(function (error) {
        console.log(error.message);
        dispatch(getAllianceMembersForRankingFailure(error.message));
      });
  }
}

export function getAllianceMembersForRankingRequest() {
  return { type: types.GET_ALLIANCE_MEMBERS_FOR_RANKING_REQUEST };
}

export function getAllianceMembersForRankingSuccess(data) {
  return { type: types.GET_ALLIANCE_MEMBERS_FOR_RANKING_SUCCESS, payload: { data } };
}

export function getAllianceMembersForRankingFailure(message) {
  return { type: types.GET_ALLIANCE_MEMBERS_FOR_RANKING_FAILURE, payload: { message } };
}

// FETCH
export function fetchOrganization(body) {
    return function (dispatch) {
        dispatch(fetchOrganizationRequest());
        post(`${API_URL}/organization`, body)
            .then(checkHttpStatus)
            .then(parseJSON)
            .then(function (response) {
              if(body.organizationType == 2){
                dispatch(fetchOrganizationSuccess());
                dispatch(getBands({from: 0, size: 20}));
                navigateTo('band_list');
              }else {
                const role = response.organizationId + '-alliance:admin'
                dispatch(addRole(role))
                dispatch(fetchOrganizationSuccess());
                dispatch(getAllAlliances({from: 0, size: 20}));
                navigateTo('alliance_list');
              }
            })
            .catch(function (error) {
                console.log(error.message);
                dispatch(fetchOrganizationFailure(error.message))
            });
    }
}

export function fetchOrganizationRequest() {
    return { type: types.FETCH_ORGANIZATION_REQUEST };
}

export function fetchOrganizationSuccess() {
    return { type: types.FETCH_ORGANIZATION_SUCCESS };
}

export function fetchOrganizationFailure(message) {
    return { type: types.FETCH_ORGANIZATION_FAILURE, payload: { message } };
}

export function updateOrganization(orgId, body) {
    return function (dispatch) {
        dispatch(updateOrganizationRequest());
        put(`${API_URL}/organization/${orgId}`, body)
            .then(checkHttpStatus)
            .then(parseJSON)
            .then(function (response) {
                console.log(response);
                dispatch(updateOrganizationSuccess());
                navigateTo('company', {id: orgId});
            })
            .catch(function (error) {
                console.log(error.message);
                dispatch(updateOrganizationFailure(error.message));
                navigateTo('company', {id: orgId});
            });
    }
}

export function updateOrganizationRequest() {
    return { type: types.UPDATE_ORGANIZATION_REQUEST };
}

export function updateOrganizationSuccess() {
    return { type: types.UPDATE_ORGANIZATION_SUCCESS };
}

export function updateOrganizationFailure(message) {
    return { type: types.UPDATE_ORGANIZATION_FAILURE, payload: { message } };
}

export function publishOrganization(id) {
    post(`/organization/${id}/publish`)
        .then(checkHttpStatus)
        .then(parseJSON)
        .then(data => {})
        .catch(error=> {console.log(error.message)})
}


export function containerActions(dispatch) {
    return bindActionCreators({
        getOrganization,
        fetchOrganization,
        updateOrganization
    }, dispatch);
}
export function getBands(data) {
  return function (dispatch) {
    dispatch(getBandsRequest());
    if(data.from ===0){
      dispatch(getBandsSuccess([]));
    }
    let url = '/band/paged';
    post( url, data)
      .then(checkHttpStatus)
      .then(parseJSON)
      .then(data => {
        console.log(data);
        const a = store.getState()
        data.map(item => {
          // if(authUserSelector.isUserMemberOfOrgSync(a, item.id)){
          //   item.inAlliance = 1;
          // } else if(authUserSelector.isUserPendingOfOrgSync(a, item.id)){
          //   item.inAlliance = 2;
          // } else if(authUserSelector.isUserAdminOfOrgSync(a, item.id)){
          //   item.inAlliance = 3;
          // }else {
            item.inAlliance = 0;
          // }
        });
        const newList = [...a.organization.bandsListForRender, ...data]
        newList.sort(function (b, c) {
          return b.inAlliance - c.inAlliance;
        }).reverse();
        dispatch(getBandsSuccess(newList));
      }).catch(error => {
      dispatch(getBandsFailure(error.message));
    })
  }
}
export function getBandsRequest() {
  return { type: types.GET_BANDS_REQUEST };
}
export function getBandsSuccess(data) {
  return { type: types.GET_BANDS_SUCCESS, payload: { data } };
}

export function getBandsFailure(message) {
  return { type: types.GET_BANDS_FAILURE, payload: { message } };
}
export function filterBands(filterText) {
  return function (dispatch) {
    const allBands = store.getState().organization.bandsList;
    const filteredAlliances = allBands.filter(item => {
      return item.name.toLowerCase().indexOf(filterText.toLowerCase())>-1;
    })
    dispatch(setFilteredBands(filteredAlliances))
  }
}
export function setFilteredBands(data) {
  return { type: types.SET_FILTERED_BANDS, payload: { data } };
}