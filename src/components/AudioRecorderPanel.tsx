import React from 'react';
import { X } from 'lucide-react';
import AudioRecorder from './AudioRecorder';

interface AudioRecorderPanelProps {
  word: string;
  onClose: () => void;
}

export default function AudioRecorderPanel({ word, onClose }: AudioRecorderPanelProps) {
  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50">
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">录制 "{word}" 的发音</h3>
              <p className="text-sm text-gray-500">点击麦克风开始录音</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          <div className="max-h-[60vh] overflow-y-auto">
            <AudioRecorder 
              word={word}
              onRecordingComplete={onClose}
            />
          </div>
        </div>
      </div>
    </div>
  );
}