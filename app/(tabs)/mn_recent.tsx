import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState, useEffect } from "react";

// Define the interface for stored image data
interface RecentImage {
  id: string;
  uri: string;
  timestamp: number;
  disease?: string;
  confidence?: number;
}

export default function RecentScreen() {
  const router = useRouter();
  const [recentImages, setRecentImages] = useState<RecentImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const RECENT_IMAGES_KEY = "@recent_images";

  // Function to load recent images from AsyncStorage
  const loadRecentImages = async () => {
    try {
      const data = await AsyncStorage.getItem(RECENT_IMAGES_KEY);
      if (data) {
        const images: RecentImage[] = JSON.parse(data);
        setRecentImages(images);
      } else {
        setRecentImages([]);
      }
    } catch (error) {
      console.error("Error loading recent images:", error);
      Alert.alert("Error", "Failed to load recent images");
    } finally {
      setLoading(false);
    }
  };

  // Load images when component mounts
  useEffect(() => {
    loadRecentImages();
  }, []);

  // Pull to refresh functionality
  const onRefresh = async () => {
    setRefreshing(true);
    await loadRecentImages();
    setRefreshing(false);
  };

  // Format timestamp to readable text
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMins < 1) return "Just now";
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString();
  };

  // Delete a single image
  const handleDeleteImage = async (id: string) => {
    Alert.alert("Delete Image", "Are you sure you want to delete this image?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const updatedImages = recentImages.filter((img) => img.id !== id);
            await AsyncStorage.setItem(
              RECENT_IMAGES_KEY,
              JSON.stringify(updatedImages)
            );
            setRecentImages(updatedImages);
          } catch (error) {
            Alert.alert("Error", "Failed to delete image");
          }
        },
      },
    ]);
  };

  // Clear all images
  const handleClearAll = () => {
    Alert.alert(
      "Clear All",
      "Are you sure you want to clear all recent images?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(RECENT_IMAGES_KEY);
              setRecentImages([]);
            } catch (error) {
              Alert.alert("Error", "Failed to clear images");
            }
          },
        },
      ]
    );
  };

  // Navigate to prescription tab with image details
  const handleImagePress = (item: RecentImage) => {
    if (item.disease && item.confidence) {
      router.push({
        pathname: "/(tabs)/prscptn_tab",
        params: {
          imageUri: item.uri,
          prediction: item.disease,
          confidence: item.confidence.toString(),
        },
      });
    } else {
      Alert.alert(
        "Not Analyzed",
        "This image hasn't been analyzed yet. Please analyze it from the home screen."
      );
    }
  };

  // Get color based on confidence level
  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return "#999";
    if (confidence > 0.8) return "#4CAF50";
    if (confidence > 0.6) return "#FF9800";
    return "#F44336";
  };

  // Render each image item
  const renderItem = ({ item }: { item: RecentImage }) => (
    <TouchableOpacity
      style={styles.imageCard}
      onPress={() => handleImagePress(item)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.uri }} style={styles.thumbnail} />

      <View style={styles.imageInfo}>
        <View style={styles.infoTop}>
          <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
          <TouchableOpacity
            onPress={() => handleDeleteImage(item.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="trash-outline" size={20} color="#F44336" />
          </TouchableOpacity>
        </View>

        {item.disease ? (
          <View style={styles.diagnosisInfo}>
            <Text style={styles.diseaseText} numberOfLines={1}>
              {item.disease}
            </Text>
            {item.confidence && (
              <View
                style={[
                  styles.confidenceBadge,
                  { backgroundColor: getConfidenceColor(item.confidence) },
                ]}
              >
                <Text style={styles.confidenceText}>
                  {(item.confidence * 100).toFixed(0)}%
                </Text>
              </View>
            )}
          </View>
        ) : (
          <Text style={styles.notAnalyzedText}>Not analyzed yet</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={["#D5F4DF", "#68952A"]} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={30} color="#000" />
        </TouchableOpacity>

        <Text style={styles.title}>Recent</Text>

        {recentImages.length > 0 && (
          <TouchableOpacity style={styles.clearBtn} onPress={handleClearAll}>
            <Text style={styles.clearBtnText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#2d5016" />
          <Text style={styles.loadingText}>Loading recent images...</Text>
        </View>
      ) : recentImages.length === 0 ? (
        <View style={styles.centerContent}>
          <Ionicons name="images-outline" size={80} color="#a0a0a0" />
          <Text style={styles.emptyTitle}>No recent items yet</Text>
          <Text style={styles.emptySubtitle}>
            Captured and uploaded images will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={recentImages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
    position: "relative",
  },
  backBtn: {
    position: "absolute",
    left: 20,
  },
  clearBtn: {
    position: "absolute",
    right: 20,
    backgroundColor: "#F44336",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  clearBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#2d5016",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#666",
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  imageCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 15,
    marginBottom: 15,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbnail: {
    width: "100%",
    height: 200,
    backgroundColor: "#e0e0e0",
  },
  imageInfo: {
    padding: 12,
  },
  infoTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 14,
    color: "#666",
  },
  diagnosisInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  diseaseText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2d5016",
    flex: 1,
    marginRight: 10,
  },
  confidenceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "bold",
  },
  notAnalyzedText: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
  },
});