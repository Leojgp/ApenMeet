import { StyleSheet, Text, ScrollView } from 'react-native';
import { useCreatePlanForm } from '../../hooks/plans/useCreatePlanForm';
import CreatePlanForm from '../../components/plans/forms/CreatePlanForm';

export default function CreatePlanScreen() {
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
    handleCoordinatesChange,
  } = useCreatePlanForm();

  return (
    <ScrollView style={styles.bg}>
      <Text style={styles.title}>Create Plan</Text>
      <CreatePlanForm />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bg: {
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#5C4D91',
    marginBottom: 24,
    textAlign: 'left',
    paddingHorizontal: 24,
    paddingTop: 40,
  },
}); 