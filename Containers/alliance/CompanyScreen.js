import React, { Component } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Linking, AsyncStorage, FlatList, Animated,Dimensions,ImageBackground } from "react-native";
import { GVE_Icon as Icon } from '../../components/common/index';
import { GVE_Header, ProductsList, GVE_Link, TextI18n, Loading, Button } from '../../components/common/index';
import {getParams, goBack, navigateTo} from '../../Services/navigationService';
import { showModal } from '../../Services/modalService';
import {API_URL, getById, post, ELASTIC_URL} from '../../redux/actions/http-request'
import {checkHttpStatus, parseJSON} from "../../utils/index";
import { getConfigItem } from '../../Services/configService';
import { connect } from 'react-redux';
import {authUserSelector} from "../../Services/authService";
import {SmallHeader} from "../../components/common/index";
import i18n from 'i18next';
import Points from "../../components/common/points/Points";
import {getAllianceMembers, sendPendingInvitation,leaveAlliance} from "../../redux/actions/organization";
import {InvitationTypes} from "../../constants/invitationTypes.enum";
import {Gifts} from "../../constants/gifts.enum";
import { SvgCss,SvgCssUri  } from 'react-native-svg';
import {default as SVGImage}  from 'react-native-remote-svg'
// import ReactHtmlParser, { processNodes, convertNodeToElement, htmlparser2 } from 'react-html-parser';
import EStyleSheet from 'react-native-extended-stylesheet';
import {fetchData} from "../../redux/actions/elasticAction";
import {LevelColors} from "../../constants/levelColorsToTheme.map";
import LinearGradient from "react-native-linear-gradient";
import PhotoGallery from "../../components/common/photo-gallery/PhotoGallery";
import FastImage from "react-native-fast-image";

const color = getConfigItem('AccessTheme').color;
const font = getConfigItem('AccessTheme').font;
const screenWidth = Dimensions.get('window').width;

const xOffset = new Animated.Value(0);
let counter= 0;

const onScroll = Animated.event(
  [{ nativeEvent: { contentOffset: { x: xOffset } } }],
  { useNativeDriver: true, listener: event => {
    // do something special
  }, }
);

class CompanyScreen extends Component {
    constructor(props){
        super(props);
        let { id, eventId, companyName, countMembers } = getParams(props);
        this.state = {
            isLoading: true,
            trackPayload: { // to tracking params
                companyName,
                eventId,
                id,
                countMembers
            },
            initialImageView: 0,
            photoViewer:[],
            id: id,
            details: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer ipsum mi, vulputate ut ipsum dapibus, volutpat pretium tellus. Integer maximus id purus a convallis. Vestibulum justo augue, rutrum eget suscipit a, ornare quis mauris.',
            products: [
                {title: 'IPOC', image: 'https://pbs.twimg.com/profile_images/424100963624828928/VgzQD4t6.jpeg', id: 1},
                {title: 'IRAN PLAST', image: 'https://pbs.twimg.com/profile_images/424100963624828928/VgzQD4t6.jpeg', id: 2},
                {title: 'INOTEX', image: 'https://pbs.twimg.com/profile_images/424100963624828928/VgzQD4t6.jpeg', id: 3},
                {title: 'FLEX', image: 'https://pbs.twimg.com/profile_images/424100963624828928/VgzQD4t6.jpeg', id: 4},
                {title: 'HI-TECH', image: 'https://pbs.twimg.com/profile_images/424100963624828928/VgzQD4t6.jpeg', id: 5}
            ],
            company: {},
            posts: [],
            services: [],
            isFavorite: false
        }
        this.getImageForPreview = this.getImageForPreview.bind(this);
        this.onPreviewImage = this.onPreviewImage.bind(this);
    }
    checkFavourite = () => {
        AsyncStorage.getItem('favorites')
            .then((value) => {
                const favourites = JSON.parse(value);

                const item = favourites && favourites.organizations.find(item => {
                    return item === this.state.id;
                })
                if(item) {
                    this.setState({isFavorite: true});
                }
            })
    }
    screenLoad() {
        this.props.getAllianceMembers(this.state.id);
        getById(API_URL + '/organization', this.state.id)
            .then(checkHttpStatus)
            .then(parseJSON)
            .then(data => {
                console.log(data);
              const criteria = {
                size: 10000,
                query: {
                  bool: {
                    must: {
                      term: {"ScopeEntityId": this.state.id}
                    }
                  }
                }
              }
              fetchData('mediapost', criteria, true)
                .then(checkHttpStatus)
                .then(parseJSON)
                .then(postData => {
                    const posts = postData.hits.hits.map(item => {
                        return item._source
                    })
                  this.setState({posts: posts})
                  console.log(posts)
                })
                .catch(error => {
                    console.log(error)
                })
                getById(`/service/organization/${this.state.id}/provideList`)
                  .then(checkHttpStatus)
                  .then(parseJSON)
                  .then(servicesList => {
                    this.setState({services: servicesList})
                  })
                  .catch(error => {
                    console.log(error)
                  })
                // getById(ELASTIC_URL + '/alliancecharacteristicsearch/tmp', this.state.id)
                //     .then(checkHttpStatus)
                //     .then(parseJSON)
                //     .then(wFdata => {
                        //data.level = wFdata._source.Own.Level || {};
                        data.ExperiencePoints = data.own.experiencePoints || 0;
                        //data.workFeatured = wFdata._source.WorkFeatured;
                        const gifts = [...Gifts].map(gift => {
                          const presentedInResponseGift = data.group.gifts && data.group.gifts.find(item => {
                            return item.name == gift.name;
                          });
                          return {
                            Name: gift.name,
                            image: gift.image || '',
                            AmountOfGiftsReceived: presentedInResponseGift ? presentedInResponseGift.amountOfGiftsReceived : 0
                          }
                        }).sort(function(a, b) {
                          return a.AmountOfGiftsReceived - b.AmountOfGiftsReceived;
                        }).reverse();
                        data.gifts = gifts;
                        if(authUserSelector.isUserMemberOfOrgSync(this.props, data.id)){
                            data.inAlliance = 1;
                        } else if(authUserSelector.isUserPendingOfOrgSync(this.props, data.id)){
                            data.inAlliance = 2;
                        } else if(authUserSelector.isUserAdminOfOrgSync(this.props, data.id)){
                            data.inAlliance = 3;
                        }else {
                            data.inAlliance = 0;
                        }
                        this.setState({company: data, isLoading: false}, function() {
                            console.log(this.state);
                            this.getImageForPreview();
                        })
                    // }).catch(error => {
                    // data.workFeatured = null;
                    // console.log(error);
                    // this.setState({company: data, isLoading: false}, function() {
                    //     console.log(this.state);
                    // })
                // })
            }).catch(error => {
            console.log(error);
            this.setState({isLoading: false});
        })
    }

    componentDidMount() {
        // tracking custom event
        this.props.navigation.addListener('willFocus', this.screenLoad.bind(this));
        const compId = this.state.id;
        const { navigation } = this.props;
        if(authUserSelector.isUserAdminOfOrgSync(this.props, this.state.id)){}
        // fetch all data
        this.setState({isLoading: true});
        this.checkFavourite();

    }

    navigateToPerson(id){
        navigateTo('person',{outerUserId:id})
    }
    joinToAlliance(orgId){
        const data = {
            InvitationType: InvitationTypes.PersonAlliance,
            OrgId: orgId
        }
        this.props.sendPendingInvitation(data);
        this.setState({company:{...this.state.company, inAlliance:2}})

    }
    leaveTheAlliance = (orgId) => {
        {
            this.props.OrgId = orgId
        }
        this.props.leaveAlliance(orgId);
        this.setState({company:{...this.state.company, inAlliance:0}})
    }
    toggleFavoriteCompany() {
        if(!this.props.isAuthenticated){
            showModal('confirm', {
                title: "MODALS.FORBIDDEN.TITLE",
                message: "MODALS.FORBIDDEN.MESSAGE",
                onOkAction: () =>navigateTo('login')
            })
            return;
        }
        post(API_URL + '/favorites/toggle', {
            EntityId: this.state.id,
            Type: "Organizations"
        })
            .then(checkHttpStatus)
            .then(parseJSON)
            .then(result => {
                if (result.result == "Added") {
                    this.setState({ isFavorite: true })
                } else {
                    this.setState({ isFavorite: false })
                }
                //console.log(result);
            }).catch(error => {
                console.log(error);
            });
    }
    goToEvents(){
        navigateTo('events', {organizerId: this.state.id})
    }
    onPressPost(post){
        if(!post.Url){
            return
        }
        let route = '';
        let params = [];
        if(post.Url.indexOf('http')>-1){
            route = post.Url;
        } else{
            const parts = post.Url.split('/');
            route = parts[0];
            params = parts.slice(1,parts.length);
        }
        navigateTo(route, {id: params[0]})
    }
  translateTransform(index: number) {
    return {
      transform: [{
        scale: xOffset.interpolate({
          inputRange: [
            (index - 1) * (screenWidth-60),
            index * (screenWidth-60),
            (index + 1) * (screenWidth-60)
          ],
          outputRange: [0.9, 1, 0.9]
        })
      }]
    };
  }
  onScrollEnd(event){
    const offsetx = event.nativeEvent.contentOffset.x
    console.log(offsetx)
  }
  _getGradientColors(){
    // if(this.state.company.level && this.state.company.level.id && this.state.company.level.id!=10){
    //   return [EStyleSheet.value('$gradientFirstForChangeLevel'),
    //     EStyleSheet.value('$gradientSecondForChangeLevel')]
    // } else if(this.state.company.level.level && this.state.company.level.id && this.state.company.level.id ==10){
    //   return [EStyleSheet.value('$gradientFirstForChangeLevel'),
    //     EStyleSheet.value('$gradientSecondForChangeLevel'),
    //     EStyleSheet.value('$gradientThirdForChangeLevel2')]
    // } else{
    //   const colors = getConfigItem('themes')['default']['color'];
    //   return [colors['$gradientFirstForChangeLevel'],
    //     colors['$gradientSecondForChangeLevel']]
    // }
    if(this.state.company.level && this.state.company.level.color){
      const themes = getConfigItem('themes');
      //const themeName = LevelColors[this.state.company.level.color]
      const colors = getConfigItem('themes')[LevelColors[this.state.company.level.color]]['color']
      if(colors) {
        if (this.state.company.level && this.state.company.level.name && this.state.company.level.name.indexOf('10') < 0) {
          return [colors['$gradientFirstForChangeLevel'],
            colors['$gradientSecondForChangeLevel']]
        } else if (this.state.company.level.level && this.state.company.level.name && this.state.company.level.name.indexOf('10') >= 0) {
          return [colors['$gradientFirstForChangeLevel'],
            colors['$gradientSecondForChangeLevel'],
            colors['$gradientThirdForChangeLevel2']]
        } else {
          const colors = getConfigItem('themes')['default']['color'];
          return [colors['$gradientFirstForChangeLevel'],
            colors['$gradientSecondForChangeLevel']]
        }
      } else {
        const colors = getConfigItem('themes')['default']['color'];
        return [colors['$gradientFirstForChangeLevel'],
          colors['$gradientSecondForChangeLevel']]
      }
    } else {
      const colors = getConfigItem('themes')['default']['color'];
      return [colors['$gradientFirstForChangeLevel'],
        colors['$gradientSecondForChangeLevel']]
    }
  }
    getImageForPreview() {
        let _images = [];
        if(this.state.company.workFeatured.images) {
            this.state.company.workFeatured.images.map((item, index) => {
                _images.push({
                    uri: item.contentUrl,
                    dimensions: { width: 1366, height: 768 }
                })
            });
        }
        this.setState({
            photoViewer: _images
        })
    }
    onPreviewImage(initialImage) {
        this.setState({
            initialImageView: initialImage
        }, () => {
            this.galleryModal.openModal()
        });
    }

    render() {
        return (
            <View style={styles.container}>
                <SmallHeader
                  leftComponent={
                      <View style={{flexDirection: 'row', alignItems: 'center'}}>
                          <TouchableOpacity style={{marginRight:3}} onPress={() => goBack(this.props)} >
                              <Icon
                                name='back'
                                size={25}
                                color={EStyleSheet.value('$headerIconColor')}
                              />
                          </TouchableOpacity>
                      </View>
                  }
                  centerComponent={
                      <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <Text style={styles.headerText} >{this.state.company && this.state.company.name}</Text>
                      </View>
                  }
                  rightComponent={
                      <View style={[styles.row]}>
                          {authUserSelector.isUserMemberOrAdminOfOrgSync(this.props, this.state.id) ?
                          <TouchableOpacity onPress={() => navigateTo('allianceTimelineScreen', {id: this.state.id})} style={{right:0,paddingHorizontal:5}}>
                              <Icon
                                  name="timeline"
                                  color={EStyleSheet.value('$headerIconColor')}
                                  size={25}
                              />
                          </TouchableOpacity>
                              : null
                          }
                          {/*<View style={{paddingHorizontal: 5}}>*/}
                              {/*<Icon*/}
                                {/*name="chat"*/}
                                {/*color={EStyleSheet.value('$headerIconColor')}*/}
                                {/*size={25}*/}
                                {/*onPress={() => navigateTo('chat', {*/}
                                    {/*interlocutor: {*/}
                                        {/*name:this.state.company && this.state.company.name,*/}
                                        {/*additionalText:i18n.t('ALLIANCE.SUBSCRIBERS', {count: this.state.company.countMembers}),*/}
                                        {/*image: this.state.company.image*/}
                                    {/*}*/}
                                {/*})}*/}
                              {/*/>*/}
                          {/*</View>*/}
                          {authUserSelector.isUserMemberOrAdminOfOrgSync(this.props, this.state.id) ?
                          <TouchableOpacity onPress={() => navigateTo('alliance_settings', {id:this.state.id, founderId: this.state.company.founderId})} style={{right:0,paddingHorizontal:5}}>
                              <Icon
                                name="setting"
                                color="#000"
                                size={25}
                              />
                          </TouchableOpacity>: null}
                      </View>
                  }
                  />
                <PhotoGallery
                    ref={modal => this.galleryModal = modal}
                    data={this.state.photoViewer}
                    initialIndex={this.state.initialImageView}
                />
                {this.state.isLoading ?
                    <Loading/> :
                    <ScrollView>
                        <View>
                            {this.state.company.image && this.state.company.image.length ?
                            <View style={[styles.imageContainer]}>
                                    <FastImage
                                        style={styles.image}
                                        source={{ uri:this.state.company.image}}
                                        resizeMode={FastImage.resizeMode.cover}
                                    />
                            </View>:
                            <View style={[styles.imageEmptyContainer]}>
                                <Image
                                    source={require('../../assets/images/EmtyPhoto.png')}
                                    style={styles.imageEmpty}
                                />
                            </View>}
                        </View>
                        <View style={styles.containerTextInfo}>
                            {authUserSelector.isUserMemberOrAdminOfOrgSync(this.props, this.state.id) ?
                            <View style={styles.infoBlock}>
                                <TouchableOpacity style={styles.levelBlock} onPress={() =>  navigateTo('levelRules')}>
                                    <TextI18n textKey={'HEADER.LEVEL'} style={styles.h2Container}></TextI18n>
                                      <LinearGradient colors={this._getGradientColors()}
                                                      start={{x: 1.0, y: 0.0}} end={{x: 0.0, y: 1.0}} style={[
                                        styles.levelView
                                      ]}>
                                          <View style={styles.levelView}>{this.state.company.level && typeof this.state.company.level.name === 'string'
                                            ? <Text style={styles.levelText}>{this.state.company.level && this.state.company.level.name.split(' ')[1]}</Text>
                                            : <Text style={styles.levelText}>0</Text>}
                                          </View>
                                      </LinearGradient>

                                    {/*<View style={styles.levelView}>{typeof this.state.company.level.Name === 'string'*/}
                                        {/*? <Text style={styles.levelText}>{this.state.company.level.Name.split(' ')[1]}</Text>*/}
                                        {/*: <Text style={styles.levelText}>0</Text>}*/}
                                    {/*</View>*/}
                                    <Points expPoints={this.state.company.ExperiencePoints}
                                            colors={this._getGradientColors()}
                                            levelPoints={this.state.company.level && this.state.company.level.points||this.props.ExperiencePoints}
                                            nextLevelPoints={this.state.company.level && this.state.company.level.nextLevelPoints||this.props.ExperiencePoints}
                                            levelId={this.state.company.level && this.state.company.level.id || 'default'}
                                    />
                                  <View style={{marginLeft:10,flexDirection:'row'}}>
                                  <Icon
                                    name="coin"
                                    color="#FFD700"
                                    size={25}

                                  />
                                  <Text style={{
                                    marginLeft: 5,
                                    color: '#4C5264',
                                    textAlign: 'center',
                                    fontFamily: 'Open Sans',
                                    fontSize: 15,
                                    fontWeight: '600'
                                  }}>{this.state.company.coins}</Text>
                                  </View>
                                  </TouchableOpacity>
                            </View>
                            : null}
                            <View style={styles.infoBlock}>
                                <View>
                                    <TextI18n style={styles.h2Container} textKey={'ALLIANCE.ABOUT'}/>
                                </View>
                                <View style={{marginRight: 5}}>
                                    <Text style={styles.textDescription}>{this.state.company.description}</Text>
                                </View>
                            </View>
                        {authUserSelector.isUserMemberOrAdminOfOrgSync(this.props, this.state.id) ?
                            <View style={styles.infoBlock}>
                            <View style={styles.mediaBlock}>
                                <TextI18n style={styles.h2Container} textKey={'ALLIANCE.MEDIA'}/>
                                {authUserSelector.isUserAdminOfOrgSync(this.props, this.state.id) ?
                                <TouchableOpacity onPress={() => navigateTo('addMediaToAllianceScreen', {creativeWorkId :this.state.company.workFeatured.id, id:this.state.id})}>
                                    <Icon
                                        name="plus"
                                        color="#000"
                                        size={27}
                                    />
                                </TouchableOpacity>: null}
                            </View>
                                <FlatList
                                horizontal={true}
                                data={this.state.company.workFeatured && this.state.company.workFeatured.images || []}
                                renderItem={({item, index, separators}) => (
                                    <View>
                                        <TouchableOpacity  onPress={() => this.onPreviewImage(index)}>
                                            {item.contentUrl ?
                                            <FastImage
                                                    style={{width: 100, height: 75, borderRadius: 4}}
                                                    source={{ uri: item.contentUrl}}
                                                    resizeMode={FastImage.resizeMode.cover}
                                                /> : null}
                                        </TouchableOpacity>
                                    </View>
                                )}
                                ItemSeparatorComponent={() =>(
                                    <View style={styles.listMediaSeparator}></View>
                                )}
                                />
                            </View>
                            :null}

                        <View style={styles.infoBlock}>
                            <View style={styles.peoplesHeader}>
                                <TouchableOpacity onPress={() => navigateTo('alliance_members', {id: this.state.id})} style={[styles.row, styles.peopleHeaderText]}>
                                    <TextI18n style={styles.h2Container} textKey={'ALLIANCE.PEOPLE'}/>
                                    <TextI18n style={styles.subscribersConteiner} textKey={'ALLIANCE.SUBSCRIBERS'} keys={{count: this.state.company.countMembers}}></TextI18n>
                                </TouchableOpacity>
                                {authUserSelector.isUserMemberOrAdminOfOrgSync(this.props, this.state.id) ?
                                <TouchableOpacity style={styles.row} onPress={() => navigateTo('alliance_ranking', {id: this.state.id})}>
                                    <Icon
                                        name="trophy"
                                        color={EStyleSheet.value('$mainColor')}
                                        size={20}
                                    />
                                    <TextI18n style={styles.peopleTopText} textKey={'ALLIANCE.TOP'} />
                                </TouchableOpacity>
                                    :null}
                            </View>
                            { this.state.company.countMembers <=0 ?
                            <View style={styles.emptyPeopleContainer}>
                                <View style={styles.emptyPeopleTextContainer}>
                                <TextI18n style={styles.emptyPeopleText} textKey={'ALLIANCE.NOPEOPLEFIRSTLINE'}/>
                                <TextI18n style={styles.emptyPeopleText} textKey={'ALLIANCE.NOPEOPLESECONDLINE'}/>
                                </View>
                                <Image
                                    source={require('../../assets/images/noPeople.png')}
                                    style={styles.emptyPeopleImage}
                                />
                            </View> :
                            <View style={styles.peoplesContainer}>
                                {this.props.members && this.props.members.length?
                                    this.props.members.slice(0, 8).map((item) => (
                                        <TouchableOpacity style={styles.peronImage} onPress={() =>{this.navigateToPerson(item.id)}}>
                                            {item.image?
                                                <FastImage
                                                    style={styles.person}
                                                    source={{ uri: item.image}}
                                                    resizeMode={FastImage.resizeMode.cover}
                                                />:
                                                <Image
                                                    resizeMethod="resize"
                                                    source={require('../../assets/images/avatar_default.png')}
                                                    style={styles.person}
                                                />
                                            }
                                        </TouchableOpacity>
                                    ))
                                    : null
                                }
                            </View>}
                        </View>
                            {authUserSelector.isUserMemberOrAdminOfOrgSync(this.props, this.state.id)  && this.state.posts.length && this.state.posts.length > 0?
                            <View>
                                <TextI18n style={styles.h2Container} textKey={'ALLIANCE.POSTS'}/>
                                <Animated.ScrollView
                                  horizontal
                                  ref={(c) => {this.scroll = c}}
                                  scrollEventThrottle={16}
                                  showsHorizontalScrollIndicator={false}
                                  pagingEnabled
                                  snapToInterval={screenWidth-60}
                                  onScroll={onScroll}>
                                  {this.state.posts.map((post, index) => {
                                      return (
                                        <TouchableOpacity onPress={()=> this.onPressPost(post)} style={[styles.postCard, this.translateTransform(index)]}>
                                            <ImageBackground source={{ uri: post.Image }} style={styles.postCardInner}>
                                                <View>
                                                    <Text style={styles.whiteText}>{post.Name}</Text>
                                                    <Text style={styles.whiteText}>{post.Description}</Text>
                                                </View>
                                            </ImageBackground>
                                        </TouchableOpacity>
                                      )
                                  })}
                                </Animated.ScrollView>
                            </View>: null}
                            {authUserSelector.isUserMemberOrAdminOfOrgSync(this.props, this.state.id) && this.state.posts.length <= 0 ?
                                <View>
                            <TextI18n style={styles.h2Container} textKey={'ALLIANCE.POSTS'}/>
                                    <TouchableOpacity activeOpacity={1} style={[styles.postCardEmpty]}>
                                        <Image style={styles.postCardInnerEmpty}
                                               source={require('../../assets/images/emptyPosts.png')} />
                                        <View style={styles.postCardTextEmpty}>
                                            <TextI18n style={styles.textEmptyPost} textKey={'ALLIANCE.NOPOSTS'}/>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            :null}
                            <View style={styles.infoBlock}>
                              <View style={styles.servicesHeader}>
                                <TextI18n style={styles.h2Container} textKey={"ALLIANCE.PROVIDEDSERVICES"} />
                                {authUserSelector.isUserAdminOfOrgSync(this.props, this.state.id) ?
                                  <TouchableOpacity onPress={() => navigateTo('allianceServicesList', {id:this.state.id})}>
                                    <Icon
                                      name="edit"
                                      color="#000"
                                      size={25}
                                    />
                                  </TouchableOpacity>: null}
                              </View>
                              {this.state.services && this.state.services.length?
                              <Animated.ScrollView
                                horizontal
                                ref={(c) => {this.scrollServices = c}}
                                scrollEventThrottle={16}
                                showsHorizontalScrollIndicator={false}
                                pagingEnabled
                                snapToInterval={screenWidth-100}
                                onScroll={onScroll}>
                                {this.state.services.map((service, index) => {
                                  return (
                                    <TouchableOpacity activeOpacity={1} onPress={()=> console.log()} style={[styles.serviceCard, this.translateTransform(index)]}>
                                      <View style={styles.serviceCardInner}>
                                          <Text style={[styles.blackText, styles.serviceName]}>{service.name}</Text>
                                          <Text style={styles.blackText}>{service.description}</Text>
                                      </View>
                                    </TouchableOpacity>
                                  )
                                })}
                              </Animated.ScrollView> :<TouchableOpacity activeOpacity={1} style={[styles.postCardEmpty]}>
                                  <Image style={styles.postCardInnerEmpty}
                                         source={require('../../assets/images/emptyPosts.png')} />
                                  <View style={styles.postCardTextEmpty}>
                                    <TextI18n style={styles.textEmptyPost} textKey={'ALLIANCE.NOPROVIDEDSERVICES'}/>
                                  </View>
                                </TouchableOpacity>}
                            </View>
                            {authUserSelector.isUserMemberOrAdminOfOrgSync(this.props, this.state.id) ?
                        <View style={styles.infoBlock}>
                            <TextI18n style={styles.h2Container} textKey={'ALLIANCE.GIFTS'}/>
                            <View style={styles.giftsContainer}>
                                {this.state.company.gifts && this.state.company.gifts.map(item => {
                                    return (
                                        <View style={styles.giftsImage}>
                                            <View style={styles.giftsWhiteContainer}>
                                              <SvgCss xml={item.image} style={styles.gifts}/>
                                              {/*<SVGImage source={{ uri:item.image }} style={styles.gifts} />*/}
                                            </View>
                                            <Text style={styles.giftsText}>{item.AmountOfGiftsReceived}</Text>
                                        </View>
                                    )
                                })}
                            </View>
                        </View>: null}

                        </View>
                        {{
                            0: <TouchableOpacity style={styles.joinBtn} onPress={() => this.joinToAlliance(this.state.company.id)}>
                                <TextI18n style={styles.joinBtnTextColor} textKey={"ALLIANCE.JOIN"}/>
                            </TouchableOpacity>,
                            1: <TouchableOpacity style={styles.joinBtn} onPress={() => this.leaveTheAlliance(this.state.id)}>
                                <TextI18n style={styles.joinBtnTextColor} textKey={"ALLIANCE.LEAVE"}/>
                            </TouchableOpacity>,
                            2: <TouchableOpacity style={styles.joinBtn}>
                                <TextI18n style={styles.joinBtnTextColor} textKey={"ALLIANCE.PENDINGINVITE"}/>
                            </TouchableOpacity>,
                            3: <TouchableOpacity style={styles.joinBtn}
                                onPress={() => navigateTo('alliance_pending_invitations', {id: this.state.id})}>
                                <TextI18n style={styles.joinBtnTextColor} textKey={"ALLIANCE.PENDINGINVITATIONS"}/>
                            </TouchableOpacity>
                        }[[this.state.company.inAlliance]]}

                    </ScrollView>
                }
            </View>
        )
    }
}
const mapStateToProps = state => ({
    auth: state.auth,
    isAuthenticated: state.auth.isAuthenticated,
    members: state.organization.members
});

const bindActions = dispatch => ({
    getAllianceMembers: (id) => dispatch(getAllianceMembers(id)),
    sendPendingInvitation: (data) => dispatch(sendPendingInvitation(data)),
    leaveAlliance: (data) => dispatch(leaveAlliance(data)),
});

export default connect(mapStateToProps, bindActions)(CompanyScreen);

const styles = EStyleSheet.create({
    container: {
        flex: 1,
    },
    containerTextInfo:{
        marginLeft: 10
    },
    infoBlock:{
       margin: 3,
       paddingVertical: 3
    },
    image: {
      resizeMode:'cover',
      height: '100%' ,
    },
    levelBlock:{
        alignItems: 'center',
        flexDirection: 'row'
    },
    person:{
        width:75,
        height: 75,
        borderRadius: 36,
    },
    peronImage:{
        width: 80,
        height: 80,
        borderRadius: 36,
        margin: 5,
    },
    gifts: {
        width: 50,
        height: 50,
    },
    giftsWhiteContainer:{
        width: 70,
        height: 70,
        borderRadius: 35,
        alignItems: 'center',
        justifyContent: 'center'
    },
    giftsImage: {
        width: 88,
        height: 88,
        alignItems: 'center',
    },
    giftsText: {
            fontSize: font.sizeH2,
            color: '$textColor'
    },
    peoplesContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
    },

    giftsContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            marginBottom: 10,
            alignItems: 'center'
    },

    joinBtn:{
        backgroundColor: '$mainColor',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        minHeight: 50
    },
    joinBtnTextColor:{
        color: '$textWhiteColor'
    },
    row:{
        flexDirection: 'row'
    },
    h2Container:{
        fontSize: font.sizeH2,
        color: '$textColor',
        fontWeight: 'bold'
    },
    imageContainer:{
        flexDirection: 'column',
        height: 250
    },
    imageInRow:{
        height: 75,
        width: 80
    },
    cover: {
        backgroundColor: '$cover',
        width: '100%',
        height: 200
    },
    header_title: {
        fontSize: font.sizeH2,
        fontWeight: '500',
        marginBottom: 15
    },
    textDetails: {
        lineHeight: 20
    },
    information:{
        flexDirection: 'row',
        alignItems: 'baseline',
        marginVertical: 10,
    },
    mediaIcons: {
        width: 16,
        height: 16,
    },
    text: {
        marginLeft: 10,
        color: '$eventInfoIconText'
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    headerText: {
        color: '$headerText',
        fontSize: font.sizeH1,
        paddingBottom: 5,
    },
    levelText: {
        color: '$rightColor',
        textAlign: 'center',
        fontSize: font.sizeH2,
    },
    levelView: {
        width: 25,
        height: 25,
        borderRadius: 15,
        justifyContent: 'center',
    },
    subscribersConteiner:{
        marginLeft: 5,
        color: '$secondaryTextColor',
        fontSize: font.sizeS,
    },
    peoplesHeader:{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    peopleTopText:{
        color: '$mainColor',
        fontSize: font.sizeS,
        marginRight: 15
    },
    peopleHeaderText:{
        alignItems: 'center',
    },
    listMediaSeparator:{
        width:10
    },
    whiteText:{
        color: '$textWhiteColor'
    },
    postCard:{
        height: 326,
        width: screenWidth-60,
        flexDirection: 'row',
        padding: 5,
        borderRadius: 10,
        overflow: 'hidden'
    },
    serviceCard:{
      height: 150,
      width: screenWidth-200,
      flexDirection: 'row',
      padding: 5,
      borderRadius: 10,
      overflow: 'hidden',
      backgroundColor: '$textWhiteColor',
      borderColor: '$cancelButton',
      borderWidth: 1,
    },
    blackText:{
      color: '$textColor'
    },
    serviceName:{
      fontWeight: 'bold',
      fontSize: font.sizeP
    },
    serviceCardInner:{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      borderRadius: 10,
      width: '100%',
      height: '100%',
      paddingBottom: 10,
      paddingLeft:5
    },
    postCardInner:{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: 10,
        width: '100%',
        height: '100%',
    },
  scrollView: {
    flexDirection: 'row',
  },
  scrollPage: {
    width: screenWidth,
    padding: 20,
  },
  card: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderColor: 'black',
    borderWidth: 1,
    backgroundColor: '#F5FCFF',
  },
    textDescription: {
        textAlign: 'justify'
    },
    emptyPeopleContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyPeopleText: {
        color: '$mainColor',
        textAlign: 'right',
        fontSize: font.sizeH1,
        fontWeight: 'bold'
    },
    emptyPeopleTextContainer: {
        paddingRight: 50
    },
    emptyPeopleImage: {
        resizeMode: 'contain',
        width: 200,
        height: 150
    },
    imageEmpty:{
        resizeMode: 'contain',
        width: '85%',
    },
    imageEmptyContainer:{
        backgroundColor: '#F5DADA',
        height: 250,
        alignItems: 'center',
        justifyContent: 'center'
    },
    postCardInnerEmpty:{
        display: 'flex',
        borderRadius: 10,
        height: '85%',
        resizeMode: 'contain',
        width: '90%',
    },
    postCardEmpty:{
        height: 300,
        width: screenWidth-150,
        flexDirection: 'column',
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: '#F5DADA',
        marginVertical: 7,
    },
    postCardTextEmpty:{
        alignItems: 'center',
    },
    textEmptyPost:{
        color: '$headerText',
        fontSize: font.sizeH3,
        fontWeight: 'bold'
    },
    mediaBlock:{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginRight: 5,
        paddingBottom: 5,
    },
    servicesHeader:{
      flexDirection: 'row',
      justifyContent: 'space-between',
    }
});
