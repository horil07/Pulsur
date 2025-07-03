"use client";

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Play, 
  Pause, 
  Music, 
  Search, 
  Filter,
  Heart,
  Clock,
  Zap,
  Volume2
} from 'lucide-react';

interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  genre: string;
  mood: string;
  duration: number;
  bpm: number;
  url: string;
  tags: string[];
  description: string;
  license: 'royalty-free' | 'creative-commons' | 'premium';
  isPopular?: boolean;
  isNew?: boolean;
}

interface BackgroundMusicLibraryProps {
  onTrackSelected: (track: MusicTrack) => void;
  selectedTrack?: MusicTrack;
  onClose: () => void;
}

// Mock music library data
const MUSIC_LIBRARY: MusicTrack[] = [
  {
    id: 'epic-1',
    title: 'Epic Adventure',
    artist: 'Pulsar Studios',
    genre: 'Cinematic',
    mood: 'Energetic',
    duration: 180,
    bpm: 120,
    url: '/music/epic-adventure.mp3',
    tags: ['epic', 'adventure', 'cinematic', 'uplifting'],
    description: 'A powerful orchestral piece perfect for heroic moments',
    license: 'royalty-free',
    isPopular: true
  },
  {
    id: 'chill-1',
    title: 'Dreamy Ambient',
    artist: 'Pulsar Studios',
    genre: 'Ambient',
    mood: 'Relaxed',
    duration: 240,
    bpm: 80,
    url: '/music/dreamy-ambient.mp3',
    tags: ['ambient', 'dreamy', 'relaxed', 'atmospheric'],
    description: 'Ethereal ambient soundscape for peaceful content',
    license: 'royalty-free',
    isNew: true
  },
  {
    id: 'tech-1',
    title: 'Digital Pulse',
    artist: 'Pulsar Studios',
    genre: 'Electronic',
    mood: 'Modern',
    duration: 150,
    bpm: 128,
    url: '/music/digital-pulse.mp3',
    tags: ['electronic', 'modern', 'tech', 'futuristic'],
    description: 'Modern electronic beat with digital elements',
    license: 'royalty-free'
  },
  {
    id: 'folk-1',
    title: 'Acoustic Journey',
    artist: 'Pulsar Studios',
    genre: 'Folk',
    mood: 'Warm',
    duration: 200,
    bpm: 95,
    url: '/music/acoustic-journey.mp3',
    tags: ['acoustic', 'folk', 'warm', 'guitar'],
    description: 'Heartwarming acoustic guitar melody',
    license: 'creative-commons',
    isPopular: true
  },
  {
    id: 'jazz-1',
    title: 'Smooth Nights',
    artist: 'Pulsar Studios',
    genre: 'Jazz',
    mood: 'Sophisticated',
    duration: 220,
    bpm: 100,
    url: '/music/smooth-nights.mp3',
    tags: ['jazz', 'smooth', 'sophisticated', 'piano'],
    description: 'Elegant jazz composition with piano and saxophone',
    license: 'royalty-free'
  },
  {
    id: 'rock-1',
    title: 'Power Drive',
    artist: 'Pulsar Studios',
    genre: 'Rock',
    mood: 'Powerful',
    duration: 160,
    bpm: 140,
    url: '/music/power-drive.mp3',
    tags: ['rock', 'powerful', 'energetic', 'guitar'],
    description: 'High-energy rock track with driving guitar riffs',
    license: 'royalty-free',
    isNew: true
  }
];

const GENRES = ['All', 'Cinematic', 'Ambient', 'Electronic', 'Folk', 'Jazz', 'Rock'];
const MOODS = ['All', 'Energetic', 'Relaxed', 'Modern', 'Warm', 'Sophisticated', 'Powerful'];

export default function BackgroundMusicLibrary({
  onTrackSelected,
  selectedTrack,
  onClose
}: BackgroundMusicLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedMood, setSelectedMood] = useState('All');
  const [currentPlaying, setCurrentPlaying] = useState<string | null>(null);
  const [volume, setVolume] = useState(50);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const audioRef = useRef<HTMLAudioElement>(null);

  // Filter tracks based on search and filters
  const filteredTracks = MUSIC_LIBRARY.filter(track => {
    const matchesSearch = track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         track.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesGenre = selectedGenre === 'All' || track.genre === selectedGenre;
    const matchesMood = selectedMood === 'All' || track.mood === selectedMood;
    
    return matchesSearch && matchesGenre && matchesMood;
  });

  const handlePlayPause = (track: MusicTrack) => {
    if (currentPlaying === track.id) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setCurrentPlaying(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = track.url;
        audioRef.current.volume = volume / 100;
        audioRef.current.play().catch(console.error);
      }
      setCurrentPlaying(track.id);
    }
  };

  const toggleFavorite = (trackId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(trackId)) {
      newFavorites.delete(trackId);
    } else {
      newFavorites.add(trackId);
    }
    setFavorites(newFavorites);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getLicenseBadgeColor = (license: string) => {
    switch (license) {
      case 'royalty-free': return 'bg-green-100 text-green-800';
      case 'creative-commons': return 'bg-blue-100 text-blue-800';
      case 'premium': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Hidden audio element for playback */}
      <audio
        ref={audioRef}
        onEnded={() => setCurrentPlaying(null)}
        onError={() => setCurrentPlaying(null)}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Music className="h-5 w-5 text-purple-500" />
          <h2 className="text-xl font-semibold">Background Music Library</h2>
          <Badge variant="secondary">{filteredTracks.length} tracks</Badge>
        </div>
        <Button variant="outline" onClick={onClose}>
          Close Library
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
                  placeholder="Search tracks, artists, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Genre Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm"
                aria-label="Filter by genre"
              >
                {GENRES.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>

            {/* Mood Filter */}
            <div className="flex items-center gap-2">
              <select
                value={selectedMood}
                onChange={(e) => setSelectedMood(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm"
                aria-label="Filter by mood"
              >
                {MOODS.map(mood => (
                  <option key={mood} value={mood}>{mood}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-3 mt-4">
            <Volume2 className="h-4 w-4 text-gray-500" />
            <input
              type="range"
              value={volume}
              onChange={(e) => setVolume(parseInt(e.target.value))}
              max={100}
              className="flex-1 max-w-xs"
              aria-label="Preview volume"
            />
            <span className="text-sm text-gray-500 min-w-[40px]">{volume}%</span>
          </div>
        </CardContent>
      </Card>

      {/* Music Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTracks.map((track) => (
          <Card
            key={track.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedTrack?.id === track.id ? 'ring-2 ring-purple-500' : ''
            }`}
            onClick={() => onTrackSelected(track)}
          >
            <CardContent className="p-4">
              {/* Track Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-medium text-sm line-clamp-1">{track.title}</h3>
                  <p className="text-xs text-gray-600">{track.artist}</p>
                </div>
                <div className="flex items-center gap-1">
                  {track.isNew && (
                    <Badge className="bg-green-100 text-green-800 text-xs px-1.5 py-0.5">
                      New
                    </Badge>
                  )}
                  {track.isPopular && (
                    <Badge className="bg-orange-100 text-orange-800 text-xs px-1.5 py-0.5">
                      Popular
                    </Badge>
                  )}
                </div>
              </div>

              {/* Track Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDuration(track.duration)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    {track.bpm} BPM
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {track.genre}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {track.mood}
                  </Badge>
                </div>

                <div className={`text-xs px-2 py-1 rounded ${getLicenseBadgeColor(track.license)}`}>
                  {track.license.replace('-', ' ').toUpperCase()}
                </div>

                <p className="text-xs text-gray-600 line-clamp-2">
                  {track.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {track.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayPause(track);
                    }}
                    className="flex items-center gap-1 text-xs"
                  >
                    {currentPlaying === track.id ? (
                      <Pause className="h-3 w-3" />
                    ) : (
                      <Play className="h-3 w-3" />
                    )}
                    {currentPlaying === track.id ? 'Pause' : 'Preview'}
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(track.id);
                    }}
                    className={`flex items-center gap-1 text-xs ${
                      favorites.has(track.id) ? 'text-red-500' : 'text-gray-500'
                    }`}
                  >
                    <Heart className={`h-3 w-3 ${favorites.has(track.id) ? 'fill-current' : ''}`} />
                  </Button>
                </div>

                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTrackSelected(track);
                  }}
                  className="text-xs"
                >
                  Select
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTracks.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Music className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No tracks found matching your criteria</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setSelectedGenre('All');
                setSelectedMood('All');
              }}
              className="mt-4"
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
