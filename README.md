# Pool Scene

A 3D interactive room visualization built with Three.js featuring a realistic pool with animated water effects and first-person camera controls.

## Preview

https://github.com/user-attachments/assets/1ec85464-f9fa-4bcc-84f7-0e404f42233d

## Features

- **Interactive 3D Environment**: Explore a pool scene in an immersive 3D space
- **First-Person Controls**: WASD movement with mouse look controls using pointer lock
- **Animated Water**: Realistic water surface animation with wave effects
- **Realistic Lighting**: Directional sunlight with shadow mapping and HDR environment mapping
- **Camera Constraints**: Movement is bounded within the room for a realistic experience
- **Light Control Panel**: Tweakpane-based UI for adjusting lighting parameters

## Technologies

- [Three.js](https://threejs.org/) - 3D rendering library
- [Vite](https://vitejs.dev/) - Fast development build tool
- [Tweakpane](https://cocopon.github.io/tweakpane/) - Lightweight GUI for parameter adjustment
- GLTF model loader for 3D assets
- EXR loader for HDR environment maps

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [pnpm](https://pnpm.io/) package manager

### Installation

```bash
# Install dependencies
pnpm install
```

### Development

```bash
# Start development server
pnpm dev
```

The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

### Build

```bash
# Create production build
pnpm build
```

### Preview Production Build

```bash
# Preview the production build locally
pnpm start
```

## Controls

- **Click** - Click on the canvas to enable first-person controls
- **Mouse** - Look around (when pointer is locked)
- **W** - Move forward
- **A** - Move left
- **S** - Move backward
- **D** - Move right
- **ESC** - Release pointer lock and regain mouse cursor

## Project Structure

```
pool-scene/
├── public/
│   ├── hdris/           # HDR environment maps
│   └── models/          # 3D model files (GLTF)
├── index.html           # Main HTML file
├── main.js              # Three.js application logic
├── package.json         # Project dependencies and scripts
└── README.md            # This file
```

## Key Features Implementation

### Water Animation

The pool water features dynamic wave animation using vertex shader manipulation:

- Combines multiple sine and cosine waves for realistic motion
- Computes vertex normals for proper lighting interaction
- Transparent material with metalness and roughness properties

### Lighting System

- Ambient lighting for base illumination
- Directional light simulating sunlight with shadow casting
- 4096x4096 shadow map resolution for high-quality shadows
- HDR environment mapping for realistic reflections

### Camera Movement

- Constrained first-person camera with room boundaries
- WASD keyboard movement
- Mouse-based look controls using Euler angles
- Vertical look angle clamping to prevent camera flipping
