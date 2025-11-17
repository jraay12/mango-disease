import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import matplotlib.pyplot as plt
import numpy as np
import os


tf.random.set_seed(42)
np.random.seed(42)

class MangoDiseaseClassifier:
    def __init__(self, data_dir, img_size=(224, 224), batch_size=32):
        self.data_dir = data_dir
        self.img_size = img_size
        self.batch_size = batch_size
        self.class_names = None
        self.model = None
        
    def create_data_generators(self):
        """Create data generators with augmentation for training"""
        
        train_datagen = ImageDataGenerator(
            rescale=1./255,
            rotation_range=20,
            width_shift_range=0.2,
            height_shift_range=0.2,
            shear_range=0.2,
            zoom_range=0.2,
            horizontal_flip=True,
            fill_mode='nearest'
        )
        
        val_test_datagen = ImageDataGenerator(rescale=1./255)
        
        train_generator = train_datagen.flow_from_directory(
            directory=os.path.join(self.data_dir, 'train'),
            target_size=self.img_size,
            batch_size=self.batch_size,
            class_mode='categorical',
            shuffle=True,
            seed=42
        )
        
        val_generator = val_test_datagen.flow_from_directory(
            directory=os.path.join(self.data_dir, 'val'),
            target_size=self.img_size,
            batch_size=self.batch_size,
            class_mode='categorical',
            shuffle=False,
            seed=42
        )
        
        test_generator = val_test_datagen.flow_from_directory(
            directory=os.path.join(self.data_dir, 'test'),
            target_size=self.img_size,
            batch_size=self.batch_size,
            class_mode='categorical',
            shuffle=False,
            seed=42
        )
        
        self.class_names = list(train_generator.class_indices.keys())
        print(f"Class names: {self.class_names}")
        print(f"Training samples: {train_generator.samples}")
        print(f"Validation samples: {val_generator.samples}")
        print(f"Test samples: {test_generator.samples}")
        
        return train_generator, val_generator, test_generator
    
    def create_model(self, num_classes):
        """Create a model using transfer learning with MobileNetV2"""
        
        base_model = tf.keras.applications.MobileNetV2(
            weights='imagenet',
            include_top=False,
            input_shape=(*self.img_size, 3)
        )
        
        base_model.trainable = False
        
        inputs = keras.Input(shape=(*self.img_size, 3))
        x = base_model(inputs, training=False)
        x = layers.GlobalAveragePooling2D()(x)
        x = layers.Dropout(0.3)(x)
        x = layers.Dense(128, activation='relu')(x)
        x = layers.BatchNormalization()(x)
        x = layers.Dropout(0.3)(x)
        outputs = layers.Dense(num_classes, activation='softmax')(x)
        
        model = keras.Model(inputs, outputs)
        
        model.compile(
            optimizer=keras.optimizers.Adam(learning_rate=0.001),
            loss='categorical_crossentropy',
            metrics=['accuracy']
        )
        
        self.model = model
        return model
    
    def train(self, epochs=15, fine_tune_epochs=10):
        """Train the model in two phases: feature extraction and fine-tuning"""
        
        train_gen, val_gen, test_gen = self.create_data_generators()
        num_classes = len(self.class_names)
        
        if self.model is None:
            self.create_model(num_classes)
        
        print("Phase 1: Feature Extraction")
        print(self.model.summary())
        
        callbacks = [
            keras.callbacks.EarlyStopping(
                monitor='val_accuracy',
                patience=5,
                restore_best_weights=True
            ),
            keras.callbacks.ReduceLROnPlateau(
                monitor='val_loss',
                factor=0.2,
                patience=3,
                min_lr=1e-7
            )
        ]
        
        print("\nStarting Phase 1 training...")
        history1 = self.model.fit(
            train_gen,
            epochs=epochs,
            validation_data=val_gen,
            callbacks=callbacks,
            verbose=1
        )
        
        print("\nPhase 2: Fine-tuning")
        
        self.model.layers[1].trainable = True
        
        fine_tune_at = 100
        
        for layer in self.model.layers[1].layers[:fine_tune_at]:
            layer.trainable = False
        
        self.model.compile(
            optimizer=keras.optimizers.Adam(learning_rate=0.0001/10),
            loss='categorical_crossentropy',
            metrics=['accuracy']
        )
        
        print(f"Number of trainable layers in base model: {sum([layer.trainable for layer in self.model.layers[1].layers])}")
        
        history2 = self.model.fit(
            train_gen,
            initial_epoch=history1.epoch[-1] + 1,
            epochs=history1.epoch[-1] + 1 + fine_tune_epochs,
            validation_data=val_gen,
            callbacks=callbacks,
            verbose=1
        )
        
        combined_history = {}
        for key in history1.history.keys():
            combined_history[key] = history1.history[key] + history2.history[key]
        
        return combined_history, test_gen
    
    def evaluate(self, test_generator):
        """Evaluate the model on test set"""
        if self.model is None:
            print("No model to evaluate!")
            return
        
        print("\n=== Final Evaluation ===")
        test_loss, test_accuracy = self.model.evaluate(test_generator, verbose=1)
        print(f"Test Accuracy: {test_accuracy:.4f}")
        print(f"Test Loss: {test_loss:.4f}")
        
        return test_accuracy, test_loss
    
    def plot_training_history(self, history):
        """Plot training history"""
        plt.figure(figsize=(12, 4))
        
        plt.subplot(1, 2, 1)
        plt.plot(history['accuracy'], label='Training Accuracy')
        plt.plot(history['val_accuracy'], label='Validation Accuracy')
        plt.title('Model Accuracy')
        plt.xlabel('Epoch')
        plt.ylabel('Accuracy')
        plt.legend()
        
        plt.subplot(1, 2, 2)
        plt.plot(history['loss'], label='Training Loss')
        plt.plot(history['val_loss'], label='Validation Loss')
        plt.title('Model Loss')
        plt.xlabel('Epoch')
        plt.ylabel('Loss')
        plt.legend()
        
        plt.tight_layout()
        
        plot_path = r"C:\Users\johnr\Sideline Projects\Mango Disease\MachineLearning\training_history.png"
        plt.savefig(plot_path, dpi=300, bbox_inches='tight')
        print(f"Training plot saved to: {plot_path}")
        plt.show()

def main():
    DATA_DIR = r"C:\Users\johnr\Sideline Projects\Mango Disease\MachineLearning\mango project\data\processed"
    IMG_SIZE = (224, 224)
    BATCH_SIZE = 16  
    EPOCHS = 15
    FINE_TUNE_EPOCHS = 10
    
    if not os.path.exists(DATA_DIR):
        print(f"Error: Data directory '{DATA_DIR}' not found!")
        print("Please run split_data.py first to create the train/val/test split.")
        return
    
    classifier = MangoDiseaseClassifier(DATA_DIR, IMG_SIZE, BATCH_SIZE)
    
    print("Starting model training...")
    history, test_gen = classifier.train(EPOCHS, FINE_TUNE_EPOCHS)
    
    classifier.evaluate(test_gen)
    
    classifier.plot_training_history(history)
    
    model_path = r"C:\Users\johnr\Sideline Projects\Mango Disease\MachineLearning\mango_disease_model.keras"
    classifier.model.save(model_path)
    print(f"Model saved as: {model_path}")

if __name__ == "__main__":
    main()