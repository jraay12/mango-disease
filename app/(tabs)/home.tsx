import { Ionicons } from "@expo/vector-icons";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-react-native";
import { bundleResourceIO, decodeJpeg } from "@tensorflow/tfjs-react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
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
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [model, setModel] = useState<tf.LayersModel | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();

  const classNames = [
    "Anthracnose",
    "Bacterial Canker",
    "Cutting Weevil",
    "Die Back",
    "Gall Midge",
    "Healthy",
    "Powdery Mildew",
    "Sooty Mould",
  ];

  class L2 {
    static readonly className = "L2";
    private l2: number;

    constructor(config?: any) {
      if (config) {
        this.l2 = config.l2 !== undefined ? config.l2 : config.l !== undefined ? config.l : 0.01;
      } else {
        this.l2 = 0.01;
      }
    }

    apply(x: tf.Tensor): tf.Scalar {
      return tf.tidy(() => {
        return tf.mul(this.l2, tf.sum(tf.square(x))) as tf.Scalar;
      });
    }

    getConfig() {
      return { l2: this.l2 };
    }

    static fromConfig(cls: any, config: any) {
      return new cls(config);
    }
  }

  tf.serialization.registerClass(L2);

  class Normalization extends tf.layers.Layer {
    static readonly className = "Normalization";
    mean: tf.LayerVariable;
    variance: tf.LayerVariable;
    count: tf.LayerVariable;

    constructor(config: any) {
      super(config);
      
      const meanArray = config.mean || [0, 0, 0];
      const varianceArray = config.variance || [1, 1, 1];
      const countValue = config.count || 1;
      
      const flatMean = Array.isArray(meanArray[0]) ? meanArray.flat() : meanArray;
      const flatVariance = Array.isArray(varianceArray[0]) ? varianceArray.flat() : varianceArray;
      
      const meanShape = [flatMean.length];
      const varianceShape = [flatVariance.length];
      
      const meanTensor = tf.tensor1d(flatMean, 'float32');
      const varianceTensor = tf.tensor1d(flatVariance, 'float32');
      const countTensor = tf.scalar(countValue, 'float32'); 
      
      this.mean = this.addWeight(
        'mean',
        meanShape,
        'float32',
        tf.initializers.zeros(),
        undefined,
        false 
      );
      
      this.variance = this.addWeight(
        'variance',
        varianceShape,
        'float32',
        tf.initializers.zeros(),
        undefined,
        false 
      );
      
      this.count = this.addWeight(
        'count',
        [],
        'float32', 
        tf.initializers.zeros(),
        undefined,
        false 
      );
      
      this.mean.write(meanTensor);
      this.variance.write(varianceTensor);
      this.count.write(countTensor);
      
      meanTensor.dispose();
      varianceTensor.dispose();
      countTensor.dispose();
    }

    call(inputs: tf.Tensor | tf.Tensor[]) {
      return tf.tidy(() => {
        const input = Array.isArray(inputs) ? inputs[0] : inputs;
        const meanTensor = this.mean.read();
        const varianceTensor = this.variance.read();
        
        return input
          .sub(meanTensor)
          .div(varianceTensor.sqrt().add(tf.scalar(1e-7)));
      });
    }

    getConfig() {
      const config = super.getConfig();
      return {
        ...config,
        mean: this.mean.read().arraySync(),
        variance: this.variance.read().arraySync(),
        count: this.count.read().arraySync(),
      };
    }

    static fromConfig(cls: any, config: any) {
      return new cls(config);
    }
  }

  tf.serialization.registerClass(Normalization);

  useEffect(() => {
    const initTensorFlow = async () => {
      try {
        await tf.ready();
        console.log("TensorFlow.js initialized");

        const modelJson = require("../../assets/models/model.json");
        const modelWeights = [
          require("../../assets/models/group1-shard1of19.bin"),
          require("../../assets/models/group1-shard2of19.bin"),
          require("../../assets/models/group1-shard3of19.bin"),
          require("../../assets/models/group1-shard4of19.bin"),
          require("../../assets/models/group1-shard5of19.bin"),
          require("../../assets/models/group1-shard6of19.bin"),
          require("../../assets/models/group1-shard7of19.bin"),
          require("../../assets/models/group1-shard8of19.bin"),
          require("../../assets/models/group1-shard9of19.bin"),
          require("../../assets/models/group1-shard10of19.bin"),
          require("../../assets/models/group1-shard11of19.bin"),
          require("../../assets/models/group1-shard12of19.bin"),
          require("../../assets/models/group1-shard13of19.bin"),
          require("../../assets/models/group1-shard14of19.bin"),
          require("../../assets/models/group1-shard15of19.bin"),
          require("../../assets/models/group1-shard16of19.bin"),
          require("../../assets/models/group1-shard17of19.bin"),
          require("../../assets/models/group1-shard18of19.bin"),
          require("../../assets/models/group1-shard19of19.bin"),
        ];

        const loadedModel = await tf.loadLayersModel(
          bundleResourceIO(modelJson, modelWeights)
        );

        setModel(loadedModel);
        setIsModelLoading(false);
        console.log("Model loaded successfully");
      } catch (error) {
        console.error("Error loading model:", error);
        Alert.alert(
          "Model Loading Error",
          `Failed to load AI model.\n\nError: ${(error as Error).message}`
        );
        setIsModelLoading(false);
      }
    };

    initTensorFlow();
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web") requestPermission();
  }, []);

  const imageToTensor = async (imageUri: string) => {
    try {
      const imgB64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: "base64",
      });

      const imgBuffer = Uint8Array.from(atob(imgB64), (c) => c.charCodeAt(0));
      let imageTensor = decodeJpeg(imgBuffer);

      const targetSize = 224;

      // Simple direct resize to 224x224 - let model handle the full image
      imageTensor = tf.image.resizeBilinear(
        imageTensor as tf.Tensor3D, 
        [targetSize, targetSize],
        true // alignCorners for better quality
      );

      const tensor = (imageTensor as tf.Tensor3D)
        .toFloat()
        .div(tf.scalar(255.0)) 
        .expandDims(0);

      return tensor as tf.Tensor4D;
    } catch (error) {
      console.error("Error in image preprocessing:", error);
      throw error;
    }
  };

  const analyzeImage = async () => {
    if (!model || !capturedImage) {
      Alert.alert("Error", "Model not loaded or no image captured");
      return;
    }

    setIsAnalyzing(true);

    try {
      const tensor = await imageToTensor(capturedImage);
      const prediction = model.predict(tensor) as tf.Tensor;
      const predictionData = await prediction.data();
      
      const predictionArray = Array.from(predictionData);
      const sum = predictionArray.reduce((a, b) => a + b, 0);
      
      const normalizedPredictions = sum !== 1 ? 
        predictionArray.map(p => p / sum) : predictionArray;
      
      const maxIndex = normalizedPredictions.indexOf(
        Math.max(...normalizedPredictions)
      );
      const confidence = normalizedPredictions[maxIndex] * 100;

      const confidenceThreshold = 50; 
      
      tensor.dispose();
      prediction.dispose();

      if (confidence < confidenceThreshold) {
        Alert.alert(
          "Low Confidence", 
          `The AI is not confident in its prediction (${confidence.toFixed(1)}%).\n\nPlease try with a clearer image of the mango leaf.`,
          [{ text: "OK", onPress: () => setIsAnalyzing(false) }]
        );
        return;
      }

      router.push({
        pathname: "/(tabs)/prscptn_tab",
        params: {
          imageUri: capturedImage,
          prediction: classNames[maxIndex],
          confidence: confidence.toFixed(2),
          allPredictions: JSON.stringify(
            classNames.map((name, i) => ({
              name,
              confidence: (normalizedPredictions[i] * 100).toFixed(2),
            }))
          ),
        },
      });
    } catch (error) {
      console.error("Error analyzing image:", error);
      Alert.alert(
        "Analysis Error", 
        "Failed to analyze image. Please ensure the image is clear and try again."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUploadImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1.0, // Max quality
        exif: false, 
      });

      if (!result.canceled) {
        setCapturedImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleCapturePhoto = async () => {
    if (Platform.OS === "web") {
      Alert.alert("Camera Not Available", "Camera is only available on mobile devices.");
      return;
    }

    try {
      if (cameraRef.current) {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 1.0, // Max quality
          skipProcessing: false, 
          exif: false,
          imageType: 'jpg', 
        });
        if (photo) setCapturedImage(photo.uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to capture photo. Please ensure good lighting.");
    }
  };

  const isWeb = Platform.OS === "web";

  if (isModelLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4ade80" />
        <Text style={styles.loadingText}>Loading AI Model...</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={["#D5F4DF", "#68952A"]} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SmartLeaf</Text>
        <TouchableOpacity onPress={() => router.push("/(tabs)/menu")}>
          <Ionicons name="menu" size={35} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.cameraContainer}>
        {capturedImage ? (
          <View style={styles.previewContainer}>
            <Image 
              source={{ uri: capturedImage }} 
              style={styles.preview}
              resizeMode="contain"
            />
            <View style={styles.imageQualityTip}>
              <Ionicons name="information-circle" size={16} color="#fff" />
              <Text style={styles.qualityTipText}>
                Full image shown - tap Analyze to diagnose
              </Text>
            </View>
          </View>
        ) : isWeb ? (
          <View style={styles.webPlaceholder}>
            <Ionicons name="camera-outline" size={80} color="#999" />
            <Text style={styles.webPlaceholderText}>Camera Not Available</Text>
            <Text style={styles.webPlaceholderSubtext}>
              Camera preview is only available on mobile devices.{"\n"}
              Please upload an image instead.
            </Text>
            <TouchableOpacity style={styles.uploadOnlyButton} onPress={handleUploadImage}>
              <Ionicons name="cloud-upload-outline" size={24} color="#fff" />
              <Text style={styles.uploadOnlyButtonText}>Upload Image</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <CameraView 
            style={styles.camera} 
            facing={facing} 
            ref={cameraRef}
          >
            <View style={styles.cameraOverlay}>
              <View style={styles.focusFrame} />
              <Text style={styles.cameraTip}>
                Position mango leaf in frame with good lighting
              </Text>
            </View>
          </CameraView>
        )}
      </View>

      {!capturedImage && !isWeb && (
        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlButton} onPress={handleUploadImage}>
            <Ionicons name="images-outline" size={30} color="#fff" />
            <Text style={styles.controlButtonLabel}>Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.captureButton} onPress={handleCapturePhoto}>
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setFacing(facing === "back" ? "front" : "back")}
          >
            <Ionicons name="camera-reverse-outline" size={30} color="#fff" />
            <Text style={styles.controlButtonLabel}>Flip</Text>
          </TouchableOpacity>
        </View>
      )}

      {capturedImage && (
        <View style={styles.bottomAction}>
          <TouchableOpacity
            style={styles.retakeButton}
            onPress={() => setCapturedImage(null)}
          >
            <Ionicons name="arrow-back" size={20} color="#4ade80" />
            <Text style={styles.retakeText}>Retake</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.analyzeButton, isAnalyzing && styles.analyzeButtonDisabled]}
            onPress={analyzeImage}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="analytics" size={20} color="#fff" />
                <Text style={styles.analyzeText}>Analyze Image</Text>
              </>
            )}
          </TouchableOpacity>
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
    marginTop: 10,
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
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  focusFrame: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: "#4ade80",
    borderRadius: 10,
    backgroundColor: "transparent",
  },
  cameraTip: {
    position: "absolute",
    bottom: 30,
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 10,
    borderRadius: 8,
  },
  previewContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  preview: {
    width: "100%",
    height: "100%",
  },
  imageQualityTip: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 10,
    borderRadius: 8,
  },
  qualityTipText: {
    color: "#fff",
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
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
    alignItems: "center",
    padding: 10,
  },
  controlButtonLabel: {
    color: "#fff",
    fontSize: 12,
    marginTop: 5,
    fontWeight: "500",
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
    paddingBottom: 30,
    backgroundColor: "transparent",
    gap: 15,
  },
  retakeButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#4ade80",
    gap: 8,
  },
  retakeText: {
    color: "#4ade80",
    fontSize: 16,
    fontWeight: "600",
  },
  analyzeButton: {
    flex: 2,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 15,
    backgroundColor: "#4ade80",
    borderRadius: 10,
    gap: 8,
  },
  analyzeButtonDisabled: {
    backgroundColor: "#86efac",
  },
  analyzeText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});