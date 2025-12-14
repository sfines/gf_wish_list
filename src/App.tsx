import { useState, useEffect } from 'react';
import { AuthForm } from './components/AuthForm';
import { WishlistDashboard } from './components/WishlistDashboard';
import { WishlistView } from './components/WishlistView';
import { ResetPassword } from './components/ResetPassword';
import { createClient } from './utils/supabase-client';
import { getSharedWishlist } from './utils/api';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import { Session } from "@supabase/supabase-js";

const supabase = createClient();

const App = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [sharedWishlist, setSharedWishlist] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingShared, setIsLoadingShared] = useState(false);
  const [isResetPasswordMode, setIsResetPasswordMode] = useState(false);

  useEffect(() => {
    // Check for existing session and password reset mode
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      // Check if we're in password reset mode
      const hash = window.location.hash;
      if (hash) {
        const hashParams = new URLSearchParams(hash.substring(1));
        const type = hashParams.get('type');

        if (type === 'recovery') {
          setIsResetPasswordMode(true);
          setIsLoading(false);
          return;
        }
      }

      setSession(session);
      setIsLoading(false);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsLoading(false);
    });

    checkSession();

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareToken = params.get("share");

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

  const handleBackFromShared = () => {
    setSharedWishlist(null);
    // Remove share token from URL
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  const handleSharedWishlistUpdate = (updatedWishlist: any) => {
    setSharedWishlist(updatedWishlist);
  };

  const handleResetPasswordSuccess = async () => {
    toast.success('Password reset successfully!');
    setIsResetPasswordMode(false);

    // Clear the hash from URL
    window.history.replaceState({}, document.title, window.location.pathname);

    // Get the new session after password reset
    const { data: { session } } = await supabase.auth.getSession();
    setSession(session);
  };

  const handleResetPasswordCancel = () => {
    setIsResetPasswordMode(false);
    // Clear the hash from URL
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  // Show password reset page if in reset mode
  if (isResetPasswordMode) {
    return (
      <>
        <ResetPassword onSuccess={handleResetPasswordSuccess} onCancel={handleResetPasswordCancel} />
        <Toaster />
      </>
    );
  }

  // Show shared wishlist if accessed via share link
  if (sharedWishlist) {
    if (isLoadingShared) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          Loading wishlist...
        </div>
      );
    }

    const isOwner = session?.user?.id === sharedWishlist.user_id;
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto p-4">
          <WishlistView
            wishlist={sharedWishlist}
            accessToken={session?.access_token}
            isOwner={isOwner}
            onBack={handleBackFromShared}
            onUpdate={handleSharedWishlistUpdate}
            onDelete={() => setSharedWishlist(null)}
          />
        </div>
        <Toaster />
      </div>
    );
  }

  if (!session) {
    return (
      <AuthForm
        onAuthSuccess={() => {
          supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
          });
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto p-4">
        <WishlistDashboard
          accessToken={session.access_token}
          userName={session.user.user_metadata.full_name || session.user.email || 'User'}
          userId={session.user.id}
          onLogout={() => supabase.auth.signOut()}
        />
        <Toaster />
      </div>
    </div>
  );
};

export default App;
