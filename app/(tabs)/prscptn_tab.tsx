import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const imageUri = params.imageUri as string;
  const prediction = params.prediction as string;
  const confidence = parseFloat(params.confidence as string);
  const allPredictions = JSON.parse(params.allPredictions as string);

  const sortedPredictions = [...allPredictions].sort(
    (a, b) => parseFloat(b.confidence) - parseFloat(a.confidence)
  );

  const getDiseaseInfo = (diseaseName: string) => {
    const diseaseData: { [key: string]: { description: string; treatment: string } } = {
      'Healthy': {
        description: 'The leaf appears to be healthy with no visible signs of disease.',
        treatment: 'Continue regular care and monitoring. Maintain proper watering and fertilization.'
      },
      'Anthracnose': {
        description: 'A fungal disease causing dark, sunken lesions on leaves and fruits.',
        treatment: 'Apply copper-based fungicides. Remove infected leaves. Improve air circulation.'
      },
      'Bacterial Canker': {
        description: 'Bacterial infection causing cankers and lesions on branches and leaves.',
        treatment: 'Prune infected areas. Apply copper bactericide. Avoid overhead irrigation.'
      },
      'Cutting Weevil': {
        description: 'Pest damage caused by weevil larvae boring into shoots and stems.',
        treatment: 'Remove and destroy affected parts. Apply appropriate insecticides. Monitor regularly.'
      },
      'Die Back': {
        description: 'Progressive death of shoots, branches, and roots from tip backwards.',
        treatment: 'Prune dead branches. Apply fungicide. Improve drainage and reduce stress.'
      },
      'Gall Midge': {
        description: 'Insect pest causing abnormal growths (galls) on leaves and shoots.',
        treatment: 'Remove and destroy galls. Apply systemic insecticides. Use pheromone traps.'
      },
      'Powdery Mildew': {
        description: 'Fungal disease appearing as white powdery coating on leaves.',
        treatment: 'Apply sulfur-based fungicides. Improve air circulation. Avoid overhead watering.'
      },
      'Sooty Mould': {
        description: 'Black fungal growth on leaves, usually following insect infestation.',
        treatment: 'Control sap-sucking insects first. Wash leaves with water. Apply neem oil.'
      }
    };

    return diseaseData[diseaseName] || {
      description: 'Unknown condition detected.',
      treatment: 'Consult with a local agricultural expert for proper diagnosis.'
    };
  };

  const diseaseInfo = getDiseaseInfo(prediction);
  const isHealthy = prediction === 'Healthy';

  const handleNewScan = () => {
    router.back();
    setTimeout(() => {
      router.back();
    }, 50);
  };

  return (
    <LinearGradient
      colors={["#D5F4DF", "#68952A"]}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={30} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Results</Text>
        <TouchableOpacity onPress={handleNewScan}>
          <Ionicons name="home-outline" size={30} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.image} />
        </View>

        <View style={[styles.predictionCard, isHealthy ? styles.healthyCard : styles.diseaseCard]}>
          <View style={styles.predictionHeader}>
            <Ionicons 
              name={isHealthy ? "checkmark-circle" : "alert-circle"} 
              size={40} 
              color={isHealthy ? "#22c55e" : "#ef4444"} 
            />
            <View style={styles.predictionTextContainer}>
              <Text style={styles.predictionLabel}>Diagnosis</Text>
              <Text style={styles.predictionText}>{prediction}</Text>
            </View>
          </View>
          
          <View style={styles.confidenceContainer}>
            <Text style={styles.confidenceLabel}>Confidence Level</Text>
            <View style={styles.confidenceBar}>
              <View style={[styles.confidenceFill, { width: `${confidence}%` }]} />
            </View>
            <Text style={styles.confidenceText}>{confidence.toFixed(1)}%</Text>
          </View>
        </View>

        {/* Disease Information */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Description</Text>
          <Text style={styles.infoText}>{diseaseInfo.description}</Text>
          
          <Text style={styles.infoTitle}>Recommended Treatment</Text>
          <Text style={styles.infoText}>{diseaseInfo.treatment}</Text>
        </View>

        {/* All Predictions */}
        <View style={styles.allPredictionsCard}>
          <Text style={styles.allPredictionsTitle}>All Predictions</Text>
          {sortedPredictions.map((pred, index) => (
            <View key={index} style={styles.predictionItem}>
              <View style={styles.predictionItemLeft}>
                <Text style={styles.predictionRank}>{index + 1}</Text>
                <Text style={styles.predictionName}>{pred.name}</Text>
              </View>
              <Text style={styles.predictionConfidence}>{pred.confidence}%</Text>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleNewScan}
          >
            <Ionicons name="camera" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>New Scan</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => {/* Add save functionality */}}
          >
            <Ionicons name="save-outline" size={20} color="#4ade80" />
            <Text style={styles.secondaryButtonText}>Save Result</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2d5016',
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  predictionCard: {
    margin: 20,
    marginTop: 10,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  healthyCard: {
    backgroundColor: '#f0fdf4',
  },
  diseaseCard: {
    backgroundColor: '#fef2f2',
  },
  predictionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  predictionTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  predictionLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  predictionText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  confidenceContainer: {
    marginTop: 10,
  },
  confidenceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  confidenceBar: {
    height: 10,
    backgroundColor: '#e5e7eb',
    borderRadius: 5,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: '#4ade80',
    borderRadius: 5,
  },
  confidenceText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 8,
    textAlign: 'right',
  },
  infoCard: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 15,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  allPredictionsCard: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  allPredictionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 15,
  },
  predictionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  predictionItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  predictionRank: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9ca3af',
    width: 30,
  },
  predictionName: {
    fontSize: 14,
    color: '#1f2937',
    flex: 1,
  },
  predictionConfidence: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4ade80',
  },
  actionButtons: {
    flexDirection: 'row',
    margin: 20,
    marginTop: 0,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4ade80',
    paddingVertical: 15,
    borderRadius: 10,
    gap: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#4ade80',
  },
  secondaryButtonText: {
    color: '#4ade80',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpace: {
    height: 40,
  },
});