import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SafetyProvider } from './contexts/SafetyContext';
import { MobileFrame } from './components/MobileFrame';
import { MobileHeader } from './components/MobileHeader';
import { MobileNavigation } from './components/MobileNavigation';

// Modals & Screens
import { AuthScreen } from './components/AuthScreen';
import { JourneySafetyCheckModal } from './components/JourneySafetyCheckModal';
import { QuickSOSModal } from './components/QuickSOSModal';
import { FakeCallModal } from './components/FakeCallModal';
import { EmergencyCardModal } from './components/EmergencyCardModal';
import { MoreHubModal } from './components/MoreHubModal';
import { OnboardingModal } from './components/OnboardingModal';
import { LoginModal } from './components/LoginModal';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { SOSPage } from './pages/SOSPage';
import { JourneyPage } from './pages/JourneyPage';
import { GuardiansPage } from './pages/GuardiansPage';
import { AIChatPage } from './pages/AIChatPage';
import { FakeCallPage } from './pages/FakeCallPage';
import { CommunityPage } from './pages/CommunityPage';
import { IncidentCenterPage } from './pages/IncidentCenterPage';
import { SettingsPage } from './pages/SettingsPage';
import { ProfilePage } from './pages/ProfilePage';

function AppContent() {
  const { isAuthenticated } = useAuth();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMoreHubOpen, setIsMoreHubOpen] = useState(false);
  const [isEmergencyCardOpen, setIsEmergencyCardOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // If user is not logged in, enforce the Login/Signup Screen
  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  const handleNavigate = (tabId: string) => {
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderCurrentView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage onNavigate={handleNavigate} />;
      case 'sos':
        return <SOSPage />;
      case 'journey':
        return <JourneyPage />;
      case 'guardians':
        return <GuardiansPage />;
      case 'ai_chat':
        return <AIChatPage />;
      case 'fake_call':
        return <FakeCallPage />;
      case 'community':
        return <CommunityPage />;
      case 'analytics':
        return <IncidentCenterPage />;
      case 'settings':
        return <SettingsPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <DashboardPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <MobileFrame>
      {/* Mobile Top Header */}
      <MobileHeader
        onOpenNotifications={() => handleNavigate('analytics')}
        onOpenProfile={() => handleNavigate('profile')}
        onOpenEmergencyCard={() => setIsEmergencyCardOpen(true)}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onOpenLogin={() => setIsLoginOpen(true)}
      />

      {/* Main Page Scrollable View */}
      <main className="flex-1 overflow-y-auto">
        {renderCurrentView()}
      </main>

      {/* Mobile Persistent Bottom Tab Navigation */}
      <MobileNavigation
        activeTab={activeTab}
        setActiveTab={handleNavigate}
        onOpenMoreMenu={() => setIsMoreHubOpen(true)}
      />

      {/* Modals & Overlays */}
      <JourneySafetyCheckModal />
      <QuickSOSModal />
      <FakeCallModal />
      <EmergencyCardModal
        isOpen={isEmergencyCardOpen}
        onClose={() => setIsEmergencyCardOpen(false)}
      />
      <MoreHubModal
        isOpen={isMoreHubOpen}
        onClose={() => setIsMoreHubOpen(false)}
        onNavigate={handleNavigate}
      />
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />
    </MobileFrame>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SafetyProvider>
        <AppContent />
      </SafetyProvider>
    </AuthProvider>
  );
}
