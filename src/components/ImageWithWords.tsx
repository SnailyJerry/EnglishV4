import React, { useState } from 'react';
import { Volume2, Mic, Book, MessageSquare } from 'lucide-react';
import type { RecognizedWord } from '../services/imageRecognition';
import AudioRecorderPanel from './AudioRecorderPanel';

interface ImageWithWordsProps {
  image: string;
  words: RecognizedWord[];
  onReupload: () => void;
  isLoading: boolean;
}

const ImageWithWords: React.FC<ImageWithWordsProps> = ({ 
  image, 
  words = [], 
  isLoading 
}) => {
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const playWord = (word: string) => {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const playSentence = (sentence: string) => {
    const utterance = new SpeechSynthesisUtterance(sentence);
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  };

  const handleWordClick = (word: string) => {
    setSelectedWord(word);
    playWord(word);
  };

  const handlePlaySound = () => {
    if (selectedWord) {
      playWord(selectedWord);
    }
  };

  const handleStartRecording = () => {
    setIsRecording(true);
  };

  const selectedWordData = selectedWord 
    ? words.find(w => w.word === selectedWord)
    : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <img 
          src={image} 
          alt="Uploaded" 
          className={`max-w-full h-auto rounded-lg shadow-lg ${isLoading ? 'blur-sm' : ''}`}
        />
        
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 rounded-lg">
            <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-white font-medium text-shadow">识别中...</p>
          </div>
        )}

        {!isLoading && words.map((word, index) => (
          <div
            key={`word-${index}`}
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{ 
              left: `${word.box.x + (word.box.width / 2)}%`, 
              top: `${word.box.y + (word.box.height / 2)}%`,
              zIndex: 20
            }}
          >
            <button
              onClick={() => handleWordClick(word.word)}
              className={`bg-white/70 px-3 py-1.5 rounded-lg text-base font-medium hover:scale-105 transition-all duration-300 flex items-center gap-2 whitespace-nowrap shadow-sm hover:shadow ${
                selectedWord === word.word ? 'text-blue-500' : 'text-gray-700'
              }`}
            >
              <span>{word.word}</span>
              <Volume2 className="w-4 h-4 text-blue-500 hover:scale-110 transition-transform" />
            </button>
          </div>
        ))}
      </div>

      {selectedWord && selectedWordData && (
        <div className="bg-white shadow-lg border border-gray-100 rounded-xl p-4 mt-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800">
                  {selectedWord}
                </h3>
                <p className="text-sm text-gray-500">
                  {selectedWordData.translation}
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handlePlaySound}
                  className="flex flex-col items-center gap-1"
                >
                  <div className="w-12 h-12 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors">
                    <Volume2 className="w-6 h-6" />
                  </div>
                  <span className="text-xs text-gray-600">播放</span>
                </button>
                <button
                  onClick={handleStartRecording}
                  className="flex flex-col items-center gap-1"
                >
                  <div className="w-12 h-12 flex items-center justify-center bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors">
                    <Mic className="w-6 h-6" />
                  </div>
                  <span className="text-xs text-gray-600">录音</span>
                </button>
                <button
                  onClick={() => setSelectedWord(null)}
                  className="flex flex-col items-center gap-1"
                >
                  <div className="w-12 h-12 flex items-center justify-center bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors">
                    <Book className="w-6 h-6" />
                  </div>
                  <span className="text-xs text-gray-600">关闭</span>
                </button>
              </div>
            </div>

            {selectedWordData.exampleSentence && (
              <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <p className="text-gray-800">{selectedWordData.exampleSentence.english}</p>
                      <button
                        onClick={() => playSentence(selectedWordData.exampleSentence!.english)}
                        className="p-1 hover:bg-blue-100 rounded-full transition-colors"
                      >
                        <Volume2 className="w-4 h-4 text-blue-500" />
                      </button>
                    </div>
                    <p className="text-gray-500 text-sm">{selectedWordData.exampleSentence.chinese}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {isRecording && selectedWord && (
        <AudioRecorderPanel
          word={selectedWord}
          onClose={() => setIsRecording(false)}
        />
      )}
    </div>
  );
};

export default ImageWithWords;