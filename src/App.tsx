import { useState, useEffect } from 'react';
import { AuthForm } from './components/AuthForm';
import { WishlistDashboard } from './components/WishlistDashboard';
import { WishlistView } from './components/WishlistView';
import { createClient } from './utils/supabase-client';
import { getSharedWishlist } from './utils/api';
import { Toaster } from './components/ui/sonner';

export default function App() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [sharedWishlist, setSharedWishlist] = useState<any>(null);
  const [isLoadingShared, setIsLoadingShared] = useState(false);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setAccessToken(session.access_token);
        setUserName(session.user?.user_metadata?.name || 'User');
      }
      
      setIsLoading(false);
    };

    checkSession();
  }, []);

  useEffect(() => {
    // Check for shared wishlist in URL
    const params = new URLSearchParams(window.location.search);
    const shareToken = params.get('share');
    
    if (shareToken) {
      loadSharedWishlist(shareToken);
    }
  }, []);

  const loadSharedWishlist = async (shareToken: string) => {
    setIsLoadingShared(true);
    try {
      const data = await getSharedWishlist(shareToken);
      setSharedWishlist(data.wishlist);
    } catch (error) {
      console.error('Error loading shared wishlist:', error);
    } finally {
      setIsLoadingShared(false);
    }
  };

  const handleAuthSuccess = (token: string, name: string) => {
    setAccessToken(token);
    setUserName(name);
  };

  const handleLogout = () => {
    setAccessToken(null);
    setUserName('');
  };

  const handleBackFromShared = () => {
    setSharedWishlist(null);
    // Remove share token from URL
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  const handleSharedWishlistUpdate = (updatedWishlist: any) => {
    setSharedWishlist(updatedWishlist);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // Show shared wishlist if accessed via share link
  if (sharedWishlist) {
    if (isLoadingShared) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
          <p className="text-muted-foreground">Loading wishlist...</p>
        </div>
      );
    }
    
    return (
      <>
        <WishlistView
          wishlist={sharedWishlist}
          accessToken={accessToken || undefined}
          isOwner={false}
          onBack={handleBackFromShared}
          onUpdate={handleSharedWishlistUpdate}
        />
        <Toaster />
      </>
    );
  }

  // Show auth or dashboard
  if (!accessToken) {
    return <AuthForm onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <>
      <WishlistDashboard
        accessToken={accessToken}
        userName={userName}
        onLogout={handleLogout}
      />
      <Toaster />
    </>
  );
}
