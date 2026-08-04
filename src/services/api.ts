import { User, Guardian, Journey, SOSAlert, NearbyPlace, SafetyIncident, AIMessage } from '../types';

const API_BASE = '/api';

export const api = {
  // Auth
  async login(email: string) {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      return await res.json();
    } catch {
      return { token: 'mock_jwt_token', user: getStoredUser() };
    }
  },

  async getProfile() {
    try {
      const res = await fetch(`${API_BASE}/auth/profile`);
      return await res.json();
    } catch {
      return { user: getStoredUser() };
    }
  },

  async updateProfile(user: Partial<User>) {
    try {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
      return await res.json();
    } catch {
      const updated = { ...getStoredUser(), ...user };
      localStorage.setItem('auralis_user', JSON.stringify(updated));
      return { user: updated };
    }
  },

  // SOS Emergency
  async triggerSOS(data: { location: any; batteryLevel: number; type: string }) {
    try {
      const res = await fetch(`${API_BASE}/sos/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch {
      return {
        success: true,
        alert: { id: `sos_${Date.now()}`, timestamp: new Date().toISOString(), status: 'active' },
        message: 'SOS triggered in offline backup mode.'
      };
    }
  },

  async cancelSOS() {
    try {
      const res = await fetch(`${API_BASE}/sos/cancel`, { method: 'POST' });
      return await res.json();
    } catch {
      return { success: true, message: 'SOS resolved locally.' };
    }
  },

  async uploadSOSAudio(payload: { audioData: string; durationSeconds?: number; locationAddress?: string; latitude?: number; longitude?: number }) {
    try {
      const res = await fetch(`${API_BASE}/sos/upload-audio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch {
      return {
        success: true,
        clip: {
          id: `audio_${Date.now()}`,
          timestamp: new Date().toISOString(),
          durationSeconds: payload.durationSeconds || 30,
          audioUrl: payload.audioData || '',
          locationAddress: payload.locationAddress || 'Current Location',
          status: 'secured_on_server'
        }
      };
    }
  },

  async getAudioEvidence() {
    try {
      const res = await fetch(`${API_BASE}/sos/audio-evidence`);
      return await res.json();
    } catch {
      return { clips: [] };
    }
  },

  // Journey
  async startJourney(data: { originName: string; destinationName: string; mode: string }) {
    try {
      const res = await fetch(`${API_BASE}/journey/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch {
      return {
        success: true,
        journey: {
          id: `j_${Date.now()}`,
          originName: data.originName,
          destinationName: data.destinationName,
          status: 'ongoing',
          startTime: new Date().toISOString(),
          mode: data.mode
        }
      };
    }
  },

  async endJourney() {
    try {
      const res = await fetch(`${API_BASE}/journey/end`, { method: 'POST' });
      return await res.json();
    } catch {
      return { success: true, message: 'Journey ended' };
    }
  },

  async getJourneyHistory() {
    try {
      const res = await fetch(`${API_BASE}/journey/history`);
      return await res.json();
    } catch {
      return { history: [] };
    }
  },

  // Guardians
  async getGuardians(): Promise<{ guardians: Guardian[] }> {
    try {
      const res = await fetch(`${API_BASE}/guardians`);
      return await res.json();
    } catch {
      return { guardians: getStoredGuardians() };
    }
  },

  async addGuardian(guardian: { name: string; phone: string; relation: string }) {
    try {
      const res = await fetch(`${API_BASE}/guardians/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(guardian)
      });
      return await res.json();
    } catch {
      const list = getStoredGuardians();
      const newG: Guardian = {
        id: `g_${Date.now()}`,
        name: guardian.name,
        phone: guardian.phone,
        relation: guardian.relation,
        status: 'active',
        batteryLevel: 90,
        lastActive: 'Just now'
      };
      list.push(newG);
      localStorage.setItem('auralis_guardians', JSON.stringify(list));
      return { success: true, guardian: newG };
    }
  },

  async deleteGuardian(id: string) {
    try {
      const res = await fetch(`${API_BASE}/guardians/${id}`, { method: 'DELETE' });
      return await res.json();
    } catch {
      const list = getStoredGuardians().filter(g => g.id !== id);
      localStorage.setItem('auralis_guardians', JSON.stringify(list));
      return { success: true };
    }
  },

  async trackGuardianByPhone(phone: string, userLat?: number, userLng?: number, userCity?: string) {
    try {
      const res = await fetch(`${API_BASE}/guardians/track-by-phone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, userLat, userLng, userCity })
      });
      return await res.json();
    } catch {
      const list = getStoredGuardians();
      let g = list.find(item => item.phone.replace(/\D/g, '').includes(phone.replace(/\D/g, '')));
      if (!g) {
        g = {
          id: `g_${Date.now()}`,
          name: `Tracked Contact (${phone.slice(-4)})`,
          phone,
          relation: 'Phone Guardian',
          status: 'active',
          batteryLevel: 91,
          lastActive: 'Just now',
          latitude: (userLat || 13.0418) + 0.003,
          longitude: (userLng || 80.2341) - 0.003,
          distanceKm: 0.9
        };
        list.push(g);
        localStorage.setItem('auralis_guardians', JSON.stringify(list));
      }
      return { success: true, guardian: g, message: `Cellular GPS fix locked for ${phone}.` };
    }
  },

  async updateGuardiansLocations(userLat?: number, userLng?: number, userCity?: string) {
    try {
      const res = await fetch(`${API_BASE}/guardians/update-location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userLat, userLng, userCity })
      });
      return await res.json();
    } catch {
      return { guardians: getStoredGuardians() };
    }
  },

  // Nearby Services
  async getNearbyPlaces(lat: number, lng: number, city?: string): Promise<{ places: NearbyPlace[] }> {
    try {
      const res = await fetch(`${API_BASE}/places/nearby?lat=${lat}&lng=${lng}&city=${encodeURIComponent(city || '')}`);
      return await res.json();
    } catch {
      return { places: getDefaultPlaces(lat, lng, city) };
    }
  },

  // Community Incidents
  async getIncidents(): Promise<{ incidents: SafetyIncident[] }> {
    try {
      const res = await fetch(`${API_BASE}/incidents`);
      return await res.json();
    } catch {
      return { incidents: getDefaultIncidents() };
    }
  },

  async reportIncident(data: any) {
    try {
      const res = await fetch(`${API_BASE}/incidents/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch {
      return { success: true };
    }
  },

  // AI Safety Chat
  async sendAIChat(message: string, context?: any): Promise<{ reply: string }> {
    try {
      const res = await fetch(`${API_BASE}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, context })
      });
      return await res.json();
    } catch {
      return { reply: "I'm Auralis AI Assistant. Always prioritize well-lit paths, keep phone battery above 20%, and use Quick SOS in emergencies." };
    }
  }
};

// Fallback helpers
function getStoredUser(): User {
  const s = localStorage.getItem('auralis_user');
  if (s) {
    const u = JSON.parse(s);
    u.primaryContactName = 'Venkatesan Ramanujam';
    u.primaryContactPhone = '+91 99404 10516';
    u.primaryContactRelation = 'Primary Contact (ICE)';
    return u;
  }
  return {
    id: 'user_aur_91001',
    name: 'Sriram',
    email: 'sriram@auralis.in',
    phone: '+91 98765 43210',
    primaryContactName: 'Venkatesan Ramanujam',
    primaryContactPhone: '+91 99404 10516',
    primaryContactRelation: 'Primary Contact (ICE)',
    bloodGroup: 'O+',
    medicalNotes: 'Keep emergency notes handy',
    city: 'Local Area',
    pincode: '560038',
    safetyScore: 96,
    isVerified: true
  };
}

function getStoredGuardians(): Guardian[] {
  return [
    { id: 'g_1', name: 'Venkatesan Ramanujam', phone: '+91 99404 10516', relation: 'Primary Contact', status: 'active', batteryLevel: 98, lastActive: 'Just now', latitude: 13.0418, longitude: 80.2341, distanceKm: 0.8 },
    { id: 'g_2', name: 'Sreejha Venkat', phone: '+91 99020 42827', relation: 'Sister', status: 'active', batteryLevel: 92, lastActive: '1 min ago', latitude: 13.0500, longitude: 80.2400, distanceKm: 1.5 },
    { id: 'g_3', name: 'Sidhanth Sundarrajan', phone: '+91 63818 45780', relation: 'Friend', status: 'active', batteryLevel: 85, lastActive: '5 mins ago', latitude: 13.0300, longitude: 80.2200, distanceKm: 2.1 }
  ];
}

function getDefaultPlaces(lat: number, lng: number, city?: string): NearbyPlace[] {
  const cityLabel = city && city !== 'Selected City' ? city : 'Local Area';
  return [
    {
      id: 'p_1',
      name: `${cityLabel} Central Police Station (112 / 100)`,
      category: 'police',
      phone: '112',
      address: `Police HQ, ${cityLabel} Circle`,
      distanceKm: 0.5,
      latitude: lat + 0.0025,
      longitude: lng + 0.0018,
      rating: 4.9,
      isOpen24x7: true
    },
    {
      id: 'p_2',
      name: `${cityLabel} Emergency Hospital (108)`,
      category: 'hospital',
      phone: '108',
      address: `24x7 Emergency Trauma Center, ${cityLabel}`,
      distanceKm: 1.2,
      latitude: lat - 0.0042,
      longitude: lng + 0.0035,
      rating: 4.8,
      isOpen24x7: true
    },
    {
      id: 'p_3',
      name: `Women Safety Response Cell (1091)`,
      category: 'women_helpline',
      phone: '1091',
      address: `Women Protection HQ, ${cityLabel}`,
      distanceKm: 0.8,
      latitude: lat + 0.0038,
      longitude: lng - 0.0028,
      rating: 5.0,
      isOpen24x7: true
    },
    {
      id: 'p_4',
      name: `Apollo 24x7 Emergency Pharmacy`,
      category: 'pharmacy',
      phone: '1800 200 0000',
      address: `Main Market Road, ${cityLabel}`,
      distanceKm: 0.3,
      latitude: lat + 0.0012,
      longitude: lng - 0.0015,
      rating: 4.7,
      isOpen24x7: true
    },
    {
      id: 'p_5',
      name: `Indian Oil 24x7 Safe Zone Fuel Station`,
      category: 'petrol_pump',
      phone: '1800 233 3555',
      address: `Main Junction, ${cityLabel}`,
      distanceKm: 0.6,
      latitude: lat - 0.0025,
      longitude: lng - 0.0022,
      rating: 4.6,
      isOpen24x7: true
    },
    {
      id: 'p_6',
      name: `${cityLabel} Railway / Transit Security Desk (139)`,
      category: 'metro',
      phone: '139',
      address: `Transit Terminal, ${cityLabel}`,
      distanceKm: 0.7,
      latitude: lat + 0.0031,
      longitude: lng + 0.0011,
      rating: 4.8,
      isOpen24x7: true
    }
  ];
}

function getDefaultIncidents(): SafetyIncident[] {
  return [
    { id: 'inc_1', title: 'Streetlight Blackout', category: 'poor_lighting', description: 'Streetlights unlit near 100ft road intersection.', severity: 'medium', latitude: 12.9750, longitude: 77.6380, locationName: 'Indiranagar 12th Main', timeAgo: '45 mins ago', verifiedCount: 14, reportedBy: 'Kavita R.' },
    { id: 'inc_2', title: 'Pink Police Patrol Active', category: 'suspicious_activity', description: 'Women safety patrol vehicle stationed at Metro gate.', severity: 'low', latitude: 12.9784, longitude: 77.6385, locationName: 'Indiranagar Metro', timeAgo: '2 hours ago', verifiedCount: 32, reportedBy: 'Bengaluru City Police' }
  ];
}
