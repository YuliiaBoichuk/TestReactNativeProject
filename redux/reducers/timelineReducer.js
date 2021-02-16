import { createReducer } from "../../utils";
import * as type from '../../constants/timeline.types';

const initialState = {
  data: [],
  loading: true,
  error: '',
  promos: [],
  criteria: {
    size: 20,
    from: 0,
    page: 1,
    query : {
      bool :{
        should:[
          {terms:{"Person.Id": null}},
          {terms:{"Owner.Id": null}}
        ]
      }
    }
  },
};

export default createReducer(initialState, {
  [type.GET_TIMELINE_REQUEST](state){
    return {...state, loading: true, error:''}
  },
  [type.GET_TIMELINE_SUCCESS](state, payload) {
    return {...state, loading: false, data: (payload.data.isPushData? state.data.concat(payload.data.data) : payload.data.data)}
  },
  [type.GET_TIMELINE_FAILURE](state, payload) {
    return {...state, loading: false, error: payload.message}
  },
  [type.SET_CRITERIA](state, payload) {
    return {...state, criteria: {...state.criteria, ...payload.data}}
  },
  [type.GET_TIMELINE_PROMOS](state, payload){
    return {...state, promos: payload.data}
  },
  [type.UPDATE_COUNT_OF_COMMENTS_FOR_POST_AND_LAST_COMMENT](state, payload) {
    console.log(payload);
    console.log(state);
    return {
      ...state, data: state.data.map(post => {
        if (post.Id == payload.id) {
          return {...post,Comments: [payload.newLastComment], CommentsCount: post.CommentsCount + 1}
        } else {
          return post
        }
      })
    }
  }
});
