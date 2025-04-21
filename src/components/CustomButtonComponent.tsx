import { Button, StyleSheet, View } from 'react-native';
import React from 'react';

interface CustomButtonProps {
  title: string;
  screenName: string;
  navigation: any;
}

export default function CustomButton({ title, screenName, navigation }: CustomButtonProps) {
  return (
    <View>
      <Button
        title={title}  
        onPress={() => {
          console.log(`${title} button pressed`);
          navigation.navigate(screenName);  
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({});
