import React from 'react';
import {
  View, StyleSheet, FlatList, Text, Dimensions, Animated, Easing
} from "react-native";
import {connect} from 'react-redux';

import {getConfigItem} from '../../Services/configService';
import {Loading, TextI18n, GVE_Icon as Icon} from "../common/index";
import { getDataForTimeline, getTimelinePromos, setCriteria } from "../../redux/actions/timelineAction";
import TimelineCard from "./TimelineCard";
import TimelinePromoItem from "./TimelinePromoItem";
import i18n from "i18next";
import EStyleSheet from 'react-native-extended-stylesheet';
import {getWithParams} from "../../redux/actions/http-request";
import {checkHttpStatus, parseJSON} from "../../utils/index";
import {navigateTo} from "../../Services/navigationService";
import PhotoGallery from "../common/photo-gallery/PhotoGallery";
import Button from "../common/Button";
import SearchField from "../common/elasticsearch/SearchField";

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

class TimelineList extends React.Component {
  constructor(props) {
    super(props);
    this.screenWidth = Dimensions.get('window').width;
    this.state = {
      isRefreshing: false,
      animatedValue: new Animated.Value(0),
      indexToAnimate: null,
      itemViewed: false,
      scrollEnabled: true,
      photoViewer: [],
      data: [],
      followingIds: [],
      initialImageView:0
    };
    this.navigateToCreatePost = this.goToCreatePost.bind(this);
    this.onPreviewImage = this.onPreviewImage.bind(this);
  }

  componentDidMount(){
    // this.screenLoad()
    console.log("init");
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
        this.props.getTimeLineData(this.props.context, false, null, mappedData || []);
      }).catch(error => {
      console.log(error);
    })
    const criteria = {
      size: 10000,
      query: {
        bool: {
          must: {
            term: {"ScopeType": 0}
          }
        }
      }
    }
    this.props.getTimelinePromos(criteria);
  }

  handleRefresh = () => {
    this.setState({
      isRefreshing: true,
    }, () => {
      console.log("handle refresh");
      this.props.getTimeLineData(this.props.context, false, null, this.state.followingIds)
    });
  };
  handleLoadMore = () => {
    this.props.getTimeLineData(this.props.context, true, null, this.state.followingIds)
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

  renderPromosList() {
    return(
      <View>
        {this.props.isLoading ? <Loading/> :
          this.props.promos.length ?
            <Animated.ScrollView
              horizontal
              ref={(c) => {this.scroll = c}}
              scrollEventThrottle={16}
              showsHorizontalScrollIndicator={false}
              style={styles.promoList}
              pagingEnabled
              snapToInterval={screenWidth-80}
              onScroll={onScroll}>
              {this.props.promos.map((post, index) => {
                return (
                  <Animated.View style={[this.translateTransform(index)]}>
                    <TimelinePromoItem data={post}/>
                  </Animated.View>
                )
              })}
            </Animated.ScrollView> : <View/>
        }
      </View>
    )
  }
  goToCreatePost(){
    navigateTo('createTimeLinePost', {context: 'user'})
  }
  onPreviewImage(initialImage) {
    const _images = []
    _images.push({
      type: 'image',
      source: {uri: initialImage.MediaObject.Image}
    })
    this.setState({
      photoViewer: _images
    }, () => {
      this.galleryModal.openModal()
    });
    
  }
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.emptyHeader}/>
        <PhotoGallery
          ref={modal => this.galleryModal = modal}
          data={this.state.photoViewer}
          initialIndex={this.state.initialImageView}
        />
        <SearchField indexes={['personactiontimelinesearch', 'person', 'event']}/>
        <View>
              <FlatList
                ref={(ref) => this.flatlistref = ref}
                data={this.props.timeline}
                ListHeaderComponent={
                  <View style={styles.timelineHeadItems}>
                    {this.props.promos.length ?
                      <View>
                        <Text style={styles.timelineTitle}>{i18n.t('TIMELINE.TODAY')}</Text>
                        <Text style={styles.timelineSubtitle}>{i18n.t('TIMELINE.DONT_FORGET')}</Text>
                        {this.renderPromosList()}
                      </View>
                      : null}
                    <View style={styles.eventBlock}>
                      <Button style={styles.eventButton}
                              title="EVENT.EVENTS"
                              noBackgroundColor={true}
                              titleColor={EStyleSheet.value('$mainColor')}
                              onPress={() => navigateTo('eventsScreenMobile')}
                              wrapperStyle={{paddingVertical: 12}}
                      />
                    </View>
                    <View style={[styles.timelineHead, styles.timelineHeader]}>
                      <Text style={styles.titleTimeline}>{i18n.t('TIMELINE.TIMELINE')}</Text>
                    <Icon
                      name='plus'
                      size={25}
                      onPress={this.navigateToCreatePost}
                      color={EStyleSheet.value('$headerIconColor')}
                    />
                    </View>
                  </View>
                }
                ListEmptyComponent={
                  <View style={styles.noPostsContainer}>
                    <TextI18n style={styles.noPostsText} textKey="TIMELINE.NOPOSTS"/>
                  </View>
                }
                renderItem={({ item, index }) => <TimelineCard type={"person"} data={item} onPreviewImage={this.onPreviewImage.bind(this)}/>}
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
      </View>
    );
  }
}

const mapStateToProps = state => ({
  timeline: state.timelineReducer.data,
  isLoading: state.timelineReducer.loading,
  promos: state.timelineReducer.promos
});
const bindActions = dispatch => ({
  getTimeLineData: (context, isLoadMore, criteria, followingIds) => dispatch(getDataForTimeline(context, isLoadMore, criteria, followingIds)),
  getTimelinePromos: (criteria) => dispatch(getTimelinePromos(criteria)),
  setCriteria: (data) => dispatch(setCriteria(data))
});
export default connect(mapStateToProps, bindActions)(TimelineList);

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    backgroundColor: '#f2f2f2', //#f8f8f8f8
    paddingHorizontal: 5
  },
  emptyHeader:{
    height: 0 //70
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
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    zIndex: 9999
  },
  modal4: {
    height: 300
  },
  timelineHeadItems:{
    left: 20
  },
  timelineTitle:{
    color: '#000',
    fontSize: 24,
    paddingVertical: 10
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
  timelineHeader:{
    width: screenWidth-40,
    justifyContent: 'space-between',
    alignItems:'center'
  },
  titleTimeline:{
    color: '#000',
    fontSize: 24,
  },
  eventButton: {
    width: '94%',
    justifyContent: 'space-between',
    borderRadius: 8,
    borderColor: '$mainColor',
    borderWidth: 1,
  },
  eventBlock:{
    justifyContent: 'center',
  }
});
