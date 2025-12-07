import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Plus, Gift, LogOut, ExternalLink, Heart } from "lucide-react";
import { createWishlist, getWishlists, getWishlist } from "../utils/api";
import { createClient } from "../utils/supabase-client";
import { WishlistView } from "./WishlistView";

interface Wishlist {
  id: string;
  name: string;
  description: string;
  share_token: string;
  items: any[];
  created_at: string;
  user_id: string;
}

interface WishlistDashboardProps {
  onLogout: () => void;
  accessToken: string;
  userName: string;
  userId: string;
}

export function WishlistDashboard({
  onLogout,
  accessToken,
  userName,
  userId,
}: WishlistDashboardProps) {
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [followingWishlists, setFollowingWishlists] = useState<Wishlist[]>([]);
  const [selectedWishlist, setSelectedWishlist] = useState<Wishlist | null>(
    null
  );
  const [selectedWishlistIsOwned, setSelectedWishlistIsOwned] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newWishlistName, setNewWishlistName] = useState("");
  const [newWishlistDescription, setNewWishlistDescription] = useState("");

  useEffect(() => {
    loadWishlists();
  }, [accessToken]);

  const loadWishlists = async () => {
    if (!accessToken) return;
    try {
      setIsLoading(true);
      const data = await getWishlists(accessToken);
      // Filter wishlists to only show ones owned by the user
      const ownedWishlists = (data.wishlists || []).filter(
        (w: any) => w.user_id === userId
      );
      setWishlists(ownedWishlists);
      setFollowingWishlists(data.following || []);
    } catch (error: any) {
      console.error("Error loading wishlists:", error);
      if (error.message === "Unauthorized") {
        handleLogout();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateWishlist = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await createWishlist(
        accessToken,
        newWishlistName,
        newWishlistDescription
      );
      setWishlists([...wishlists, data]);
      setNewWishlistName("");
      setNewWishlistDescription("");
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error("Error creating wishlist:", error);
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    onLogout();
  };

  const handleWishlistUpdate = (updatedWishlist: Wishlist) => {
    const newWishlists = wishlists.map((w) =>
      w.id === updatedWishlist.id ? updatedWishlist : w
    );
    setWishlists(newWishlists);
    setSelectedWishlist(updatedWishlist);
  };

  const handleWishlistDelete = (deletedId: string) => {
    setWishlists(wishlists.filter((w) => w.id !== deletedId));
    setSelectedWishlist(null);
  };

  const handleWishlistClick = async (wishlist: Wishlist, isOwned: boolean) => {
    try {
      setIsLoading(true);
      const fullWishlist = await getWishlist(accessToken, wishlist.id);
      setSelectedWishlist(fullWishlist);
      setSelectedWishlistIsOwned(isOwned);
    } catch (error) {
      console.error("Error fetching wishlist details:", error);
      // Fallback to existing data if fetch fails
      setSelectedWishlist(wishlist);
      setSelectedWishlistIsOwned(isOwned);
    } finally {
      setIsLoading(false);
    }
  };

  if (selectedWishlist) {
    return (
      <WishlistView
        wishlist={selectedWishlist}
        accessToken={accessToken}
        isOwner={selectedWishlistIsOwned}
        onBack={() => setSelectedWishlist(null)}
        onUpdate={handleWishlistUpdate}
        onDelete={handleWishlistDelete}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="mb-1">Welcome, {userName}!</h1>
            <p className="text-muted-foreground">
              Manage your wishlists and share them with friends
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        <div className="mb-6">
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button size="lg">
                <Plus className="mr-2 h-5 w-5" />
                Create New Wishlist
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Wishlist</DialogTitle>
                <DialogDescription>
                  Give your wishlist a name and optional description
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateWishlist} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Birthday Wishlist"
                    value={newWishlistName}
                    onChange={(e) => setNewWishlistName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Things I'd love for my birthday..."
                    value={newWishlistDescription}
                    onChange={(e) => setNewWishlistDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                <Button type="submit" className="w-full">
                  Create Wishlist
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading wishlists...</p>
          </div>
        ) : wishlists.length === 0 && followingWishlists.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Gift className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="mb-2">No wishlists yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first wishlist to get started
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {wishlists.length > 0 && (
              <div>
                <h2 className="mb-4">My Wishlists</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {wishlists.map((wishlist) => (
                    <Card
                      key={wishlist.id}
                      className="hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => handleWishlistClick(wishlist, true)}
                    >
                      <CardHeader>
                        <CardTitle className="flex items-start justify-between">
                          <span className="line-clamp-1">{wishlist.name}</span>
                          <Gift className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-2" />
                        </CardTitle>
                        {wishlist.description && (
                          <CardDescription className="line-clamp-2">
                            {wishlist.description}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>{wishlist.items?.length || 0} items</span>
                          <ExternalLink className="h-4 w-4" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {followingWishlists.length > 0 && (
              <div>
                <h2 className="mb-4 flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Following
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {followingWishlists.map((wishlist) => (
                    <Card
                      key={wishlist.id}
                      className="hover:shadow-lg transition-shadow cursor-pointer border-pink-200"
                      onClick={() => handleWishlistClick(wishlist, false)}
                    >
                      <CardHeader>
                        <CardTitle className="flex items-start justify-between">
                          <span className="line-clamp-1">{wishlist.name}</span>
                          <Heart className="h-5 w-5 text-pink-500 flex-shrink-0 ml-2" />
                        </CardTitle>
                        {wishlist.description && (
                          <CardDescription className="line-clamp-2">
                            {wishlist.description}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>{wishlist.items?.length || 0} items</span>
                          <ExternalLink className="h-4 w-4" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
