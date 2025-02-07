# Physical Queue Management System

## Project Overview
This project focuses on developing a **Physical Queue Management System** using an **ultrasonic sensor** and **Arduino**, alongside a **React-based web app**. The system monitors queue length, predicts wait times, and provides real-time data to optimize queue efficiency and improve the customer experience.

## Key Features
- **Real-time queue monitoring**: Uses an ultrasonic sensor to detect queue length dynamically.
- **Predictive wait-time calculation**: Estimates clearance time based on queue data.
- **User-friendly web interface**: Displays queue status and wait-time predictions.

## Components & Materials
### Hardware:
- **Arduino Uno** (Processes sensor data)
- **Ultrasonic Sensor (HC-SR04)** (Detects queue length)
- **Jumper wires & Breadboard** (For circuit setup)
- **Power Supply (PC)** (Powers the Arduino)
- **Simulation Materials** (Represent people in a queue for testing)

### Software & Technologies:
- **Arduino (C++)** (Controls sensors and data processing)
- **ReactJS (Frontend Web App)**
- **NodeJS (Backend for Serial Monitor Connection)**

## Methodology
1. **Setup hardware**: Configure the Arduino and ultrasonic sensor.
2. **Measure queue length**: Sensor detects distance to estimate queue size.
3. **Process data**: Arduino calculates queue length and predicts wait times.
4. **Display results**: Data is sent to a ReactJS web app for real-time visualization.
5. **Optimize accuracy**: Implemented statistical filtering (mode) to enhance reliability.

## Results & Challenges
### Achievements:
- Successfully measured queue length in real time.
- Predicted wait times with **±10% accuracy**.
- Implemented data smoothing for accurate readings.

### Challenges & Solutions:
- **Sensor detected external objects** → Adjusted range and sensitivity.
- **Inconsistent readings** → Implemented a buffer and used statistical filtering.
