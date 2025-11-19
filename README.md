# Audio Visualizer

A tool that visualizes audio frequencies and waveforms in real-time using colorful graphics.

## Project Overview

This multimedia project demonstrates real-time audio visualization using modern web technologies including HTML5, CSS3, Canvas API, and will integrate Audio API and Video API in later stages.

## Features Implemented

### Stage 1: HTML & CSS (Completed ✓)
- **Modern, responsive HTML structure** with semantic elements
- **Beautiful gradient-based design** with animations
- **File upload interface** with drag-and-drop support
- **Audio player controls** with custom styling
- **Visualization mode selector** for different effects
- **Color scheme selector** with multiple themes
- **Fully responsive layout** that works on all screen sizes

### Stage 2: Canvas API (Completed ✓)
- **Four Visualization Modes:**
  1. **Frequency Bars** - Classic bar visualization with gradients and glow effects
  2. **Circular** - Radial frequency display with rotating bars
  3. **Waveform** - Smooth waveform with mirror effect
  4. **Particles** - Dynamic particle system with physics

- **Five Color Schemes:**
  - Rainbow: Full spectrum colors
  - Fire: Warm red/orange/yellow tones
  - Ocean: Cool blue/cyan tones
  - Neon: Vibrant electric colors
  - Purple Haze: Purple gradient theme

- **Advanced Canvas Features:**
  - Gradient rendering
  - Shadow and glow effects
  - Particle physics simulation
  - Smooth animations at 60 FPS
  - Dynamic visual effects based on simulated audio data

### Stage 3: Audio API (Coming Soon)
- Web Audio API integration
- Real-time frequency analysis
- Audio context and analyzer nodes
- FFT (Fast Fourier Transform) processing

### Stage 4: Video API (Coming Soon)
- Video element integration
- Video playback controls
- Audio extraction from video files
- Synchronized visualization

## How to Use

1. **Open the project**: Open `index.html` in a modern web browser
2. **Upload audio**: Click the upload area or drag-and-drop an audio file (MP3, WAV, etc.)
3. **Play audio**: Use the Play button or the audio player controls
4. **Choose visualization**: Select from 4 different visualization modes
5. **Pick colors**: Choose from 5 color schemes
6. **Enjoy**: Watch the real-time visualization!

## Technologies Used

- **HTML5**: Semantic markup, audio element, file input
- **CSS3**: Flexbox, Grid, animations, gradients, backdrop filters
- **JavaScript (ES6+)**: Classes, arrow functions, async operations
- **Canvas API**: 2D rendering context, animations, gradients, transformations

## Project Structure

```
multimedia_project/
├── index.html          # Main HTML structure
├── style.css           # All styling and animations
├── visualizer.js       # Canvas API and visualization logic
└── README.md          # Project documentation
```

## Browser Compatibility

Works best in modern browsers:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Future Enhancements (Stages 3 & 4)

- [ ] Web Audio API integration for real audio analysis
- [ ] Video file support with audio extraction
- [ ] More visualization modes
- [ ] Recording and export functionality
- [ ] Fullscreen mode
- [ ] Performance optimizations

## Notes

- **Stage 2 Implementation**: Currently uses simulated audio data to demonstrate Canvas API capabilities
- **Stage 3 Preview**: The audio player is functional and ready for Web Audio API integration
- All visualizations are optimized for smooth 60 FPS performance
- The design is fully responsive and mobile-friendly
