import { StyleSheet, Text, ScrollView, Alert, View, Platform } from 'react-native';
import CreatePlanForm from '../../components/plans/forms/CreatePlanForm';
import { usePlanDetails } from '../../hooks/plans/usePlanDetails';
import { useEffect, useState } from 'react';
import { editPlan } from '../../api/plans/plansApi';
import { useTheme } from '../../hooks/theme/useTheme';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

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
      Alert.alert('Error', error.message || t('api.errors.plans.notFound'));
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>{t('plans.detail.loading')}</Text>
      </View>
    );
  }

  if (error || !plan) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.error, { color: theme.error }]}>{error || t('plans.detail.notFound')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
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
  error: {
    textAlign: 'center',
    marginTop: 20,
  },
}); 