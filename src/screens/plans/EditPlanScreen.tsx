import { StyleSheet, Text, ScrollView, Alert, View, Platform } from 'react-native';
import CreatePlanForm from '../../components/plans/forms/CreatePlanForm';
import { usePlanDetails } from '../../hooks/plans/usePlanDetails';
import { useEffect, useState } from 'react';
import { editPlan } from '../../api/plans/plansApi';
import { useTheme } from '../../hooks/theme/useTheme';

interface EditPlanScreenProps {
  route: {
    params: {
      planId: string;
    };
  };
  navigation: any;
}

export default function EditPlanScreen({ route, navigation }: EditPlanScreenProps) {
  const { planId } = route.params;
  const { plan, loading, error } = usePlanDetails(planId);
  const [formData, setFormData] = useState<any>(null);
  const theme = useTheme();

  useEffect(() => {
    if (plan) {
      const initialValues = {
        title: plan.title,
        description: plan.description,
        dateTime: new Date(plan.dateTime),
        location: plan.location,
        maxParticipants: plan.maxParticipants,
        tags: plan.tags,
        image: null,
        imageUrl: plan.imageUrl
      };
      setFormData(initialValues);
    }
  }, [plan]);

  const handleEdit = async (form: any) => {
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('dateTime', form.dateTime.toISOString());
      formData.append('maxParticipants', (form.maxParticipants || 0).toString());
      const locationData = {
        address: form.location.address,
        coordinates: form.location.coordinates
      };
      formData.append('location', JSON.stringify(locationData));
      form.tags.forEach((tag: string) => {
        formData.append('tags[]', tag);
      });
      if (form.image) {
        const imageUri = form.image.uri;
        const imageName = imageUri.split('/').pop() || 'image.jpg';
        const imageType = `image/${imageUri.split('.').pop()}`;
        formData.append('image', {
          uri: Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri,
          type: imageType,
          name: imageName,
        } as any);
      }
      await editPlan(planId, formData);
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al editar el plan');
    }
  };

  if (loading) {
    return (
      <ScrollView style={[styles.container, { backgroundColor: theme.background }]}> 
        <Text style={{ color: theme.text }}>Cargando...</Text>
      </ScrollView>
    );
  }

  if (error) {
    return (
      <ScrollView style={[styles.container, { backgroundColor: theme.background }]}> 
        <Text style={{ color: theme.error }}>Error: {error}</Text>
      </ScrollView>
    );
  }

  if (!formData) {
    return (
      <ScrollView style={[styles.container, { backgroundColor: theme.background }]}> 
        <Text style={{ color: theme.text }}>No se encontró el plan</Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}> 
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.primary }]}>Editar Plan</Text>
      </View>
      <CreatePlanForm
        initialValues={formData}
        onSubmit={handleEdit}
        isEditing={true}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
}); 