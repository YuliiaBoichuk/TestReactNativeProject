import React, {Component} from 'react';
import {navigateTo} from '../../Services/navigationService';
import {View, Text, TouchableOpacity, StyleSheet, Image, TouchableWithoutFeedback, Animated, ImageBackground, Dimensions} from 'react-native';
import { GVE_Icon as Icon } from '../common';
import {getConfigItem} from "../../Services/configService";
import Button from "../common/Button";

const color = getConfigItem('AccessTheme').color;
const screenWidth = Dimensions.get('window').width;

class TimelinePromoItem extends Component {

  constructor(props) {
    super(props);
    this.state = {
    }
  }

  onNavigate (data) {
    navigateTo('timelinePromoPage', {id: data.Id})
    console.log(data);
    //navigateTo('promo', {companyId:data.id, companyName: data.name})
  }

  render() {
    const { data } = this.props;
    return (
      <TouchableOpacity
        style={[styles.itemContainer]}
        onPress={() => this.onNavigate(data)}
      >
        <ImageBackground source={{ uri: data.Image }} style={[styles.itemContainerInner]}>
          <View style={styles.bookmark}>
            <Icon
              name="bookmark"
              size={42}
              color="#F83A3A"
              // onPress={() => navigateTo('chat')}
            />
          </View>
          <View style={styles.content}>
            <View style={styles.contentItemTime}>
              <Icon
                name="clock"
                size={20}
                color="#fff"
              /><Text style={[styles.contentItem, { marginLeft: 5 }]}>{new Date(data.EndDate).toLocaleString()}</Text>
            </View>
            <Text style={[styles.contentItem, styles.contentItemName]}>{data.Name}</Text>
            <Text style={[styles.contentItem, styles.contentItemDescription]}>{data.Description}</Text>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    )
  }

};

export default TimelinePromoItem;

const styles = StyleSheet.create({
  itemContainer:{
    height: 326,
    width: screenWidth-100,
    flexDirection: 'row',
    marginRight: 20,
    borderRadius: 10,
    overflow: 'hidden'
  },
  itemContainerInner: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    width: '100%',
    height: '100%',
    paddingHorizontal: 20
  },
  bookmark: {
    top: 0
  },
  content: {
    bottom: 20
  },
  contentItem: {
    color: '#fff',
  },
  contentItemTime: {
    flexDirection:'row',
    alignItems: 'center',
    marginBottom: 10
  },
  contentItemName:{
    fontSize: 20,
    fontWeight: 'bold'
  },
  contentItemDescription:{

  }
});