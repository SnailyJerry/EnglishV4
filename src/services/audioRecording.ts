import { VersionControl } from './versionControl';

export interface AudioRecording {
  id: string;
  timestamp: number;
  audioUrl: string;
  wordId: string;
  duration: number;
  score?: number;
}

class AudioRecordingService {
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  private animationFrame: number | null = null;
  private onVisualizerUpdate: ((data: Uint8Array) => void) | null = null;

  async startRecording(onVisualizerUpdate?: (data: Uint8Array) => void): Promise<void> {
    try {
      this.chunks = [];
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });

      // Set up audio context and analyser for visualization
      this.audioContext = new AudioContext();
      const source = this.audioContext.createMediaStreamSource(this.stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      source.connect(this.analyser);
      
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      this.onVisualizerUpdate = onVisualizerUpdate;

      if (onVisualizerUpdate) {
        this.startVisualization();
      }

      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          this.chunks.push(e.data);
        }
      };

      this.mediaRecorder.start(100); // Collect data every 100ms
    } catch (error) {
      console.error('Error starting recording:', error);
      throw new Error('无法访问麦克风');
    }
  }

  private startVisualization = () => {
    const updateVisualizer = () => {
      if (this.analyser && this.dataArray && this.onVisualizerUpdate) {
        this.analyser.getByteFrequencyData(this.dataArray);
        this.onVisualizerUpdate(this.dataArray);
        this.animationFrame = requestAnimationFrame(updateVisualizer);
      }
    };
    updateVisualizer();
  };

  async stopRecording(): Promise<AudioRecording> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('录音未开始'));
        return;
      }

      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame);
        this.animationFrame = null;
      }

      this.mediaRecorder.onstop = async () => {
        const blob = new Blob(this.chunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(blob);
        
        const recording: AudioRecording = {
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          audioUrl,
          wordId: '',
          duration: this.chunks.length * 100
        };

        this.chunks = [];
        if (this.stream) {
          this.stream.getTracks().forEach(track => track.stop());
          this.stream = null;
        }

        if (this.audioContext) {
          await this.audioContext.close();
          this.audioContext = null;
          this.analyser = null;
          this.dataArray = null;
        }

        resolve(recording);
      };

      this.mediaRecorder.stop();
    });
  }

  saveRecording(recording: AudioRecording, word: string): void {
    const recordings = this.getRecordings();
    recordings.push({
      ...recording,
      wordId: word
    });
    localStorage.setItem('audio_recordings', JSON.stringify(recordings));
  }

  getRecordings(): AudioRecording[] {
    const recordingsStr = localStorage.getItem('audio_recordings');
    return recordingsStr ? JSON.parse(recordingsStr) : [];
  }

  getRecordingsForWord(word: string): AudioRecording[] {
    return this.getRecordings().filter(r => r.wordId === word);
  }

  deleteRecording(id: string): void {
    const recordings = this.getRecordings();
    const newRecordings = recordings.filter(r => r.id !== id);
    localStorage.setItem('audio_recordings', JSON.stringify(newRecordings));
  }
}

export const audioRecordingService = new AudioRecordingService();