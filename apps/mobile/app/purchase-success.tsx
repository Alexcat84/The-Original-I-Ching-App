import { useEffect } from 'react';
import { DeviceEventEmitter } from 'react-native';
import { router } from 'expo-router';

export default function PurchaseSuccess() {
  useEffect(() => {
    DeviceEventEmitter.emit('rnPurchaseSuccess', {});
    router.replace('/');
  }, []);

  return null;
}
