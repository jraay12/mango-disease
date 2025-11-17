import os
import shutil
import random
from sklearn.model_selection import train_test_split

def split_dataset(source_dir, output_dir, train_ratio=0.7, val_ratio=0.15, test_ratio=0.15):
    """
    Split dataset into train, validation, and test sets
    """
    
    train_dir = os.path.join(output_dir, 'train')
    val_dir = os.path.join(output_dir, 'val') 
    test_dir = os.path.join(output_dir, 'test')
    
    for dir_path in [train_dir, val_dir, test_dir]:
        os.makedirs(dir_path, exist_ok=True)
    
    classes = [d for d in os.listdir(source_dir) 
               if os.path.isdir(os.path.join(source_dir, d)) and not d.startswith('.')]
    
    print(f"Found classes: {classes}")
    
    total_stats = {'train': 0, 'val': 0, 'test': 0}
    
    for class_name in classes:
        class_path = os.path.join(source_dir, class_name)
        
        for dir_path in [train_dir, val_dir, test_dir]:
            os.makedirs(os.path.join(dir_path, class_name), exist_ok=True)
        
        images = [f for f in os.listdir(class_path) 
                 if f.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp'))]
        
        print(f"Class {class_name}: {len(images)} images")
        
        if len(images) == 0:
            print(f"  Warning: No images found in {class_name}!")
            continue
        
        train_val_images, test_images = train_test_split(
            images, test_size=test_ratio, random_state=42
        )
        
        train_images, val_images = train_test_split(
            train_val_images, test_size=val_ratio/(train_ratio+val_ratio), random_state=42
        )
        
        for image in train_images:
            src = os.path.join(class_path, image)
            dst = os.path.join(train_dir, class_name, image)
            shutil.copy2(src, dst)
            
        for image in val_images:
            src = os.path.join(class_path, image)
            dst = os.path.join(val_dir, class_name, image)
            shutil.copy2(src, dst)
            
        for image in test_images:
            src = os.path.join(class_path, image)
            dst = os.path.join(test_dir, class_name, image)
            shutil.copy2(src, dst)
        
        total_stats['train'] += len(train_images)
        total_stats['val'] += len(val_images)
        total_stats['test'] += len(test_images)
            
        print(f"  - Train: {len(train_images)}, Val: {len(val_images)}, Test: {len(test_images)}")

    print(f"\nTotal images: {sum(total_stats.values())}")
    print(f"Training: {total_stats['train']} ({total_stats['train']/sum(total_stats.values())*100:.1f}%)")
    print(f"Validation: {total_stats['val']} ({total_stats['val']/sum(total_stats.values())*100:.1f}%)")
    print(f"Test: {total_stats['test']} ({total_stats['test']/sum(total_stats.values())*100:.1f}%)")

def verify_split(output_dir):
    """Verify the split was successful"""
    train_dir = os.path.join(output_dir, 'train')
    val_dir = os.path.join(output_dir, 'val')
    test_dir = os.path.join(output_dir, 'test')
    
    print("\n=== Split Verification ===")
    for split_name, split_dir in [('Train', train_dir), ('Val', val_dir), ('Test', test_dir)]:
        total_images = 0
        classes = [d for d in os.listdir(split_dir) if os.path.isdir(os.path.join(split_dir, d)) and not d.startswith('.')]
        print(f"\n{split_name} Set:")
        for class_name in classes:
            class_path = os.path.join(split_dir, class_name)
            images = [f for f in os.listdir(class_path) 
                     if f.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp'))]
            total_images += len(images)
            print(f"  {class_name}: {len(images)} images")
        print(f"Total {split_name} images: {total_images}")

if __name__ == "__main__":
    SOURCE_DIR = r"C:\Users\johnr\Sideline Projects\Mango Disease\MachineLearning\mango project\data\raw"
    OUTPUT_DIR = r"C:\Users\johnr\Sideline Projects\Mango Disease\MachineLearning\mango project\data\processed"
    
    if not os.path.exists(SOURCE_DIR):
        print(f"Error: Source directory '{SOURCE_DIR}' not found!")
        print("Please make sure your class folders are in the 'raw' directory.")
        exit(1)
    
    classes = [d for d in os.listdir(SOURCE_DIR) if os.path.isdir(os.path.join(SOURCE_DIR, d))]
    if len(classes) == 0:
        print(f"Error: No class folders found in '{SOURCE_DIR}'!")
        print("Expected folders: Anthracnose, Bacterial Canker, Cutting Weevil, etc.")
        exit(1)
    
    print("Starting dataset split...")
    split_dataset(SOURCE_DIR, OUTPUT_DIR)
    verify_split(OUTPUT_DIR)
    print("\nDataset split completed successfully!")
    print(f"Processed data saved to: {OUTPUT_DIR}")