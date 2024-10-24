import React, { useState, useCallback } from 'react';
import { Mic, Square, Play, Trash2, AlertCircle } from 'lucide-react';
import { audioRecordingService, AudioRecording } from '../services/audioRecording';
import AudioVisualizer from './AudioVisualizer';

interface AudioRecorderProps {
  word: string;
  onRecordingComplete?: () => void;
}

export default function AudioRecorder({ word, onRecordingComplete }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState<AudioRecording[]>(
    () => audioRecordingService.getRecordingsForWord(word)
  );
  const [visualizerData, setVisualizerData] = useState<Uint8Array | null>(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const startRecording = async () => {
    try {
      setError(null);
      await audioRecordingService.startRecording((data) => {
        setVisualizerData(new Uint8Array(data));
      });
      setIsRecording(true);
      setRecordingDuration(0);
      const interval = setInterval(() => {
        setRecordingDuration(d => {
          if (d >= 30) { // 30 seconds max
            stopRecording();
            clearInterval(interval);
            return d;
          }
          return d + 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Failed to start recording:', error);
      setError('无法访问麦克风，请确保已授予权限。');
    }
  };

  const stopRecording = async () => {
    try {
      const recording = await audioRecordingService.stopRecording();
      audioRecordingService.saveRecording(recording, word);
      setRecordings(audioRecordingService.getRecordingsForWord(word));
      setIsRecording(false);
      setVisualizerData(null);
      setRecordingDuration(0);
      onRecordingComplete?.();
    } catch (error) {
      console.error('Failed to stop recording:', error);
      setIsRecording(false);
      setVisualizerData(null);
      setError('录音保存失败，请重试。');
    }
  };

  const playRecording = (audioUrl: string, id: string) => {
    if (currentlyPlaying === id) {
      return;
    }
    const audio = new Audio(audioUrl);
    audio.onended = () => setCurrentlyPlaying(null);
    audio.play();
    setCurrentlyPlaying(id);
  };

  const deleteRecording = (id: string) => {
    if (currentlyPlaying === id) {
      setCurrentlyPlaying(null);
    }
    audioRecordingService.deleteRecording(id);
    setRecordings(audioRecordingService.getRecordingsForWord(word));
  };

  return (
    <div className="mt-2">
      {error && (
        <div className="mb-2 p-2 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
            >
              <Mic className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="bg-gray-600 hover:bg-gray-700 text-white p-2 rounded-full transition-colors animate-pulse"
            >
              <Square className="w-4 h-4" />
            </button>
          )}
          <span className="text-sm text-gray-600">
            {isRecording ? `录音中 ${recordingDuration}s` : '点击录音'}
          </span>
        </div>

        {visualizerData && (
          <AudioVisualizer data={visualizerData} />
        )}
      </div>

      {recordings.length > 0 && (
        <div className="mt-2 space-y-2">
          {recordings.map((recording) => (
            <div
              key={recording.id}
              className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg"
            >
              <button
                onClick={() => playRecording(recording.audioUrl, recording.id)}
                className={`${
                  currentlyPlaying === recording.id
                    ? 'text-blue-600 animate-pulse'
                    : 'text-blue-500 hover:text-blue-600'
                }`}
              >
                <Play className="w-4 h-4" />
              </button>
              <span className="text-xs text-gray-500">
                {new Date(recording.timestamp).toLocaleString()}
              </span>
              <button
                onClick={() => deleteRecording(recording.id)}
                className="ml-auto text-red-500 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}