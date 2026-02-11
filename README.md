# MICRO PROJECT 4th SEM

## Overview
This project implement an intelligent software layer for an autonomous sorting conveyor system. It utilizes real-time computer vision to identify, classify, and process objects based on their geometric features and color properties. The system is designed as a software-only demonstration, focusing on the intelligence required for automated industrial sorting workflows.

## Features
- **Real-time Vision Intelligence**: Continuous monitoring and processing of video streams.
- **Advanced Object Identification**: High-performance detection using state-of-the-art neural networks.
- **Dynamic Color Classification**: Automated sorting based on HSV (Hue, Saturation, Value) analysis.
- **Interactive Control Interface**: Modern web-based dashboard for system monitoring and configuration.

## Tech Stack
- **Language**: Python
- **Core Intelligence**: YOLOv8 (You Only Look Once) - Nano model for efficient CPU-based inference.
- **Computer Vision**: OpenCV (Open Source Computer Vision Library)
- **Application Framework**: Streamlit
- **Data Processing**: NumPy

## Model Optimization and Fine-tuning
One of the core technical highlights of this project is the **fine-tuning of the YOLOv8-Nano architecture**. To achieve reliable performance in a microscale sorting environment, we performed custom training on specialized datasets. This process involved:
- **Transfer Learning**: Leveraging pre-trained weights to accelerate convergence on new object classes.
- **Custom Object Classification**: Adapting the model's output layer to recognize specific industrial components with high precision.
- **Inference Optimization**: Fine-tuning hyperparameters to ensure sub-50ms latency on CPU-based hardware, maintaining a consistent 8-15 FPS.

## Design Principles
The project prioritizes performance and accuracy on edge devices (CPU-bound systems), demonstrating the feasibility of deploying advanced AI models in resource-constrained environments typical of industrial micro-automation.
