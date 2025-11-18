import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useCallback } from "react";

// Define the type for recent image entries
interface RecentImage {
  id: string;
  uri: string;
  timestamp: number;
  disease?: string;
  confidence?: number;
}

export default function UploadsScreen() {
  const router = useRouter();
  const [uploads, setUploads] = useState<RecentImage[]>([]);
  const [loading, setLoading] = useState(true);

  const RECENT_IMAGES_KEY = '@recent_images';

  // Load uploads whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadUploads();
    }, [])
  );

  const loadUploads = async () => {
    try {
      setLoading(true);
      const data = await AsyncStorage.getItem(RECENT_IMAGES_KEY);
      if (data) {
        const recentImages: RecentImage[] = JSON.parse(data);
        setUploads(recentImages);
      } else {
        setUploads([]);
      }
    } catch (error) {
      console.error('Error loading uploads:', error);
      Alert.alert('Error', 'Failed to load uploads');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUpload = async (id: string) => {
    Alert.alert(
      'Delete Upload',
      'Are you sure you want to delete this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedUploads = uploads.filter(upload => upload.id !== id);
              await AsyncStorage.setItem(RECENT_IMAGES_KEY, JSON.stringify(updatedUploads));
              setUploads(updatedUploads);
            } catch (error) {
              console.error('Error deleting upload:', error);
              Alert.alert('Error', 'Failed to delete image');
            }
          }
        }
      ]
    );
  };

  const handleClearAll = async () => {
    Alert.alert(
      'Clear All',
      'Are you sure you want to delete all uploads?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(RECENT_IMAGES_KEY);
              setUploads([]);
            } catch (error) {
              console.error('Error clearing uploads:', error);
              Alert.alert('Error', 'Failed to clear uploads');
            }
          }
        }
      ]
    );
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return 'Today';
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return "#999";
    if (confidence > 0.8) return "#4CAF50";
    if (confidence > 0.6) return "#FF9800";
    return "#F44336";
  };

  return (
    <LinearGradient colors={["#D5F4DF", "#68952A"]} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={30} color="#000" />
        </TouchableOpacity>

        <Text style={styles.title}>My Uploads</Text>

        {uploads.length > 0 && (
          <TouchableOpacity style={styles.clearBtn} onPress={handleClearAll}>
            <Ionicons name="trash-outline" size={24} color="#d32f2f" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="hourglass-outline" size={60} color="#68952A" />
            <Text style={styles.emptyText}>Loading uploads...</Text>
          </View>
        ) : uploads.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="cloud-upload-outline" size={80} color="#ccc" />
            <Text style={styles.emptyText}>No uploads yet</Text>
            <Text style={styles.emptySubtext}>
              Upload images from the home screen to see them here
            </Text>
          </View>
        ) : (
          <View style={styles.uploadsGrid}>
            {uploads.map((upload) => (
              <View key={upload.id} style={styles.uploadCard}>
                <Image 
                  source={{ uri: upload.uri }} 
                  style={styles.uploadImage}
                  resizeMode="cover"
                />
                
                <View style={styles.uploadOverlay}>
                  <TouchableOpacity 
                    style={styles.deleteBtn}
                    onPress={() => handleDeleteUpload(upload.id)}
                  >
                    <Ionicons name="close-circle" size={28} color="#fff" />
                  </TouchableOpacity>
                </View>

                <View style={styles.uploadInfo}>
                  <Text style={styles.uploadDate}>
                    {formatDate(upload.timestamp)}
                  </Text>
                  
                  {upload.disease && (
                    <View style={styles.diseaseInfo}>
                      <Text 
                        style={[
                          styles.diseaseName,
                          { color: getConfidenceColor(upload.confidence) }
                        ]}
                        numberOfLines={1}
                      >
                        {upload.disease}
                      </Text>
                      {upload.confidence && (
                        <Text style={styles.confidenceText}>
                          {(upload.confidence * 100).toFixed(0)}%
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {uploads.length > 0 && (
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Ionicons name="images-outline" size={24} color="#68952A" />
            <Text style={styles.statNumber}>{uploads.length}</Text>
            <Text style={styles.statLabel}>Total Uploads</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Ionicons name="leaf-outline" size={24} color="#68952A" />
            <Text style={styles.statNumber}>
              {uploads.filter(u => u.disease).length}
            </Text>
            <Text style={styles.statLabel}>Analyzed</Text>
          </View>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    paddingTop: 50 
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
    position: "relative"
  },
  backBtn: { 
    position: "absolute", 
    left: 20,
    zIndex: 10
  },
  clearBtn: {
    position: "absolute",
    right: 20,
    zIndex: 10,
    padding: 5
  },
  title: { 
    fontSize: 30, 
    fontWeight: "bold",
    color: "#1a4d2e"
  },
  scrollView: {
    flex: 1,
    width: "100%"
  },
  scrollContent: {
    padding: 15,
    paddingBottom: 40
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
    paddingHorizontal: 40
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#666",
    marginTop: 20,
    marginBottom: 10
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    lineHeight: 20
  },
  uploadsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingBottom: 20
  },
  uploadCard: {
    width: "48%",
    marginBottom: 15,
    borderRadius: 15,
    backgroundColor: "#fff",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5
  },
  uploadImage: {
    width: "100%",
    height: 150,
    backgroundColor: "#f0f0f0"
  },
  uploadOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    padding: 8
  },
  deleteBtn: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 14,
    padding: 2
  },
  uploadInfo: {
    padding: 10
  },
  uploadDate: {
    fontSize: 12,
    color: "#999",
    marginBottom: 5
  },
  diseaseInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  diseaseName: {
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
    marginRight: 5
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#666"
  },
  statsCard: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5
  },
  statItem: {
    flex: 1,
    alignItems: "center"
  },
  statDivider: {
    width: 1,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 15
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a4d2e",
    marginTop: 8,
    marginBottom: 4
  },
  statLabel: {
    fontSize: 12,
    color: "#666"
  }
});