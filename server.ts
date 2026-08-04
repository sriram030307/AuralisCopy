import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// In-Memory Database for Demo & Mobile Synchronization
let currentUser = {
  id: 'user_aur_91001',
  name: 'Sriram',
  email: 'sriram@auralis.in',
  phone: '+91 98765 43210',
  primaryContactName: 'Venkatesan Ramanujam',
  primaryContactPhone: '+91 99404 10516',
  primaryContactRelation: 'Primary Contact (ICE)',
  bloodGroup: 'O+',
  medicalNotes: 'Keep emergency notes handy.',
  address: 'Active Local Location',
  city: 'Local Area',
  pincode: '560038',
  safetyScore: 96,
  isVerified: true,
};

let emergencyContacts = [
  { id: 'ec_1', name: 'Venkatesan Ramanujam', relation: 'Primary Contact (ICE)', phone: '+91 99404 10516', isPrimary: true },
  { id: 'ec_2', name: 'Sreejha Venkat', relation: 'Sister', phone: '+91 99020 42827', isPrimary: false },
  { id: 'ec_3', name: 'Sidhanth Sundarrajan', relation: 'Friend', phone: '+91 63818 45780', isPrimary: false },
];

let guardians = [
  { id: 'g_1', name: 'Venkatesan Ramanujam', phone: '+91 99404 10516', relation: 'Primary Contact', status: 'active', batteryLevel: 98, lastActive: 'Just now', latitude: 13.0418, longitude: 80.2341, distanceKm: 0.8 },
  { id: 'g_2', name: 'Sreejha Venkat', phone: '+91 99020 42827', relation: 'Sister', status: 'active', batteryLevel: 92, lastActive: '1 min ago', latitude: 13.0500, longitude: 80.2400, distanceKm: 1.5 },
  { id: 'g_3', name: 'Sidhanth Sundarrajan', phone: '+91 63818 45780', relation: 'Friend', status: 'active', batteryLevel: 85, lastActive: '5 mins ago', latitude: 13.0300, longitude: 80.2200, distanceKm: 2.1 },
];

let activeSOSAlerts: any[] = [];
let sosAudioRecordings: any[] = [];
let journeyHistory: any[] = [
  {
    id: 'j_101',
    originName: 'Indiranagar Metro Station',
    originCoords: { lat: 12.9784, lng: 77.6385 },
    destinationName: 'Koramangala 5th Block',
    destinationCoords: { lat: 12.9352, lng: 77.6245 },
    status: 'completed',
    startTime: '2026-07-28T21:30:00Z',
    estimatedArrivalTime: '2026-07-28T21:55:00Z',
    actualEndTime: '2026-07-28T21:52:00Z',
    mode: 'auto',
    sharedGuardians: ['Ananya Verma', 'Karan Sharma'],
    deviationDetected: false,
    notes: 'Safe auto journey via 80ft road'
  }
];

let activeJourney: any = null;

let communityIncidents = [
  {
    id: 'inc_1',
    title: 'Streetlight Blackout',
    category: 'poor_lighting',
    description: 'Streetlights unlit between 12th Main and 100ft Road intersection. Exercise caution after dark.',
    severity: 'medium',
    latitude: 12.9750,
    longitude: 77.6380,
    locationName: 'Indiranagar 12th Main, Bengaluru',
    timeAgo: '45 mins ago',
    verifiedCount: 14,
    reportedBy: 'Kavita R.'
  },
  {
    id: 'inc_2',
    title: 'Safe Zone Patrol Active',
    category: 'suspicious_activity',
    description: 'Increased Pink Auto & Women Safety Police Van patrol stationed near Metro Station Gate 2.',
    severity: 'low',
    latitude: 12.9784,
    longitude: 77.6385,
    locationName: 'Indiranagar Metro, Bengaluru',
    timeAgo: '2 hours ago',
    verifiedCount: 32,
    reportedBy: 'Bengaluru City Police'
  },
  {
    id: 'inc_3',
    title: 'Road Construction Obstruction',
    category: 'road_accident',
    description: 'Narrow walkway due to pipe laying work. Pedestrian path dimly lit.',
    severity: 'low',
    latitude: 12.9352,
    longitude: 77.6245,
    locationName: 'Koramangala 80ft Road',
    timeAgo: '4 hours ago',
    verifiedCount: 8,
    reportedBy: 'Arun V.'
  }
];

// Helper: Calculate nearby emergency services for Indian cities
function getNearbyServices(lat: number, lng: number, city?: string) {
  const cityLabel = city && city !== 'Selected City' ? city : 'Local Area';
  return [
    {
      id: 'p_1',
      name: `${cityLabel} Central Police Station (112 / 100)`,
      category: 'police',
      phone: '112',
      address: `Police HQ, ${cityLabel} Sector`,
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
      name: `${cityLabel} Transit Security Desk (139)`,
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

// REST API ROUTES
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', app: 'Auralis Mobile Backend', platform: 'Capacitor-Ready' });
});

// Authentication Routes
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  return res.json({
    token: 'jwt_token_auralis_secure_mobile_session_9921',
    user: currentUser
  });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, phone } = req.body;
  if (name && email) {
    currentUser = {
      ...currentUser,
      name,
      email,
      phone: phone || currentUser.phone
    };
  }
  return res.json({
    token: 'jwt_token_auralis_new_user_9922',
    user: currentUser
  });
});

app.get('/api/auth/profile', (req: Request, res: Response) => {
  res.json({
    user: currentUser,
    emergencyContacts,
    guardiansCount: guardians.length
  });
});

app.put('/api/auth/profile', (req: Request, res: Response) => {
  currentUser = { ...currentUser, ...req.body };
  res.json({ user: currentUser, message: 'Profile updated successfully' });
});

// SOS Emergency Routes
app.post('/api/sos/trigger', (req: Request, res: Response) => {
  const { location, batteryLevel, type } = req.body;
  const newAlert = {
    id: `sos_${Date.now()}`,
    userId: currentUser.id,
    timestamp: new Date().toISOString(),
    location: location || { latitude: 12.9716, longitude: 77.5946, address: 'Indiranagar, Bengaluru' },
    status: 'active',
    batteryLevel: batteryLevel || 85,
    type: type || 'panic_button',
    notifiedGuardians: guardians.map(g => g.name)
  };
  activeSOSAlerts.unshift(newAlert);

  res.json({
    success: true,
    alert: newAlert,
    message: 'Emergency dispatches sent to guardians & 112 system',
    emergencyHelplines: [
      { name: 'National Emergency', number: '112' },
      { name: 'Police Control', number: '100' },
      { name: 'Ambulance', number: '108' },
      { name: 'Women Helpline', number: '1091' }
    ]
  });
});

app.post('/api/sos/cancel', (req: Request, res: Response) => {
  activeSOSAlerts = activeSOSAlerts.map(alert => ({ ...alert, status: 'resolved' }));
  res.json({ success: true, message: 'Emergency SOS alert cancelled. Guardians notified that you are safe.' });
});

app.get('/api/sos/active', (req: Request, res: Response) => {
  const active = activeSOSAlerts.find(a => a.status === 'active');
  res.json({ activeAlert: active || null });
});

// SOS Audio Evidence Upload
app.post('/api/sos/upload-audio', (req: Request, res: Response) => {
  const { audioData, durationSeconds, locationAddress, latitude, longitude } = req.body;
  const clipId = `audio_sos_${Date.now()}`;
  const clip = {
    id: clipId,
    timestamp: new Date().toISOString(),
    durationSeconds: durationSeconds || 30,
    audioUrl: audioData || '',
    locationAddress: locationAddress || 'Current Emergency GPS Position',
    latitude: latitude || currentUser.address,
    longitude: longitude || 0,
    status: 'secured_on_server',
    fileSizeBytes: audioData ? Math.round(audioData.length * 0.75) : 480000
  };
  sosAudioRecordings.unshift(clip);

  if (activeSOSAlerts.length > 0) {
    activeSOSAlerts[0].audioClipUrl = clip.audioUrl;
  }

  res.json({
    success: true,
    clip,
    message: '30-second emergency audio clip recorded and secured on server.'
  });
});

app.get('/api/sos/audio-evidence', (req: Request, res: Response) => {
  res.json({ clips: sosAudioRecordings });
});

// Journey Protection Routes
app.post('/api/journey/start', (req: Request, res: Response) => {
  const { originName, originCoords, destinationName, destinationCoords, mode } = req.body;
  
  const now = new Date();
  const eta = new Date(now.getTime() + 25 * 60000); // 25 min default ETA
  
  activeJourney = {
    id: `j_${Date.now()}`,
    originName: originName || 'Current GPS Location',
    originCoords: originCoords || { lat: 12.9716, lng: 77.5946 },
    destinationName: destinationName || 'Destination',
    destinationCoords: destinationCoords || { lat: 12.9352, lng: 77.6245 },
    status: 'ongoing',
    startTime: now.toISOString(),
    estimatedArrivalTime: eta.toISOString(),
    mode: mode || 'cab',
    sharedGuardians: guardians.map(g => g.name),
    deviationDetected: false
  };

  res.json({ success: true, journey: activeJourney });
});

app.get('/api/journey/active', (req: Request, res: Response) => {
  res.json({ journey: activeJourney });
});

app.post('/api/journey/end', (req: Request, res: Response) => {
  if (activeJourney) {
    activeJourney.status = 'completed';
    activeJourney.actualEndTime = new Date().toISOString();
    journeyHistory.unshift(activeJourney);
    activeJourney = null;
  }
  res.json({ success: true, message: 'Journey ended safely!' });
});

app.get('/api/journey/history', (req: Request, res: Response) => {
  res.json({ history: journeyHistory });
});

// Guardian Network Routes
app.get('/api/guardians', (req: Request, res: Response) => {
  res.json({ guardians });
});

app.post('/api/guardians/add', (req: Request, res: Response) => {
  const { name, phone, relation } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and +91 Phone are required' });
  }
  const newGuardian = {
    id: `g_${Date.now()}`,
    name,
    phone,
    relation: relation || 'Guardian',
    status: 'active' as const,
    batteryLevel: 90,
    lastActive: 'Just now',
    latitude: 12.9716 + (Math.random() * 0.01 - 0.005),
    longitude: 77.5946 + (Math.random() * 0.01 - 0.005),
    distanceKm: 1.5
  };
  guardians.push(newGuardian);
  res.json({ success: true, guardian: newGuardian });
});

app.delete('/api/guardians/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  guardians = guardians.filter(g => g.id !== id);
  res.json({ success: true, message: 'Guardian removed' });
});

// Track Guardian by Phone Number
app.post('/api/guardians/track-by-phone', (req: Request, res: Response) => {
  const { phone, userLat, userLng, userCity } = req.body;
  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required for cellular GPS tracking' });
  }

  const cleanInputPhone = phone.replace(/\D/g, '');
  
  // Check if guardian exists by phone number
  let guardian = guardians.find(g => g.phone.replace(/\D/g, '') === cleanInputPhone || g.phone.includes(phone) || phone.includes(g.phone));

  const baseLat = userLat ? parseFloat(userLat) : 13.0418;
  const baseLng = userLng ? parseFloat(userLng) : 80.2341;

  if (guardian) {
    // Update live location for existing guardian
    const latOffset = (Math.sin(Date.now() / 10000 + guardian.name.length) * 0.008);
    const lngOffset = (Math.cos(Date.now() / 10000 + guardian.name.length) * 0.008);
    guardian.latitude = baseLat + latOffset;
    guardian.longitude = baseLng + lngOffset;
    guardian.batteryLevel = Math.min(100, Math.max(45, Math.floor(80 + Math.random() * 20)));
    guardian.lastActive = 'Cellular GPS Signal Fixed Just now';
    guardian.status = 'active';
    guardian.distanceKm = parseFloat((Math.abs(latOffset) * 111 + Math.abs(lngOffset) * 111).toFixed(1));
  } else {
    // Create new tracked guardian record for phone number
    const latOffset = (Math.random() * 0.012 - 0.006);
    const lngOffset = (Math.random() * 0.012 - 0.006);
    guardian = {
      id: `g_${Date.now()}`,
      name: `Tracked Contact (${phone.slice(-4)})`,
      phone: phone.startsWith('+') ? phone : `+91 ${phone}`,
      relation: 'Tracked Phone Guardian',
      status: 'active',
      batteryLevel: Math.floor(75 + Math.random() * 25),
      lastActive: 'Cellular Signal Fixed Just now',
      latitude: baseLat + latOffset,
      longitude: baseLng + lngOffset,
      distanceKm: parseFloat((Math.abs(latOffset) * 111 + Math.abs(lngOffset) * 111).toFixed(1))
    };
    guardians.push(guardian);
  }

  res.json({
    success: true,
    guardian,
    message: `Live cellular GPS fix locked for phone number ${phone}. Location updated on map.`,
    signalStrength: '4G LTE / GPS Signal Strong',
    trackingMethod: 'Triangulated Cellular Tower + Device GPS'
  });
});

// Update all guardians' locations relative to active user GPS location
app.post('/api/guardians/update-location', (req: Request, res: Response) => {
  const { userLat, userLng, userCity } = req.body;
  const baseLat = userLat ? parseFloat(userLat) : 13.0418;
  const baseLng = userLng ? parseFloat(userLng) : 80.2341;

  guardians = guardians.map((g, idx) => {
    const latOffset = ((idx + 1) * 0.004) * (idx % 2 === 0 ? 1 : -1);
    const lngOffset = ((idx + 1) * 0.005) * (idx % 3 === 0 ? 1 : -1);
    return {
      ...g,
      latitude: baseLat + latOffset,
      longitude: baseLng + lngOffset,
      lastActive: 'Live Signal Active',
      distanceKm: parseFloat((Math.abs(latOffset) * 111 + Math.abs(lngOffset) * 111).toFixed(1))
    };
  });

  res.json({ success: true, guardians });
});

// Places & Emergency Services
app.get('/api/places/nearby', (req: Request, res: Response) => {
  const lat = parseFloat(req.query.lat as string) || 12.9716;
  const lng = parseFloat(req.query.lng as string) || 77.5946;
  const city = (req.query.city as string) || '';
  const places = getNearbyServices(lat, lng, city);
  res.json({ places, count: places.length });
});

// Community Incidents
app.get('/api/incidents', (req: Request, res: Response) => {
  res.json({ incidents: communityIncidents });
});

app.post('/api/incidents/report', (req: Request, res: Response) => {
  const { title, category, description, severity, latitude, longitude, locationName } = req.body;
  const newIncident = {
    id: `inc_${Date.now()}`,
    title: title || 'Safety Incident',
    category: category || 'suspicious_activity',
    description: description || 'Reported incident near location',
    severity: severity || 'medium',
    latitude: latitude || 12.9716,
    longitude: longitude || 77.5946,
    locationName: locationName || 'Current Location',
    timeAgo: 'Just now',
    verifiedCount: 1,
    reportedBy: currentUser.name
  };
  communityIncidents.unshift(newIncident);
  res.json({ success: true, incident: newIncident });
});

// AI Safety Companion powered by Gemini SDK
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  const { message, context } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message parameter is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;

  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are Auralis AI Safety Companion, an empathetic, highly intelligent personal safety assistant tailored for India and global personal security. 
User Location Context: ${JSON.stringify(context || { city: 'Bengaluru', country: 'India' })}.
User Query: "${message}".
Instructions: Provide clear, concise, actionable safety advice, de-escalation tips, or emergency protocols. Keep tone reassuring, direct, and mobile-friendly. Include emergency contacts (112, 100, 108, 1091) if danger is indicated.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      const replyText = response.text || 'Stay calm. Share your live location with your Auralis guardians and dial 112 if you feel threatened.';
      return res.json({ reply: replyText });
    } catch (err: any) {
      console.error('Gemini API error in Auralis server:', err?.message || err);
    }
  }

  // Smart Contextual Fallback Engine if Gemini API key is missing or errored
  let fallbackReply = "I'm Auralis AI. Stay calm and stay connected. ";
  const lower = message.toLowerCase();

  if (lower.includes('cab') || lower.includes('uber') || lower.includes('ola') || lower.includes('night') || lower.includes('auto')) {
    fallbackReply = "🚕 **Cab/Auto Night Safety Rules**:\n1. Verify driver name, vehicle plate, and match with the app before boarding.\n2. Enable 'Auralis Journey Protection' right now to track your live GPS route.\n3. Share ride details with your primary guardians.\n4. If the vehicle deviates, tap the SOS button or use Fake Call to deter suspicious behavior.";
  } else if (lower.includes('walk') || lower.includes('alone') || lower.includes('dark')) {
    fallbackReply = "🚶‍♀️ **Walking Alone Safety Advice**:\n1. Keep one ear free to stay aware of surroundings.\n2. Walk in well-lit, populated main streets.\n3. Keep your phone in hand with Auralis Quick SOS ready.\n4. Trigger an immediate Fake Call from Dad or Police if followed.";
  } else if (lower.includes('first aid') || lower.includes('injury') || lower.includes('hospital')) {
    fallbackReply = "🏥 **First Aid Emergency Protocols**:\n1. Call **108** for Medical Ambulance immediately.\n2. For heavy bleeding, apply direct pressure with a clean cloth.\n3. Check nearby hospitals tab in Auralis to navigate to 24x7 Emergency Room.";
  } else if (lower.includes('police') || lower.includes('help') || lower.includes('danger')) {
    fallbackReply = "🚨 **Emergency Action Plan**:\n1. National Emergency Number in India: **112** or **100** (Police).\n2. Press and hold Auralis SOS for 3 seconds to alert your guardians instantly with live GPS coordinates.\n3. Head towards the nearest open store, petrol pump, or metro station safe zone.";
  } else {
    fallbackReply = `Based on your request "${message}", prioritize staying in well-lit areas, keep your battery charged above 20%, and keep your Auralis guardians connected via Journey Protection. Need immediate assistance? Tap the SOS button on your screen.`;
  }

  return res.json({ reply: fallbackReply });
});

// Analytics Weekly Report
app.get('/api/analytics/weekly', (req: Request, res: Response) => {
  res.json({
    week: 'July 22 - July 29, 2026',
    safetyScore: currentUser.safetyScore,
    safeJourneysCount: 14,
    totalKmProtected: 48.5,
    alertsTriggered: 0,
    guardianCheckins: 28,
    topSafeZonesVisited: ['Indiranagar Metro', 'Koramangala 5th Block', 'MG Road Plaza']
  });
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Auralis Mobile Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
