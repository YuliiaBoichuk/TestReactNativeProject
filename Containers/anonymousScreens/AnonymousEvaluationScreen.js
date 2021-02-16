import React from 'react';
import {
  View, StyleSheet, FlatList, Dimensions, Keyboard, PanResponder, Text, SafeAreaView,Switch
} from 'react-native';
import {connect} from 'react-redux';

import {getConfigItem} from '../../Services/configService';
import {getParams, goBack, navigateTo} from "../../Services/navigationService";
import Button from "../../components/common/Button";
import {EvaluationCard} from "../../components/quest/index";
import {sendReactionOnTask, setTransparentTab} from "../../redux/actions/questAction";
import {showModal, closeModal} from "../../Services/modalService";
import {TextI18n} from "../../components/common/index";
import Image from 'react-native-remote-svg';
import {Gifts} from '../../constants/gifts.enum';
import EStyleSheet from 'react-native-extended-stylesheet';
import deviceStorage from "../../Services/deviceStorage";
import i18n from "i18next";
import {AdMobRewarded} from "react-native-admob";

const color = getConfigItem('AccessTheme').color;
const font = getConfigItem('AccessTheme').font;
const { width, height } = Dimensions.get('window');

class AnonymousEvaluationScreen extends React.Component {
  flatlistref = null;
  questData = {};
  screenHeight = 0;
  yOffset=0;
  quarterScreenHeight =0;
  threeQuartersScreenHeight = 0;


  constructor(props) {
    super(props);
    this.questData = getParams(props).quest;
    this.screenHeight = Dimensions.get('window').height;
    this.isError = false;
    this.quarterScreenHeight = this.screenHeight/4;
    this.threeQuartersScreenHeight = this.screenHeight*0.75;
    this.state = {
      isRefreshing: false,
      currentShowingIndex:0,
      comment: '',
      isGiftModalOpened: false,
      isKeyboardOpen: false,
      otherUsersActions: [],
      isScheduledActions: false,
      isShowADV: 0,
    }
    this.scrollToItem = this.scrollToItem.bind(this)
    this.onKeyboardWillShow = (e) => {
      this.setState({isKeyboardOpen:true});
      closeModal();
    };
    this.onKeyboardWillHide = (_e) => {
      this.setState({isKeyboardOpen:false});
      this.flatlistref.scrollToIndex({index:this.state.currentShowingIndex, animated: true})
      this.setState({isGiftModalOpened:false});
    };
  }

  componentDidMount() {
    this.keyboardWillShowListener = Keyboard.addListener('keyboardDidShow', this.onKeyboardWillShow.bind(this));
    this.keyboardWillHideListener = Keyboard.addListener('keyboardDidHide', this.onKeyboardWillHide.bind(this));
    this.props.navigation.addListener('willFocus', this.screenload.bind(this));
    this.props.navigation.addListener('willBlur', this.screenUnload.bind(this))
  }

  componentDidUpdate(prevProps, prevState){
    if(!(prevProps.sendGiftId && prevProps.sendGiftId.giftId) && (this.props.sendGiftId && this.props.sendGiftId.giftId)){
      closeModal();
      this.setState({isGiftModalOpened: false});
    }
  }

  screenUnload() {
    this.props.setTransparentTab(false);
    closeModal();
  }

  screenload() {
    this.props.setTransparentTab(true);
    const result = this.questData.tasks.find((task) => {
      return !task || !task.mediaObject
    });
    this.isError = !!result;
    deviceStorage.getKey('isShowADV').then(isShowADV => {this.setState({isShowADV: Number(isShowADV)})})
  }
  onShowGifts(index){
    showModal('anonymousUserRestricted', {
      message:'ANONYMOUS.RESTRICTED_ACTION',
      onOkAction: (data) => {
        deviceStorage.removeKey('anonymousFlow')
        navigateTo('login')
      },
      onCancelAction:(data) => {
      }
    })

  }

  sendReaction(item, type){
    this.props.sendReaction(
        {
          personTaskActionId: this.questData.tasks[this.state.currentShowingIndex].id,
          actionType: type,
          text: item,
          startTime: new Date().toISOString(), //ToDo: temporary added need implement logic of handle showing video time
          endTime: new Date().toISOString()
        });
  }
  onComment(text){
    this.setState({comment: text.text});
    this.sendReaction(text.text, 'CommentAction');
  }


  componentWillUnmount() {
    console.log('UnMount');
    if (this.keyboardWillShowListener) {
      this.keyboardWillShowListener.remove();
    }
    if (this.keyboardWillHideListener) {
      this.keyboardWillHideListener.remove();
    }
  }

  handleLoadMore() {
    console.log("Handle load more", 'background: #222; color: #bada55')
  }
  scrollToItem(data) {

  }
  onAction(data){
    const otherUsersActionsOld = [...this.state.otherUsersActions]
    otherUsersActionsOld.push(JSON.parse(data))
    this.setState({otherUsersActions: otherUsersActionsOld})
    setTimeout(()=>{
      if(this.state.otherUsersActions && this.state.otherUsersActions.length) {
        const otherUsersActionsOld = [...this.state.otherUsersActions]
        otherUsersActionsOld.shift()
        this.setState({otherUsersActions: otherUsersActionsOld})
      }
    }, 12000)
  }

  showAdvertising() {
    AdMobRewarded.setAdUnitID('ca-app-pub-3940256099942544/5224354917');
    AdMobRewarded.requestAd().then((data) => {
      console.log(data);
      AdMobRewarded.showAd()
    }).catch((e) => {
      console.log(e);
    });
  }

  onScrollEndDrag = (e) => {
    this.setState({isShowADV: this.state.currentShowingIndex>=0 ? ++this.state.isShowADV :null}, ()=>{
      deviceStorage.saveKey('isShowADV', this.state.isShowADV);
      this.state.isShowADV % 3 == 0 ? this.showAdvertising() : null;
    })
    let yOffset = e.nativeEvent.contentOffset.y;
    if(yOffset> this.yOffset){
      if(yOffset%this.screenHeight> this.quarterScreenHeight && this.state.currentShowingIndex<this.questData.tasks.length-1){
        this.flatlistref.scrollToIndex({index:(this.state.currentShowingIndex+1), animated: true});
        this.setState({currentShowingIndex: (this.state.currentShowingIndex+1), otherUsersActions: []}, () =>{
        })
      } else{
        this.flatlistref.scrollToIndex({index:(this.state.currentShowingIndex), animated: true})
      }
    }else if(yOffset< this.yOffset){
      if(yOffset%this.screenHeight< this.threeQuartersScreenHeight && this.state.currentShowingIndex!=0){
        this.flatlistref.scrollToIndex({index:(this.state.currentShowingIndex-1), animated: true});
        this.setState({currentShowingIndex: (this.state.currentShowingIndex-1), otherUsersActions: []}, () =>{
        })
      } else{
        this.flatlistref.scrollToIndex({index:(this.state.currentShowingIndex), animated: true})
      }
    }
    closeModal();
    this.setState({isGiftModalOpened: false});
  }
  getMessageForToast(){
    let message = '';
    message += this.state.otherUsersActions[0].personName || 'You';
    if(this.state.otherUsersActions[0].type == 'CommentAction'){
      message += ' commented '
    } else if(this.state.otherUsersActions[0].type == 'DislikeAction'){
      message += ' dislike video'
    } else if(this.state.otherUsersActions[0].type == 'LikeAction'){
      message+=' like video'
    } else if(this.state.otherUsersActions[0].type == 'SendGift'){
      message+= ' send gift'
    }

    if(this.state.otherUsersActions[0].type != 'SendGift' && this.state.otherUsersActions[0].content){
      if(this.state.otherUsersActions[0].content.indexOf('http')==0){
        message += i18n.t('QUESTS.WITHVIDEO');
      } else {
        message += this.state.otherUsersActions[0].content
      }
    }
    return message;
  }
  render() {
    if(this.props.sendReactionAction && this.props.sendReactionAction.data
        && this.props.sendReactionAction.data.actionType === 'CommentAction'
        && this.props.sendReactionAction.data.text) {
      this.commentMessage = this.props.sendReactionAction.data.text;
    }
    if(this.props.sendGiftId && this.props.sendGiftId.giftId) {
      this.gift = Gifts.find(item => {
        return item.id == this.props.sendGiftId.giftId
      });
    }
    if(this.isError){
      return(
          <View style={{flex:1, alignItems: 'center', justifyContent:'center'}}>
            <Image source={require('../../assets/images/business-and-finance.png')}
                   style={styles.image}/>
            <TextI18n style={styles.noResultsText} textKey="QUESTS.QUESTBROKEN"/>
          </View>
      )
    }else {
      return (
    
    
        <SafeAreaView style={styles.container}>
          <FlatList
        
            ref={(ref) => this.flatlistref = ref}
            data={this.questData.tasks}
            renderItem={({item, index}) => <EvaluationCard data={item}
                                                           index={index} height={this.screenHeight}
                                                           currentShowingIndex={this.state.currentShowingIndex}
                                                           isExpert={false}
                                                           isAnonymous={true}
                                                           isGiftModalOpened={this.state.isGiftModalOpened}
                                                           isScheduledActions={this.state.isScheduledActions}
                                                           isKeyboardOpen={this.state.isKeyboardOpen}
                                                           onAction={(data) => {
                                                             this.onAction(data)
                                                           }}
                                                           onShowGifts={this.onShowGifts.bind(this)}/>}
            contentContainerStyle={{flexGrow: 1}}
            initialNumToRender={3}
            refreshing={this.state.isRefreshing}
            onRefresh={this.handleRefresh}
            getItemLayout={(data, index) => (
              {length: this.screenHeight, offset: this.screenHeight * index, index}
            )}
            scrollEventThrottle={16}
            keyExtractor={item => item.id.toString()}
            onScrollBeginDrag={(e) => {
              this.yOffset = e.nativeEvent.contentOffset.y
            }}
            onScrollEndDrag={this.onScrollEndDrag}
            onEndReached={(x, y) => {
              console.log('reached');
              this.handleLoadMore()
            }}
            onEndReachedThreshold={0.01}
          />
      
          {this.state.otherUsersActions && this.state.otherUsersActions.length ?
            <View style={styles.giftActionBarContainer}>
              <Text numberOfLines={2}>{this.getMessageForToast()}</Text>
              {this.state.otherUsersActions[0].type == 'SendGift' ?
                <Image source={{
                  uri: Gifts.find(item => {
                    return item.id == this.state.otherUsersActions[0].content
                  }).image
                }} style={{width: 40, height: 40,}}/> : null}
            </View> : null
          }
        </SafeAreaView>
      );
    }
  }
}

const mapStateToProps = state => ({
  auth: state.auth,
  sendGiftId: state.questReducer.sendGiftId,
  sendReactionAction: state.questReducer.sendReactionAction
});
const bindActions = dispatch => ({
  setTransparentTab: data => dispatch(setTransparentTab(data)),
  sendReaction: (data) => dispatch(sendReactionOnTask(data))
});
export default connect(mapStateToProps, bindActions)(AnonymousEvaluationScreen);

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  giftActionBarContainer:{
    position: 'absolute',
    top: 50,
    left:'10%',
    width: '80%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    alignItems: 'center',
    height: 50,
    borderRadius: 10,
    backgroundColor: '$questCardBackground'
  },
  giftActionBar:{
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 34,
    paddingVertical: 35,
    borderRadius: 10,
    width: '80%',
    height:30,
    position:'absolute',
    top: 10,
    left: '10%',
    zIndex:200,
    backgroundColor: '$questCardBackground'
  },
  scheduledActionBarContainer:{
    position: 'absolute',
    top: 20,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    height: 30
  },
  scheduledActionBarText:{
    color: '#fff'
  },  image: {
    width: 80,
    height: 80,
    borderRadius: 40
  },
});
