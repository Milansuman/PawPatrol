import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { apiPost } from '../../lib/fetch';

const { width, height } = Dimensions.get('window');

export default function NewReportScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [dogCount, setDogCount] = useState(0);
  const [isDetecting, setIsDetecting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [reportId, setReportId] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const detectorRef = useRef<any>(null);

  useEffect(() => {
    initializeDetector();
    getCurrentLocation();
  }, []);

  const initializeDetector = async () => {
    try {
      // For now, we'll use a mock detector since MediaPipe web version 
      // may not work reliably in React Native environment
      // In a production app, you would use react-native-vision-camera 
      // with ML Kit or TensorFlow Lite for on-device detection
      detectorRef.current = { initialized: true } as any;
      console.log('Mock detector initialized');
    } catch (error) {
      console.error('Error initializing detector:', error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Permission to access location was denied');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get current location');
    }
  };

  const detectDogs = async () => {
    if (!cameraRef.current || !detectorRef.current || !location) {
      if (!location) {
        Alert.alert('Error', 'Location not available. Please wait for location to be set.');
      }
      return;
    }

    setIsDetecting(true);
    
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
      });

      if (photo?.uri) {
        // Mock detection logic - in a real app, you would use ML Kit or TensorFlow Lite
        // to analyze the image and detect dogs
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing time
        
        // For demo purposes, randomly detect 1-3 dogs
        const detectedDogCount = Math.floor(Math.random() * 3) + 1;
        console.log(`Mock detection: Found ${detectedDogCount} dogs`);
        
        setDogCount(detectedDogCount);
        await submitReport(detectedDogCount);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to take picture');
      setIsDetecting(false);
    }
  };

  const submitReport = async (count: number) => {
    if (!location) {
      Alert.alert('Error', 'Location not available');
      setIsDetecting(false);
      return;
    }

    try {
      const reportData = {
        location: `POINT(${location.coords.longitude} ${location.coords.latitude})`,
        count: count,
        aggressiveness: 0,
      };

      console.log('Creating dog report:', reportData);
      
      const response = await apiPost('/dogReports', reportData);
      
      if (response.error) {
        Alert.alert('Error', response.error);
        setIsDetecting(false);
        return;
      }

      if (response.data?.id) {
        setReportId(response.data.id);
        setShowConfirmation(true);
        setIsDetecting(false);
      } else {
        Alert.alert('Error', 'Failed to create report - no ID returned');
        setIsDetecting(false);
      }
    } catch (error) {
      console.error('Error creating report:', error);
      Alert.alert('Error', 'Failed to create report');
      setIsDetecting(false);
    }
  };

  const handleBack = () => {
    if (showConfirmation) {
      router.push('/(main)');
    } else {
      router.back();
    }
  };

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>We need your permission to show the camera</Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (showConfirmation) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Report Created</Text>
        </View>
        
        <View style={styles.confirmationContainer}>
          <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
          <Text style={styles.confirmationTitle}>Dog Report Submitted!</Text>
          <Text style={styles.confirmationText}>
            Detected {dogCount} {dogCount === 1 ? 'dog' : 'dogs'} in the area
          </Text>
          <Text style={styles.confirmationSubtext}>
            Report ID: {reportId}
          </Text>
          
          <TouchableOpacity style={styles.homeButton} onPress={() => router.push('/(main)')}>
            <Text style={styles.homeButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dog Detection</Text>
        <View style={styles.headerRight}>
          {location && (
            <Ionicons name="location" size={20} color="#4CAF50" />
          )}
        </View>
      </View>

      <CameraView
        style={styles.camera}
        facing={facing}
        ref={cameraRef}
      >
        <View style={styles.cameraOverlay}>
          {/* <View style={styles.detectionInfo}>
            <Text style={styles.instructionText}>
              Point camera at dogs and tap the shutter to create a report
            </Text>
            {location && (
              <Text style={styles.locationStatus}>
                📍 Location: {location.coords.latitude.toFixed(4)}, {location.coords.longitude.toFixed(4)}
              </Text>
            )}
          </View> */}

          <View style={styles.cameraControls}>
            <TouchableOpacity
              style={styles.flipButton}
              onPress={() => setFacing(current => current === 'back' ? 'front' : 'back')}
            >
              <Ionicons name="camera-reverse" size={28} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.shutterButton, isDetecting && styles.shutterButtonActive]}
              onPress={detectDogs}
              disabled={isDetecting || !location}
            >
              {isDetecting ? (
                <View style={styles.processingIndicator}>
                  <Text style={styles.processingText}>Detecting...</Text>
                </View>
              ) : (
                <View style={styles.shutterInner} />
              )}
            </TouchableOpacity>

            <View style={styles.placeholderButton} />
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 120,
    paddingBottom: 40,
  },
  detectionInfo: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  instructionText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 10,
  },
  locationStatus: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  cameraControls: {
    marginTop: "auto",
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  flipButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  shutterButtonActive: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  processingIndicator: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  placeholderButton: {
    width: 50,
    height: 50,
  },
  // Permission styles
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  permissionText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#333',
    marginBottom: 30,
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Confirmation styles
  confirmationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    backgroundColor: '#f5f5f5',
  },
  confirmationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  confirmationText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  confirmationSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 40,
  },
  homeButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 8,
  },
  homeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});