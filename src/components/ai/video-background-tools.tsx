"use client";

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Play, 
  Pause, 
  Monitor, 
  Search, 
  Filter,
  Palette,
  Settings,
  Video,
  Image,
  Sparkles,
  RotateCcw
} from 'lucide-react';

interface VideoBackground {
  id: string;
  name: string;
  category: 'nature' | 'abstract' | 'urban' | 'space' | 'gradient' | 'texture';
  type: 'video' | 'image' | 'generated';
  preview: string;
  url: string;
  duration?: number;
  tags: string[];
  description: string;
  isNew?: boolean;
  isPopular?: boolean;
}

interface VideoBackgroundToolsProps {
  onBackgroundSelected: (background: VideoBackground, settings: BackgroundSettings) => void;
  selectedBackground?: VideoBackground;
  onClose: () => void;
}

interface BackgroundSettings {
  opacity: number;
  blendMode: string;
  scale: number;
  position: { x: number; y: number };
  blur: number;
  brightness: number;
  contrast: number;
  saturation: number;
}

// Mock background library
const BACKGROUND_LIBRARY: VideoBackground[] = [
  {
    id: 'nature-1',
    name: 'Forest Canopy',
    category: 'nature',
    type: 'video',
    preview: '/backgrounds/forest-preview.jpg',
    url: '/backgrounds/forest-canopy.mp4',
    duration: 30,
    tags: ['nature', 'trees', 'peaceful', 'green'],
    description: 'Serene forest canopy with gentle movement',
    isPopular: true
  },
  {
    id: 'abstract-1',
    name: 'Flowing Particles',
    category: 'abstract',
    type: 'video',
    preview: '/backgrounds/particles-preview.jpg',
    url: '/backgrounds/flowing-particles.mp4',
    duration: 20,
    tags: ['abstract', 'particles', 'flowing', 'colorful'],
    description: 'Colorful particles flowing in abstract patterns',
    isNew: true
  },
  {
    id: 'space-1',
    name: 'Starfield',
    category: 'space',
    type: 'video',
    preview: '/backgrounds/stars-preview.jpg',
    url: '/backgrounds/starfield.mp4',
    duration: 60,
    tags: ['space', 'stars', 'cosmic', 'dark'],
    description: 'Gentle starfield movement in deep space'
  },
  {
    id: 'gradient-1',
    name: 'Sunset Gradient',
    category: 'gradient',
    type: 'image',
    preview: '/backgrounds/sunset-gradient.jpg',
    url: '/backgrounds/sunset-gradient.jpg',
    tags: ['gradient', 'sunset', 'warm', 'orange'],
    description: 'Warm sunset gradient background',
    isPopular: true
  },
  {
    id: 'urban-1',
    name: 'City Lights',
    category: 'urban',
    type: 'video',
    preview: '/backgrounds/city-preview.jpg',
    url: '/backgrounds/city-lights.mp4',
    duration: 25,
    tags: ['urban', 'city', 'lights', 'modern'],
    description: 'Dynamic city lights and traffic flow'
  },
  {
    id: 'texture-1',
    name: 'Paper Texture',
    category: 'texture',
    type: 'image',
    preview: '/backgrounds/paper-texture.jpg',
    url: '/backgrounds/paper-texture.jpg',
    tags: ['texture', 'paper', 'neutral', 'subtle'],
    description: 'Subtle paper texture for elegant backgrounds'
  }
];

const CATEGORIES = ['All', 'Nature', 'Abstract', 'Urban', 'Space', 'Gradient', 'Texture'];
const BLEND_MODES = ['normal', 'multiply', 'screen', 'overlay', 'soft-light', 'hard-light'];

export default function VideoBackgroundTools({
  onBackgroundSelected,
  selectedBackground,
  onClose
}: VideoBackgroundToolsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPlaying, setCurrentPlaying] = useState<string | null>(null);
  const [showCustomizer, setShowCustomizer] = useState(false);
  
  const [settings, setSettings] = useState<BackgroundSettings>({
    opacity: 80,
    blendMode: 'normal',
    scale: 100,
    position: { x: 50, y: 50 },
    blur: 0,
    brightness: 100,
    contrast: 100,
    saturation: 100
  });

  const videoRef = useRef<HTMLVideoElement>(null);

  // Filter backgrounds
  const filteredBackgrounds = BACKGROUND_LIBRARY.filter(bg => {
    const matchesSearch = bg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         bg.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All' || 
                           bg.category === selectedCategory.toLowerCase();
    
    return matchesSearch && matchesCategory;
  });

  const handlePlayPause = (background: VideoBackground) => {
    if (background.type !== 'video') return;
    
    if (currentPlaying === background.id) {
      if (videoRef.current) {
        videoRef.current.pause();
      }
      setCurrentPlaying(null);
    } else {
      if (videoRef.current) {
        videoRef.current.src = background.url;
        videoRef.current.play().catch(console.error);
      }
      setCurrentPlaying(background.id);
    }
  };

  const updateSetting = (key: keyof BackgroundSettings, value: number | string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    setSettings({
      opacity: 80,
      blendMode: 'normal',
      scale: 100,
      position: { x: 50, y: 50 },
      blur: 0,
      brightness: 100,
      contrast: 100,
      saturation: 100
    });
  };

  const applyBackground = () => {
    if (selectedBackground) {
      onBackgroundSelected(selectedBackground, settings);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Hidden video element for preview */}
      <video
        ref={videoRef}
        onEnded={() => setCurrentPlaying(null)}
        onError={() => setCurrentPlaying(null)}
        muted
        loop
        className="hidden"
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Video className="h-5 w-5 text-purple-500" />
          <h2 className="text-xl font-semibold">Video Background Studio</h2>
          <Badge variant="secondary">{filteredBackgrounds.length} backgrounds</Badge>
        </div>
        <Button variant="outline" onClick={onClose}>
          Close Studio
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search backgrounds, categories, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm"
                aria-label="Filter by category"
              >
                {CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Customizer Toggle */}
            <Button
              variant={showCustomizer ? "default" : "outline"}
              onClick={() => setShowCustomizer(!showCustomizer)}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Customize
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Background Library */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filteredBackgrounds.map((background) => (
              <Card
                key={background.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedBackground?.id === background.id ? 'ring-2 ring-purple-500' : ''
                }`}
                onClick={() => {
                  onBackgroundSelected(background, settings);
                  setShowCustomizer(true);
                }}
              >
                <CardContent className="p-3">
                  {/* Preview */}
                  <div className="relative aspect-video mb-3 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={background.preview}
                      alt={background.name}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Type indicator */}
                    <div className="absolute top-2 left-2">
                      {background.type === 'video' ? (
                        <Video className="h-4 w-4 text-white drop-shadow-lg" />
                      ) : (
                        <Image className="h-4 w-4 text-white drop-shadow-lg" />
                      )}
                    </div>

                    {/* Status badges */}
                    <div className="absolute top-2 right-2 flex gap-1">
                      {background.isNew && (
                        <Badge className="bg-green-500 text-white text-xs px-1.5 py-0.5">New</Badge>
                      )}
                      {background.isPopular && (
                        <Badge className="bg-orange-500 text-white text-xs px-1.5 py-0.5">Popular</Badge>
                      )}
                    </div>

                    {/* Play button for videos */}
                    {background.type === 'video' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayPause(background);
                        }}
                        className="absolute bottom-2 left-2 h-6 w-6 p-0"
                      >
                        {currentPlaying === background.id ? (
                          <Pause className="h-3 w-3" />
                        ) : (
                          <Play className="h-3 w-3" />
                        )}
                      </Button>
                    )}

                    {/* Duration for videos */}
                    {background.duration && (
                      <span className="absolute bottom-2 right-2 text-xs text-white bg-black/50 px-1.5 py-0.5 rounded">
                        {formatDuration(background.duration)}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="space-y-2">
                    <h3 className="font-medium text-sm line-clamp-1">{background.name}</h3>
                    <Badge variant="outline" className="text-xs capitalize">
                      {background.category}
                    </Badge>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {background.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredBackgrounds.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Monitor className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No backgrounds found</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Background Customizer */}
        {showCustomizer && selectedBackground && (
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Background Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Preview */}
                <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 border-2 border-dashed border-gray-200">
                  <img
                    src={selectedBackground.preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    style={{
                      opacity: settings.opacity / 100,
                      transform: `scale(${settings.scale / 100})`,
                      filter: `blur(${settings.blur}px) brightness(${settings.brightness}%) contrast(${settings.contrast}%) saturate(${settings.saturation}%)`,
                      mixBlendMode: settings.blendMode as 'normal' | 'multiply' | 'screen' | 'overlay' | 'soft-light' | 'hard-light'
                    }}
                  />
                </div>

                {/* Opacity */}
                <div>
                  <label className="text-sm font-medium flex justify-between">
                    Opacity
                    <span>{settings.opacity}%</span>
                  </label>
                  <input
                    type="range"
                    value={settings.opacity}
                    onChange={(e) => updateSetting('opacity', parseInt(e.target.value))}
                    max={100}
                    className="w-full mt-1"
                    aria-label="Background opacity"
                  />
                </div>

                {/* Scale */}
                <div>
                  <label className="text-sm font-medium flex justify-between">
                    Scale
                    <span>{settings.scale}%</span>
                  </label>
                  <input
                    type="range"
                    value={settings.scale}
                    onChange={(e) => updateSetting('scale', parseInt(e.target.value))}
                    min={50}
                    max={200}
                    className="w-full mt-1"
                    aria-label="Background scale"
                  />
                </div>

                {/* Blur */}
                <div>
                  <label className="text-sm font-medium flex justify-between">
                    Blur
                    <span>{settings.blur}px</span>
                  </label>
                  <input
                    type="range"
                    value={settings.blur}
                    onChange={(e) => updateSetting('blur', parseInt(e.target.value))}
                    max={20}
                    className="w-full mt-1"
                    aria-label="Background blur"
                  />
                </div>

                {/* Brightness */}
                <div>
                  <label className="text-sm font-medium flex justify-between">
                    Brightness
                    <span>{settings.brightness}%</span>
                  </label>
                  <input
                    type="range"
                    value={settings.brightness}
                    onChange={(e) => updateSetting('brightness', parseInt(e.target.value))}
                    max={200}
                    className="w-full mt-1"
                    aria-label="Background brightness"
                  />
                </div>

                {/* Contrast */}
                <div>
                  <label className="text-sm font-medium flex justify-between">
                    Contrast
                    <span>{settings.contrast}%</span>
                  </label>
                  <input
                    type="range"
                    value={settings.contrast}
                    onChange={(e) => updateSetting('contrast', parseInt(e.target.value))}
                    max={200}
                    className="w-full mt-1"
                    aria-label="Background contrast"
                  />
                </div>

                {/* Saturation */}
                <div>
                  <label className="text-sm font-medium flex justify-between">
                    Saturation
                    <span>{settings.saturation}%</span>
                  </label>
                  <input
                    type="range"
                    value={settings.saturation}
                    onChange={(e) => updateSetting('saturation', parseInt(e.target.value))}
                    max={200}
                    className="w-full mt-1"
                    aria-label="Background saturation"
                  />
                </div>

                {/* Blend Mode */}
                <div>
                  <label className="text-sm font-medium">Blend Mode</label>
                  <select
                    value={settings.blendMode}
                    onChange={(e) => updateSetting('blendMode', e.target.value)}
                    className="w-full mt-1 border rounded-md px-3 py-2 text-sm"
                    aria-label="Background blend mode"
                  >
                    {BLEND_MODES.map(mode => (
                      <option key={mode} value={mode}>
                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={resetSettings}
                    className="flex-1 flex items-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </Button>
                  <Button
                    onClick={applyBackground}
                    className="flex-1 flex items-center gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    Apply
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
