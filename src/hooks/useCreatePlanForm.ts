import { useState } from 'react';
import { useCreatePlan } from './useCreatePlan';
import { useNavigation } from '@react-navigation/native';

export interface CreatePlanFormState {
  title: string;
  description: string;
  address: string;
  tags: string;
  date: Date;
  showDate: boolean;
  maxParticipants: string;
  imageUrl: string;
  status: string;
}

export const useCreatePlanForm = () => {
  const navigation = useNavigation();
  const { create, loading, error } = useCreatePlan();
  
  const [formState, setFormState] = useState<CreatePlanFormState>({
    title: '',
    description: '',
    address: '',
    tags: '',
    date: new Date(),
    showDate: false,
    maxParticipants: '',
    imageUrl: '',
    status: 'open'
  });

  const updateFormState = (field: keyof CreatePlanFormState, value: any) => {
    setFormState(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreate = async () => {
    const ok = await create({
      title: formState.title,
      description: formState.description,
      location: { 
        address: formState.address, 
        coordinates: [0, 0] 
      },
      tags: formState.tags.split(',').map(t => t.trim()).filter(Boolean),
      dateTime: formState.date.toISOString(),
      maxParticipants: Number(formState.maxParticipants),
      imageUrl: formState.imageUrl,
      status: formState.status
    });
    
    if (ok) navigation.goBack();
  };

  return {
    formState,
    updateFormState,
    handleCreate,
    loading,
    error
  };
}; 