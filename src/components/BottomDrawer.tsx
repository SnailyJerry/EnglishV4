import React from 'react';
import { X } from 'lucide-react';
import AudioRecorder from './AudioRecorder';

interface BottomDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedWord: string | null;
}

export default function BottomDrawer({ isOpen, onClose, selectedWord }: BottomDrawerProps) {
  if (!isOpen || !selectedWord) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      <div className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
        isOpen ? 'translate-y-0' : 'translate-y-full'
      }`}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{selectedWord}</h3>
              <p className="text-sm text-gray-500">录制你的发音</p>
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
              word={selectedWord}
              onRecordingComplete={onClose}
            />
          </div>
        </div>
      </div>
    </>
  );
}