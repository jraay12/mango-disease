import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const imageUri = params.imageUri as string;
  const prediction = params.prediction as string;
  const confidence = parseFloat(params.confidence as string);
  const allPredictions = (() => {
    try {
      const parsed = JSON.parse(params.allPredictions as string);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn("Failed to parse allPredictions:", error);
      return [];
    }
  })();

  const sortedPredictions = (
    Array.isArray(allPredictions) ? allPredictions : []
  )
    .slice()
    .sort((a, b) => parseFloat(b.confidence) - parseFloat(a.confidence));

  const getDiseaseInfo = (diseaseName: string) => {
    const diseaseData: {
      [key: string]: {
        description: string;
        symptoms: string[];
        causes: string;
        treatment: string[];
        prevention: string[];
        severity: "low" | "medium" | "high";
      };
    } = {
      Healthy: {
        description:
          "The leaf appears to be healthy with no visible signs of disease or pest damage.",
        symptoms: [
          "Green, vibrant leaf color",
          "No spots, lesions, or discoloration",
          "Proper leaf structure and shape",
          "No signs of wilting or damage",
        ],
        causes: "Good plant health maintenance and proper care.",
        treatment: [
          "Continue regular watering schedule",
          "Maintain balanced fertilization",
          "Monitor for any changes in leaf health",
          "Ensure adequate sunlight exposure",
        ],
        prevention: [
          "Regular inspection of plants",
          "Proper spacing for air circulation",
          "Consistent care routine",
          "Maintain soil health with organic matter",
        ],
        severity: "low",
      },
      Anthracnose: {
        description:
          "A fungal disease caused by Colletotrichum gloeosporioides that causes dark, sunken lesions on leaves, stems, and fruits.",
        symptoms: [
          "Dark brown to black spots on leaves",
          "Sunken lesions with defined borders",
          "Premature leaf drop",
          "Black spots on fruits",
          "Die-back of young shoots",
        ],
        causes:
          "Caused by fungal infection, spread through water splash, high humidity, and warm temperatures.",
        treatment: [
          "Remove and destroy all infected plant parts immediately",
          "Apply copper-based fungicides (0.3% copper oxychloride)",
          "Spray Mancozeb 0.25% at 15-day intervals",
          "Use systemic fungicides like Carbendazim",
          "Prune affected branches 6 inches below infected area",
        ],
        prevention: [
          "Improve air circulation by proper pruning",
          "Avoid overhead irrigation",
          "Remove fallen leaves and fruits",
          "Apply preventive fungicide sprays before monsoon",
          "Maintain proper plant spacing",
        ],
        severity: "high",
      },
      "Bacterial Canker": {
        description:
          "Bacterial infection caused by Xanthomonas campestris causing cankers, lesions, and dieback on mango plants.",
        symptoms: [
          "Water-soaked lesions on leaves",
          "Dark brown to black cankers on stems",
          "Gummy exudates from infected areas",
          "Leaf spots with yellow halos",
          "Progressive wilting and dieback",
        ],
        causes:
          "Bacterial infection spread through rain, wind, pruning tools, and insect wounds.",
        treatment: [
          "Prune infected branches during dry weather",
          "Apply copper-based bactericides (Bordeaux mixture 1%)",
          "Spray Streptocycline (100 ppm) at 10-day intervals",
          "Disinfect pruning tools with 70% alcohol",
          "Remove severely infected trees to prevent spread",
        ],
        prevention: [
          "Use disease-free planting material",
          "Avoid injuries to plants during cultivation",
          "Practice proper sanitation",
          "Apply copper sprays preventively",
          "Control insect vectors",
        ],
        severity: "high",
      },
      "Cutting Weevil": {
        description:
          "Pest damage caused by mango stem borer weevil (Hypomeces squamosus) larvae that bore into young shoots and stems.",
        symptoms: [
          "Wilting of young shoots",
          "Holes in stems with frass outside",
          "Yellowing and drooping of leaves",
          "Stunted growth of affected shoots",
          "Dead and dried young branches",
        ],
        causes:
          "Adult weevils lay eggs in stem tissue; larvae bore into stems causing damage.",
        treatment: [
          "Prune and destroy infested shoots immediately",
          "Apply Chlorpyrifos 20 EC (2 ml/liter) to stems",
          "Inject Monocrotophos into bore holes with cotton swab",
          "Use systemic insecticides like Imidacloprid",
          "Remove and burn severely damaged branches",
        ],
        prevention: [
          "Regular monitoring of young shoots",
          "Remove egg-laying sites",
          "Wrap young stems with newspaper during egg-laying period",
          "Maintain tree vigor with proper nutrition",
          "Use pheromone traps to monitor adult population",
        ],
        severity: "medium",
      },
      "Die Back": {
        description:
          "Progressive death of shoots, branches, and twigs starting from the tip and moving backwards, caused by Lasiodiplodia theobromae fungus.",
        symptoms: [
          "Drying of twigs from tip downwards",
          "Browning and withering of leaves",
          "Black discoloration under bark",
          "Gum exudation from affected areas",
          "Complete death of branches in severe cases",
        ],
        causes:
          "Fungal infection favored by water stress, poor drainage, and nutrient deficiency.",
        treatment: [
          "Prune dead and dying branches 15-20 cm below infection",
          "Apply Bordeaux paste (10%) on cut surfaces",
          "Spray Copper oxychloride 0.3% on entire tree",
          "Use Carbendazim 0.1% as systemic fungicide",
          "Improve soil drainage and fertility",
        ],
        prevention: [
          "Ensure proper irrigation during dry periods",
          "Improve soil drainage",
          "Apply balanced fertilizers regularly",
          "Avoid water stress",
          "Conduct preventive spraying before flowering",
        ],
        severity: "high",
      },
      "Gall Midge": {
        description:
          "Insect pest (Procontarinia matteiana) that causes abnormal growths (galls) on leaves, flowers, and young fruits.",
        symptoms: [
          "Cone-shaped galls on leaf surfaces",
          "Distorted and curled leaves",
          "Small white larvae inside galls",
          "Reduced flowering and fruiting",
          "Premature dropping of affected leaves",
        ],
        causes:
          "Adult midges lay eggs in tender plant tissue; larvae develop inside causing gall formation.",
        treatment: [
          "Remove and destroy all galls immediately",
          "Spray Dimethoate 30 EC (2 ml/liter)",
          "Apply Imidacloprid 17.8 SL (0.3 ml/liter)",
          "Use Thiamethoxam 25 WG for systemic control",
          "Repeat sprays at 15-day intervals",
        ],
        prevention: [
          "Regular inspection of new flushes",
          "Remove and burn affected plant parts",
          "Use yellow sticky traps to monitor adults",
          "Spray neem oil 3% during new leaf emergence",
          "Maintain orchard cleanliness",
        ],
        severity: "medium",
      },
      "Powdery Mildew": {
        description:
          "Fungal disease caused by Oidium mangiferae appearing as white powdery coating on leaves, flowers, and young fruits.",
        symptoms: [
          "White powdery coating on leaf surfaces",
          "Affected leaves become pale and distorted",
          "Flower infection leads to poor fruit set",
          "Young fruits covered with white powder",
          "Premature leaf and fruit drop",
        ],
        causes:
          "Fungal infection favored by dry weather, high humidity at night, and moderate temperatures.",
        treatment: [
          "Spray Sulfur 80% WP (2.5 g/liter)",
          "Apply Hexaconazole 5% EC (2 ml/liter)",
          "Use Triadimefon 25% WP (1 g/liter)",
          "Spray at 15-day intervals until disease is controlled",
          "Apply during early morning or evening",
        ],
        prevention: [
          "Prune to improve air circulation",
          "Avoid excessive nitrogen fertilization",
          "Spray preventive sulfur before flowering",
          "Remove and destroy heavily infected parts",
          "Plant resistant varieties when possible",
        ],
        severity: "medium",
      },
      "Sooty Mould": {
        description:
          "Black fungal growth on leaves and branches, developing on honeydew secreted by sap-sucking insects like scales, mealybugs, and aphids.",
        symptoms: [
          "Black sooty coating on leaves and stems",
          "Reduced photosynthesis",
          "Sticky honeydew on plant surfaces",
          "Presence of scale insects or mealybugs",
          "Weakened plant growth",
        ],
        causes:
          "Secondary fungal growth on honeydew excreted by sap-sucking insects.",
        treatment: [
          "Control primary pests (scales, mealybugs, aphids) first",
          "Spray Dimethoate 30 EC (2 ml/liter) for insect control",
          "Wash leaves with water or soap solution",
          "Apply Neem oil 3% to remove sooty layer",
          "Improve air circulation through pruning",
        ],
        prevention: [
          "Regular monitoring for sap-sucking insects",
          "Use yellow sticky traps",
          "Encourage natural predators like ladybirds",
          "Spray neem oil preventively",
          "Maintain tree health with proper nutrition",
        ],
        severity: "low",
      },
    };

    return (
      diseaseData[diseaseName] || {
        description: "Unknown condition detected. Further examination needed.",
        symptoms: ["Unidentified symptoms"],
        causes: "Unknown cause",
        treatment: ["Consult with a local agricultural expert"],
        prevention: ["Regular monitoring and care"],
        severity: "medium" as const,
      }
    );
  };

  const diseaseInfo = getDiseaseInfo(prediction);
  const isHealthy = prediction === "Healthy";

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low":
        return "#22c55e";
      case "medium":
        return "#f59e0b";
      case "high":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case "low":
        return "Low Risk";
      case "medium":
        return "Moderate Risk";
      case "high":
        return "High Risk";
      default:
        return "Unknown";
    }
  };

  const handleNewScan = () => {
    router.back();
  };

  return (
    <LinearGradient colors={["#D5F4DF", "#68952A"]} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={30} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analysis Results</Text>
        <TouchableOpacity onPress={handleNewScan}>
          <Ionicons name="camera" size={30} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Preview */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.image} />
        </View>

        {/* Main Prediction Card */}
        <View
          style={[
            styles.predictionCard,
            isHealthy ? styles.healthyCard : styles.diseaseCard,
          ]}
        >
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

          {/* Confidence Level */}
          {/* <View style={styles.confidenceContainer}>
            <Text style={styles.confidenceLabel}>Confidence Level</Text>
            <View style={styles.confidenceBar}>
              <View
                style={[styles.confidenceFill, { width: `${confidence}%` }]}
              />
            </View>
            <Text style={styles.confidenceText}>{confidence.toFixed(1)}%</Text>
          </View> */}

          {/* Severity Badge */}
          {!isHealthy && (
            <View
              style={[
                styles.severityBadge,
                { backgroundColor: getSeverityColor(diseaseInfo.severity) },
              ]}
            >
              <Ionicons name="warning" size={16} color="#fff" />
              <Text style={styles.severityText}>
                {getSeverityText(diseaseInfo.severity)}
              </Text>
            </View>
          )}
        </View>

        {/* Description */}
        <View style={styles.infoCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={24} color="#2d5016" />
            <Text style={styles.infoTitle}>Description</Text>
          </View>
          <Text style={styles.infoText}>{diseaseInfo.description}</Text>
        </View>

        {/* Symptoms */}
        <View style={styles.infoCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="medical" size={24} color="#2d5016" />
            <Text style={styles.infoTitle}>Symptoms</Text>
          </View>
          {diseaseInfo.symptoms.map((symptom, index) => (
            <View key={index} style={styles.listItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.listItemText}>{symptom}</Text>
            </View>
          ))}
        </View>

        {/* Causes */}
        <View style={styles.infoCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="help-circle" size={24} color="#2d5016" />
            <Text style={styles.infoTitle}>Causes</Text>
          </View>
          <Text style={styles.infoText}>{diseaseInfo.causes}</Text>
        </View>

        {/* Treatment */}
        <View style={[styles.infoCard, styles.treatmentCard]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="medkit" size={24} color="#fff" />
            <Text style={[styles.infoTitle, styles.treatmentTitle]}>
              Treatment Plan
            </Text>
          </View>
          {diseaseInfo.treatment.map((step, index) => (
            <View key={index} style={styles.treatmentItem}>
              <View style={styles.treatmentNumber}>
                <Text style={styles.treatmentNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.treatmentItemText}>{step}</Text>
            </View>
          ))}
        </View>

        {/* Prevention */}
        <View style={styles.infoCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="shield-checkmark" size={24} color="#2d5016" />
            <Text style={styles.infoTitle}>Prevention Tips</Text>
          </View>
          {diseaseInfo.prevention.map((tip, index) => (
            <View key={index} style={styles.listItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4ade80" />
              <Text style={styles.listItemText}>{tip}</Text>
            </View>
          ))}
        </View>

        {/* All Predictions */}
        {/* <View style={styles.allPredictionsCard}>
          <Text style={styles.allPredictionsTitle}>All Predictions</Text>
          {sortedPredictions.map((pred, index) => (
            <View key={index} style={styles.predictionItem}>
              <View style={styles.predictionItemLeft}>
                <Text style={styles.predictionRank}>{index + 1}</Text>
                <Text style={styles.predictionName}>{pred.name}</Text>
              </View>
              <View style={styles.predictionConfidenceContainer}>
                <View style={[styles.miniConfidenceBar, { width: 60 }]}>
                  <View
                    style={[
                      styles.miniConfidenceFill,
                      { width: `${pred.confidence}%` },
                    ]}
                  />
                </View>
                <Text style={styles.predictionConfidence}>
                  {pred.confidence}%
                </Text>
              </View>
            </View>
          ))}
        </View> */}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={handleNewScan}>
            <Ionicons name="camera" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>New Scan</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => {
              /* Add save functionality */
            }}
          >
            <Ionicons name="bookmark-outline" size={20} color="#4ade80" />
            <Text style={styles.secondaryButtonText}>Save Report</Text>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2d5016",
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    margin: 20,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  image: {
    width: "100%",
    height: 300,
    resizeMode: "cover",
  },
  predictionCard: {
    margin: 20,
    marginTop: 10,
    padding: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  healthyCard: {
    backgroundColor: "#f0fdf4",
  },
  diseaseCard: {
    backgroundColor: "#fef2f2",
  },
  predictionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  predictionTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  predictionLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  predictionText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
  },
  confidenceContainer: {
    marginTop: 10,
  },
  confidenceLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  confidenceBar: {
    height: 10,
    backgroundColor: "#e5e7eb",
    borderRadius: 5,
    overflow: "hidden",
  },
  confidenceFill: {
    height: "100%",
    backgroundColor: "#4ade80",
    borderRadius: 5,
  },
  confidenceText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginTop: 8,
    textAlign: "right",
  },
  severityBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 15,
    gap: 6,
  },
  severityText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  infoCard: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 10,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2d5016",
  },
  infoText: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 22,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
    gap: 10,
  },
  bulletPoint: {
    fontSize: 18,
    color: "#4ade80",
    fontWeight: "bold",
    marginTop: -2,
  },
  listItemText: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 20,
    flex: 1,
  },
  treatmentCard: {
    backgroundColor: "#2d5016",
  },
  treatmentTitle: {
    color: "#fff",
  },
  treatmentItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 15,
    gap: 12,
  },
  treatmentNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#4ade80",
    justifyContent: "center",
    alignItems: "center",
  },
  treatmentNumberText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  treatmentItemText: {
    fontSize: 14,
    color: "#fff",
    lineHeight: 20,
    flex: 1,
    marginTop: 4,
  },
  allPredictionsCard: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  allPredictionsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 15,
  },
  predictionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  predictionItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  predictionRank: {
    fontSize: 16,
    fontWeight: "600",
    color: "#9ca3af",
    width: 30,
  },
  predictionName: {
    fontSize: 14,
    color: "#1f2937",
    flex: 1,
  },
  predictionConfidenceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  miniConfidenceBar: {
    height: 6,
    backgroundColor: "#e5e7eb",
    borderRadius: 3,
    overflow: "hidden",
  },
  miniConfidenceFill: {
    height: "100%",
    backgroundColor: "#4ade80",
    borderRadius: 3,
  },
  predictionConfidence: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4ade80",
    minWidth: 45,
    textAlign: "right",
  },
  warningCard: {
    flexDirection: "row",
    margin: 20,
    marginTop: 0,
    padding: 15,
    backgroundColor: "#fffbeb",
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#f59e0b",
    gap: 12,
    alignItems: "flex-start",
  },
  warningText: {
    fontSize: 13,
    color: "#92400e",
    lineHeight: 18,
    flex: 1,
  },
  actionButtons: {
    flexDirection: "row",
    margin: 20,
    marginTop: 0,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4ade80",
    paddingVertical: 15,
    borderRadius: 10,
    gap: 8,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#4ade80",
  },
  secondaryButtonText: {
    color: "#4ade80",
    fontSize: 16,
    fontWeight: "600",
  },
  bottomSpace: {
    height: 40,
  },
});
