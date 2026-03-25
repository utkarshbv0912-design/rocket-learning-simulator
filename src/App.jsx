import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Home from './pages/Home';
import RocketCalculator from './pages/RocketCalculator';
import RocketSimulator from './pages/RocketSimulator';
import RocketFacts from './pages/RocketFacts';
import RocketBuilder from './pages/RocketBuilder';
import MissionMode from './pages/MissionMode';
import SpaceMap from './pages/SpaceMap';
import LearningHub from './pages/LearningHub';
import AILearning from './pages/AILearning';
import Profile from './pages/Profile';
import PartsLibrary from './pages/PartsLibrary';
import AchievementToast from './components/AchievementToast';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/calculator" element={<RocketCalculator />} />
      <Route path="/simulator" element={<RocketSimulator />} />
      <Route path="/facts" element={<RocketFacts />} />
      <Route path="/builder" element={<RocketBuilder />} />
      <Route path="/missions" element={<MissionMode />} />
      <Route path="/space-map" element={<SpaceMap />} />
      <Route path="/learning" element={<LearningHub />} />
      <Route path="/ai-learning" element={<AILearning />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/parts" element={<PartsLibrary />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
        <AchievementToast />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
