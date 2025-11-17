import tensorflow as tf
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import classification_report, confusion_matrix
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import os
import pandas as pd
from PIL import Image
import random

class ModelTester:
    def __init__(self, model_path, test_data_dir, img_size=(224, 224)):
        self.model_path = model_path
        self.test_data_dir = test_data_dir
        self.img_size = img_size
        self.model = None
        self.class_names = None
        self.load_model()
        
    def load_model(self):
        """Load the trained model"""
        print("Loading model...")
        try:
            self.model = tf.keras.models.load_model(self.model_path)
            print("Model loaded successfully!")
            print(f"Model input shape: {self.model.input_shape}")
        except Exception as e:
            print(f"Error loading model: {e}")
            return False
        return True
    
    def load_test_data(self):
        """Load and prepare test data"""
        print("\nLoading test data...")
        
        test_datagen = ImageDataGenerator(rescale=1./255)
        
        test_generator = test_datagen.flow_from_directory(
            directory=self.test_data_dir,
            target_size=self.img_size,
            batch_size=32,
            class_mode='categorical',
            shuffle=False  
        )
        
        self.class_names = list(test_generator.class_indices.keys())
        print(f"Test data loaded: {test_generator.samples} images")
        print(f"Class names: {self.class_names}")
        
        return test_generator
    
    def evaluate_accuracy(self, test_generator):
        """Evaluate overall accuracy"""
        print("\n" + "="*50)
        print("EVALUATING MODEL ACCURACY")
        print("="*50)
        
        y_true = test_generator.classes
        predictions = self.model.predict(test_generator, verbose=1)
        y_pred = np.argmax(predictions, axis=1)
        
        accuracy = np.sum(y_true == y_pred) / len(y_true)
        
        print(f"OVERALL TEST ACCURACY: {accuracy:.4f} ({accuracy*100:.2f}%)")
        
        if accuracy >= 0.90:
            print("EXCELLENT! Model is highly accurate")
        elif accuracy >= 0.80:
            print("VERY GOOD! Model is reliable for practical use")
        elif accuracy >= 0.70:
            print("GOOD, but consider improvements")
        else:
            print("NEEDS IMPROVEMENT - Model may not be reliable")
            
        return y_true, y_pred, predictions
    
    def per_class_accuracy(self, y_true, y_pred):
        """Calculate accuracy for each class"""
        print("\n" + "="*50)
        print("PER-CLASS ACCURACY ANALYSIS")
        print("="*50)
        
        class_accuracies = {}
        
        for i, class_name in enumerate(self.class_names):
            class_mask = y_true == i
            if np.sum(class_mask) > 0:  
                class_accuracy = np.sum(y_pred[class_mask] == i) / np.sum(class_mask)
                class_accuracies[class_name] = class_accuracy

                    
                print(f"{class_name}: {class_accuracy:.4f} ({class_accuracy*100:.2f}%)")
        
        return class_accuracies
    
    def confusion_matrix_analysis(self, y_true, y_pred):
        """Create and analyze confusion matrix"""
        print("\n" + "="*50)
        print("CONFUSION MATRIX ANALYSIS")
        print("="*50)
        
        # Calculate confusion matrix
        cm = confusion_matrix(y_true, y_pred)
        
        # Plot confusion matrix
        plt.figure(figsize=(10, 8))
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                    xticklabels=self.class_names, 
                    yticklabels=self.class_names)
        plt.title('Confusion Matrix')
        plt.xlabel('Predicted Label')
        plt.ylabel('True Label')
        plt.xticks(rotation=45)
        plt.yticks(rotation=0)
        plt.tight_layout()
        plt.savefig('../confusion_matrix.png', dpi=300, bbox_inches='tight')
        plt.show()
        
        print("\nTop Confusions (where model makes mistakes):")
        confusions = []
        for i in range(len(self.class_names)):
            for j in range(len(self.class_names)):
                if i != j and cm[i, j] > 0:
                    confusions.append((cm[i, j], self.class_names[i], self.class_names[j]))
        
        confusions.sort(reverse=True)
        for freq, true_class, pred_class in confusions[:5]:
            print(f"  {true_class} → {pred_class}: {freq} times")
    
    def detailed_classification_report(self, y_true, y_pred):
        """Generate detailed classification metrics"""
        print("\n" + "="*50)
        print("DETAILED CLASSIFICATION REPORT")
        print("="*50)
        
        report = classification_report(y_true, y_pred, 
                                     target_names=self.class_names,
                                     digits=4)
        print(report)
    
    def test_single_image(self, image_path):
        """Test the model on a single image"""
        print(f"\nTesting single image: {os.path.basename(image_path)}")
        
        img = Image.open(image_path)
        img = img.resize(self.img_size)
        img_array = np.array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        
        prediction = self.model.predict(img_array, verbose=0)
        predicted_class_idx = np.argmax(prediction[0])
        confidence = prediction[0][predicted_class_idx]
        
        predicted_class = self.class_names[predicted_class_idx]
        
        print(f"Image: {os.path.basename(image_path)}")
        print(f"Predicted: {predicted_class}")
        print(f"Confidence: {confidence:.4f} ({confidence*100:.2f}%)")
        
        top_3_idx = np.argsort(prediction[0])[-3:][::-1]
        print("\nTop 3 predictions:")
        for i, idx in enumerate(top_3_idx):
            conf = prediction[0][idx]
            print(f"  {i+1}. {self.class_names[idx]}: {conf:.4f} ({conf*100:.2f}%)")
        
        return predicted_class, confidence
    
    def test_random_samples(self, test_generator, num_samples=5):
        """Test random samples from test set"""
        print(f"\n" + "="*50)
        print(f"TESTING {num_samples} RANDOM SAMPLES")
        print("="*50)
        
        test_files = test_generator.filenames
        y_true = test_generator.classes
        predictions = self.model.predict(test_generator, verbose=0)
        y_pred = np.argmax(predictions, axis=1)
        
        random_indices = random.sample(range(len(test_files)), min(num_samples, len(test_files)))
        
        correct_count = 0
        for i, idx in enumerate(random_indices):
            true_class = self.class_names[y_true[idx]]
            pred_class = self.class_names[y_pred[idx]]
            confidence = predictions[idx][y_pred[idx]]
            
            status = "CORRECT" if true_class == pred_class else " WRONG"
            if true_class == pred_class:
                correct_count += 1
                
            print(f"\nSample {i+1}:")
            print(f"  Image: {test_files[idx]}")
            print(f"  True: {true_class}")
            print(f"  Predicted: {pred_class}")
            print(f"  Confidence: {confidence:.4f}")
            print(f"  Status: {status}")
        
        print(f"\nRandom sample accuracy: {correct_count}/{num_samples} ({correct_count/num_samples*100:.1f}%)")
    
    def model_summary(self):
        """Print model architecture summary"""
        print("\n" + "="*50)
        print("MODEL ARCHITECTURE SUMMARY")
        print("="*50)
        self.model.summary()

def main():
    MODEL_PATH = r"C:\Users\johnr\Sideline Projects\Mango Disease\MachineLearning\mango_disease_model.keras"
    TEST_DATA_DIR = r"C:\Users\johnr\Sideline Projects\Mango Disease\MachineLearning\mango project\data\processed\test"
    
    SINGLE_IMAGE_PATH = None  
    
    print("MANGO DISEASE MODEL TESTING SUITE")
    print("="*60)
    
    tester = ModelTester(MODEL_PATH, TEST_DATA_DIR)
    
    if not tester.model:
        print("Failed to load model. Exiting.")
        return
    
    test_generator = tester.load_test_data()
    
    y_true, y_pred, predictions = tester.evaluate_accuracy(test_generator)
    tester.per_class_accuracy(y_true, y_pred)
    tester.confusion_matrix_analysis(y_true, y_pred)
    tester.detailed_classification_report(y_true, y_pred)
    tester.test_random_samples(test_generator, num_samples=8)
    
    if SINGLE_IMAGE_PATH and os.path.exists(SINGLE_IMAGE_PATH):
        tester.test_single_image(SINGLE_IMAGE_PATH)
    
    tester.model_summary()
    
    print("\n" + "="*60)
    print("TESTING COMPLETE!")
    print("="*60)
    print("Check the generated 'confusion_matrix.png' for visual analysis")
    print("Look for:")
    print("  - Overall accuracy > 80% for reliable performance")
    print("  - Consistent performance across all classes")
    print("  - Clear diagonal pattern in confusion matrix")

if __name__ == "__main__":
    main()