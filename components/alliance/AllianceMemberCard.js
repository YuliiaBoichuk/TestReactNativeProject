import React, {Component} from 'react';
import {navigateTo} from '../../Services/navigationService';
import {View, Text, TouchableOpacity, StyleSheet, Image} from 'react-native';
import {getConfigItem} from "../../Services/configService";
import {TextI18n} from "../common/index";
import EStyleSheet from 'react-native-extended-stylesheet';
import {AllRoles} from "../../constants/allRoles.enum";
import {API_URL, getWithParams, post} from "../../redux/actions/http-request";
import {checkHttpStatus, parseJSON} from "../../utils";
import {updateFollowCount} from "../../redux/actions/auth";
import {connect} from "react-redux";
import FastImage from "react-native-fast-image";

const color = getConfigItem('AccessTheme').color;
const font = getConfigItem('AccessTheme').font;

const AllianceListCard = ({data, followRequest}) => {
    const onNavigate = (id) => {
        navigateTo('person', {outerUserId:id})
    }

    const updateFollowStatus = (id, followStatus) => {
        const updateData = [...this.state.data];
        const index = updateData.findIndex((data) => {
            return data.id == id
        })
        if (index > -1) {
            updateData[index].isFollow = followStatus;
        }
    }


    return (
        <TouchableOpacity
            style={styles.container}
            onPress={() => onNavigate(data.id)}
        >
            <View style={styles.logoWrap}>
                {data.image?
                    <FastImage
                        style={styles.logo}
                        source={{ uri: data.image}}
                        resizeMode={FastImage.resizeMode.cover}
                    />:
                    <Image
                        resizeMethod="resize"
                        source={require('../../assets/images/avatar_default.png')}
                        style={styles.logo}
                    />
                }
            </View>
            <View style={styles.infoContent}>
                <View style={styles.titleWrap}>
                    <Text style={[styles.title]} numberOfLines={1}>{data.alternateName}</Text>
                    <View style={[styles.roleBar]}>
                        <TextI18n style={styles.roleBarText} textKey={data.role == AllRoles.Artist ? "ROLES.ARTIST" :
                            data.role == AllRoles.Manager ? "ROLES.MANAGER" : data.role == AllRoles.SingingCoach ? "ROLES.SINGINGCOACH" : data.role == AllRoles.AssistantManager ? "ROLES.ASSISTANTMANAGER" :
                                data.role == AllRoles.Choreographer ? "ROLES.CHOREOGRAPHER" : data.role == AllRoles.Admin ? "ROLES.ADMIN" : ''}>
                        </TextI18n>
                    </View>
                    <TextI18n textKey={'PERSONSCREEN.EXPPOINTS'} keys={{experiencePoints: data.experiencePoints}}/>
                    <Text>{data.level && data.level.name}</Text>
                </View>
                {/*<View style={styles.buttonWrap}>*/}
                    {/*<TouchableOpacity style={styles.buttonFollow} onPress={() => followRequest(data.id)}>*/}
                        {/*{{*/}
                            {/*1: <TextI18n textKey={'HEADER.UNFOLLOW'}*/}
                                         {/*style={{color: EStyleSheet.value('$btnOkColor')}}></TextI18n>,*/}
                            {/*2: <TextI18n textKey={'HEADER.FOLLOW'}*/}
                                         {/*style={{color: EStyleSheet.value('$btnOkColor')}}></TextI18n>*/}
                        {/*}[[data.isFollow ? 1 : 2]]}*/}
                    {/*</TouchableOpacity>*/}
                {/*</View>*/}
            </View>

        </TouchableOpacity>
    )
};

export default AllianceListCard;

const styles = EStyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'row',
        padding: 5,
        width: '100%',
        height: 80,
        marginTop: 10,
        paddingHorizontal: 0,
        marginLeft: 20
    },
    logoWrap: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '15%',
    },
    logo: {
        width: 58,
        height: 58,
        borderRadius: 29,
    },
    infoContent: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 15,
        justifyContent: 'space-between',
        width: '75%',
    },
    titleWrap: {
        width: '58%',
    },
    title: {
        fontSize: font.sizeH2,
        color: '$textColor',
        paddingBottom: 2,
    },
    buttonWrap: {
        width: '42%',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonFollow: {
        backgroundColor: '$mainColor',
        paddingHorizontal: 17,
        paddingVertical: 6,
        borderRadius: 10,
    },
    roleBar: {
        backgroundColor: '$mainColor',
        borderRadius: 10,
        alignItems: 'center',
        width: 110
    },
    roleBarText: {
        color: '$genBackgroundColor',
        textTransform: 'uppercase',
        fontSize: font.sizeS,
        textAlign: 'center'
    }
});
