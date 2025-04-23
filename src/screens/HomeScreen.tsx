import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import CustomButton from '../components/navigation/CustomButtonComponent'


interface HomeScreenProps{
    navigation:any
}

export default function HomeScreen({navigation}:HomeScreenProps) {

  return (
    <View style={styles.container}>
      <Text style={styles.textStyle}>ÅpenMeet</Text>
      <CustomButton title='SignUp' screenName='SignUp' navigation={navigation}/>
      <CustomButton title='SignIn' screenName='SignIn' navigation={navigation}/>
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
      },
      textStyle: {
        fontSize: 36,
      }
})