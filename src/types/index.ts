export interface User {
  id: string;
  name: string;
  email: string;
  phone: string; // +91 format
  primaryContactName?: string;
  primaryContactPhone?: string;
  primaryContactRelation?: string;
  bloodGroup?: string;
  medicalNotes?: string;
  avatarUrl?: string;
  address?: string;
  city?: string;
  pincode?: string;
  safetyScore: number;
  isVerified: boolean;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
  isPrimary: boolean;
}

export interface Guardian {
  id: string;
  name: string;
  phone: string;
  avatarUrl?: string;
  relation: string;
  status: 'active' | 'offline' | 'pending';
  batteryLevel?: number;
  lastActive?: string;
  latitude?: number;
  longitude?: number;
  distanceKm?: number;
}

export interface LocationCoords {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number | null;
  heading?: number | null;
  speed?: number | null;
  address?: string;
  city?: string;
  state?: string;
  timestamp?: number;
}

export interface NearbyPlace {
  id: string;
  name: string;
  category: 'police' | 'hospital' | 'pharmacy' | 'women_helpline' | 'petrol_pump' | 'safe_zone' | 'metro';
  phone: string;
  address: string;
  distanceKm: number;
  latitude: number;
  longitude: number;
  rating?: number;
  isOpen24x7?: boolean;
}

export interface Journey {
  id: string;
  originName: string;
  originCoords: { lat: number; lng: number };
  destinationName: string;
  destinationCoords: { lat: number; lng: number };
  status: 'ongoing' | 'completed' | 'alert' | 'cancelled';
  startTime: string;
  estimatedArrivalTime: string;
  actualEndTime?: string;
  mode: 'walking' | 'cab' | 'auto' | 'metro' | 'driving';
  sharedGuardians: string[];
  deviationDetected: boolean;
  notes?: string;
}

export interface SOSAlert {
  id: string;
  userId: string;
  timestamp: string;
  location: LocationCoords;
  status: 'active' | 'resolved' | 'false_alarm';
  audioClipUrl?: string;
  notifiedGuardians: string[];
  batteryLevel: number;
  type: 'panic_button' | 'fall_detection' | 'route_deviation' | 'silent_alarm' | 'voice_wake_word' | 'checkin_timeout';
}

export interface AudioEvidenceClip {
  id: string;
  timestamp: string;
  durationSeconds: number;
  audioUrl: string;
  fileSizeBytes?: number;
  locationAddress?: string;
  latitude?: number;
  longitude?: number;
  status: 'recording' | 'uploading' | 'secured_on_server' | 'error';
}

export interface SafetyIncident {
  id: string;
  title: string;
  category: 'suspicious_activity' | 'harassment' | 'poor_lighting' | 'road_accident' | 'protest' | 'theft';
  description: string;
  severity: 'low' | 'medium' | 'high';
  latitude: number;
  longitude: number;
  locationName: string;
  timeAgo: string;
  verifiedCount: number;
  reportedBy: string;
}

export interface SafetyReport {
  week: string;
  safetyScore: number;
  safeJourneysCount: number;
  totalKmProtected: number;
  alertsTriggered: number;
  guardianCheckins: number;
  topSafeZonesVisited: string[];
}

export interface AIMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  category?: 'general' | 'emergency' | 'travel_tip' | 'first_aid';
}
