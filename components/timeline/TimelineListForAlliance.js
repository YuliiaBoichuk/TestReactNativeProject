import React from 'react';
import {
  View, StyleSheet, FlatList, Text, Dimensions, Animated, Easing, TouchableOpacity
} from "react-native";
import {connect} from 'react-redux';

import {getConfigItem} from '../../Services/configService';
import {GVE_Icon as Icon, Loading, TextI18n} from "../common/index";
import { getDataForTimeline, getTimelinePromos, setCriteria } from "../../redux/actions/allianceTimelineAction";
import TimelineCard from "./TimelineCard";
import TimelinePromoItem from "./TimelinePromoItem";
import i18n from "i18next";
import EStyleSheet from 'react-native-extended-stylesheet';
import {getWithParams} from "../../redux/actions/http-request";
import {checkHttpStatus, parseJSON} from "../../utils/index";
import {getParams, goBack} from "../../Services/navigationService";
import {navigateTo} from "../../Services/navigationService";
import {authUserSelector} from "../../Services/authService";

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

class TimelineListForAlliance extends React.Component {
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
      followingIds: [],
        orgId: ''
    };
    this.navigateToCreatePost = this.goToCreatePost.bind(this)
  }

  componentDidMount(){
    // this.screenLoad()
    console.log("init");
      const {id }= getParams(this.props);
      this.setState({orgId: id});
    this.props.navigation.addListener('willFocus', this.screenLoad.bind(this))

  }
  screenLoad() {
    this.props.setCriteria({from:0, page:1});
    console.log("screen loads");
    getWithParams('/person/following')
      .then(checkHttpStatus)
      .then(parseJSON)
      .then(data => {
        const mappedData = data.map((item, index) => {
          return item.id
        })
        this.setState({ followingIds: mappedData ||[]});
        this.props.getTimeLineData(this.props.context, false, null, mappedData || [], this.state.orgId);
      }).catch(error => {
      console.log(error);
    })

    this.props.getTimelinePromos();
  }

  handleRefresh = () => {
    this.setState({
      isRefreshing: true,
    }, () => {
      console.log("handle refresh");
      this.props.getTimeLineData(this.props.context, false, null, this.state.followingIds, this.state.orgId)
    });
  };
  handleLoadMore = () => {
    this.props.getTimeLineData(this.props.context, true, null, this.state.followingIds, this.state.orgId)
  };
  translateTransform(index: number) {
    return {
      transform: [{
        scale: xOffset.interpolate({
          inputRange: [
            (index - 1) * (screenWidth-80),
            index * (screenWidth-80),
            (index + 1) * (screenWidth-80)
          ],
          outputRange: [0.9, 1, 0.9]
        })
      }]
    };
  }

  // renderPromosList() {
  //   return(
  //     <View>
  //       {this.props.isLoading ? <Loading/> :
  //         this.props.promos.length ?
  //           <Animated.ScrollView
  //             horizontal
  //             ref={(c) => {this.scroll = c}}
  //             scrollEventThrottle={16}
  //             showsHorizontalScrollIndicator={false}
  //             style={styles.promoList}
  //             pagingEnabled
  //             snapToInterval={screenWidth-80}
  //             onScroll={onScroll}>
  //             {this.props.promos.map((post, index) => {
  //               return (
  //                 <Animated.View style={[this.translateTransform(index)]}>
  //                   <TimelinePromoItem data={post}/>
  //                 </Animated.View>
  //               )
  //             })}
  //           </Animated.ScrollView> : <View/>
  //       }
  //     </View>
  //   )
  // }

  goToCreatePost(){
    navigateTo('createAllianceTimeLinePost', {context: 'user', id:this.state.orgId})
  }
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.emptyHeader}/>
        {this.props.isLoading ? <Loading/> :
          <View>
              <FlatList
                ref={(ref) => this.flatlistref = ref}
                data={this.props.timeline}
                ListHeaderComponent={
                  <View style={styles.timelineHeadItems}>
                    {/*{this.props.promos.length ?*/}
                    {/*  <View>*/}
                    {/*    <TouchableOpacity style={{marginTop:15}} onPress={() => goBack(this.props)} >*/}
                    {/*      <Icon*/}
                    {/*          name='back'*/}
                    {/*          size={25}*/}
                    {/*          color={EStyleSheet.value('$headerIconColor')}*/}
                    {/*      /></TouchableOpacity>*/}
                    {/*    <Text style={styles.timelineSubtitle}>{i18n.t('TIMELINE.DONT_FORGET')}</Text>*/}
                    {/*    {this.renderPromosList()}*/}
                    {/*  </View>*/}
                    {/*  : null}*/}
                    <View style={styles.timelineHead}>
                      {/*{!this.props.promos.length ?*/}
                      <TouchableOpacity style={{marginTop: 5}} onPress={() => goBack(this.props)} >
                        <Icon
                            name='back'
                            size={25}
                            color={EStyleSheet.value('$headerIconColor')}
                        /></TouchableOpacity>
                      {/*:null}*/}
                      <Text style={styles.titleTimeline}>{i18n.t('TIMELINE.TIMELINE')}</Text>
                      { authUserSelector.isUserAdminOfOrgSync(this.props, this.state.orgId) ||
                      authUserSelector.isUserProMemberOfOrgSync(this.props, this.state.orgId)?
                      <Icon
                          name='plus'
                          size={25}
                          onPress={this.navigateToCreatePost}
                          color={EStyleSheet.value('$headerIconColor')}
                      /> : null}
                    </View>
                  </View>
                }
                ListEmptyComponent={
                  <View style={styles.noPostsContainer}>
                    <TextI18n style={styles.noPostsText} textKey="TIMELINE.NOPOSTS"/>
                  </View>
                }
                renderItem={({ item, index }) => <TimelineCard type={"alliance"} data={item}/>}
                refreshing={this.props.isLoading}
                onRefresh={this.handleRefresh}
                onEndReached={(x, y) => {
                  if (x.distanceFromEnd >= 0) {
                    this.handleLoadMore()
                  }
                }}
                onEndReachedThreshold={0.01}
              />
          </View>
        }
      </View>
    );
  }
}

const mapStateToProps = state => ({
  auth: state.auth,
  timeline: state.timelineReducer.data,
  isLoading: state.timelineReducer.loading,
  promos: state.timelineReducer.promos
});
const bindActions = dispatch => ({
  getTimeLineData: (context, isLoadMore, criteria, followingIds, orgId) => dispatch(getDataForTimeline(context, isLoadMore, criteria, followingIds, orgId)),
  getTimelinePromos: () => dispatch(getTimelinePromos()),
  setCriteria: (data) => dispatch(setCriteria(data))
});
export default connect(mapStateToProps, bindActions)(TimelineListForAlliance);

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    backgroundColor: '#f2f2f2',
    paddingHorizontal: 5
  },
  emptyHeader:{
    height: 10
  },
  timelineHeadItems:{
    left: 10,
    alignItems: 'center',
    flexDirection: 'row',
  },
  timelineSubtitle:{
    color: '#000',
    fontSize: 20,
    paddingBottom: 10
  },
  promoList: {
    minHeight: 326,
    backgroundColor: '#f2f2f2',
    paddingBottom: 20
  },
  noPostsContainer:{
    alignItems: 'center'
  },
  timelineHead:{
    flexDirection: 'row',
    paddingVertical: 10,
  },
  titleTimeline:{
    color: '#000',
    fontSize: 24,
    paddingRight: 210
  },
});
