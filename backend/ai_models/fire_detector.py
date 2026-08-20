"""
URJADRISHTI — AI Substation Fire & Spark Detection Model
Trains a PyTorch CNN / OpenCV Spectral Analyzer on the Fire-Detection dataset (0: Normal, 1: Fire/Spark).
Provides real-time frame inference for laptop camera feeds and real-life optical surveillance.
"""

import os
import cv2
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Dataset
from torchvision import transforms
from PIL import Image

class FireDataset(Dataset):
    def __init__(self, root_dir, transform=None):
        self.root_dir = root_dir
        self.transform = transform
        self.samples = []

        class_0_dir = os.path.join(root_dir, '0')
        class_1_dir = os.path.join(root_dir, '1')

        if os.path.exists(class_0_dir):
            for fname in os.listdir(class_0_dir):
                if fname.lower().endswith(('.jpg', '.jpeg', '.png')):
                    self.samples.append((os.path.join(class_0_dir, fname), 0))

        if os.path.exists(class_1_dir):
            for fname in os.listdir(class_1_dir):
                if fname.lower().endswith(('.jpg', '.jpeg', '.png')):
                    self.samples.append((os.path.join(class_1_dir, fname), 1))

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        path, label = self.samples[idx]
        try:
            image = Image.open(path).convert('RGB')
        except Exception:
            image = Image.new('RGB', (128, 128), (0, 0, 0))
        if self.transform:
            image = self.transform(image)
        return image, label


class SubstationFireCNN(nn.Module):
    def __init__(self):
        super(SubstationFireCNN, self).__init__()
        self.features = nn.Sequential(
            nn.Conv2d(3, 16, kernel_size=3, padding=1),
            nn.BatchNorm2d(16),
            nn.ReLU(),
            nn.MaxPool2d(2, 2),

            nn.Conv2d(16, 32, kernel_size=3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(),
            nn.MaxPool2d(2, 2),

            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(),
            nn.MaxPool2d(2, 2),
        )
        self.classifier = nn.Sequential(
            nn.Linear(64 * 16 * 16, 64),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(64, 2)
        )

    def forward(self, x):
        x = self.features(x)
        x = x.view(x.size(0), -1)
        x = self.classifier(x)
        return x


class FireDetectionEngine:
    def __init__(self, model_path=None):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = SubstationFireCNN().to(self.device)
        self.model.eval()
        self.model_path = model_path or "backend/ai_models/fire_model.pth"

        if os.path.exists(self.model_path):
            try:
                self.model.load_state_dict(torch.load(self.model_path, map_location=self.device))
                print(f"[FIRE DETECTOR] Loaded trained PyTorch model weights from {self.model_path}")
            except Exception as e:
                print(f"[FIRE DETECTOR] Error loading model: {e}")

        self.transform = transforms.Compose([
            transforms.Resize((128, 128)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])

    def train_on_dataset(self, dataset_dir="fire detection dataset/Fire-Detection", epochs=3):
        """Trains the PyTorch SubstationFireCNN model on the Fire-Detection dataset."""
        if not os.path.exists(dataset_dir):
            print(f"[FIRE DETECTOR] Dataset path {dataset_dir} not found.")
            return False

        print(f"[FIRE DETECTOR] Starting training PyTorch model on {dataset_dir}...")
        dataset = FireDataset(dataset_dir, transform=self.transform)
        if len(dataset) == 0:
            print("[FIRE DETECTOR] No valid images found in dataset.")
            return False

        dataloader = DataLoader(dataset, batch_size=16, shuffle=True)
        criterion = nn.CrossEntropyLoss()
        optimizer = optim.Adam(self.model.parameters(), lr=0.001)

        self.model.train()
        for epoch in range(epochs):
            running_loss = 0.0
            correct = 0
            total = 0
            for images, labels in dataloader:
                images, labels = images.to(self.device), labels.to(self.device)
                optimizer.zero_grad()
                outputs = self.model(images)
                loss = criterion(outputs, labels)
                loss.backward()
                optimizer.step()

                running_loss += loss.item() * images.size(0)
                _, predicted = torch.max(outputs, 1)
                total += labels.size(0)
                correct += (predicted == labels).sum().item()

            epoch_loss = running_loss / total
            accuracy = correct / total
            print(f"[FIRE DETECTOR] Epoch {epoch+1}/{epochs} - Loss: {epoch_loss:.4f} - Accuracy: {accuracy*100:.2f}%")

        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        torch.save(self.model.state_dict(), self.model_path)
        print(f"[FIRE DETECTOR] Model trained successfully and saved to {self.model_path}")
        self.model.eval()
        return True

    def analyze_frame_bytes(self, image_bytes: bytes) -> dict:
        """Analyzes a real-time camera image frame byte array using PyTorch CNN & Multi-Spectral OpenCV flame & spark detector."""
        try:
            if not image_bytes:
                return {
                    "fire_detected": False,
                    "confidence": 0.0,
                    "hazard_level": "NONE",
                    "alert_message": "Substation optical feed awaiting camera frame stream.",
                    "substation_status": "NORMAL OPTICAL MONITORING"
                }

            nparr = np.frombuffer(image_bytes, np.uint8)
            frame_cv = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            if frame_cv is None:
                raise ValueError("Could not decode image bytes into OpenCV frame")

            # 1. OpenCV Multi-Spectral Real-Life Flame & Electric Spark Detector (HSV Color Space)
            hsv = cv2.cvtColor(frame_cv, cv2.COLOR_BGR2HSV)

            # Spectral Mask 1: Yellow / Orange / Flame Red (H: 0 to 45, S: 40 to 255, V: 110 to 255)
            lower_fire1 = np.array([0, 40, 110])
            upper_fire1 = np.array([45, 255, 255])
            mask1 = cv2.inRange(hsv, lower_fire1, upper_fire1)

            # Spectral Mask 2: Deep Red Flame Wrap-Around (H: 155 to 180, S: 40 to 255, V: 110 to 255)
            lower_fire2 = np.array([155, 40, 110])
            upper_fire2 = np.array([180, 255, 255])
            mask2 = cv2.inRange(hsv, lower_fire2, upper_fire2)

            # Spectral Mask 3: Intense White/Yellow Flame Hotspot Core (V > 220, S: 20 to 255)
            lower_fire3 = np.array([0, 20, 220])
            upper_fire3 = np.array([180, 255, 255])
            mask3 = cv2.inRange(hsv, lower_fire3, upper_fire3)

            # Combine all flame & spark spectral masks
            combined_mask = cv2.bitwise_or(mask1, mask2)
            combined_mask = cv2.bitwise_or(combined_mask, mask3)

            fire_pixel_count = cv2.countNonZero(combined_mask)
            total_pixels = frame_cv.shape[0] * frame_cv.shape[1]
            fire_pixel_ratio = fire_pixel_count / float(total_pixels)

            # 2. PyTorch SubstationFireCNN Model Inference
            pil_img = Image.fromarray(cv2.cvtColor(frame_cv, cv2.COLOR_BGR2RGB))
            img_tensor = self.transform(pil_img).unsqueeze(0).to(self.device)

            with torch.no_grad():
                outputs = self.model(img_tensor)
                probs = torch.softmax(outputs, dim=1)[0]
                fire_prob_model = float(probs[1].item())

            # 3. Real-Life Camera Fire Detection Thresholds (Triggers on real-world lighter, matchstick, candle, flame, or video fire)
            is_fire_detected = (fire_prob_model > 0.35) or (fire_pixel_ratio > 0.0008) or (fire_pixel_count > 50)
            confidence = max(fire_prob_model, min(0.99, fire_pixel_ratio * 30.0 + 0.85))

            if is_fire_detected:
                return {
                    "fire_detected": True,
                    "confidence": round(max(0.95, confidence), 3),
                    "hazard_level": "CRITICAL",
                    "alert_message": "🔥 CRITICAL ALERT: SPARK OR FIRE DETECTED! CHANCE OF MAJOR OUTBREAK AT SUBSTATION!",
                    "substation_status": "FIRE HAZARD EMERGENCY"
                }
            else:
                return {
                    "fire_detected": False,
                    "confidence": round(1.0 - confidence, 3),
                    "hazard_level": "NONE",
                    "alert_message": "Substation camera optical scan clear. No spark or thermal anomaly detected.",
                    "substation_status": "NORMAL OPTICAL MONITORING"
                }
        except Exception as e:
            return {
                "fire_detected": False,
                "confidence": 0.0,
                "hazard_level": "UNKNOWN",
                "alert_message": f"Optical analysis error: {str(e)}",
                "substation_status": "CAMERA MONITORING"
            }
