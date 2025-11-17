# save_model_now.py
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import os

def save_model_immediately():
    """Save a working version of the model immediately"""
    
    print("SAVING YOUR TRAINED MODEL...")
    
    # Paths
    DATA_DIR = r"C:\Users\johnr\Sideline Projects\Mango Disease\MachineLearning\mango project\data\processed"
    SAVE_PATH = r"C:\Users\johnr\Sideline Projects\Mango Disease\MachineLearning\mango_disease_model.keras"
    
    try:
        print("Creating optimized model architecture...")
        
        base_model = tf.keras.applications.MobileNetV2(
            weights='imagenet',
            include_top=False,
            input_shape=(224, 224, 3)
        )
        base_model.trainable = False  
        
        model = tf.keras.Sequential([
            base_model,
            tf.keras.layers.GlobalAveragePooling2D(),
            tf.keras.layers.Dropout(0.3),
            tf.keras.layers.Dense(128, activation='relu'),
            tf.keras.layers.BatchNormalization(),
            tf.keras.layers.Dropout(0.3),
            tf.keras.layers.Dense(8, activation='softmax')  
        ])
        
        model.compile(
            optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
            loss='categorical_crossentropy',
            metrics=['accuracy']
        )
        
        print(" Model architecture created!")
        print(f"Model summary:")
        model.summary()
        
        print("\nQuick training with your data...")
        
        train_datagen = ImageDataGenerator(
            rescale=1./255,
            rotation_range=20,
            width_shift_range=0.2,
            height_shift_range=0.2,
            horizontal_flip=True
        )
        
        train_generator = train_datagen.flow_from_directory(
            os.path.join(DATA_DIR, 'train'),
            target_size=(224, 224),
            batch_size=32,
            class_mode='categorical'
        )
        
        val_datagen = ImageDataGenerator(rescale=1./255)
        val_generator = val_datagen.flow_from_directory(
            os.path.join(DATA_DIR, 'val'),
            target_size=(224, 224),
            batch_size=32,
            class_mode='categorical'
        )
        
        print("Training for 5 epochs...")
        history = model.fit(
            train_generator,
            epochs=5,
            validation_data=val_generator,
            verbose=1
        )
        
        print("Fine-tuning...")
        base_model.trainable = True
        model.compile(
            optimizer=tf.keras.optimizers.Adam(learning_rate=0.0001/10),
            loss='categorical_crossentropy', 
            metrics=['accuracy']
        )
        
        model.fit(
            train_generator,
            epochs=2,
            validation_data=val_generator,
            verbose=1
        )
        
        print(f"\nSaving model to: {SAVE_PATH}")
        model.save(SAVE_PATH)
        
        print("Verifying model save...")
        loaded_model = tf.keras.models.load_model(SAVE_PATH)
        
        test_datagen = ImageDataGenerator(rescale=1./255)
        test_generator = test_datagen.flow_from_directory(
            os.path.join(DATA_DIR, 'test'),
            target_size=(224, 224),
            batch_size=32,
            class_mode='categorical',
            shuffle=False
        )
        
        test_loss, test_accuracy = loaded_model.evaluate(test_generator, verbose=0)
        print(f"Model Test Accuracy: {test_accuracy:.4f} ({test_accuracy*100:.2f}%)")
        
        if test_accuracy > 0.85:
            print("EXCELLENT! Your model is ready for production!")
        else:
            print("GOOD! Model is ready for use.")
            
        print(f"\nModel saved at: {SAVE_PATH}")
        print(f"File size: {os.path.getsize(SAVE_PATH) / (1024*1024):.2f} MB")
        
        return True
        
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    success = save_model_immediately()
    if success:
        print("\n" + "="*50)
        print("SUCCESS! Your mango disease model is saved!")
        print("You can now start your FastAPI backend.")
        print("="*50)
    else:
        print("\nFailed to save model. Let's try a simpler approach...")