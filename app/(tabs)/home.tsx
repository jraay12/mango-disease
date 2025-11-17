import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<"back" | "front">("back");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();

  // API Configuration - Update with your computer's IP for local testing
  const API_URL = "http://192.168.1.97:8000/predict"; // ← CHANGE THIS to your computer's IP

  // Request camera permissions on mount
  React.useEffect(() => {
    if (Platform.OS !== "web") {
      requestPermission();
    }
  }, []);

  // Handle image upload from gallery
  const handleUploadImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setCapturedImage(result.assets[0].uri);
        setAnalysisResult(null); // Clear previous results
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  // Handle capture photo
  const handleCapturePhoto = async () => {
    if (Platform.OS === "web") {
      Alert.alert(
        "Camera Not Available",
        "Camera is only available on mobile devices."
      );
      return;
    }

    try {
      if (cameraRef.current) {
        const photo = await cameraRef.current.takePictureAsync();
        if (photo) {
          setCapturedImage(photo.uri);
          setAnalysisResult(null); // Clear previous results
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to capture photo");
    }
  };

  const analyzeImage = async () => {
    if (!capturedImage) return;

    setAnalyzing(true);
    setAnalysisResult(null);

    try {
      const formData = new FormData();
      formData.append("file", {
        uri: capturedImage,
        type: "image/jpeg",
        name: "mango_leaf.jpg",
      } as any);

      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const result = await response.json();

      if (result.success) {
        setAnalysisResult(result);
        console.log("Analysis successful:", result);

        // Navigate to Prescription tab with parameters
        router.push({
          pathname: "/(tabs)/prscptn_tab",
          params: {
            imageUri: capturedImage,
            prediction: result.disease,
            confidence: result.confidence.toString(),
            allPredictions: JSON.stringify(result.all_predictions),
          },
        });
      } else {
        throw new Error(result.error || "Analysis failed");
      }
    } catch (error: any) {
      console.error("Analysis error:", error);
      Alert.alert("Analysis Failed", `Error: ${error.message}`);
    } finally {
      setAnalyzing(false);
    }
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedImage(null);
    setAnalysisResult(null);
  };

  // Get confidence color
  const getConfidenceColor = (confidence: any) => {
    if (confidence > 0.8) return "#4CAF50";
    if (confidence > 0.6) return "#FF9800";
    return "#F44336";
  };

  // Check if running on web
  const isWeb = Platform.OS === "web";

  // Loading state
  if (!isWeb && !permission) {
    return (
      <LinearGradient
        colors={["#D5F4DF", "#68952A"]}
        style={styles.loadingContainer}
      >
        <Text style={styles.loadingText}>Loading camera...</Text>
      </LinearGradient>
    );
  }

  // Permission denied
  if (!isWeb && permission && !permission.granted) {
    return (
      <LinearGradient
        colors={["#D5F4DF", "#68952A"]}
        style={styles.permissionContainer}
      >
        <Ionicons name="camera-outline" size={80} color="#ccc" />
        <Text style={styles.permissionText}>Camera permission is required</Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#D5F4DF", "#68952A"]} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="home-outline" size={30} color="#000" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>SmartLeaf</Text>

        <TouchableOpacity onPress={() => router.push("/(tabs)/menu")}>
          <Ionicons name="menu" size={35} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Camera View or Preview */}
      <View style={styles.cameraContainer}>
        {capturedImage ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: capturedImage }} style={styles.preview} />

            {/* Analysis Results Overlay */}
            {analysisResult && (
              <View style={styles.resultsOverlay}>
                <View
                  style={[
                    styles.resultCard,
                    {
                      backgroundColor: getConfidenceColor(
                        analysisResult.confidence
                      ),
                    },
                  ]}
                >
                  <Text style={styles.resultDisease}>
                    {analysisResult.disease}
                  </Text>
                  <Text style={styles.resultConfidence}>
                    {(analysisResult.confidence * 100).toFixed(1)}% confidence
                  </Text>
                </View>
              </View>
            )}
          </View>
        ) : isWeb ? (
          <View style={styles.webPlaceholder}>
            <Ionicons name="camera-outline" size={80} color="#a0a0a0" />
            <Text style={styles.webPlaceholderText}>Camera Preview</Text>
            <Text style={styles.webPlaceholderSubtext}>
              Camera is only available on mobile devices
            </Text>
            <TouchableOpacity
              style={styles.uploadOnlyButton}
              onPress={handleUploadImage}
            >
              <Ionicons name="images-outline" size={24} color="#fff" />
              <Text style={styles.uploadOnlyButtonText}>Upload Image</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
            <View style={styles.cameraOverlay} />
          </CameraView>
        )}
      </View>

      {/* Controls - Only show on mobile when no captured image */}
      {!isWeb && !capturedImage && (
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleUploadImage}
          >
            <Ionicons name="images-outline" size={28} color="#4ade80" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.captureButton}
            onPress={handleCapturePhoto}
          >
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={() =>
              setFacing((current) => (current === "back" ? "front" : "back"))
            }
          >
            <Ionicons name="camera-reverse-outline" size={28} color="#4ade80" />
          </TouchableOpacity>
        </View>
      )}

      {/* Bottom Action - When image is captured */}
      {capturedImage && (
        <View style={styles.bottomAction}>
          <TouchableOpacity
            style={styles.retakeButton}
            onPress={handleRetake}
            disabled={analyzing}
          >
            <Text style={[styles.retakeText, analyzing && styles.disabledText]}>
              Retake
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.analyzeButton, analyzing && styles.analyzingButton]}
            onPress={analyzeImage}
            disabled={analyzing}
          >
            {analyzing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.analyzeText}>
                {analysisResult ? "Re-analyze" : "Analyze"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Detailed Results */}
      {analysisResult && (
        <View style={styles.detailedResults}>
          <Text style={styles.resultsTitle}>Detailed Analysis</Text>

          {/* Top Predictions */}
          <View style={styles.predictionsList}>
            {Object.entries(analysisResult.all_predictions)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 3)
              .map(([disease, confidence], index) => (
                <View
                  key={disease}
                  style={[
                    styles.predictionItem,
                    disease === analysisResult.disease && styles.topPrediction,
                  ]}
                >
                  <Text style={styles.predictionName}>
                    {index + 1}. {disease}
                  </Text>
                  <Text style={styles.predictionConfidence}>
                    {(confidence * 100).toFixed(1)}%
                  </Text>
                </View>
              ))}
          </View>

          {/* Health Recommendation */}
          <View style={styles.recommendationCard}>
            <Text style={styles.recommendationTitle}>
              {analysisResult.disease === "Healthy"
                ? "🌱 Healthy Plant"
                : "⚠️ Treatment Recommended"}
            </Text>
            <Text style={styles.recommendationText}>
              {analysisResult.disease === "Healthy"
                ? "Your mango plant appears healthy! Continue regular care and monitoring."
                : "Consider consulting with agricultural experts for proper treatment."}
            </Text>
          </View>
        </View>
      )}

      {/* API Configuration Hint */}
      {!analysisResult && capturedImage && (
        <View style={styles.configHint}>
          <Text style={styles.configHintText}>
            💡 Make sure your Python backend is running on {API_URL}
          </Text>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  permissionText: {
    fontSize: 16,
    color: "#6b7280",
    marginTop: 20,
    marginBottom: 20,
    textAlign: "center",
  },
  permissionButton: {
    backgroundColor: "#4ade80",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  permissionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: "transparent",
  },
  headerTitle: {
    fontSize: 35,
    fontWeight: "bold",
    color: "#2d5016",
  },
  cameraContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#e0e0e0",
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: "transparent",
  },
  previewContainer: {
    flex: 1,
    position: "relative",
  },
  preview: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  resultsOverlay: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
  },
  resultCard: {
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  resultDisease: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  resultConfidence: {
    color: "#fff",
    fontSize: 14,
    marginTop: 5,
  },
  webPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    padding: 40,
  },
  webPlaceholderText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#666",
    marginTop: 20,
    marginBottom: 8,
  },
  webPlaceholderSubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginBottom: 30,
  },
  uploadOnlyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4ade80",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    gap: 8,
  },
  uploadOnlyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 40,
    backgroundColor: "transparent",
  },
  controlButton: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#4ade80",
  },
  captureButtonInner: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: "#4ade80",
  },
  bottomAction: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "transparent",
  },
  retakeButton: {
    flex: 1,
    paddingVertical: 15,
    marginRight: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#4ade80",
    alignItems: "center",
  },
  retakeText: {
    color: "#4ade80",
    fontSize: 16,
    fontWeight: "600",
  },
  analyzeButton: {
    flex: 1,
    paddingVertical: 15,
    marginLeft: 10,
    backgroundColor: "#4ade80",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  analyzingButton: {
    backgroundColor: "#8bc34a",
  },
  analyzeText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledText: {
    color: "#ccc",
  },
  detailedResults: {
    padding: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    margin: 20,
    borderRadius: 15,
    marginTop: 0,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2d5016",
    marginBottom: 15,
    textAlign: "center",
  },
  predictionsList: {
    marginBottom: 15,
  },
  predictionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    marginBottom: 8,
  },
  topPrediction: {
    backgroundColor: "#e8f5e8",
    borderLeftWidth: 4,
    borderLeftColor: "#4ade80",
  },
  predictionName: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  predictionConfidence: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2d5016",
  },
  recommendationCard: {
    backgroundColor: "#e3f2fd",
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#2196f3",
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1976d2",
    marginBottom: 5,
  },
  recommendationText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
  configHint: {
    padding: 10,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    marginHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
  },
  configHintText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
});
