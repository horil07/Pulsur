"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  Volume2, 
  Music, 
  Wand2, 
  Download,
  RotateCcw,
  Settings,
  Headphones,
  Mic
} from 'lucide-react';

interface AudioFile {
  id: string;
  name: string;
  url: string;
  duration: number;
  waveform?: number[];
}

interface AudioEffect {
  id: string;
  name: string;
  type: 'reverb' | 'delay' | 'chorus' | 'distortion' | 'equalizer' | 'compressor';
  params: { [key: string]: number };
  enabled: boolean;
}

interface AudioEnhancementToolsProps {
  audioFile?: AudioFile;
  onAudioProcessed: (audioData: { file: File; effects: AudioEffect[] }) => void;
  onClose: () => void;
}

export default function AudioEnhancementTools({
  audioFile,
  onAudioProcessed,
  onClose
}: AudioEnhancementToolsProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState([80]);
  const [effects, setEffects] = useState<AudioEffect[]>([
    { id: 'reverb', name: 'Reverb', type: 'reverb', params: { wetness: 0, roomSize: 0.5 }, enabled: false },
    { id: 'delay', name: 'Delay', type: 'delay', params: { delayTime: 0.3, feedback: 0.4 }, enabled: false },
    { id: 'chorus', name: 'Chorus', type: 'chorus', params: { rate: 1.5, depth: 0.7 }, enabled: false },
    { id: 'distortion', name: 'Distortion', type: 'distortion', params: { amount: 0, tone: 0.5 }, enabled: false },
    { id: 'compressor', name: 'Compressor', type: 'compressor', params: { threshold: -24, ratio: 4 }, enabled: false }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Audio context for real-time processing
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const effectsChainRef = useRef<AudioNode[]>([]);

  useEffect(() => {
    // Initialize Web Audio API
    if (typeof window !== 'undefined' && audioFile) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as any).webkitAudioContext)();
      setupAudioProcessing();
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [audioFile]);

  const setupAudioProcessing = () => {
    if (!audioRef.current || !audioContextRef.current) return;

    // Create source node
    sourceNodeRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
    
    // Create effects chain
    const gainNode = audioContextRef.current.createGain();
    effectsChainRef.current = [gainNode];

    // Connect to destination
    sourceNodeRef.current.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume[0] / 100;
    }
  };

  const toggleEffect = (effectId: string) => {
    setEffects(effects.map(effect => 
      effect.id === effectId 
        ? { ...effect, enabled: !effect.enabled }
        : effect
    ));
  };

  const updateEffectParam = (effectId: string, paramName: string, value: number) => {
    setEffects(effects.map(effect => 
      effect.id === effectId 
        ? { 
            ...effect, 
            params: { ...effect.params, [paramName]: value }
          }
        : effect
    ));
  };

  const applyEffects = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate audio processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create processed file (mock implementation)
      const processedFile = new File(['processed audio'], 'enhanced-audio.wav', { type: 'audio/wav' });
      
      onAudioProcessed({
        file: processedFile,
        effects: effects.filter(effect => effect.enabled)
      });
      
    } catch (error) {
      console.error('Audio processing failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetEffects = () => {
    setEffects(effects.map(effect => ({ ...effect, enabled: false })));
    setVolume([80]);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Headphones className="h-5 w-5 text-purple-500" />
          <h2 className="text-xl font-semibold">Audio Enhancement Studio</h2>
        </div>
        <Button variant="outline" onClick={onClose}>
          Close Studio
        </Button>
      </div>

      {/* Audio Player */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-4 w-4" />
            Audio Player & Preview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {audioFile ? (
            <>
              <audio
                ref={audioRef}
                src={audioFile.url}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
              />
              
              {/* Waveform Visualization */}
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  className="w-full h-20 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg"
                  width={800}
                  height={80}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-sm text-gray-500">Waveform Visualization</div>
                </div>
              </div>

              {/* Controls */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={togglePlayPause}
                    className="flex items-center gap-2"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    {isPlaying ? 'Pause' : 'Play'}
                  </Button>
                  
                  <div className="flex-1">
                    <input
                      type="range"
                      min={0}
                      max={duration}
                      value={currentTime}
                      onChange={(e) => {
                        const time = parseFloat(e.target.value);
                        if (audioRef.current) {
                          audioRef.current.currentTime = time;
                        }
                      }}
                      className="w-full"
                      aria-label="Audio timeline"
                    />
                  </div>
                  
                  <div className="text-sm text-gray-500 min-w-[80px]">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>
                </div>

                {/* Volume Control */}
                <div className="flex items-center gap-3">
                  <Volume2 className="h-4 w-4 text-gray-500" />
                  <input
                    type="range"
                    value={volume[0]}
                    onChange={(e) => handleVolumeChange([parseInt(e.target.value)])}
                    max={100}
                    step={1}
                    className="flex-1 max-w-xs"
                    aria-label="Volume control"
                  />
                  <span className="text-sm text-gray-500 min-w-[40px]">{volume[0]}%</span>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Mic className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No audio file loaded</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Effects Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-4 w-4" />
            Audio Effects Suite
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {effects.map((effect) => (
              <div
                key={effect.id}
                className={`p-4 border rounded-lg transition-all ${
                  effect.enabled 
                    ? 'border-purple-200 bg-purple-50' 
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    <span className="font-medium">{effect.name}</span>
                  </div>
                  <Badge
                    variant={effect.enabled ? "default" : "secondary"}
                    className="cursor-pointer"
                    onClick={() => toggleEffect(effect.id)}
                  >
                    {effect.enabled ? 'ON' : 'OFF'}
                  </Badge>
                </div>

                {effect.enabled && (
                  <div className="space-y-3">
                    {Object.entries(effect.params).map(([paramName, paramValue]) => (
                      <div key={paramName}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="capitalize">{paramName}</span>
                          <span>{paramValue}</span>
                        </div>
                        <input
                          type="range"
                          value={paramValue}
                          onChange={(e) => updateEffectParam(effect.id, paramName, parseFloat(e.target.value))}
                          max={1}
                          step={0.1}
                          className="w-full"
                          aria-label={`${effect.name} ${paramName} control`}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={resetEffects}
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reset All Effects
        </Button>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export Audio
          </Button>
          
          <Button
            onClick={applyEffects}
            disabled={isProcessing}
            className="flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Processing...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" />
                Apply & Continue
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
