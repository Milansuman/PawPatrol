import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  SafeAreaView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authenticatedFetch } from '../lib/fetch';
import BottomSheetSelector from './BottomSheetSelector';

interface Shelter {
  id: string;
  name: string;
  location: any;
}

interface ShelterSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (shelter: Shelter) => void;
  selectedShelter?: Shelter;
}

export default function ShelterSelector({ visible, onClose, onSelect, selectedShelter }: ShelterSelectorProps) {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  const fetchShelters = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authenticatedFetch<Shelter[]>('/shelters');
      if (response.error) {
        setError(response.error);
      } else {
        setShelters(response.data || []);
      }
    } catch (err) {
      setError('Failed to load shelters');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchShelters();
      setSearchQuery('');
    }
  }, [visible]);

  const handleSelect = (shelter: Shelter) => {
    onSelect(shelter);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <BottomSheetSelector
            title="Select Shelter"
            searchPlaceholder="Search shelters..."
            items={shelters}
            loading={loading}
            error={error}
            searchQuery={searchQuery}
            selectedItem={selectedShelter}
            onSearchChange={setSearchQuery}
            onSelect={handleSelect}
            onRetry={fetchShelters}
          />
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 16,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    zIndex: 1,
  },
  closeButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});