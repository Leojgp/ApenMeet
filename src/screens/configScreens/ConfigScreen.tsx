import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

export default function ConfigScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>ConfigScreen</Text>
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      },
      title: {
        fontSize: 24,
        marginBottom: 10,
      },
})