import { useState, useEffect } from 'react';
import { useJoinPlan } from './useJoinPlan';
import { usePlansById } from './usePlansById';
import { getCurrentUser } from '../api/userApi';

export const usePlanDetails = (planId: string) => {
  const { plan, loading, error } = usePlansById(planId);
  const { join } = useJoinPlan();
  const [mapReady, setMapReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showJoinRequest, setShowJoinRequest] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
        if (plan && user) {
          setIsAdmin(plan.admins.some(a => a._id === user._id));
        }
      } catch (err) {
        console.error('Error fetching current user:', err);
      }
    };
    fetchCurrentUser();
  }, [plan]);

  const handleJoin = async () => {
    if (isAdmin) {
      setShowJoinRequest(true);
    } else {
      const result = await join(planId);
      if (result) {
        console.log('You joined successfully to the plan');
      }
    }
  };

  const handleAcceptJoin = async () => {
    const result = await join(planId);
    if (result) {
      console.log('User joined successfully to the plan');
      setShowJoinRequest(false);
    }
  };

  const handleRejectJoin = () => {
    setShowJoinRequest(false);
  };

  return {
    plan,
    loading,
    error,
    mapReady,
    setMapReady,
    isAdmin,
    showJoinRequest,
    currentUser,
    handleJoin,
    handleAcceptJoin,
    handleRejectJoin
  };
}; 