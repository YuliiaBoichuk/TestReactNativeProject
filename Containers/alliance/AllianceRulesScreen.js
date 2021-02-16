import React, { Component } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity,Text } from 'react-native';
import {SmallHeader, TextI18n} from '../../components/common/index';
import { GVE_Icon as Icon } from '../../components/common/index';
import { goBack } from '../../Services/navigationService';
import {API_URL, getWithParams } from '../../redux/actions/http-request';
import { checkHttpStatus, parseJSON } from "../../utils/index";
import { getConfigItem } from '../../Services/configService';
import EStyleSheet from 'react-native-extended-stylesheet';
import { Table, TableWrapper, Row, Rows, Col, Cols, Cell } from 'react-native-table-component';
import i18n from "i18next";
import LinearGradient from "react-native-linear-gradient";
import {LevelColors} from "../../constants/levelColorsToTheme.map";
const color = getConfigItem('AccessTheme').color;
const font = getConfigItem('AccessTheme').font;


class AllianceRulesScreen extends  Component {
    constructor() {
        super();
        this.state = {
            data: [],
            tableData: [],
            tableHead: [i18n.t('LEVELRULES.COLOR'), i18n.t('LEVELRULES.NAME'), i18n.t('LEVELRULES.POINTS')],

        }
    }
    componentDidMount() {
            getWithParams(API_URL + '/level')
                .then(checkHttpStatus)
                .then(parseJSON)
                .then(res => {
                    const dataForTable  = res.organizationLevels.sort((a, b)=> {return a.points - b.points}).map(level => {
                        return [
                            <LinearGradient colors={this._getGradientColors(level.color, 1)}
                                            start={{x: 1.0, y: 0.0}} end={{x: 0.0, y: 1.0}} style={[
                                styles.inner,{width: 40, height:40, borderRadius: 25, marginLeft:40},
                            ]}>
                            </LinearGradient>,
                            <Text style={styles.text}>{level.name}</Text>,
                            <Text style={styles.text}>{level.points.toString()}</Text>]
                    })
                    this.setState({ data: dataForTable });
                }).catch(error => {
                console.log(error);
            });
        };
    _getGradientColors(color,id){
        if(color){
            const themes = getConfigItem('themes');
            const themeName = LevelColors[color]
            const colors = themes[themeName]['color']
            if(colors) {
                if (id && id != 10) {
                    return [colors['$gradientFirstForChangeLevel'],
                        colors['$gradientSecondForChangeLevel']]
                } else if (id && id == 10) {
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
    onFailed(error){
        console.error(error)
    }
     render(){
        return (
            <View style={styles.container}>
                <SmallHeader
                    leftComponent={
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <TouchableOpacity style={{marginRight:8}} onPress={() => goBack(this.props)} >
                                <Icon
                                    name='back'
                                    size={25}
                                    color={EStyleSheet.value('$headerIconColor')}
                                /></TouchableOpacity>
                            <TextI18n textKey={'ALLIANCERULES.ALLIANCERULES'} style={styles.headerText} />
                        </View>
                    }
                />
                <ScrollView style={styles.content}>
                        {/*<TextI18n textKey={'PROFILE.SETTINGS.LEVELRULES'} style={styles.headerDescription}/>*/}
                        <Table>
                            {/*<Row data={this.state.tableHead} style={styles.head} textStyle={styles.text}/>*/}
                            <Rows data={this.state.data} style={styles.rows}/>
                        </Table>
                    {/*<View>*/}
                    {/*    <TextI18n textKey={'LEVELRULES.DESCRIPTION'} style={styles.headerDescription}/>*/}
                    {/*    <TextI18n textKey={'LEVELRULES.TEXTRULES'}/>*/}
                    {/*</View>*/}
                </ScrollView>
            </View>
        )
    }
};

export default AllianceRulesScreen;

const styles = EStyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 5,
        marginTop: 15
    },
    headerText: {
        fontSize: font.sizeH1,
        color: '$textColor',
        marginBottom: 5,
        marginLeft: 90
    },
    // headerDescription:{
    //     marginTop: 15,
    //     fontSize: font.sizeH2,
    //     textAlign: 'center',
    // },
    rows:{
        height: 50,
        flexDirection: 'row'
    },
    text: {
        fontSize: font.sizeH2,
        color: '$textColor',
        marginRight: 20
    },
    head: {
        height: 40,
    },
});
