import {API_URL, post, getWithParams, ELASTIC_URL} from './http-request';
import {checkHttpStatus, parseJSON} from "../../utils/index";
import * as type from '../../constants/timeline.types';
import store from '../configureStore';
import {default as timelinePromos} from '../../constants/timelinePromo.items'

// GET
export function getDataForTimeline(context, isLoadMore, criteria, followedUsersIds) {
  return function (dispatch) {
    if (!isLoadMore) {
      dispatch(getTimelineDataRequest());
    }
    // const mockedResponse = [
    //   {
    //     Name: 'test',
    //     PersonId: 41,
    //     ContentType: 1,
    //     ContentTypeRelation: 0,
    //     ActionTime: "2019-10-08T23:59:59.9966667",
    //     Location: '',
    //     Text: '',
    //     MediaObject:{
    //       caption: null,
    //       contentUrl: "https://eudev.blob.core.windows.net/31591e57-0c67-4c65-88ff-6950ecc625cfpublic/117964/117964.m3u8",
    //       description: null,
    //       id: 119,
    //       image: "https://eudev.blob.core.windows.net/31591e57-0c67-4c65-88ff-6950ecc625cfpublic/117964/117964.jpg",
    //       name: null,
    //       payload: "{}"
    //     }
    //   }
    // ]
    
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
    criteria.query =  {
      bool :{
        should:[
          {terms:{"Person.Id": [person_id]}},
          {terms:{"Owner.Id": [person_id]}}
        ]
      }
    }
    if(followedUsersIds){
      criteria.query.bool.should[0].terms["Person.Id"] = [...criteria.query.bool.should[0].terms["Person.Id"], ...followedUsersIds];
      criteria.query.bool.should[1].terms["Owner.Id"] = [...criteria.query.bool.should[1].terms["Owner.Id"], ...followedUsersIds];
      
    }
    criteria.sort=[{'ActionTime': {"order" : "desc"}}]
    const newObj = {...criteria}
    delete newObj['page']
    // dispatch(getTimelineDataSuccess(mockedResponse));
    console.log(criteria)
    post(`${ELASTIC_URL}/personactiontimelinesearch/tmp/_search`, newObj)
      .then(checkHttpStatus)
      .then(parseJSON)
      .then(function (response) {
        // console.log(response);
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
export function updateCountOfCommentsForPostAndLastComment(postID, newLastComment) {
  return {type: type.UPDATE_COUNT_OF_COMMENTS_FOR_POST_AND_LAST_COMMENT, payload:{id: postID, newLastComment:newLastComment}}
}
export function getTimelinePromos(criteria) {
  return function(dispatch) {
    post(`${ELASTIC_URL}/mediapost/tmp/_search`, criteria)
      .then(checkHttpStatus)
      .then(parseJSON)
      .then(function (data) {
        console.log(data);
        const promos = data.hits.hits.map((item) => {
          return item._source;
        });
        dispatch(getTimelinePromosSuccess([...promos]));
      })
      .catch(function (error) {
        console.log(error.message);
      });
  }
}
export function getTimelinePromosSuccess(data) {
  return { type: type.GET_TIMELINE_PROMOS, payload: {data}}

}
