// ===================================
// Audio Visualizer - Canvas API Implementation
// Stage 1 & 2: HTML, CSS, Canvas API
// ===================================

class AudioVisualizer {
  constructor() {
    // DOM Elements
    this.audioFile = document.getElementById('audioFile');
    this.audio = document.getElementById('audio');
    this.playBtn = document.getElementById('playBtn');
    this.pauseBtn = document.getElementById('pauseBtn');
    this.canvas = document.getElementById('visualizerCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.visualMode = document.getElementById('visualMode');
    this.colorScheme = document.getElementById('colorScheme');
    this.fileName = document.getElementById('fileName');

    // Canvas properties
    this.setupCanvas();
    
    // Animation properties
    this.animationId = null;
    this.particles = [];
    this.time = 0;
    
    // Simulated audio data for Stage 2 (Canvas API demo)
    this.dataArray = new Uint8Array(128);
    this.generateSimulatedData();

    // Event listeners
    this.initializeEventListeners();
    
    // Start animation
    this.animate();
  }

  setupCanvas() {
    // Set canvas size
    this.canvas.width = 1000;
    this.canvas.height = 400;
    
    // Handle window resize
    window.addEventListener('resize', () => {
      const maxWidth = Math.min(window.innerWidth - 100, 1000);
      this.canvas.width = maxWidth;
    });
  }

  initializeEventListeners() {
    // File upload
    this.audioFile.addEventListener('change', (e) => this.handleFileUpload(e));
    
    // Drag and drop
    const uploadLabel = document.querySelector('.upload-label');
    uploadLabel.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadLabel.style.borderColor = '#00d4ff';
    });
    
    uploadLabel.addEventListener('dragleave', () => {
      uploadLabel.style.borderColor = '#5865f2';
    });
    
    uploadLabel.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadLabel.style.borderColor = '#5865f2';
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        this.loadAudioFile(files[0]);
      }
    });

    // Audio controls
    this.playBtn.addEventListener('click', () => this.play());
    this.pauseBtn.addEventListener('click', () => this.pause());

    // Visualization mode
    this.visualMode.addEventListener('change', () => {
      this.particles = []; // Reset particles when changing mode
    });

    // Audio events
    this.audio.addEventListener('play', () => {
      this.playBtn.disabled = true;
      this.pauseBtn.disabled = false;
    });

    this.audio.addEventListener('pause', () => {
      this.playBtn.disabled = false;
      this.pauseBtn.disabled = true;
    });

    this.audio.addEventListener('ended', () => {
      this.playBtn.disabled = false;
      this.pauseBtn.disabled = true;
    });
  }

  handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
      this.loadAudioFile(file);
    }
  }

  loadAudioFile(file) {
    const url = URL.createObjectURL(file);
    this.audio.src = url;
    this.fileName.textContent = `Loaded: ${file.name}`;
    this.playBtn.disabled = false;
    this.pauseBtn.disabled = true;
  }

  play() {
    this.audio.play();
  }

  pause() {
    this.audio.pause();
  }

  // Generate simulated audio data for demonstration (Stage 2)
  generateSimulatedData() {
    const isPlaying = !this.audio.paused && !this.audio.ended;
    
    for (let i = 0; i < this.dataArray.length; i++) {
      if (isPlaying) {
        // More dynamic visualization when playing
        const wave = Math.sin(this.time * 0.05 + i * 0.2) * 127 + 128;
        const noise = Math.random() * 50;
        this.dataArray[i] = Math.min(255, wave + noise);
      } else {
        // Gentle idle animation when paused
        const idle = Math.sin(this.time * 0.02 + i * 0.1) * 30 + 40;
        this.dataArray[i] = idle;
      }
    }
    this.time++;
  }

  // Color schemes
  getColor(index, total) {
    const scheme = this.colorScheme.value;
    const hue = (index / total) * 360;
    const value = this.dataArray[index];
    const intensity = value / 255;

    switch (scheme) {
      case 'rainbow':
        return `hsl(${hue}, 100%, ${50 + intensity * 30}%)`;
      
      case 'fire':
        const fireHue = 0 + (60 * intensity);
        return `hsl(${fireHue}, 100%, ${40 + intensity * 30}%)`;
      
      case 'ocean':
        const oceanHue = 180 + (60 * intensity);
        return `hsl(${oceanHue}, 70%, ${40 + intensity * 40}%)`;
      
      case 'neon':
        const neonColors = [
          `rgb(${255 * intensity}, 0, ${255 * intensity})`,
          `rgb(0, ${255 * intensity}, ${255 * intensity})`,
          `rgb(${255 * intensity}, ${255 * intensity}, 0)`
        ];
        return neonColors[index % 3];
      
      case 'purple':
        return `hsl(${270 + intensity * 60}, 80%, ${40 + intensity * 30}%)`;
      
      default:
        return `hsl(${hue}, 100%, 50%)`;
    }
  }

  // Visualization: Frequency Bars
  drawBars() {
    const bufferLength = this.dataArray.length;
    const barWidth = (this.canvas.width / bufferLength) * 2;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (this.dataArray[i] / 255) * this.canvas.height * 0.8;
      
      // Create gradient for each bar
      const gradient = this.ctx.createLinearGradient(0, this.canvas.height, 0, this.canvas.height - barHeight);
      gradient.addColorStop(0, this.getColor(i, bufferLength));
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
      
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(x, this.canvas.height - barHeight, barWidth - 2, barHeight);
      
      // Add glow effect
      this.ctx.shadowBlur = 15;
      this.ctx.shadowColor = this.getColor(i, bufferLength);
      
      x += barWidth;
    }
  }

  // Visualization: Circular
  drawCircular() {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const bufferLength = this.dataArray.length;
    const radius = Math.min(centerX, centerY) - 50;

    // Draw outer circle
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    for (let i = 0; i < bufferLength; i++) {
      const angle = (i / bufferLength) * Math.PI * 2 - Math.PI / 2;
      const barHeight = (this.dataArray[i] / 255) * 100;
      
      const x1 = centerX + Math.cos(angle) * radius;
      const y1 = centerY + Math.sin(angle) * radius;
      const x2 = centerX + Math.cos(angle) * (radius + barHeight);
      const y2 = centerY + Math.sin(angle) * (radius + barHeight);

      this.ctx.beginPath();
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      this.ctx.strokeStyle = this.getColor(i, bufferLength);
      this.ctx.lineWidth = 3;
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = this.getColor(i, bufferLength);
      this.ctx.stroke();
    }

    // Draw center circle
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, 20, 0, Math.PI * 2);
    const centerGradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 20);
    centerGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    centerGradient.addColorStop(1, 'rgba(100, 100, 255, 0.4)');
    this.ctx.fillStyle = centerGradient;
    this.ctx.fill();
  }

  // Visualization: Waveform
  drawWaveform() {
    const bufferLength = this.dataArray.length;
    const sliceWidth = this.canvas.width / bufferLength;
    
    // Draw main waveform
    this.ctx.beginPath();
    this.ctx.lineWidth = 3;
    
    for (let i = 0; i < bufferLength; i++) {
      const v = this.dataArray[i] / 128.0;
      const y = (v * this.canvas.height) / 2;
      const x = i * sliceWidth;

      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }

    const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, 0);
    gradient.addColorStop(0, this.getColor(0, bufferLength));
    gradient.addColorStop(0.5, this.getColor(bufferLength / 2, bufferLength));
    gradient.addColorStop(1, this.getColor(bufferLength - 1, bufferLength));
    
    this.ctx.strokeStyle = gradient;
    this.ctx.shadowBlur = 20;
    this.ctx.shadowColor = this.getColor(bufferLength / 2, bufferLength);
    this.ctx.stroke();

    // Draw mirror waveform
    this.ctx.beginPath();
    for (let i = 0; i < bufferLength; i++) {
      const v = this.dataArray[i] / 128.0;
      const y = this.canvas.height - (v * this.canvas.height) / 2;
      const x = i * sliceWidth;

      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    this.ctx.strokeStyle = gradient;
    this.ctx.globalAlpha = 0.5;
    this.ctx.stroke();
    this.ctx.globalAlpha = 1.0;
  }

  // Visualization: Particles
  drawParticles() {
    const bufferLength = this.dataArray.length;
    
    // Create new particles
    if (this.particles.length < 100) {
      for (let i = 0; i < 3; i++) {
        const value = this.dataArray[Math.floor(Math.random() * bufferLength)];
        if (value > 100) {
          this.particles.push({
            x: Math.random() * this.canvas.width,
            y: this.canvas.height,
            vx: (Math.random() - 0.5) * 4,
            vy: -(Math.random() * 5 + 3),
            size: Math.random() * 4 + 2,
            color: this.getColor(Math.floor(Math.random() * bufferLength), bufferLength),
            life: 1.0
          });
        }
      }
    }

    // Update and draw particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1; // gravity
      p.life -= 0.01;

      if (p.life <= 0 || p.y > this.canvas.height) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.life;
      this.ctx.shadowBlur = 15;
      this.ctx.shadowColor = p.color;
      this.ctx.fill();
      this.ctx.globalAlpha = 1.0;
    }

    // Draw frequency bars in background
    const barWidth = this.canvas.width / bufferLength;
    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (this.dataArray[i] / 255) * this.canvas.height * 0.3;
      this.ctx.fillStyle = this.getColor(i, bufferLength);
      this.ctx.globalAlpha = 0.2;
      this.ctx.fillRect(i * barWidth, this.canvas.height - barHeight, barWidth - 2, barHeight);
      this.ctx.globalAlpha = 1.0;
    }
  }

  // Main animation loop
  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());

    // Generate simulated data (Stage 2: Canvas API only)
    // In Stage 3, this will be replaced with real audio analysis
    this.generateSimulatedData();

    // Clear canvas with fade effect
    this.ctx.fillStyle = 'rgba(26, 26, 46, 0.3)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Reset shadow
    this.ctx.shadowBlur = 0;

    // Draw based on selected mode
    const mode = this.visualMode.value;
    switch (mode) {
      case 'bars':
        this.drawBars();
        break;
      case 'circular':
        this.drawCircular();
        break;
      case 'waveform':
        this.drawWaveform();
        break;
      case 'particles':
        this.drawParticles();
        break;
    }
  }
}

// Initialize the visualizer when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new AudioVisualizer();
});
