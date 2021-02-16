import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { getConfigItem } from '../../Services/configService';
import { GVE_Icon as Icon, SmallHeader } from '../../components/common/index';
import EStyleSheet from 'react-native-extended-stylesheet';
import TimelineCard from "../../components/timeline/TimelineCard";
import PhotoGallery from "../../components/common/photo-gallery/PhotoGallery";
import {getParams} from "../../Services/navigationService";
const color = getConfigItem('AccessTheme').color;
const font = getConfigItem('AccessTheme').font;


class TimelinePostViewScreen extends Component {
  constructor(props) {
    super(props);
    let navParams = getParams(props);
    
    this.state = {
      photoViewer: [],
      initialImageView:0,
      post: navParams&& navParams.source ||null
    }
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
        <PhotoGallery
          ref={modal => this.galleryModal = modal}
          data={this.state.photoViewer}
          initialIndex={this.state.initialImageView}
        />
        {/*<SmallHeader rightComponent={*/}
        {/*  <View style={styles.headerIcons}>*/}
        {/*    <Icon*/}
        {/*      name='search'*/}
        {/*      type='ionicon'*/}
        {/*      color={EStyleSheet.value('$headerIconColor')}*/}
        {/*      size={24}*/}
        {/*    />*/}
        {/*    <Icon*/}
        {/*      name='filter'*/}
        {/*      type='ionicon'*/}
        {/*      color={EStyleSheet.value('$headerIconColor')}*/}
        {/*      size={24}*/}
        {/*    />*/}
        {/*  </View>*/}
        {/*}/>*/}
        <TimelineCard type={"person"} data={this.state.post} onPreviewImage={this.onPreviewImage.bind(this)}/>
      </View>
    )
  }
}

export default TimelinePostViewScreen;

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    marginTop: '7%'
  },
  headerIcons:{
    flexDirection: 'row'
  }
})