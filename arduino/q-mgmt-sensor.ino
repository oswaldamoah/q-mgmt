// Pins and constants
const int trigPin = 9;   // Trig pin connected to D9
const int echoPin = 10;  // Echo pin connected to D10
const float speedOfSound = 0.034; // cm/us (speed of sound in air - microseconds)

// Variables for timing and previous state
int previousPeopleCount = 0;   // Last recorded queue length
long entryTime = 0;            // Time when someone joined the queue
float avgTimeInQueue = 0;      // Average time spent in queue

// Constants for distance calculations
int initial_distance = 0; // Distance between sensor and end of the queue (last box)
int box_distance = 7;       // Distance for each box

// Maximum range to ignore wall and other objects
const int maxRange = 42; // Adjust based on your setup (in cm)

// Variables for accuracy enhancement
const int bufferSize = 30;  // Number of measurements to store (e.g., 30 for ~5 seconds at 100ms interval)
int queueBuffer[bufferSize]; // Circular buffer to store recent measurements
int bufferIndex = 0;         // Index for the circular buffer

// Function to calculate the sensor distance for a specific box
int sensor_distance(int box_no) {
  return initial_distance + box_distance * box_no;
}

// The variables below are the distances from the sensor to the:
// Adjust distances for each box based on their positions
int a = sensor_distance(0);  // End of 5th box
int b = sensor_distance(1);  // End of 4th box
int c = sensor_distance(2);  // End of 3rd box
int d = sensor_distance(3);  // End of 2nd box
int e = sensor_distance(4);  // End of 1st box
int f = sensor_distance(5);  // Start of 1st box

void setup() {
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  Serial.begin(9600); // Initialize Serial Monitor for debugging

  // Initialize the buffer with zeros
  for (int i = 0; i < bufferSize; i++) {
    queueBuffer[i] = 0;
  }
}

void loop() {
  // Measure the current queue length
  int currentMeasurement = measureQueue();

  // Store the measurement in the circular buffer
  queueBuffer[bufferIndex] = currentMeasurement;
  bufferIndex = (bufferIndex + 1) % bufferSize;

  // Determine the most frequent value in the buffer
  int count = calculateMode(queueBuffer, bufferSize);

  // Handle changes in the queue and calculate average time spent
  handleQueueChange(count);

  delay(100);  // Delay between measurements for stability
}

// Measure distance and determine the number of people in the queue
int measureQueue() {
  // Trigger a pulse
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  // Read echo pulse duration
  long duration = pulseIn(echoPin, HIGH);

  // Calculate distance
  float distance = (duration * speedOfSound) / 2;  // cm

  // Check if distance is within maxRange
  if (distance > maxRange || distance == 0) {
    return 0; // No valid detection
  }

  // Determine the number of people based on distance ranges
  if (distance >= a && distance < b) {
    return 5;
  } else if (distance >= b && distance < c) {
    return 4;
  } else if (distance >= c && distance < d) {
    return 3;
  } else if (distance >= d && distance < e) {
    return 2;
  } else if (distance >= e && distance < f) {
    return 1;
  } else {
    return 0;
  }
}

// Calculate the mode (most frequent value) in an array
int calculateMode(int arr[], int size) {
  int maxValue = 0, maxCount = 0;

  for (int i = 0; i < size; i++) {
    int count = 0;

    for (int j = 0; j < size; j++) {
      if (arr[j] == arr[i]) {
        count++;
      }
    }

    if (count > maxCount) {
      maxCount = count;
      maxValue = arr[i];
    }
  }

  return maxValue;
}

// Handle queue changes and calculate average time in queue
void handleQueueChange(int currentCount) {
  long currentTime = millis(); // Get the current time

  if (previousPeopleCount != currentCount) {
    // A change in queue length occurred
    if (currentCount > previousPeopleCount) {
      // Someone joined the queue
      Serial.println("Someone joined the queue.");
      entryTime = currentTime; // Record the time they joined
    } else if (currentCount < previousPeopleCount) {
      // Someone left the queue
      Serial.println("Someone left the queue.");
      long timeInQueue = currentTime - entryTime; // Time spent in queue

      // Calculate average time in queue
      if (timeInQueue > 0) {
        avgTimeInQueue = (avgTimeInQueue + timeInQueue / 1000.0) / 2.0;
        Serial.print("Average time in queue: ");
        Serial.print(avgTimeInQueue, 2);
        Serial.println(" seconds");
      }
    }

    // Display the current queue length only once after a change
    Serial.print("People in queue: ");
    Serial.println(currentCount);

    // Update the previous state
    previousPeopleCount = currentCount;
  }
}
