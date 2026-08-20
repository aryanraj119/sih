"""
URJADRISHTI — YOLOv8 Substation Fire & Spark Detection Model Trainer
Trains YOLOv8 on the dataset at: A:/SIH/SIH/fire detection dataset/New folder/archive (2)/Fire-Detection
"""

import os
import shutil
from ultralytics import YOLO

def train_yolo_fire_model():
    dataset_yaml = os.path.abspath("fire detection dataset/New folder/archive (2)/Fire-Detection/data.yaml")
    print(f"[YOLO TRAINER] Loading dataset configuration from {dataset_yaml}...")

    # Load YOLOv8 Nano pre-trained model
    model = YOLO("yolov8n.pt")

    # Train the YOLO model on Roboflow Fire-Detection Dataset (2,509 annotated images)
    print("[YOLO TRAINER] Starting YOLOv8 model training on 2,509 fire/spark annotated images...")
    results = model.train(
        data=dataset_yaml,
        epochs=3,
        imgsz=416,
        batch=16,
        name="substation_yolo_fire",
        project="runs/detect",
        exist_ok=True
    )

    # Save trained best weights to backend/ai_models/yolo_fire.pt
    best_weights = os.path.join("runs", "detect", "substation_yolo_fire", "weights", "best.pt")
    target_weights = os.path.join("backend", "ai_models", "yolo_fire.pt")

    if os.path.exists(best_weights):
        os.makedirs("backend/ai_models", exist_ok=True)
        shutil.copy(best_weights, target_weights)
        print(f"[YOLO TRAINER] YOLOv8 Model trained successfully! Best weights copied to {target_weights}")
        return target_weights
    else:
        print("[YOLO TRAINER] Training completed. Could not locate best.pt weights file.")
        return None

if __name__ == "__main__":
    train_yolo_fire_model()
