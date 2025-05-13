import { StyleSheet, Text, ScrollView, Alert, View, Platform } from 'react-native';
import CreatePlanForm from '../../components/plans/forms/CreatePlanForm';
import { usePlanDetails } from '../../hooks/plans/usePlanDetails';
import { useEffect, useState } from 'react';
import { editPlan } from '../../api/plans/plansApi';

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
      console.log('Form data before sending:', form);
      console.log('Form tags before sending:', form.tags);
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
        console.log('Appending tag:', tag);
        formData.append('tags[]', tag);
      });

      console.log('FormData tags:', formData.getAll('tags[]'));

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
      console.error('Error in handleEdit:', error);
      Alert.alert('Error', error.message || 'Error al editar el plan');
    }
  };

  if (loading) {
    return (
      <ScrollView style={styles.container}>
        <Text>Cargando...</Text>
      </ScrollView>
    );
  }

  if (error) {
    return (
      <ScrollView style={styles.container}>
        <Text>Error: {error}</Text>
      </ScrollView>
    );
  }

  if (!formData) {
    return (
      <ScrollView style={styles.container}>
        <Text>No se encontró el plan</Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Editar Plan</Text>
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
    backgroundColor: '#fff',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#5C4D91',
  },
}); 