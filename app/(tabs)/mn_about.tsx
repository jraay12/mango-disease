import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function AboutScreen() {
  const router = useRouter();

  const handleLinkPress = (url: string) => {
    Linking.openURL(url).catch((err) =>
      console.error("Failed to open URL:", err)
    );
  };

  return (
    <LinearGradient colors={["#D5F4DF", "#68952A"]} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={30} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>About This App</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* App Info Section */}
        <View style={styles.section}>
          <View style={styles.logoContainer}>
            <Ionicons name="leaf" size={60} color="#2d5016" />
            <Text style={styles.appName}>SmartLeaf</Text>
            <Text style={styles.version}>Version 1.0.0</Text>
          </View>
        </View>

        {/* Description Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="information-circle" size={24} color="#2d5016" />
            <Text style={styles.cardTitle}>What is SmartLeaf?</Text>
          </View>
          <Text style={styles.cardText}>
            SmartLeaf is an AI-powered mobile application designed to help
            farmers and agricultural enthusiasts identify diseases in mango
            plants quickly and accurately. Using advanced machine learning
            technology, the app can analyze leaf images and provide instant
            diagnosis with treatment recommendations.
          </Text>
        </View>

        {/* Features Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="sparkles" size={24} color="#2d5016" />
            <Text style={styles.cardTitle}>Key Features</Text>
          </View>
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Ionicons name="camera" size={20} color="#4ade80" />
              <Text style={styles.featureText}>
                Instant disease detection from photos
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="analytics" size={20} color="#4ade80" />
              <Text style={styles.featureText}>
                AI-powered analysis with confidence scores
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="medkit" size={20} color="#4ade80" />
              <Text style={styles.featureText}>
                Treatment recommendations and prescriptions
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="time" size={20} color="#4ade80" />
              <Text style={styles.featureText}>
                History tracking of analyzed images
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="shield-checkmark" size={20} color="#4ade80" />
              <Text style={styles.featureText}>
                Accurate disease classification
              </Text>
            </View>
          </View>
        </View>

        {/* How to Use Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="help-circle" size={24} color="#2d5016" />
            <Text style={styles.cardTitle}>How to Use</Text>
          </View>
          <View style={styles.stepsList}>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.stepText}>
                Capture or upload a clear photo of the mango leaf
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepText}>
                Tap "Analyze" to process the image
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.stepText}>
                View the diagnosis results and confidence score
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>4</Text>
              </View>
              <Text style={styles.stepText}>
                Check prescription tab for treatment details
              </Text>
            </View>
          </View>
        </View>

        {/* Technology Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="laptop" size={24} color="#2d5016" />
            <Text style={styles.cardTitle}>Technology</Text>
          </View>
          <Text style={styles.cardText}>
            SmartLeaf uses deep learning models trained on thousands of mango
            leaf images to identify various diseases including Anthracnose,
            Bacterial Canker, Cutting Weevil, Die Back, Gall Midge, Powdery
            Mildew, Sooty Mould, and healthy leaves.
          </Text>
        </View>

        {/* Developer Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="code-slash" size={24} color="#2d5016" />
            <Text style={styles.cardTitle}>Developers</Text>
          </View>
          <Text style={styles.cardText}>
            Developed by passionate students dedicated to helping the
            agricultural community through innovative technology solutions.
          </Text>
        </View>


        {/* Disclaimer Section */}
        <View style={[styles.card, styles.disclaimerCard]}>
          <View style={styles.cardHeader}>
            <Ionicons name="warning" size={24} color="#FF9800" />
            <Text style={[styles.cardTitle, { color: "#FF9800" }]}>
              Important Notice
            </Text>
          </View>
          <Text style={styles.cardText}>
            This app provides preliminary disease identification and should not
            replace professional agricultural advice. For severe infections or
            uncertain diagnoses, please consult with certified agricultural
            experts or plant pathologists.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2024 SmartLeaf. All rights reserved.
          </Text>
          <Text style={styles.footerSubtext}>
            Made with ❤️ for farmers and agriculture
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: "center",
    position: "relative",
  },
  backBtn: {
    position: "absolute",
    left: 20,
    top: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2d5016",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  section: {
    marginBottom: 20,
  },
  logoContainer: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    padding: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appName: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2d5016",
    marginTop: 10,
  },
  version: {
    fontSize: 16,
    color: "#666",
    marginTop: 5,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  disclaimerCard: {
    backgroundColor: "rgba(255, 249, 196, 0.9)",
    borderLeftWidth: 4,
    borderLeftColor: "#FF9800",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2d5016",
    marginLeft: 10,
  },
  cardText: {
    fontSize: 15,
    color: "#333",
    lineHeight: 24,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  featureText: {
    fontSize: 15,
    color: "#333",
    marginLeft: 12,
    flex: 1,
  },
  stepsList: {
    gap: 15,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#4ade80",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  stepText: {
    fontSize: 15,
    color: "#333",
    flex: 1,
    lineHeight: 22,
    paddingTop: 4,
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f9ff",
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#4ade80",
  },
  contactButtonText: {
    fontSize: 16,
    color: "#2d5016",
    marginLeft: 10,
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
    paddingVertical: 20,
    marginTop: 10,
  },
  footerText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  footerSubtext: {
    fontSize: 12,
    color: "#999",
    marginTop: 5,
    textAlign: "center",
  },
});