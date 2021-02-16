import React from 'react';
import {
  View, StyleSheet, FlatList, Text, Dimensions, Animated, Easing, TouchableOpacity, Image
} from "react-native";
import {connect} from 'react-redux';

import {getConfigItem} from '../../Services/configService';
import {Loading, TextI18n, GVE_Icon as Icon, Avatar} from "../common/index";
import i18n from "i18next";
import EStyleSheet from 'react-native-extended-stylesheet';
import {getWithParams} from "../../redux/actions/http-request";
import {checkHttpStatus, parseJSON} from "../../utils/index";
import {navigateTo} from "../../Services/navigationService";
import {CommentContentType} from "../../constants/timelineCommentContentType.enum";
import {showModal} from "../../Services/modalService";
import FastImage from "react-native-fast-image";

const color = getConfigItem('AccessTheme').color;
const font = getConfigItem('AccessTheme').font;



class TimeLineComment extends React.Component {
  constructor(props) {
    super(props);
    this.screenWidth = Dimensions.get('window').width;
    this.state = {
      isRefreshing: false,
      scrollEnabled: true,
    };
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
  renderUserImage(isBig, item){
    return(
      <Avatar
        style={{marginHorizontal: 2, width: isBig?45:25, height: isBig?45:25, borderWidth: 1}}
        source={item.Person && item.Person.Image}
        rounded
      />
    )
  }
  renderUserName(isBig, item){
    return(
      <TouchableOpacity onPress={()=> navigateTo('person', item.Person.Id)}>
        <Text style={styles.userName}>{item.Person.Name||'Manager Artist'}</Text>
      </TouchableOpacity>
    )
  }
  renderTime(isBig, item) {
    return(
        <View>
          <Text style={styles.timeText}>{this.showActionTime(item.CreateDate)}</Text>
        </View>
    )
  }
  renderCommentType(isBig, item) {
    switch (item.ContentType) {
      case CommentContentType.Text:
        return <View>{this.renderTextComment(isBig, item)}</View>
        break;
      case CommentContentType.Video:
        return <View>{this.renderVideoComment(isBig, item)}</View>
        break;
      case CommentContentType.Gift:
        return <View>{this.renderGiftComment(isBig, item)}</View>
        break;
      default:
        return null;
        break;
    }
  }

  renderTextComment(isBig, item){
    return(
      <View style={{paddingVertical: 10}}>
        <Text style={styles.commentText}>{item.Content}</Text>
      </View>
    )
  }
  renderVideoComment(isBig, item){
    return(
      <View>
        <TouchableOpacity onPress={() => showModal('videoFullScreen',
          {gradientShow: false,video: {Name:'', image: item.ThumbnailUrl, contentUrl:item.Content}})}>
          { item.ThumbnailUrl ?
          <FastImage
                  style={styles.postImage}
                  source={{ uri: item.ThumbnailUrl}}
                  resizeMode={FastImage.resizeMode.cover}
              /> : null}
          <View style={styles.playIcon}>
            <Icon name='play'
                  size={40}
                  color='#000' /></View>
        </TouchableOpacity>
      </View>
    )
  }
  renderGiftComment(isBig, item){
    return(
      <View style={{paddingVertical: 10}}>
        <Text style={styles.commentText} >Not implemented Gift</Text>
      </View>
    )
  }
  renderReplay(data){
    // ToDo: create key in translations
    return(
      <View>
        {/*<TouchableOpacity onPress={() => {this.props.onReplay(data.Id)}}>*/}
          {/*<TextI18n textKey="Replay"/>*/}
        {/*</TouchableOpacity>*/}
      </View>
    )
  }

  render() {
    console.log(this.props.data)
    return (
      <View style={styles.container}>
        <View style={styles.commentContainer}>
          <View style={{flexDirection: 'row'}}>
            <View>{this.renderUserImage(true, this.props.data)}</View>
            <View>
              <View>{this.renderUserName(true, this.props.data)}</View>
              <View>{this.renderTime(true, this.props.data)}</View>
            </View>
          </View>
          <View style={styles.commentContentFirstLevel}>
            <View>{this.renderCommentType(true, this.props.data)}</View>
            <View>{this.renderReplay(this.props.data)}</View>
            {this.props.data.ChildComment && this.props.data.ChildComment.length ?
              this.props.data.ChildComment.map((item, index)=> {
                return(
                  <View key={item.Id} style={styles.childCommentContainer}>
                    <View>{this.renderUserImage(false, item)}</View>
                    <View>{this.renderUserName(false, item)}</View>
                    <View>
                      <View>{this.renderCommentType(false, item)}</View>
                    </View>
                  </View>
                )
              }): null
            }
          </View>
        </View>
      </View>
    );
  }
}

export default TimeLineComment;

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: 5,
    paddingVertical: 10
  },
  commentContainer:{
    flex:1,
    flexDirection: 'column'
  },
  childCommentContainer:{
    flex:1,
    flexDirection: 'row'
  },
  userName:{
    color: '$headerText',
    fontSize: font.sizeH2,
  },
  commentContentFirstLevel:{
    marginLeft:45
  },
  timeText:{
    fontSize: font.sizeS,
    color: '$btnIconColor'
  },
  commentText:{
    color: '$headerText',
    fontSize: font.sizeH3,
    marginLeft:5
  },
  separator:{
    height: 1,
    width: "100%",
    backgroundColor: '$tabText',
    marginLeft: 5,
    marginVertical: 10
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

});
