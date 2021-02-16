import React from 'react';
import {
  View, StyleSheet, FlatList, Text, Dimensions, Animated, Easing, KeyboardAvoidingView, Keyboard
} from "react-native";
import {connect} from 'react-redux';

import {getConfigItem} from '../../Services/configService';
import {Loading, TextI18n, GVE_Icon as Icon} from "../common/index";
import i18n from "i18next";
import EStyleSheet from 'react-native-extended-stylesheet';
import {ELASTIC_URL, getWithParams, post} from "../../redux/actions/http-request";
import {checkHttpStatus, parseJSON} from "../../utils/index";
import {getParams, navigateTo} from "../../Services/navigationService";
import {TimeLineComment} from "./index";
import CommentAction from "../quest/CommentAction";
import {updateCountOfCommentsForPostAndLastComment} from "../../redux/actions/timelineAction";

const color = getConfigItem('AccessTheme').color;
const font = getConfigItem('AccessTheme').font;
const elWidth = Dimensions.get('window').width-100+20+20;
const screenWidth = Dimensions.get('window').width;
const xOffset = new Animated.Value(0);
const onScroll = Animated.event(
  [{ nativeEvent: { contentOffset: { x: xOffset } } }],
  { useNativeDriver: true, listener: event => {
    const offsetx = event.nativeEvent.contentOffset.x
    // do something special
  }, }
);

class TimeLineComments extends React.Component {
  constructor(props) {
    super(props);
    this.screenWidth = Dimensions.get('window').width;
    this.state = {
      isRefreshing: false,
      animatedValue: new Animated.Value(0),
      indexToAnimate: null,
      itemViewed: false,
      scrollEnabled: true,
      data: [],
      commentId: null,
      isKeyBoardShown: false
    };
  }
  
  componentDidMount(){
    this.screenLoad()
    console.log("init");
    this.keyboardWillShowListener = Keyboard.addListener('keyboardDidShow', this.onKeyboardShow.bind(this));
    this.keyboardWillHideListener = Keyboard.addListener('keyboardDidHide', this.onKeyboardHide.bind(this));
    // this.props.navigation.addListener('willFocus', this.screenLoad.bind(this))
    
  }
  onKeyboardShow(){
    this.setState({isKeyBoardShown:true})
  }
  onKeyboardHide(){
    this.setState({isKeyBoardShown:false})
  }
  screenLoad() {
    console.log("screen loads");
    // let navParams = getParams(this.props);
    // console.log(navParams)
    const criteria = {
      query: {
        bool: {
          should: [
            {terms: {"PersonActionTimeLinesId": [this.props.id]}},
          ]
        }
      },
      from: 0,
      sort:[{'CreateDate': {"order" : "desc"}}],
      size: 100
    }
    post(`${ELASTIC_URL}/commentsearch/tmp/_search`, criteria)
      .then(checkHttpStatus)
      .then(parseJSON)
      .then(data => {
        
        const comments = data.hits.hits.map((item) => {
          return item._source;
        });
        comments.unshift(...this.props.lastComment);
        this.setState({data: comments})
        console.log(data)
      }).catch(error => {
      console.log(error);
    })

  }

  onComment(el, data) {
    if (el.text != "" && el.text != " ") {
    console.log(el)
    const objForSend = {
      name: "",
      content: el.text,
      thumbnailUrl: el.thumbnailUrl || "",
      contentType: el.textContentType || 0,
      timeLineType: this.props.type == 'person'? 0: 1,
      personActionTimeLinesId: this.props.id, //- post Id
      parentCommentId: this.state.commentId //- (Sub) null
    }
    post('/persontaskaction/timelinecomment',objForSend)
      .then(checkHttpStatus)
      .then(parseJSON)
      .then(data => {
        //data.postId
        const objToSetAsLastComment ={
          Id: data.commentId,
          Content: el.text,
          ThumbnailUrl: el.thumbnailUrl || "",
          ContentType: el.textContentType || 0,
          CreateDate: new Date().toISOString(),
          Person: {Id: this.props.auth.person.id, Name: this.props.auth.person.name, Image: this.props.auth.person.image, BaseEventSeasonId: null},
          PersonActionTimeLinesId: this.props.id,
          ChildComment: [],
          Name: "",
          '@type': "CommentSearch"
        }
        this.props.updateCountOfCommentsForPostAndLastComment(this.props.id, objToSetAsLastComment);
        if(this.props.onAddComment){
          this.props.onAddComment()
        }
        this.setState({data: [ objToSetAsLastComment, ...this.state.data], commentId: null})
        console.log(data)
      })
      .catch(error => {
        showModal('alert', {
          message: 'COMMON.ERROR'
        })
      })
    }
  }
  onReplay(commentId){
    this.setState({commentId: commentId})
  }
  
  handleRefresh = () => {
    console.warn('Need implement')
    // this.setState({
    //   isRefreshing: true,
    // }, () => {
    //   console.log("handle refresh");
    //   this.props.getTimeLineData(this.props.context, false, null, this.state.followingIds)
    // });
  };
  handleLoadMore = () => {
    console.warn('Need implement')
    // this.props.getTimeLineData(this.props.context, true, null, this.state.followingIds)
  };
  renderSeparator(){
    return (<View  style={styles.separator}></View>)
  }
  render() {
    return (
      <KeyboardAvoidingView style={styles.container}>
        <View style={styles.emptyHeader}/>
        {this.props.isLoading ? <Loading/> :
          <View style={{flex:1, paddingBottom: 40}}>
            <TextI18n textKey={"TIMELINE.COMMENT"} style={styles.headerText}/>
            <View style={{flex:this.state.isKeyBoardShown? 1 : 2, marginBottom:50}}>
            <FlatList
              ref={(ref) => this.flatlistref = ref}
              data={this.state.data}
              ListEmptyComponent={
                <View style={styles.noPostsContainer}>
                  <TextI18n style={styles.noPostsText} textKey="TIMELINE.NOCOMMENTS"/>
                </View>
              }
              ItemSeparatorComponent={(leadingItem, section) =>(this.renderSeparator(leadingItem, section))}
              renderItem={({ item, index }) => <TimeLineComment onReplay={this.onReplay.bind(this)} data={item}/>}
              refreshing={this.state.isRefreshing}
              onRefresh={this.handleRefresh}
              onEndReached={(x, y) => {
                if (x.distanceFromEnd >= 0) {
                  this.handleLoadMore()
                }
              }}
              onEndReachedThreshold={0.01}
            />
            </View>
            <View style={{flex:this.state.isKeyBoardShown? 1 : 0}}>
            <CommentAction comment={""} style={styles.commentInput} onSendCommentVideo={(el)=> this.onComment(el)} onSendComment={(el)=> this.onComment(el)} whiteInput={true} />
            </View>
          </View>
        }
      </KeyboardAvoidingView>
    );
  }
}
const mapStateToProps = (state) => ({
  auth: state.auth
});
const mapDispatchToProps = (dispatch) => ({
  updateCountOfCommentsForPostAndLastComment: (postId, newLastComment) => dispatch(updateCountOfCommentsForPostAndLastComment(postId, newLastComment))
});

export default connect(mapStateToProps, mapDispatchToProps)(TimeLineComments);


const styles = EStyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    backgroundColor: '#f2f2f2', //#f8f8f8f8
    paddingHorizontal: 5
  },
  emptyHeader:{
    height: 10 //70
  },
  main: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8f8',
    marginBottom: 10
  },
  button:{
    backgroundColor:'$profileImageBackground'
  },
  header:{
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    minHeight: 50,
    paddingLeft: 10
  },
  title: {
    color: '$mainColor'
  },
  headerText:{
    color:'$headerText',
    fontSize: font.sizeHeader,
    fontWeight: 'bold',
    paddingVertical: 15,
    marginLeft: 15
  },
  commentInput:{
    marginHorizontal: 0,
  },
  separator:{
    height:1,
    marginLeft:50,
    backgroundColor: '$tabText',
    marginVertical: 5
  }

});
