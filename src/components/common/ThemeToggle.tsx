import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/theme/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../../store/themeSlice';
import { RootState } from '../../store';

export default function ThemeToggle() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);

  return (
    <TouchableOpacity 
      style={[styles.button, { backgroundColor: theme.primary }]} 
      onPress={() => dispatch(toggleTheme())}
    >
      <Ionicons 
        name={isDarkMode ? 'sunny' : 'moon'} 
        size={20} 
        color={theme.card} 
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
    borderRadius: 8,
  },
}); 