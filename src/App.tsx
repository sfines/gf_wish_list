import { useState, useEffect } from "react";
import { AuthForm } from "./components/AuthForm";
import { WishlistDashboard } from "./components/WishlistDashboard";
import { WishlistView } from "./components/WishlistView";
import { createClient } from "./utils/supabase-client";
import { getSharedWishlist } from "./utils/api";
import { Session } from "@supabase/supabase-js";

const supabase = createClient();

const App = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [sharedWishlist, setSharedWishlist] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsLoading(false);
    });

    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setIsLoading(false);
    };

    checkSession();

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareToken = params.get("share");

    if (shareToken) {
      const loadWishlist = async (token: string) => {
        try {
          setIsLoading(true);
          const data = await getSharedWishlist(token);
          setSharedWishlist(data);
        } catch (error) {
          console.error("Error loading shared wishlist:", error);
          // Handle error (e.g., show a not found message)
        } finally {
          setIsLoading(false);
        }
      };
      loadWishlist(shareToken);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (sharedWishlist) {
    const isOwner = session?.user?.id === sharedWishlist.user_id;
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto p-4">
          <WishlistView
            wishlist={sharedWishlist}
            accessToken={session?.access_token}
            isOwner={isOwner}
            onBack={() => setSharedWishlist(null)}
            onUpdate={(updated) => setSharedWishlist(updated)}
            onDelete={() => setSharedWishlist(null)}
          />
        </div>
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
          userName={session.user.user_metadata.full_name || session.user.email}
          userId={session.user.id}
          onLogout={() => supabase.auth.signOut()}
        />
      </div>
    </div>
  );
};

export default App;
