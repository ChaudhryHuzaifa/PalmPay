// src/renderer/utils/webcam.ts

export class WebcamManager {
  private stream: MediaStream | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private capturedImages: string[] = [];

  async start(videoElementId: string): Promise<boolean> {
    try {
      // Stop any existing stream
      if (this.stream) {
        this.stop();
      }

      // Get video element
      this.videoElement = document.getElementById(videoElementId) as HTMLVideoElement;
      if (!this.videoElement) {
        throw new Error(`Video element ${videoElementId} not found`);
      }

      // Request camera access
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });

      // Set video source
      this.videoElement.srcObject = this.stream;
      await this.videoElement.play();

      return true;
    } catch (error) {
      console.error('Failed to start webcam:', error);
      throw error;
    }
  }

  capture(): string | null {
    if (!this.videoElement || !this.stream) {
      console.error('Webcam not started');
      return null;
    }

    try {
      const canvas = document.createElement('canvas');
      canvas.width = this.videoElement.videoWidth;
      canvas.height = this.videoElement.videoHeight;

      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Failed to get canvas context');
      }

      // Draw current video frame
      context.drawImage(this.videoElement, 0, 0, canvas.width, canvas.height);

      // Convert to base64 JPEG
      const base64Image = canvas.toDataURL('image/jpeg', 0.8);
      
      // Store for reference
      this.capturedImages.push(base64Image);

      // Return base64 without prefix for API
      return this.extractBase64Data(base64Image);
    } catch (error) {
      console.error('Failed to capture image:', error);
      return null;
    }
  }

  async captureMultiple(count: number = 5, interval: number = 500): Promise<string[]> {
    const images: string[] = [];

    for (let i = 0; i < count; i++) {
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, interval));
      }

      const image = this.capture();
      if (image) {
        images.push(image);
        
        // Emit progress event
        const event = new CustomEvent('webcam-capture-progress', {
          detail: { current: i + 1, total: count, image }
        });
        window.dispatchEvent(event);
      }
    }

    return images;
  }

  stop(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }

    this.capturedImages = [];
  }

  getCapturedImages(): string[] {
    return this.capturedImages.map(img => this.extractBase64Data(img));
  }

  extractBase64Data(dataUrl: string): string {
    // Remove "data:image/jpeg;base64," prefix
    return dataUrl.replace(/^data:image\/\w+;base64,/, '');
  }

  async isAvailable(): Promise<boolean> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      return videoDevices.length > 0;
    } catch (error) {
      console.error('Error checking webcam availability:', error);
      return false;
    }
  }
}

// Export singleton instance
export const webcamManager = new WebcamManager();