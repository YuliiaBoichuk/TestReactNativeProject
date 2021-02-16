import React, {Component} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, FlatList, Image} from 'react-native';
import {connect} from 'react-redux';
import {getConfigItem} from "../../Services/configService";
import {
  ActionContentType,
  ContentType,
  MediaContentType,
  ReactionContentType,
  ReviewContentType
} from '../../constants/timeline.enums'
import { TextI18n, Avatar, GVE_Icon as Icon, Button } from "../common/index";
import {Video} from  '../../Routing'
import {navigateTo, openVideoPlayer} from "../../Services/navigationService";
import CommentAction from "../quest/CommentAction";
import i18n from "i18next";
import {showModal} from "../../Services/modalService";
import {post} from "../../redux/actions/http-request";
import {checkHttpStatus, parseJSON} from "../../utils/index";
import {updateCountOfCommentsForPostAndLastComment} from "../../redux/actions/timelineAction";
import EStyleSheet from "react-native-extended-stylesheet";
import FastImage from "react-native-fast-image";

const color = getConfigItem('AccessTheme').color;
const font = getConfigItem('AccessTheme').font;


class TimelineCard extends Component {



  constructor(props) {
    super(props);
    this.state = {
    }

  }

  componentDidMount() {

  }

  componentWillReceiveProps(props) {

  }
  showProfileInfo(id){
    navigateTo('person', {outerUserId:id});
  }
  onComment(el, data){
    console.log(el)
    if(!el.text){
      return;
    }
    const objForSend = {
      name: "",
      content: el.text,
      thumbnailUrl: el.thumbnailUrl || "",
      contentType: el.textContentType || 0,
      timeLineType: this.props.type == 'person'? 0: 1,
      personActionTimeLinesId: data.Id, //- post Id
      parentCommentId: null //- (Sub) null
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
          Person: {Id: this.props.auth.person.id, Name: this.props.auth.person.alternateName, Image: this.props.auth.person.image, BaseEventSeasonId: null},
          PersonActionTimeLinesId: data.postId,
          ChildComment: [],
          Name: "",
          '@type': "CommentSearch"
        }

        this.props.updateCountOfCommentsForPostAndLastComment(data.postId, objToSetAsLastComment)
        console.log(data)
      })
      .catch(error => {
        showModal('alert', {
          message: 'COMMON.ERROR'
        })
      })
  }

  getDateDiff(time1, time2) {

    const t1 = new Date(time1);
    const t2 = new Date(time2);


    const diffMS = t1 - t2;
    const diffS = diffMS / 1000;
    const diffM = diffS / 60;
    const diffH = diffM / 60;
    const diffD = diffH / 24;
    const diff = {
      days: parseInt(diffD),
      hours: parseInt(diffH % 24),
      minutes: parseInt(diffM % 60).toString(),
      seconds: parseInt(diffS % 60).toString()
    };
    return diff;
  }
  showActionTime(ActionTime) {
    const curTime = new Date().getTime();;
    const actTime = new Date(ActionTime).getTime();
    const diff = this.getDateDiff(curTime, actTime);
    return diff.minutes>1 && ((diff.days && (' ' + (i18n.t('TIMELINE.DAYS', {days: diff.days})))||'') +
      (diff.hours && ( ' ' + i18n.t('TIMELINE.HOURS', {hours: diff.hours})) || '') +
      (diff.minutes && ( ' ' + i18n.t('TIMELINE.MINUTES', {minutes: diff.minutes}))|| '')) || i18n.t('TIMELINE.MOMENTSAGO')
  }
  renderOwner() {
    const {data} = this.props;
    return(
      <View style={[styles.reactionHeader]}>
        <TouchableOpacity onPress={() => this.showProfileInfo(data.Owner.Id)}
                          style={[styles.performerAvatar, styles.row]}>
          <Avatar
            style={{ marginRight: 5, width: 60, height: 60, borderWidth: 1 }}
            source={data.Owner && data.Owner.Image}
            rounded
            isOnline={true}

          />
          <View style={styles.col}>
            <Text style={styles.ownerName}>{data.Owner && data.Owner.Name}</Text>
            <Text style={styles.reactionTime}>{data.ActionTime ? this.showActionTime(data.ActionTime): ''}</Text>
          </View>
        </TouchableOpacity>
        {/*<TouchableOpacity style={styles.menuMore} onPress={() => this.showProfileInfo(data.Person.Id)}>*/}
        {/*  <Icon name='more'*/}
        {/*        size={35}*/}
        {/*        color='#000' />*/}
        {/*</TouchableOpacity>*/}
      </View>
    )
  }

  renderVideo(){
    const {data} = this.props;
    return(

      <TouchableOpacity onPress={() => showModal('videoFullScreen',
        {gradientShow: false,video: {Name:'', image: data.MediaObject.Image, contentUrl:data.MediaObject.ContentUrl}})}>
        {data.MediaObject.Image ?
        <FastImage
            style={styles.postImage}
            source={{ uri: data.MediaObject.Image}}
            resizeMode={FastImage.resizeMode.cover}
        /> : null}
        <View style={styles.playIcon}>
        <Icon name='play'
              size={40}
              color='#000' /></View>
      </TouchableOpacity>
    )
  }
  renderVideoUpload(){
    const {data} = this.props;
    return(
      <View>
        <View style={[styles.row]}>
          {data.Owner ? this.renderOwner(): null}
        </View>
        <TextI18n textKey={'TIMELINE.UPLOADNEWVIDEO'}/>
  
        <View style={styles.reactionContent}>
          <TouchableOpacity onPress={() => showModal('videoFullScreen',
            {gradientShow: false,video: {Name:'', image: data.ThumbnailUrl, contentUrl:data.Text}})}>
            {data.ThumbnailUrl?
            <FastImage
                style={styles.postImage}
                source={{ uri: data.ThumbnailUrl}}
                resizeMode={FastImage.resizeMode.cover}
            /> : null}
            <View style={styles.playIcon}>
              <Icon name='play'
                    size={40}
                    color='#000' /></View>
          </TouchableOpacity>
        </View>
        {this.renderCommentForm()}
      </View>
     
    )
  }
  renderImageUpload(){
    const {data} = this.props;
    return(
      <View>
        <View style={[styles.row]}>
          {data.Owner ? this.renderOwner(): null}
        </View>
        <TextI18n textKey={'TIMELINE.UPLOADNEWIMAGE'}/>
  
        <View style={styles.reactionContent}>
          <View style={styles.reactionMediaContent}>
            <TouchableOpacity onPress={() => this.props.onPreviewImage({MediaObject:{Image:data.Text}})}>
              {data.Text ?
              <FastImage
                  style={styles.postImage}
                  source={{ uri: data.Text}}
                  resizeMode={FastImage.resizeMode.cover}
              />: null}
            </TouchableOpacity>
          </View>
        </View>
        {this.renderCommentForm()}
      </View>
      
    )
  }
  renderAvatarUpload(){
    const {data} = this.props;
    return(
      <View>
        <View style={[styles.row]}>
          {data.Owner ? this.renderOwner(): null}
        </View>
        <TextI18n textKey={'TIMELINE.UPLOADAVATAR'}/>
        <View style={styles.reactionContent}>
          <View style={styles.reactionMediaContent}>
            <TouchableOpacity onPress={() => this.props.onPreviewImage({MediaObject:{Image:data.Text}})}>
              <FastImage
                  style={styles.postImage}
                  source={{ uri: data.Text}}
                  resizeMode={FastImage.resizeMode.cover}
              />
            </TouchableOpacity>
          </View>
        </View>
        {this.renderCommentForm()}
      </View>
      
    )
  }
  renderCommentForm() {
    const {data} = this.props;
    return(
      <View>
        <TouchableOpacity onPress={() => {showModal('commentsModal', {gradientShow: false, id:data.Id, lastComment:data.Comments, commentsCount:data.CommentsCount, type: this.props.type})}} style={styles.commentsAmount}>
          <TextI18n textKey="TIMELINE.COMMENTS"/>
          <Text style={styles.textCount}>{data.CommentsCount}</Text>
          <Icon name='comment'
                size={20}
                color={EStyleSheet.value('$btnIconColor')}
          />
        </TouchableOpacity>
        {/*<CommentAction comment={""} style={styles.commentInput} onSendCommentVideo={(el)=> this.onComment(el,data)} onSendComment={(el)=> this.onComment(el,data)} />*/}
      </View>
    )
    /*return(
      <View style={[styles.reactionCommentForm]}>
        <View style={styles.thumbsContent}>
          <View>
            <Icon //onPress={() => this.closeModal()}
              name='dislike'
              size={32}
              color={"#979797"}/>
          </View>
          <View style={[{ "marginLeft": 10 }]}>
            <Icon //onPress={() => this.closeModal()}
              name='like'
              size={32}
              color={"#979797"}/>
          </View>
        </View>
        <CommentAction comment={""} style={styles.commentInput} onSendComment={this.onComment.bind(this)} showGift/>
      </View>
    )*/
  }
  renderLikeContent() {
    const {data} = this.props;
    return(
      <View>
        <View style={[styles.row]}>
          {data.Owner ? this.renderOwner(): null}
        </View>
        <View style={styles.reactionContent}>
          <View style={styles.reactionTextContent}>
            <TextI18n textKey={'TIMELINE.LIKE'}/>
            <TouchableOpacity onPress={() => this.showProfileInfo(data.Person.Id)}><Text>{`@ ${data.Person && data.Person.Name}`}</Text></TouchableOpacity>
          </View>
          <View style={styles.reactionMediaContent}>
            {/*<Video*/}
              {/*autoPlay={false}*/}
              {/*isPaused={true}*/}
              {/*isVertical={false}*/}
              {/*rotateToFullScreen={false}*/}
              {/*resizeMode="contain"*/}
              {/*lockRatio={1.2}*/}
              {/*posterUrl={data.MediaObject.Image}*/}
              {/*fullScreenOnly={false}   // open fullscreen video*/}
              {/*inlineOnly={false}   // hide/show fullscreen button*/}
              {/*url={data.MediaObject.ContentUrl}*/}
            {/*/>*/}
            {this.renderVideo()}
          </View>
        </View>
        {this.renderCommentForm()}
      </View>)
  }
  renderDisLikeContent() {
    const {data} = this.props;
    return(
      <View>
        <View style={[styles.row]}>
          {data.Owner ? this.renderOwner(): null}
        </View>
        <View style={styles.reactionContent}>
          <View style={styles.reactionTextContent}>
            <TextI18n textKey={'TIMELINE.DISLIKE'}/>
            <TouchableOpacity onPress={() => this.showProfileInfo(data.Person.Id)}><Text>{'@' + data.Person && data.Person.Name}</Text></TouchableOpacity>
          </View>
          <View style={styles.reactionMediaContent}>
            {this.renderVideo()}
          </View>
        </View>
        {this.renderCommentForm()}
      </View>)
  }
  renderCommentContent(){
    const {data} = this.props;
    return(
      <View>
        <View style={[styles.row]}>
          {data.Owner ? this.renderOwner(): null}
        </View>
        <View style={styles.reactionContent}>
          <View style={styles.reactionTextContent}>
            {/*<TextI18n textKey={'TIMELINE.COMMENTED'}/>
            <TextI18n textKey={'TIMELINE.TO'}/>
            <TouchableOpacity onPress={() => this.showProfileInfo(data.Person.Id)}><Text>{'@' + (data.Person && data.Person.Name)}</Text></TouchableOpacity>*/}
            {data.TextContentType==0 ?<Text>{data.Text}</Text>: null}
          </View>
          <View style={styles.reactionMediaContent}>
            {/*<Video*/}
              {/*autoPlay={false}*/}
              {/*isPaused={true}*/}
              {/*isVertical={false}*/}
              {/*rotateToFullScreen={false}*/}
              {/*resizeMode="contain"*/}
              {/*lockRatio={1.2}*/}
              {/*posterUrl={data.MediaObject.Image}*/}
              {/*fullScreenOnly={false}   // open fullscreen video*/}
              {/*inlineOnly={false}   // hide/show fullscreen button*/}
              {/*url={data.MediaObject.ContentUrl}*/}
            {/*/>*/}
            {data.TextContentType ==0 ? this.renderVideo(): <TouchableOpacity onPress={() => showModal('videoFullScreen',
              {gradientShow: false,video: {Name:'', image: data.ThumbnailUrl, contentUrl:data.Text}})}>
              <FastImage
                  style={styles.postImage}
                  source={{ uri: data.ThumbnailUrl}}
                  resizeMode={FastImage.resizeMode.cover}
              />
              <View style={styles.playIcon}>
                <Icon name='play'
                      size={40}
                      color='#000' /></View>
            </TouchableOpacity>}
          </View>
        </View>
        {this.renderCommentForm()}
      </View>)
  }
  renderSendGiftContent() {
    const {data} = this.props;
    return(
      <View>
        <View style={[styles.row]}>
          {data.Owner ? this.renderOwner(): null}
        </View>
        <View style={styles.reactionContent}>
          <View style={styles.reactionTextContent}>
            <TextI18n textKey={'TIMELINE.SENTGIFT'}/>
          </View>
          <View style={styles.reactionMediaContent}>
            {this.renderVideo()}
          </View>
          {/*<View style={styles.reactionMediaContent}>*/}
          {/*  <Video*/}
          {/*    autoPlay={false}*/}
          {/*    isPaused={true}*/}
          {/*    isVertical={false}*/}
          {/*    rotateToFullScreen={false}*/}
          {/*    resizeMode="contain"*/}
          {/*    lockRatio={1.2}*/}
          {/*    posterUrl={data.MediaObject.Image}*/}
          {/*    fullScreenOnly={false}   // open fullscreen video*/}
          {/*    inlineOnly={false}   // hide/show fullscreen button*/}
          {/*    url={data.MediaObject.ContentUrl}*/}
          {/*  />*/}
          {/*</View>*/}
        </View>
        {this.renderCommentForm()}
      </View>)
  }
  renderPost(){
    const {data} = this.props;
    return(
      <View>
        <View style={[styles.row]}>
          {data.Owner ? this.renderOwner(): null}
        </View>
        <View style={styles.reactionContent}>
          <Text>{data.Text}</Text>

            {data.MediaObject && data.MediaObject.ContentUrl?
              <View style={styles.reactionMediaContent}>
                {this.renderVideo()}</View>: data.MediaObject&&data.MediaObject.Image?<View style={styles.reactionMediaContent}>
                <TouchableOpacity onPress={() => this.props.onPreviewImage(data)}>
                  <FastImage
                      style={styles.postImage}
                      source={{ uri: data.MediaObject.Image}}
                      resizeMode={FastImage.resizeMode.cover}
                  />
                </TouchableOpacity>
              </View>: null}
        </View>
        {this.renderCommentForm()}
      </View>)
  }
  renderUploadVideo() {
    const {data} = this.props;
    return(
      <View>
        <View style={[styles.row]}>
          {data.Owner ? this.renderOwner(): null}
          <TextI18n textKey={'TIMELINE.UPLOADVIDEO'}/>
        </View>
        <View style={styles.reactionContent}>
          {data.MediaObject?
          this.renderVideo(): null}
        </View>
        {this.renderCommentForm()}
      </View>)
  }
  renderUploadAudio(){
    return(
      <View>
        <View style={[styles.row]}>
          {data.Owner ? this.renderOwner(): null}
          <TextI18n textKey={'TIMELINE.UPLOADVIDEO'}/>
        </View>
        <View style={styles.reactionContent}>
          <Text>NOTIMPLEMENTED</Text>
        </View>
        {this.renderCommentForm()}
      </View>)
  }
  renderLevelContent(){
    const {data} = this.props;
    return(
      <View>
        <View style={[styles.row]}>
          <TouchableOpacity onPress={() => this.showProfileInfo(data.Person.Id)}
                            style={[styles.performerAvatar, styles.row]}>
            <Avatar
              style={{marginHorizontal: 5, width: 60, height: 60, borderWidth: 1}}
              source={data.Person && data.Person.Image || data.Alliance && data.Alliance.Image }
              rounded

            />
            <Text>{data.Person && data.Person.Name + ' ' || data.Alliance && data.Alliance.Name + ' '}</Text>
          </TouchableOpacity>
          <TextI18n textKey={'TIMELINE.GETSLEVEL'} keys={{
            level: data.Name.substring(5)
          }}/>
        </View>
      </View>)
  }
  renderJoinContent(){
    const {data} = this.props;
    return(
        <View>
          <View style={[styles.row]}>
            <TouchableOpacity onPress={() => this.showProfileInfo(data.Owner.Id)}
                              style={[styles.performerAvatar, styles.row]}>
              <Avatar
                  style={{marginHorizontal: 5, width: 60, height: 60, borderWidth: 1}}
                  source={data.Owner && data.Owner.Image}
              rounded

              />

            <TextI18n textKey={'TIMELINE.GETJOIN'} keys={{
              personName: data.Owner.Name
            }}/>
            </TouchableOpacity>
          </View>
        </View>)
  }
  renderLeaveContent(){
    const {data} = this.props;
    return(
        <View>
          <View style={[styles.row]}>
            <TouchableOpacity onPress={() => this.showProfileInfo(data.Owner.Id)}
                              style={[styles.performerAvatar, styles.row]}>
              <Avatar
                  style={{marginHorizontal: 5, width: 60, height: 60, borderWidth: 1}}
                  source={data.Owner && data.Owner.Image}
                  rounded

              />
            </TouchableOpacity>
            <TextI18n textKey={'TIMELINE.GETLEAVE'}keys={{
              personName: data.Owner.Name
            }} />
          </View>
        </View>)
  }

  renderReview() {
    const {data} = this.props;
    switch (data.ContentTypeRelation) {
      case ReviewContentType.Level:
        return <View>{this.renderLevelContent()}</View>
        break;
      case ReviewContentType.Comment:
        return <View>{this.renderCommentContent()}</View>
        break;
      default:
        return null;
        break;
    }
    // return (
    //   <View>
    //     {{
    //       [ReviewContentType.Level]: this.renderLevelContent(),
    //       [ReviewContentType.Comment]: this.renderCommentContent(),
    //     }[data.ContentTypeRelation]}
    //   </View>)
  }

  renderAction() {
    const {data} = this.props;
    switch (data.ContentTypeRelation) {
      case ActionContentType.Join:
        return <View>{this.renderJoinContent()}</View>
        break;
      case ActionContentType.Leave:
        return <View>{this.renderLeaveContent()}</View>
        break;
      case ActionContentType.UploadPersonAvatar:
        return <View>{this.renderAvatarUpload()}</View>
        break;
      case ActionContentType.UploadPersonVideo:
        return <View>{this.renderVideoUpload()}</View>
        break;
      case ActionContentType.UploadPersonImage:
        return <View>{this.renderImageUpload()}</View>
        break;
      default:
        return null;
        break;
    }
    // return (
    //   <View>
    //     {{
    //       [ReviewContentType.Level]: this.renderLevelContent(),
    //       [ReviewContentType.Comment]: this.renderCommentContent(),
    //     }[data.ContentTypeRelation]}
    //   </View>)
  }

  renderReactionContent(item) {
    const {data} = this.props;
    switch (data.ContentTypeRelation) {
      case ReactionContentType.Like:
        return <View>{this.renderLikeContent()}</View>
        break;
      case ReactionContentType.Dislike:
        return <View>{this.renderDisLikeContent()}</View>
        break;
      case ReactionContentType.SendGift:
        return <View>{this.renderSendGiftContent()}</View>
        break;
      default:
        return null;
        break;
    }
    // return (
    //   <View>
    //     {{
    //       [ReactionContentType.Like]: this.renderLikeContent(),
    //       [ReactionContentType.Dislike]: this.renderDisLikeContent(),
    //       [ReactionContentType.SendGift]: this.renderSendGiftContent()
    //     }[data.ContentTypeRelation]}
    //   </View>
    // )
  }
  renderMedia(){
    const {data} = this.props;
    switch (data.ContentTypeRelation) {
      case MediaContentType.Post:
        return <View>{this.renderPost()}</View>
        break;
      case MediaContentType.UploadVideo:
        return <View>{this.renderUploadVideo()}</View>
        break;
      case MediaContentType.UploadAudio:
        return <View>{this.renderUploadAudio()}</View>
        break;
      default:
        return null;
        break;
    }
    // return (
    //   <View>
    //     {{
    //       [MediaContentType.Post]: this.renderPost(),
    //       [MediaContentType.UploadVideo]: this.renderUploadVideo(),
    //       [MediaContentType.UploadAudio]: this.renderUploadAudio()
    //     }[data.ContentTypeRelation]}
    //   </View>
    // )
  }


  render() {
    const {data} = this.props;

      switch (data.ContentType) {

          case ContentType.Media:
            return (<View style={[styles.card]}>
              {this.renderMedia()}
            </View>)
            break;
        case ContentType.Reaction:
          return (<View style={[styles.card]}>
            {this.renderReactionContent()}
          </View>)
          break;
        case ContentType.Review:
          return (<View style={[styles.card]}>
            {this.renderReview()}
          </View>)
          break;
        case ContentType.Action:
          return (<View style={[styles.card]}>
            {this.renderAction()}
          </View>)
          break;
        default:
          return null;
          break;
    }
    //   {{
    //     [ContentType.Media]:,
    //     [ContentType.Reaction]: this.renderReactionContent(),
    //     [ContentType.Review]:this.renderReview(),
    //   }[[data.ContentType]]}
    // return (<View style={[styles.card]}>
    // </View>)


  }

};
const mapStateToProps = (state) => ({
  auth: state.auth
});
const mapDispatchToProps = (dispatch) => ({
  updateCountOfCommentsForPostAndLastComment: (postId, newLastComment) => dispatch(updateCountOfCommentsForPostAndLastComment(postId, newLastComment))
});

export default connect(mapStateToProps, mapDispatchToProps)(TimelineCard);


const styles = EStyleSheet.create({
  card:{
    //borderWidth: 1,
    //borderColor: color.timelineCardBorder,
    borderRadius: 15,
    padding: 20,
    backgroundColor: '#f8f8f8f8',
    marginBottom: 20,
  },
  row:{
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  col:{
    flexDirection: 'column',
    justifyContent: 'center'
  },
  reactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10
  },
  ownerName: {
    fontSize: 22
  },
  reactionTime: {
    color: '#ccc'
  },
  menuMore: {
    alignSelf: 'center'
  },
  reactionContent: {
    display: 'flex',
    flexDirection: 'column',
    alignContent: 'space-between',
    // marginLeft: 60
  },
  reactionTextContent: {
    marginLeft: 5
  },
  reactionMediaContent: {
    marginTop: 10,
  },
  reactionCommentForm: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    alignContent: 'space-between',
    width: '100%',
    marginTop: 20
  },
  commentInput: {
    width: '100%',
    alignSelf: 'flex-start',
    marginTop: 50,
  },
  thumbsContent: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%'
  },
  postImage:{
    width: '100%',
    height: 200
  },
  playIcon:{
    position: 'absolute',
    left: '45%',
    top: 80
  },
  commentsAmount:{
    flexDirection:'row',
    justifyContent:'flex-end',
    alignItems: 'flex-end',
    paddingVertical: 5
  },
  textCount:{
    paddingHorizontal: 3,
    fontSize: font.sizeH3,
  }
});
