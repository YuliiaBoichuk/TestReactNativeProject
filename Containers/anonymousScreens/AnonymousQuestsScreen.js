import React from 'react';
import {
  View, FlatList, Text, PanResponder, TouchableOpacity
} from 'react-native';
import {connect} from 'react-redux';
import {getConfigItem} from '../../Services/configService';
import {QuestsListCard} from "../../components/quest/index"
import {getAnonymousQuestsForReview, getQuestsFromElastic} from "../../redux/actions/questAction";
import {Loading, SmallHeader, TextI18n, GVE_Icon as Icon} from "../../components/common/index";


import EStyleSheet from 'react-native-extended-stylesheet';
const font = getConfigItem('AccessTheme').font;

class AnonymousQuestsScreen extends React.Component {
  constructor(props) {
    super(props);
    this.types = [ 'Active', 'Final'];
    this.state = {
      isRefreshing: false,
      activeList: 'Active',
      data: []
    }
    this._panResponder = PanResponder.create({
      // Ask to be the responder:
    
      onMoveShouldSetPanResponderCapture: (_, gestureState) => {
        const { dx, dy } = gestureState
        return (dx > 2 || dx < -2 || dy > 2 || dy < -2)
      },
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        //return true if user is swiping, return false if it's a single click
        return !(gestureState.dx === 0 && gestureState.dy === 0)
      },
      onPanResponderGrant: (evt, gestureState) => {
        // The gesture has started. Show visual feedback so the user knows
        // what is happening!
        // gestureState.d{x,y} will be set to zero now
      },
      onPanResponderMove: (evt, gestureState) => {
        // The most recent move distance is gestureState.move{X,Y}
        // The accumulated gesture distance since becoming responder is
        // gestureState.d{x,y}
      },
      onPanResponderTerminationRequest: (evt, gestureState) => true,
      onPanResponderRelease: (evt, gestureState) => {
        console.log(gestureState.dx, gestureState.vx)
        if (gestureState.dx > 0) {
          const currentIndex = this.types.indexOf(this.state.activeList);
          if (currentIndex - 1 >= 0) {
            this.setState({activeList: this.types[currentIndex - 1]})
            this.props.getQuestsFromElastic(this.types[currentIndex - 1]);
          }
        } else if(gestureState.dx < 0) {
          const currentIndex = this.types.indexOf(this.state.activeList);
        
          if (this.types.length > currentIndex + 1) {
            this.setState({activeList: this.types[currentIndex + 1]})
            this.props.getQuestsFromElastic(this.types[currentIndex + 1]);
          }
        }
        // The user has released all touches while this view is the
        // responder. This typically means a gesture has succeeded
      },
      onPanResponderTerminate: (evt, gestureState) => {
        // Another component has become the responder, so this gesture
        // should be cancelled
      },
      onShouldBlockNativeResponder: (evt, gestureState) => {
        // Returns whether this component should block native components from becoming the JS
        // responder. Returns true by default. Is currently only supported on android.
        return true;
      },
    });
  
  }
  
  componentDidMount() {
    this.props.navigation.addListener('willFocus', this.screenLoad.bind(this))
  }
  _loadData(){
    this.props.getAnonymousQuestsForReview(this.props.anonymousData)
  }
  
  screenLoad() {
    this._loadData()
  }
  selectActiveTab(item) {
    this.setState({activeList: item})
    if(item!='Active'){
      this.props.getQuestsFromElastic(item, true);
    } else {
      this.screenLoad()
    }
  }
  handleRefresh = () => {
    this.setState({
      isRefreshing: true,
    }, () => {
      if(this.state.activeList!='Active'){
        this.props.getQuestsFromElastic(this.state.activeList, true);
      } else {
        this.screenLoad()
      }
    });
  };
  
  handleLoadMore = () => {
    //ToDo: discuss if needed Infinity scroll
  };
  
  _returnCountOfQuests(){
    
    return (this.state.activeList == 'Active'&& (this.props.anonymous_list.length || 0)
      || this.state.activeList == 'Final' && (this.props.final_list.length || 0) || 0)
  }
  
  _renderActiveList() {
    return (
      <View>
        {this.props.isLoading ? <Loading/> :
          this.props.anonymous_list.length ?
            <FlatList
              ref={(ref) => this.flatlistref = ref}
              data={this.props.anonymous_list}
              renderItem={({item, index}) => <QuestsListCard data={item}
                                                             isArtist={false} isAnonymous={true}/>}
              refreshing={this.props.isLoading}
              onRefresh={this.handleRefresh}
              onEndReached={(x, y) => {
                console.log('reached');
                this.handleLoadMore()
              }}
              ListHeaderComponentStyle={{paddingTop:10}}
              onEndReachedThreshold={0.01}
            /> : <View/>
        }</View>)
  }
  _renderFinalList() {
    return (
      <View>
        {this.props.isLoading ? <Loading/> :
          this.props.final_list.length ?
            <FlatList
              ref={(ref) => this.flatlistref = ref}
              data={this.props.final_list}
              renderItem={({item, index}) => <QuestsListCard data={item}
                                                             isAnonymous={true}
                                                             isForResults={true}
                                                             isArtist={false}/>}
              refreshing={this.props.isLoading}
              onRefresh={this.handleRefresh}
              onEndReached={(x, y) => {
                console.log('reached');
                this.handleLoadMore()
              }}
              onEndReachedThreshold={0.01}
            /> : <View/>
        }</View>)
  }
  
  render() {
    return (
      <View style={styles.container}>
        <SmallHeader
          leftComponent={
            <TextI18n style={styles.headerText} textKey="QUESTS.QUESTS"/>}
        />
        <View style={[styles.tabsBar]}>
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => this.selectActiveTab('Active')}>
            <TextI18n style={[styles.text, this.state.activeList == 'Active' ? styles.activeText: null]}
                      textKey="TICKETS.TABS.ACTIVE"></TextI18n>
            {
              this.state.activeList == 'Active' ? <View style={styles.activeBar} /> : null
            }
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => this.selectActiveTab('Final')}>
            <TextI18n style={[styles.text, this.state.activeList == 'Active' ? styles.activeText: null]}
                      textKey="TICKETS.TABS.FINAL"></TextI18n>
            {
              this.state.activeList == 'Final' ? <View style={styles.activeBar} /> : null
            }
          </TouchableOpacity>
        </View>
  
        <View style={styles.header}>
          <TextI18n
            style={styles.title}
            textKey="QUESTS.TOPBAR.QUESTIONCOUNT.LEFT"
          />
          <Text style={{
            fontWeight: '500',
            color: EStyleSheet.value('$mainColor')
          }}> {this._returnCountOfQuests()} </Text>
          {this._returnCountOfQuests() === 1 ? <TextI18n
              style={styles.title}
              textKey="QUESTS.TOPBAR.QUESTIONCOUNT.RIGHT"
          />: <TextI18n
              style={styles.title}
              textKey="QUESTS.TOPBAR.QUESTIONCOUNT.RIGHTPLURAL"
          />}
        </View>
        <View>
          {this.state.activeList == 'Active' ? this._renderActiveList() : null}
          {this.state.activeList == 'Final' ? this._renderFinalList() : null}
        </View>
      </View>
    );
  }
}

const mapStateToProps = state => ({
  anonymous_list: state.questReducer.anonymous,
  isLoading: state.questReducer.loading,
  anonymousData: state.auth.anonymousData,
  final_list: state.questReducer.Final,
});
const bindActions = dispatch => ({
  getAnonymousQuestsForReview: (data) => dispatch(getAnonymousQuestsForReview(data)),
  getQuestsFromElastic: (type, isAnonymous) => dispatch(getQuestsFromElastic(type, isAnonymous))
});
export default connect(mapStateToProps, bindActions)(AnonymousQuestsScreen);

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    backgroundColor: '$genBackgroundColor',
    paddingHorizontal: 5
  },
  emptyHeader: {
    height: 70
  },
  main: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '$genBackgroundColor',
    marginBottom: 10
  },
  button: {
    backgroundColor: '$profileImageBackground'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    minHeight: 50,
    paddingLeft: 10
  },
  title: {
    color: '$mainColor'
  },
  // modal: {
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   position: 'absolute',
  //   zIndex: 9999
  // },
  // modal4: {
  //   height: 300
  // },
  tabsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  text: {
    fontSize: font.sizeH2,
    color: '$headerText'
  },
  activetab: {
    backgroundColor: '$mainColor'
  },
  headerText:{
    fontSize: font.sizeHeader,
    color: '$headerText'
  },
  tabItem:{
    justifyContent: 'center'
  },
  activeBar:{
    height:2,
    marginLeft: 4,
    width: '80%',
    backgroundColor: '$mainColor'
  },
});
