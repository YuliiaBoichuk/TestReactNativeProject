import {API_URL, post, getWithParams, ELASTIC_URL} from './http-request';
import {checkHttpStatus, parseJSON} from "../../utils/index";
import * as type from '../../constants/timeline.types';
import store from '../configureStore';
import {default as timelinePromos} from '../../constants/timelinePromo.items'

// GET
export function getDataForTimeline(context, isLoadMore, criteria, followedUsersIds, orgId) {
  return function (dispatch) {
    if (!isLoadMore) {
      dispatch(getTimelineDataRequest());
    }
    if(!criteria){
      criteria = store.getState().timelineReducer.criteria;
    }
    if(!isLoadMore){
      dispatch(setCriteria({from:0, page:1}))
      criteria.from= 0
      criteria.page= 1
    } else {
      dispatch(setCriteria({from: criteria.page*criteria.size, page: criteria.page+1}))
      criteria.from= criteria.page*criteria.size
      criteria.page= criteria.page+1
    }
    // delete criteria['page']
    // delete criteria['query']
    const person_id = store.getState().auth.person_id
    // const org = this.state.org
    criteria.query =  {
      bool :{
        should:[
          {terms:{"Alliance.Id": [orgId]}},
        ]
      }
    }
    criteria.sort=[{'ActionTime': {"order" : "desc"}}]
    const newObj = {...criteria}
    delete newObj['page']
    // dispatch(getTimelineDataSuccess(mockedResponse));
    console.log(criteria)
    post(`${ELASTIC_URL}/allianceactiontimelinesearch/tmp/_search`, newObj)
      .then(checkHttpStatus)
      .then(parseJSON)
      .then(function (response) {
        console.log(response);
        var result = [];
        response.hits.hits.map((item) => {
          result.push(item._source)
        })
        dispatch(getTimelineDataSuccess({data: result, isPushData: isLoadMore}));
      })
      .catch(function (error) {
        console.log(error.message);
        dispatch(getTimelineDataFailure(error.message));
      });
  }
}

export function getTimelineDataRequest() {
  return { type: type.GET_TIMELINE_REQUEST };
}

export function getTimelineDataSuccess(data) {
  return { type: type.GET_TIMELINE_SUCCESS, payload: { data } };
}

export function getTimelineDataFailure(message) {
  return { type: type.GET_TIMELINE_FAILURE, payload: { message } };
}
export function setCriteria(data) {
  return {type: type.SET_CRITERIA, payload:{data}}
}

export function getTimelinePromos() {
  return function(dispatch) {
    // getWithParams(`${API_URL}/`)
    //   .then(checkHttpStatus)
    //   .then(parseJSON)
    //   .then(function (response) {
    //     console.log(response);
    //     dispatch(getTimelinePromosSuccess({data: response}));
    //   })
    //   .catch(function (error) {
    //     console.log(error.message);
    //   });
    dispatch(getTimelinePromosSuccess({timelinePromos}))
  }
}
export function getTimelinePromosSuccess(data) {
  return { type: type.GET_TIMELINE_PROMOS, payload: {data}}

}
