import { StyleSheet, Text, ScrollView } from 'react-native';
import { useCreatePlanForm } from '../../hooks/useCreatePlanForm';
import CreatePlanForm from '../../components/plans/CreatePlanForm';

export default function CreatePlanScreen() {
  const {
    formState,
    updateFormState,
    handleCreate,
    loading,
    error
  } = useCreatePlanForm();

  return (
    <ScrollView style={styles.bg}>
      <Text style={styles.title}>Create Plan</Text>
      <CreatePlanForm
        formState={formState}
        updateFormState={updateFormState}
        handleCreate={handleCreate}
        loading={loading}
        error={error}
      />
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