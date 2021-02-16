import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { getConfigItem } from '../../Services/configService';
import {TimelineListForAlliance} from '../../components/timeline/index'
import {TimeLineViewTypes} from '../../constants/timeline-view.types'
const color = getConfigItem('AccessTheme').color;
const font = getConfigItem('AccessTheme').font;


class AllianceTimelineScreen extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.emptyHeader}/>
        <TimelineListForAlliance context={TimeLineViewTypes.AllianceTimeline} navigation={this.props.navigation} />
      </View>
    )
  }
}

export default AllianceTimelineScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  headerIcons:{
    flexDirection: 'row'
  }
});
