import { useState } from "react";
import { Button } from "./ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Search, UserPlus, Check } from "lucide-react";
import { searchWishlists, followWishlist } from "../utils/api";
import { toast } from "sonner";

interface FindWishlistDialogProps {
    accessToken: string;
    onFollowSuccess: () => void;
}

export function FindWishlistDialog({ accessToken, onFollowSuccess }: FindWishlistDialogProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsLoading(true);
        try {
            const data = await searchWishlists(accessToken, query);
            setResults(data);
        } catch (error) {
            console.error("Search failed:", error);
            toast.error("Search failed", {
                description: "Could not find wishlists. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleFollow = async (wishlistId: string) => {
        try {
            await followWishlist(accessToken, wishlistId);
            toast.success("Following wishlist", {
                description: "You are now following this wishlist.",
            });
            // Update local state to show followed without researching
            setResults(results.map(r => r.id === wishlistId ? { ...r, isFollowing: true } : r));
            onFollowSuccess();
        } catch (error) {
            console.error("Follow failed:", error);
            toast.error("Failed to follow", {
                description: "Could not follow wishlist. Please try again.",
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Search className="mr-2 h-4 w-4" />
                    Find Wishlists
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Find Wishlists</DialogTitle>
                    <DialogDescription>
                        Search for wishlists by owner name or share token.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                    <Input
                        placeholder="Search by owner name or token"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        disabled={isLoading}
                    />
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Searching..." : "Search"}
                    </Button>
                </form>

                <div className="space-y-4 max-h-[300px] overflow-y-auto">
                    {results.length === 0 && query && !isLoading && (
                        <p className="text-center text-muted-foreground text-sm">
                            No wishlists found.
                        </p>
                    )}
                    {results.map((wishlist) => (
                        <div
                            key={wishlist.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                        >
                            <div className="flex-1 min-w-0 mr-4">
                                <h4 className="font-medium truncate">{wishlist.name}</h4>
                                <p className="text-sm text-muted-foreground truncate">
                                    by {wishlist.owner_name || "Unknown"}
                                </p>
                                {wishlist.items && (
                                    <p className="text-xs text-muted-foreground">
                                        {wishlist.items[0]?.count || 0} items
                                    </p>
                                )}
                            </div>
                            <Button
                                size="sm"
                                variant={wishlist.isFollowing ? "secondary" : "default"}
                                onClick={() => !wishlist.isFollowing && handleFollow(wishlist.id)}
                                disabled={wishlist.isFollowing}
                            >
                                {wishlist.isFollowing ? (
                                    <>
                                        <Check className="mr-2 h-3 w-3" />
                                        Following
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="mr-2 h-3 w-3" />
                                        Follow
                                    </>
                                )}
                            </Button>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
