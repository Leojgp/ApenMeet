import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { lightTheme, darkTheme, Theme } from '../../theme/theme';

export const useTheme = (): Theme => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  return isDarkMode ? darkTheme : lightTheme;
}; 