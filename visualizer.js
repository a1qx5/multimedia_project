class AudioVisualizer {
  constructor() {
    // DOM Elements
    this.audioFile = document.getElementById('audioFile');
    this.audio = document.getElementById('audio');
    this.playBtn = document.getElementById('playBtn');
    this.pauseBtn = document.getElementById('pauseBtn');
    this.micBtn = document.getElementById('micBtn');
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

    this.setupAudioAPI();

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

  setupAudioAPI() {
    try {
      // Create Audio Context
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) {
        throw new Error('Web Audio API is not supported in this browser');
      }

      this.audioContext = new AudioContext();

      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.8;
      this.analyser.minDecibels = -90;
      this.analyser.maxDecibels = -10;

      this.bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(this.bufferLength);

      this.audioSourceConnected = false;
      this.microphoneStream = null;
      this.currentSource = null;
      this.audioSource = null;

      console.log('Web Audio API initialized successfully');
    } catch (error) {
      console.error('Error initializing Web Audio API:', error);
      alert('Your browser does not support the Web Audio API. Please use a modern browser like Chrome, Firefox, or Edge.');
    }
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
    this.micBtn.addEventListener('click', () => this.toggleMicrophone());

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

    // Connect audio element to analyser (only once)
    this.connectAudioSource();
  }

  connectAudioSource() {
    if (!this.audioSourceConnected && this.audioContext) {
      try {
        // Disconnect microphone if active
        if (this.microphoneStream) {
          this.stopMicrophone();
        }

        // Create source from audio element
        this.audioSource = this.audioContext.createMediaElementSource(this.audio);

        this.audioSource.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);

        this.audioSourceConnected = true;
        this.currentSource = 'file';
        console.log('Audio source connected to analyser');
      } catch (error) {
        console.error('Error connecting audio source:', error);
      }
    }
  }

  play() {
    // Resume AudioContext on user interaction
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    this.audio.play();
  }

  pause() {
    this.audio.pause();
  }

  async toggleMicrophone() {
    if (this.microphoneStream) {
      this.stopMicrophone();
    } else {
      await this.startMicrophone();
    }
  }

  async startMicrophone() {
    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Microphone access is not supported in this browser. Please use a modern browser like Chrome, Firefox, or Edge.');
        return;
      }

      // Resume AudioContext if needed
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Stop audio file playback if active
      if (!this.audio.paused) {
        this.audio.pause();
      }

      // Disconnect audio file source if connected
      if (this.audioSourceConnected && this.audioSource) {
        this.audioSource.disconnect();
        this.audioSourceConnected = false;
      }

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      this.microphoneStream = stream;

      // Create microphone source and connect to analyser
      const micSource = this.audioContext.createMediaStreamSource(stream);
      micSource.connect(this.analyser);
      this.currentSource = 'microphone';
      this.audioSource = micSource;

      // Update UI
      this.micBtn.textContent = 'Stop Microphone';
      this.micBtn.classList.add('active');
      this.fileName.textContent = 'Microphone Active';
      this.playBtn.disabled = true;
      this.pauseBtn.disabled = true;

      console.log('Microphone started successfully');
    } catch (error) {
      console.error('Error accessing microphone:', error);
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        alert('Microphone access denied. Please allow microphone access to use this feature.');
      } else if (error.name === 'NotFoundError') {
        alert('No microphone found. Please connect a microphone and try again.');
      } else {
        alert('Error accessing microphone: ' + error.message);
      }
    }
  }

  stopMicrophone() {
    if (this.microphoneStream) {
      // Stop all tracks in the stream
      this.microphoneStream.getTracks().forEach(track => track.stop());
      this.microphoneStream = null;

      // Disconnect microphone source
      if (this.audioSource) {
        this.audioSource.disconnect();
        this.audioSource = null;
      }

      this.currentSource = null;

      // Update UI
      this.micBtn.textContent = 'Start Microphone';
      this.micBtn.classList.remove('active');
      this.fileName.textContent = '';

      // Re-enable play/pause buttons if audio file is loaded
      if (this.audio.src) {
        this.playBtn.disabled = false;
        this.pauseBtn.disabled = this.audio.paused;
      }

      console.log('Microphone stopped');
    }
  }

  getVisualData() {
    const sampleSize = 128;
    const visualData = new Uint8Array(sampleSize);
    const amplification = 1.5;

    for (let i = 0; i < sampleSize; i++) {
      const binIndex = Math.floor((i / sampleSize) * (this.bufferLength / 2));
      const amplified = Math.min(255, this.dataArray[binIndex] * amplification);
      visualData[i] = amplified;
    }

    // Store for getColor to access
    this.currentVisualData = visualData;
    return visualData;
  }

  // Color schemes
  getColor(index, total) {
    const scheme = this.colorScheme.value;
    const hue = (index / total) * 360;
    const dataSource = this.currentVisualData || this.dataArray;
    const value = dataSource[index] || 0;
    const intensity = value / 255;

    switch (scheme) {
      case 'rainbow':
        return `hsl(${hue}, 100%, ${60 + intensity * 40}%)`;

      case 'fire':
        const fireHue = 0 + (60 * intensity);
        return `hsl(${fireHue}, 100%, ${50 + intensity * 40}%)`;

      case 'ocean':
        const oceanHue = 180 + (60 * intensity);
        return `hsl(${oceanHue}, 90%, ${50 + intensity * 40}%)`;

      case 'neon':
        const neonColors = [
          `rgb(${255 * intensity}, 0, ${255 * intensity})`,
          `rgb(0, ${255 * intensity}, ${255 * intensity})`,
          `rgb(${255 * intensity}, ${255 * intensity}, 0)`
        ];
        return neonColors[index % 3];

      case 'purple':
        return `hsl(${270 + intensity * 60}, 90%, ${50 + intensity * 40}%)`;

      default:
        return `hsl(${hue}, 100%, 50%)`;
    }
  }

  // Visualization: Frequency Bars
  drawBars() {
    const visualData = this.getVisualData();
    const bufferLength = visualData.length;
    const barWidth = (this.canvas.width / bufferLength) - 2;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (visualData[i] / 255) * this.canvas.height;

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
    const visualData = this.getVisualData();
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const bufferLength = visualData.length;
    const radius = Math.min(centerX, centerY) - 50;

    // Draw outer circle
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    for (let i = 0; i < bufferLength; i++) {
      const angle = (i / bufferLength) * Math.PI * 2 - Math.PI / 2;
      const barHeight = (visualData[i] / 255) * 150;

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
    const visualData = this.getVisualData();
    const bufferLength = visualData.length;

    // Create new particles
    if (this.particles.length < 100) {
      for (let i = 0; i < 3; i++) {
        const value = visualData[Math.floor(Math.random() * bufferLength)];
        if (value > 80) {
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
      const barHeight = (visualData[i] / 255) * this.canvas.height * 0.4;
      this.ctx.fillStyle = this.getColor(i, bufferLength);
      this.ctx.globalAlpha = 0.2;
      this.ctx.fillRect(i * barWidth, this.canvas.height - barHeight, barWidth - 2, barHeight);
      this.ctx.globalAlpha = 1.0;
    }
  }

  // Main animation loop
  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());

    // Get real-time audio data from analyser (Stage 3: Audio API)
    if (this.analyser) {
      const mode = this.visualMode.value;
      // Use time domain data for waveform, frequency data for others
      if (mode === 'waveform') {
        this.analyser.getByteTimeDomainData(this.dataArray);
      } else {
        this.analyser.getByteFrequencyData(this.dataArray);
      }
    }

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
