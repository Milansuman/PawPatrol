import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  ActivityIndicator,
} from 'react-native';

interface SelectableItem {
  id: string;
  name: string;
  [key: string]: any;
}

interface BottomSheetSelectorProps<T extends SelectableItem> {
  title: string;
  searchPlaceholder: string;
  items: T[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  selectedItem?: T;
  onSearchChange: (query: string) => void;
  onSelect: (item: T) => void;
  onRetry: () => void;
  renderItem?: (item: T, isSelected: boolean) => React.ReactNode;
}

export default function BottomSheetSelector<T extends SelectableItem>({
  title,
  searchPlaceholder,
  items,
  loading,
  error,
  searchQuery,
  selectedItem,
  onSearchChange,
  onSelect,
  onRetry,
  renderItem,
}: BottomSheetSelectorProps<T>) {
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    return items.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [items, searchQuery]);

  const defaultRenderItem = ({ item }: { item: T }) => (
    <TouchableOpacity
      style={[
        styles.item,
        selectedItem?.id === item.id && styles.selectedItem
      ]}
      onPress={() => onSelect(item)}
    >
      <Text style={[
        styles.itemName,
        selectedItem?.id === item.id && styles.selectedItemName
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderItemComponent = renderItem 
    ? ({ item }: { item: T }) => (
        <TouchableOpacity onPress={() => onSelect(item)}>
          {renderItem(item, selectedItem?.id === item.id)}
        </TouchableOpacity>
      )
    : defaultRenderItem;

  return (
    <>
      <Text style={styles.title}>{title}</Text>
      
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChangeText={onSearchChange}
          autoCapitalize="none"
          placeholderTextColor="#999"
        />
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={onRetry} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          renderItem={renderItemComponent}
          keyExtractor={(item) => item.id}
          style={styles.list}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>
                {searchQuery ? 'No items found' : 'No items available'}
              </Text>
            </View>
          }
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: "#333"
  },
  list: {
    flex: 1,
  },
  item: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedItem: {
    backgroundColor: '#e3f2fd',
  },
  itemName: {
    fontSize: 16,
    color: '#333',
  },
  selectedItemName: {
    color: '#007AFF',
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#ff3333',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});