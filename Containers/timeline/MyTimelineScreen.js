import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { getConfigItem } from '../../Services/configService';
import {TimelineList} from '../../components/timeline/index'
import {TimeLineViewTypes} from '../../constants/timeline-view.types'
import { GVE_Icon as Icon, SmallHeader } from '../../components/common/index';
import EStyleSheet from 'react-native-extended-stylesheet';
const color = getConfigItem('AccessTheme').color;
const font = getConfigItem('AccessTheme').font;


class MyTimelineScreen extends Component {
  constructor(props) {
    super(props);
  }
  
  render() {
    return (
      <View style={styles.container}>
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
        <View style={styles.emptyHeader}/>
        <TimelineList context={TimeLineViewTypes.My} navigation={this.props.navigation} />
      </View>
    )
  }
}

export default MyTimelineScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: '7%'
  },
  headerIcons:{
    flexDirection: 'row'
  }
})