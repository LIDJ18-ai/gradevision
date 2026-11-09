import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HomePage from '@/pages/HomePage';
import AuthPage from '@/pages/AuthPage';
import UploadPage, { type UploadedCardData } from '@/pages/UploadPage';
import AnalyzingPage from '@/pages/AnalyzingPage';
import ReportPage from '@/pages/ReportPage';
import DashboardPage from '@/pages/DashboardPage';
import type { GradeResult, Page } from '@/types';

function AppContent() {
  const { user, loading } = useAuth();
  const [page, setPage] = useState<Page>('home');
  const [cardData, setCardData] = useState<UploadedCardData | null>(null);
  const [gradeResult, setGradeResult] = useState<GradeResult | null>(null);

  // Auto-redirect from auth pages once the user session is established.
  // This fixes the post-login race condition: signIn/signUp sets the session
  // in AuthContext, and this effect picks up the new user state on the next
  // render cycle, navigating to the dashboard without depending on the
  // caller to check user state synchronously.
  useEffect(() => {
    if (user && (page === 'login' || page === 'signup')) {
      setPage('dashboard');
      window.scrollTo(0, 0);
    }
  }, [user, page]);

  // Redirect protected pages to login if user is lost (e.g. session expired).
  useEffect(() => {
    if (!loading && !user && (page === 'upload' || page === 'dashboard' || page === 'report')) {
      setPage('login');
    }
  }, [loading, user, page]);

  const navigate = (target: Page) => {
    setPage(target);
    window.scrollTo(0, 0);
  };

  const handleUploadComplete = (data: UploadedCardData) => {
    setCardData(data);
    setPage('analyzing');
    window.scrollTo(0, 0);
  };

  const handleAnalysisComplete = (result: GradeResult) => {
    setGradeResult(result);
    setPage('report');
    window.scrollTo(0, 0);
  };

  const handleNewGrading = () => {
    setCardData(null);
    setGradeResult(null);
    setPage('upload');
    window.scrollTo(0, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-950">
        <div className="w-8 h-8 border-2 border-gold-400/30 border-t-gold-400 rounded-full animate-spin" />
      </div>
    );
  }

  const showFooter = page !== 'analyzing';

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar currentPage={page} onNavigate={navigate} />

      <main className="flex-1">
        {page === 'home' && <HomePage onNavigate={navigate} />}

        {(page === 'login' || page === 'signup') && (
          <AuthPage mode={page} onNavigate={navigate} />
        )}

        {page === 'upload' && (
          <UploadPage onNavigate={navigate} onComplete={handleUploadComplete} />
        )}

        {page === 'analyzing' && cardData && (
          <AnalyzingPage cardData={cardData} onComplete={handleAnalysisComplete} />
        )}

        {page === 'report' && cardData && gradeResult && (
          <ReportPage
            cardData={cardData}
            result={gradeResult}
            reportId={null}
            onNavigate={navigate}
            onNewGrading={handleNewGrading}
          />
        )}

        {page === 'dashboard' && <DashboardPage onNavigate={navigate} />}
      </main>

      {showFooter && <Footer onNavigate={navigate} />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
