import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { LocationCoords, NearbyPlace, Guardian, Journey, AudioEvidenceClip } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

interface SafetyContextType {
  location: LocationCoords;
  batteryLevel: number;
  isOnline: boolean;
  gpsStatus: 'locating' | 'active' | 'error';
  gpsAccuracy: number | null;
  refreshGPSLocation: () => Promise<void>;
  
  // SOS
  isSOSActive: boolean;
  sosCountdown: number | null;
  triggerSOS: () => void;
  cancelSOS: () => void;
  isAlarmRinging: boolean;
  toggleAlarm: () => void;

  // Haptics & Siren
  triggerHapticPattern: (pattern: 'tap' | 'countdown' | 'sos_active' | 'sos_cancelled' | 'audio_recorded') => void;
  isSirenActive: boolean;
  toggleSirenMode: () => void;

  // Offline SMS Fallback
  isOffline: boolean;
  smsFallbackMessage: string;
  dispatchSmsFallback: () => void;
  lastSmsFallbackTime: string | null;

  // Auto 30s SOS Audio Recording & Evidence
  audioRecordingState: 'idle' | 'recording' | 'uploading' | 'completed' | 'error';
  audioRecordingSecondsLeft: number;
  audioEvidenceClips: AudioEvidenceClip[];
  latestAudioClipUrl: string | null;
  startSOSAudioRecording: () => void;
  stopSOSAudioRecording: () => void;
  
  // Journey
  activeJourney: Journey | null;
  startJourney: (originName: string, destinationName: string, mode: any) => Promise<void>;
  endJourney: () => Promise<void>;
  checkInIntervalMinutes: number;
  setCheckInIntervalMinutes: (mins: number) => void;
  isSafetyCheckPending: boolean;
  safetyCheckCountdown: number;
  confirmSafetyCheck: () => void;
  triggerCheckInNow: () => void;

  // Voice Wake-Word
  isWakeWordActive: boolean;
  setIsWakeWordActive: (active: boolean) => void;
  customWakeWord: string;
  setCustomWakeWord: (phrase: string) => void;
  isVoiceListening: boolean;
  lastSpokenTranscript: string;
  simulateWakeWordTrigger: () => void;
  
  // Guardians & Phone Tracking
  guardians: Guardian[];
  nearbyPlaces: NearbyPlace[];
  refreshGuardians: () => Promise<void>;
  trackGuardianByPhone: (phone: string) => Promise<any>;
  updateGuardiansLocations: () => Promise<void>;
  lastTrackedPhoneMsg: string | null;
  
  // Fake Call
  isFakeCallActive: boolean;
  fakeCallData: { callerName: string; callerNumber: string };
  scheduleFakeCall: (callerName: string, callerNumber: string, delaySeconds: number) => void;
  acceptFakeCall: () => void;
  declineFakeCall: () => void;
  
  // App view frame toggle
  deviceViewMode: 'phone' | 'fullscreen';
  setDeviceViewMode: (mode: 'phone' | 'fullscreen') => void;
  
  // City switch
  selectedCity: string;
  setSelectedCity: (city: string) => void;
}

const INDIAN_CITIES_COORDS: Record<string, { lat: number; lng: number; address: string }> = {
  'Bengaluru': { lat: 12.9716, lng: 77.5946, address: 'Indiranagar 100ft Rd, Bengaluru' },
  'Delhi NCR': { lat: 28.6139, lng: 77.2090, address: 'Connaught Place, New Delhi' },
  'Mumbai': { lat: 19.0760, lng: 72.8777, address: 'Bandra Kurla Complex, Mumbai' },
  'Hyderabad': { lat: 17.3850, lng: 78.4867, address: 'HITECH City, Hyderabad' },
  'Chennai': { lat: 13.0827, lng: 80.2707, address: 'T. Nagar, Chennai' },
  'Kolkata': { lat: 22.5726, lng: 88.3639, address: 'Park Street, Kolkata' },
  'Pune': { lat: 18.5204, lng: 73.8567, address: 'Viman Nagar, Pune' }
};

const SafetyContext = createContext<SafetyContextType | undefined>(undefined);

export const SafetyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCity, setSelectedCityState] = useState<string>('Bengaluru');
  const [location, setLocation] = useState<LocationCoords>({
    latitude: 12.9716,
    longitude: 77.5946,
    accuracy: 8,
    speed: 0,
    heading: 0,
    address: 'Indiranagar 100ft Rd, Bengaluru',
    city: 'Bengaluru',
    state: 'Karnataka',
    timestamp: Date.now()
  });

  const [batteryLevel, setBatteryLevel] = useState<number>(88);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  
  const [isSOSActive, setIsSOSActive] = useState<boolean>(false);
  const [sosCountdown, setSosCountdown] = useState<number | null>(null);
  const [isAlarmRinging, setIsAlarmRinging] = useState<boolean>(false);
  
  const [activeJourney, setActiveJourney] = useState<Journey | null>(null);
  const [checkInIntervalMinutes, setCheckInIntervalMinutes] = useState<number>(2);
  const [isSafetyCheckPending, setIsSafetyCheckPending] = useState<boolean>(false);
  const [safetyCheckCountdown, setSafetyCheckCountdown] = useState<number>(30);

  // Voice Wake-Word State
  const [isWakeWordActive, setIsWakeWordActive] = useState<boolean>(false);
  const [customWakeWord, setCustomWakeWord] = useState<string>('auralis emergency');
  const [isVoiceListening, setIsVoiceListening] = useState<boolean>(false);
  const [lastSpokenTranscript, setLastSpokenTranscript] = useState<string>('');

  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  
  const [isFakeCallActive, setIsFakeCallActive] = useState<boolean>(false);
  const [fakeCallData, setFakeCallData] = useState({ callerName: 'Venkatesan Ramanujam', callerNumber: '+91 99404 10516' });
  
  const [deviceViewMode, setDeviceViewMode] = useState<'phone' | 'fullscreen'>('fullscreen');
  const [gpsStatus, setGpsStatus] = useState<'locating' | 'active' | 'error'>('locating');
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);

  // Auto 30s SOS Audio Recording state
  const [audioRecordingState, setAudioRecordingState] = useState<'idle' | 'recording' | 'uploading' | 'completed' | 'error'>('idle');
  const [audioRecordingSecondsLeft, setAudioRecordingSecondsLeft] = useState<number>(30);
  const [audioEvidenceClips, setAudioEvidenceClips] = useState<AudioEvidenceClip[]>([]);
  const [latestAudioClipUrl, setLatestAudioClipUrl] = useState<string | null>(null);

  // Audio Recorder & Siren refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioTimerIntervalRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const sirenIntervalRef = useRef<any>(null);

  // User auth details for SMS fallback
  let authUser: any = null;
  try {
    const authCtx = useAuth();
    authUser = authCtx?.user;
  } catch {}

  // Haptic Feedback Engine
  const triggerHapticPattern = useCallback((pattern: 'tap' | 'countdown' | 'sos_active' | 'sos_cancelled' | 'audio_recorded') => {
    if (typeof window === 'undefined' || !('vibrate' in navigator)) return;
    try {
      if (pattern === 'tap') {
        navigator.vibrate([80]);
      } else if (pattern === 'countdown') {
        navigator.vibrate([150]);
      } else if (pattern === 'sos_active') {
        // Distinct SOS Morse Code Vibration Pattern: 3 Short, 3 Long, 3 Short
        navigator.vibrate([150, 80, 150, 80, 150, 200, 400, 100, 400, 100, 400, 200, 150, 80, 150, 80, 150]);
      } else if (pattern === 'sos_cancelled') {
        navigator.vibrate([80, 50, 80]);
      } else if (pattern === 'audio_recorded') {
        navigator.vibrate([250, 100, 250]);
      }
    } catch (e) {
      console.warn('Haptic vibration unavailable or blocked:', e);
    }
  }, []);

  // Offline Detection & Emergency SMS Fallback Engine
  const [isOffline, setIsOffline] = useState<boolean>(() => typeof navigator !== 'undefined' ? !navigator.onLine : false);
  const [lastSmsFallbackTime, setLastSmsFallbackTime] = useState<string | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const userName = authUser?.name || 'Sriram';
  const primaryPhone = authUser?.primaryContactPhone || '+91 99404 10516';
  const primaryName = authUser?.primaryContactName || 'Venkatesan Ramanujam';

  const mapsUrl = `https://maps.google.com/?q=${location.latitude},${location.longitude}`;
  const smsFallbackMessage = `🚨 EMERGENCY SOS ALERT! ${userName} needs immediate assistance! Current GPS Position: ${location.address || 'GPS Position Locked'} (${location.latitude.toFixed(5)}°, ${location.longitude.toFixed(5)}°). Google Maps Pin: ${mapsUrl}. ICE Contact: ${primaryName} (${primaryPhone}).`;

  const dispatchSmsFallback = useCallback(() => {
    triggerHapticPattern('tap');
    const recipientPhones = [primaryPhone, ...guardians.map(g => g.phone)].filter(Boolean).join(',');
    const encodedBody = encodeURIComponent(smsFallbackMessage);
    const smsUri = `sms:${recipientPhones}?body=${encodedBody}`;

    setLastSmsFallbackTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

    try {
      window.open(smsUri, '_self');
    } catch {
      window.location.href = smsUri;
    }
  }, [primaryPhone, guardians, smsFallbackMessage, triggerHapticPattern]);

  // High-Decibel Siren Sound Engine
  const stopAlarmSound = useCallback(() => {
    if (sirenIntervalRef.current) {
      clearInterval(sirenIntervalRef.current);
      sirenIntervalRef.current = null;
    }
    if (oscRef.current) {
      try {
        oscRef.current.stop();
        oscRef.current.disconnect();
      } catch {}
      oscRef.current = null;
    }
    setIsAlarmRinging(false);
  }, []);

  const startSirenSound = useCallback(() => {
    try {
      stopAlarmSound();
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      gain.gain.setValueAtTime(0.85, ctx.currentTime); // High volume deterrence siren

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      oscRef.current = osc;
      setIsAlarmRinging(true);

      let highPitch = false;
      osc.frequency.setValueAtTime(850, ctx.currentTime);

      sirenIntervalRef.current = setInterval(() => {
        if (!ctx || ctx.state === 'closed') return;
        highPitch = !highPitch;
        const targetFreq = highPitch ? 1600 : 850;
        try {
          osc.frequency.exponentialRampToValueAtTime(targetFreq, ctx.currentTime + 0.3);
        } catch {}
      }, 350);
    } catch (err) {
      console.warn('Siren audio playback error:', err);
    }
  }, [stopAlarmSound]);

  const toggleAlarm = useCallback(() => {
    triggerHapticPattern('tap');
    if (isAlarmRinging) {
      stopAlarmSound();
    } else {
      startSirenSound();
    }
  }, [isAlarmRinging, stopAlarmSound, startSirenSound, triggerHapticPattern]);

  // Phone Guardian Tracking state
  const [lastTrackedPhoneMsg, setLastTrackedPhoneMsg] = useState<string | null>(null);

  // Web Audio Synth Chime for Check-In
  const playCheckInChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch {}
  };

  // Scheduled Safety Check-In Timer when Journey is active
  useEffect(() => {
    let interval: any;
    if (activeJourney && !isSafetyCheckPending) {
      // Trigger prompt every checkInIntervalMinutes minutes
      const ms = Math.max(1, checkInIntervalMinutes) * 60 * 1000;
      interval = setInterval(() => {
        setIsSafetyCheckPending(true);
        setSafetyCheckCountdown(30);
        playCheckInChime();
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Auralis Journey Protection Check-In', {
            body: 'Are you safe? Please confirm your safety within 30 seconds.'
          });
        }
      }, ms);
    }
    return () => clearInterval(interval);
  }, [activeJourney, isSafetyCheckPending, checkInIntervalMinutes]);

  // Countdown timer when safety check is pending
  useEffect(() => {
    let timer: any;
    if (isSafetyCheckPending) {
      if (safetyCheckCountdown > 0) {
        timer = setTimeout(() => {
          setSafetyCheckCountdown(prev => prev - 1);
        }, 1000);
      } else {
        // Countdown reached 0 without confirmation -> Auto escalation to SOS!
        setIsSafetyCheckPending(false);
        setIsSOSActive(true);
        toggleAlarm();
        api.triggerSOS({ location, batteryLevel, type: 'checkin_timeout' });
      }
    }
    return () => clearTimeout(timer);
  }, [isSafetyCheckPending, safetyCheckCountdown, location, batteryLevel]);

  const confirmSafetyCheck = () => {
    setIsSafetyCheckPending(false);
    setSafetyCheckCountdown(30);
  };

  const triggerCheckInNow = () => {
    setIsSafetyCheckPending(true);
    setSafetyCheckCountdown(30);
    playCheckInChime();
  };

  // Voice Wake-Word Web Speech API listener
  useEffect(() => {
    if (!isWakeWordActive) {
      setIsVoiceListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsVoiceListening(false);
      return;
    }

    let recognition: any;
    try {
      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsVoiceListening(true);
      recognition.onend = () => {
        if (isWakeWordActive) {
          try { recognition.start(); } catch {}
        } else {
          setIsVoiceListening(false);
        }
      };

      recognition.onresult = (event: any) => {
        let text = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          text += event.results[i][0].transcript;
        }
        text = text.toLowerCase();
        setLastSpokenTranscript(text);

        const phrase = (customWakeWord || 'auralis emergency').toLowerCase();
        if (
          text.includes(phrase) ||
          text.includes('help me') ||
          text.includes('emergency') ||
          text.includes('save me')
        ) {
          setIsSOSActive(true);
          toggleAlarm();
          api.triggerSOS({ location, batteryLevel, type: 'voice_wake_word' });
        }
      };

      recognition.start();
    } catch (err) {
      console.warn('Voice Wake-Word SpeechRecognition error:', err);
    }

    return () => {
      if (recognition) {
        try { recognition.stop(); } catch {}
      }
    };
  }, [isWakeWordActive, customWakeWord, location, batteryLevel]);

  const simulateWakeWordTrigger = () => {
    setLastSpokenTranscript(customWakeWord || 'auralis emergency');
    setIsSOSActive(true);
    toggleAlarm();
    api.triggerSOS({ location, batteryLevel, type: 'voice_wake_word_test' });
  };

  // Helper for Reverse Geocoding via Nominatim
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      if (data && data.address) {
        const road = data.address.road || data.address.suburb || data.address.neighbourhood || '';
        const rawCity = data.address.city || data.address.town || data.address.village || data.address.county || data.address.state_district || 'Local Area';
        
        let city = rawCity;
        const lc = rawCity.toLowerCase();
        if (lc.includes('chennai') || lc.includes('madras')) city = 'Chennai';
        else if (lc.includes('bengaluru') || lc.includes('bangalore')) city = 'Bengaluru';
        else if (lc.includes('mumbai') || lc.includes('bombay')) city = 'Mumbai';
        else if (lc.includes('delhi') || lc.includes('new delhi')) city = 'Delhi NCR';
        else if (lc.includes('hyderabad')) city = 'Hyderabad';
        else if (lc.includes('kolkata') || lc.includes('calcutta')) city = 'Kolkata';
        else if (lc.includes('pune')) city = 'Pune';

        const state = data.address.state || 'India';
        const displayAddr = road ? `${road}, ${city}` : (data.display_name ? data.display_name.split(',').slice(0, 3).join(',') : `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`);
        return { address: displayAddr, city, state };
      }
    } catch {
      // Ignore network errors on geocoding
    }
    return null;
  };

  // Explicit device GPS refresh method
  const refreshGPSLocation = useCallback(async (): Promise<void> => {
    setGpsStatus('locating');
    return new Promise((resolve) => {
      if (!('geolocation' in navigator)) {
        setGpsStatus('error');
        resolve();
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const accuracy = Math.round(pos.coords.accuracy);

          setGpsAccuracy(accuracy);
          setGpsStatus('active');

          const geoDetails = await reverseGeocode(lat, lng);

          if (geoDetails?.city) {
            setSelectedCityState(geoDetails.city);
          }

          setLocation({
            latitude: lat,
            longitude: lng,
            accuracy,
            speed: pos.coords.speed ? Math.round(pos.coords.speed * 3.6) : 0,
            heading: pos.coords.heading || 0,
            address: geoDetails?.address || `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`,
            city: geoDetails?.city || selectedCity,
            state: geoDetails?.state || 'India',
            timestamp: pos.timestamp
          });
          resolve();
        },
        (err) => {
          console.warn('Manual GPS error:', err.message);
          setGpsStatus('error');
          resolve();
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
      );
    });
  }, [selectedCity]);

  // 1. Geolocation Setup
  useEffect(() => {
    refreshGPSLocation();

    if ('geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const accuracy = Math.round(pos.coords.accuracy);

          setGpsAccuracy(accuracy);
          setGpsStatus('active');

          setLocation(prev => ({
            ...prev,
            latitude: lat,
            longitude: lng,
            accuracy,
            speed: pos.coords.speed ? Math.round(pos.coords.speed * 3.6) : 0,
            heading: pos.coords.heading || 0,
            timestamp: pos.timestamp
          }));

          // Trigger reverse geocoding in background
          const geoDetails = await reverseGeocode(lat, lng);
          if (geoDetails) {
            if (geoDetails.city) {
              setSelectedCityState(geoDetails.city);
            }
            setLocation(prev => ({
              ...prev,
              address: geoDetails.address,
              city: geoDetails.city,
              state: geoDetails.state
            }));
          }
        },
        (err) => {
          console.warn('Geolocation watch error:', err.message);
          setGpsStatus('error');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [refreshGPSLocation]);

  // Battery monitoring
  useEffect(() => {
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100));
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
      });
    }
  }, []);

  // Online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch Guardians & Places
  const fetchPlaces = useCallback(async (lat: number, lng: number, city?: string) => {
    const res = await api.getNearbyPlaces(lat, lng, city);
    if (res?.places) {
      setNearbyPlaces(res.places);
    }
  }, []);

  const refreshGuardians = useCallback(async () => {
    const res = await api.getGuardians();
    if (res?.guardians) {
      setGuardians(res.guardians);
    }
  }, []);

  useEffect(() => {
    refreshGuardians();
    fetchPlaces(location.latitude, location.longitude, location.city);
  }, [location.latitude, location.longitude, location.city, fetchPlaces, refreshGuardians]);

  // City Switcher
  const setSelectedCity = (city: string) => {
    setSelectedCityState(city);
    const cityCoords = INDIAN_CITIES_COORDS[city] || INDIAN_CITIES_COORDS['Bengaluru'];
    setLocation(prev => ({
      ...prev,
      latitude: cityCoords.lat,
      longitude: cityCoords.lng,
      address: cityCoords.address,
      city
    }));
  };

  // SOS Audio Recording Engine
  const stopSOSAudioRecording = useCallback(() => {
    if (audioTimerIntervalRef.current) clearInterval(audioTimerIntervalRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try { mediaRecorderRef.current.stop(); } catch {}
    }
    setAudioRecordingState('completed');
  }, []);

  const startSOSAudioRecording = useCallback(async () => {
    try {
      setAudioRecordingState('recording');
      setAudioRecordingSecondsLeft(30);
      audioChunksRef.current = [];

      let stream: MediaStream | null = null;
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true }).catch(err => {
          console.warn('Microphone permission blocked or unavailable:', err);
          return null;
        });
      }

      if (stream) {
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        recorder.onstop = async () => {
          setAudioRecordingState('uploading');
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const clipUrl = URL.createObjectURL(audioBlob);
          setLatestAudioClipUrl(clipUrl);

          // Convert blob to base64 string for upload / server storage
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64Audio = (reader.result as string) || '';
            const res = await api.uploadSOSAudio({
              audioData: base64Audio,
              durationSeconds: 30,
              locationAddress: location.address || 'Current Emergency Location',
              latitude: location.latitude,
              longitude: location.longitude
            });

            const newClip: AudioEvidenceClip = {
              id: res.clip?.id || `audio_${Date.now()}`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              durationSeconds: 30,
              audioUrl: clipUrl,
              locationAddress: location.address || `${location.latitude.toFixed(4)}°, ${location.longitude.toFixed(4)}°`,
              latitude: location.latitude,
              longitude: location.longitude,
              status: 'secured_on_server'
            };

            setAudioEvidenceClips(prev => [newClip, ...prev]);
            setAudioRecordingState('completed');
          };

          // stop stream tracks
          stream?.getTracks().forEach(track => track.stop());
        };

        recorder.start(1000);
      } else {
        // Fallback simulation when mic permission is unavailable in iframe sandbox
        console.log('Audio recording started in emergency simulation mode.');
      }

      // 30-Second Countdown Timer
      let secLeft = 30;
      if (audioTimerIntervalRef.current) clearInterval(audioTimerIntervalRef.current);
      audioTimerIntervalRef.current = setInterval(() => {
        secLeft -= 1;
        setAudioRecordingSecondsLeft(secLeft);

        if (secLeft <= 0) {
          clearInterval(audioTimerIntervalRef.current);
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            try { mediaRecorderRef.current.stop(); } catch {}
          } else {
            setAudioRecordingState('completed');
            const simClip: AudioEvidenceClip = {
              id: `audio_sim_${Date.now()}`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              durationSeconds: 30,
              audioUrl: '',
              locationAddress: location.address || 'Emergency GPS Position',
              latitude: location.latitude,
              longitude: location.longitude,
              status: 'secured_on_server'
            };
            setAudioEvidenceClips(prev => [simClip, ...prev]);
          }
        }
      }, 1000);
    } catch (err) {
      console.warn('Audio recording trigger error:', err);
      setAudioRecordingState('error');
    }
  }, [location]);

  // Trigger auto 30s audio recording whenever SOS becomes active
  useEffect(() => {
    if (isSOSActive) {
      startSOSAudioRecording();
    } else {
      stopSOSAudioRecording();
    }
  }, [isSOSActive, startSOSAudioRecording, stopSOSAudioRecording]);

  // Phone Guardian Tracking Functions
  const trackGuardianByPhone = async (phone: string) => {
    const res = await api.trackGuardianByPhone(phone, location.latitude, location.longitude, selectedCity);
    if (res?.success) {
      setLastTrackedPhoneMsg(res.message);
      await refreshGuardians();
    }
    return res;
  };

  const updateGuardiansLocations = async () => {
    const res = await api.updateGuardiansLocations(location.latitude, location.longitude, selectedCity);
    if (res?.guardians) {
      setGuardians(res.guardians);
    }
  };

  // SOS Countdown & Execution
  const triggerSOS = () => {
    if (isSOSActive) return;
    triggerHapticPattern('press');
    setSosCountdown(3);
  };

  useEffect(() => {
    let timer: any;
    if (sosCountdown !== null && sosCountdown > 0) {
      triggerHapticPattern('countdown');
      timer = setTimeout(() => setSosCountdown(sosCountdown - 1), 1000);
    } else if (sosCountdown === 0) {
      setSosCountdown(null);
      setIsSOSActive(true);
      triggerHapticPattern('sos_active'); // Confirm SOS & 30s Audio Recording start via Morse Vibration pattern!
      startSirenSound(); // High-decibel threat deterrence siren sound

      // If offline or network error occurs, attempt auto SMS fallback dispatch
      if (!navigator.onLine) {
        dispatchSmsFallback();
      } else {
        api.triggerSOS({ location, batteryLevel, type: 'panic_button' }).catch(() => {
          dispatchSmsFallback();
        });
      }
    }
    return () => clearTimeout(timer);
  }, [sosCountdown, location, batteryLevel, triggerHapticPattern, startSirenSound, dispatchSmsFallback]);

  const cancelSOS = () => {
    triggerHapticPattern('sos_cancelled');
    setSosCountdown(null);
    setIsSOSActive(false);
    stopAlarmSound();
    api.cancelSOS();
  };

  // Journey
  const startJourney = async (originName: string, destinationName: string, mode: any) => {
    const res = await api.startJourney({ originName, destinationName, mode });
    if (res?.journey) {
      setActiveJourney(res.journey);
    }
  };

  const endJourney = async () => {
    await api.endJourney();
    setActiveJourney(null);
  };

  // Fake Call
  const scheduleFakeCall = (callerName: string, callerNumber: string, delaySeconds: number) => {
    setFakeCallData({ callerName, callerNumber });
    setTimeout(() => {
      setIsFakeCallActive(true);
    }, delaySeconds * 1000);
  };

  const acceptFakeCall = () => {
    setIsFakeCallActive(false);
  };

  const declineFakeCall = () => {
    setIsFakeCallActive(false);
  };

  return (
    <SafetyContext.Provider
      value={{
        location,
        batteryLevel,
        isOnline,
        gpsStatus,
        gpsAccuracy,
        refreshGPSLocation,
        isSOSActive,
        sosCountdown,
        triggerSOS,
        cancelSOS,
        isAlarmRinging,
        toggleAlarm,
        triggerHapticPattern,
        isSirenActive: isAlarmRinging,
        toggleSirenMode: toggleAlarm,
        isOffline,
        smsFallbackMessage,
        dispatchSmsFallback,
        lastSmsFallbackTime,
        audioRecordingState,
        audioRecordingSecondsLeft,
        audioEvidenceClips,
        latestAudioClipUrl,
        startSOSAudioRecording,
        stopSOSAudioRecording,
        activeJourney,
        startJourney,
        endJourney,
        checkInIntervalMinutes,
        setCheckInIntervalMinutes,
        isSafetyCheckPending,
        safetyCheckCountdown,
        confirmSafetyCheck,
        triggerCheckInNow,
        isWakeWordActive,
        setIsWakeWordActive,
        customWakeWord,
        setCustomWakeWord,
        isVoiceListening,
        lastSpokenTranscript,
        simulateWakeWordTrigger,
        guardians,
        nearbyPlaces,
        refreshGuardians,
        trackGuardianByPhone,
        updateGuardiansLocations,
        lastTrackedPhoneMsg,
        isFakeCallActive,
        fakeCallData,
        scheduleFakeCall,
        acceptFakeCall,
        declineFakeCall,
        deviceViewMode,
        setDeviceViewMode,
        selectedCity,
        setSelectedCity
      }}
    >
      {children}
    </SafetyContext.Provider>
  );
};

export const useSafety = () => {
  const context = useContext(SafetyContext);
  if (!context) throw new Error('useSafety must be used within a SafetyProvider');
  return context;
};
