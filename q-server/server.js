const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const WebSocket = require('ws');
const express = require('express');
const cors = require('cors');
const os = require('os');

const app = express();
app.use(cors());  // Enable CORS for Express

const PORT = 5000;  // Backend server port
const SERIAL_PORT = 'COM6';  // Change this if necessary based on your Arduino port
const BAUD_RATE = 9600;

// Create HTTP server
const server = app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});

// Create WebSocket server attached to HTTP server
const wss = new WebSocket.Server({ server }, () => {
  console.log("WebSocket server is listening on ws://localhost:5000");
});

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('Frontend connected to WebSocket');

  // Handle WebSocket close
  ws.on('close', () => {
    console.log('Frontend disconnected');
  });

  // Handle WebSocket errors
  ws.on('error', (err) => {
    console.error('WebSocket error:', err);
  });
});

// Check if serial port exists and connect to Arduino
const checkArduinoConnection = () => {
  SerialPort.list().then(ports => {
    console.log('Available Serial Ports:', ports);  // Log all available serial ports

    const arduinoPort = ports.find(port => port.path === SERIAL_PORT);
    
    if (arduinoPort) {
      console.log(`Arduino found on ${SERIAL_PORT}`);
      
      // Create SerialPort instance with the found port
      const port = new SerialPort({ path: arduinoPort.path, baudRate: BAUD_RATE });

      port.on('open', () => {
        console.log('Connected to Arduino on', SERIAL_PORT);
      });

      port.on('error', (err) => {
        console.error('Error with Arduino serial port:', err);
      });

      const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

      parser.on('data', (data) => {
        console.log('Received from Arduino:', data);
        
        // Send data to all connected WebSocket clients
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(data);
          }
        });
      });
    } else {
      console.error(`Arduino not found on ${SERIAL_PORT}`);
    }
  }).catch((err) => {
    console.error('Error listing serial ports:', err);
  });
};

checkArduinoConnection(); // Call function to check and connect to Arduino
