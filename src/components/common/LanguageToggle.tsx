import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../hooks/theme/useTheme';
import i18n from '../../i18n';

export default function LanguageToggle() {
  const theme = useTheme();
  const [currentLang, setCurrentLang] = useState(i18n.language);

  const toggleLanguage = async () => {
    const newLang = currentLang === 'en' ? 'es' : 'en';
    await i18n.changeLanguage(newLang);
    setCurrentLang(newLang);
  };

  return (
    <TouchableOpacity 
      style={[styles.button, { backgroundColor: theme.primary }]} 
      onPress={toggleLanguage}
    >
      <Text style={[styles.text, { color: theme.card }]}>
        {currentLang === 'en' ? 'ES' : 'EN'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: 'bold',
  },
}); 