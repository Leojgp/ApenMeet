import React from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../../store/themeSlice';
import { RootState } from '../../store';
import { Ionicons } from '@expo/vector-icons';

const ThemeToggle = () => {
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const translateX = React.useRef(new Animated.Value(isDarkMode ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.spring(translateX, {
      toValue: isDarkMode ? 1 : 0,
      useNativeDriver: true,
      tension: 20,
      friction: 7,
    }).start();
  }, [isDarkMode]);

  const handleToggle = () => {
    dispatch(toggleTheme());
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? '#28292c' : '#d8dbe0' }
      ]}
      onPress={handleToggle}
      activeOpacity={0.8}
    >
      <Animated.View
        style={[
          styles.slider,
          {
            transform: [
              {
                translateX: translateX.interpolate({
                  inputRange: [0, 1],
                  outputRange: [2, 22],
                }),
              },
            ],
          },
        ]}
      >
        <Ionicons
          name={isDarkMode ? 'moon' : 'sunny'}
          size={20}
          color={isDarkMode ? '#d8dbe0' : '#28292c'}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 50,
    height: 30,
    borderRadius: 15,
    padding: 2,
  },
  slider: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ThemeToggle; 