import { StyleSheet, Text, ScrollView } from 'react-native';
import { useCreatePlanForm } from '../../hooks/plans/useCreatePlanForm';
import CreatePlanForm from '../../components/plans/forms/CreatePlanForm';
import { useTheme } from '../../hooks/theme/useTheme';
import { useTranslation } from 'react-i18next';

export default function CreatePlanScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const {
    form,
    handleChange,
    handleCreate,
    handleImagePick,
    handleDateTimeChange,
    showDatePicker,
    setShowDatePicker,
    handleTagsChange,
    handleLocationChange,
  } = useCreatePlanForm();

  return (
    <ScrollView style={[styles.bg, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.primary }]}>{t('plans.create.title')}</Text>
      <CreatePlanForm />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'left',
    paddingHorizontal: 24,
    paddingTop: 40,
  },
}); 