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
import {
  ArrowLeft,
  Plus,
  Trash2,
  ExternalLink,
  Share2,
  Copy,
  CheckCircle2,
  Circle,
  AlertCircle,
  Pencil,
  Heart,
  HeartOff,
} from "lucide-react";
import {
  addItem,
  deleteItem,
  deleteWishlist,
  updateItemClaimed,
  updateItem,
  updateWishlist,
  updateItemImage,
  followWishlist,
  unfollowWishlist,
  getFollowingStatus,
} from "../utils/api";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import ImageSelector from "./figma/ImageSelector";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface WishlistItem {
  id: string;
  title: string;
  url: string;
  description: string;
  addedAt: string;
  claimed: boolean;
  image_url?: string;
  image_urls?: string[];
}

interface Wishlist {
  id: string;
  name: string;
  description: string;
  shareToken: string;
  items: WishlistItem[];
  createdAt: string;
}

interface WishlistViewProps {
  wishlist: Wishlist;
  accessToken?: string;
  isOwner: boolean;
  onBack: () => void;
  onUpdate?: (wishlist: Wishlist) => void;
  onDelete?: (wishlistId: string) => void;
}

export function WishlistView({
  wishlist,
  accessToken,
  isOwner,
  onBack,
  onUpdate,
  onDelete,
}: WishlistViewProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isEditTitleDialogOpen, setIsEditTitleDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WishlistItem | null>(null);
  const [itemUrl, setItemUrl] = useState("");
  const [itemTitle, setItemTitle] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [wishlistName, setWishlistName] = useState(wishlist.name);
  const [wishlistDescription, setWishlistDescription] = useState(
    wishlist.description
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const shareUrl = `${window.location.origin}?share=${wishlist.shareToken}`;

  useEffect(() => {
    const fetchFollowingStatus = async () => {
      if (!accessToken || isOwner) return;

      try {
        const data = await getFollowingStatus(accessToken, wishlist.id);
        setIsFollowing(data.is_following);
      } catch (error) {
        console.error("Error fetching following status:", error);
      }
    };

    fetchFollowingStatus();
  }, [accessToken, wishlist.id, isOwner]);

  const handleFollowWishlist = async () => {
    if (!accessToken) return;

    try {
      await followWishlist(accessToken, wishlist.id);
      setIsFollowing(true);
      toast.success("Wishlist followed");
    } catch (error) {
      console.error("Error following wishlist:", error);
      toast.error("Failed to follow wishlist");
    }
  };

  const handleUnfollowWishlist = async () => {
    if (!accessToken) return;

    try {
      await unfollowWishlist(accessToken, wishlist.id);
      setIsFollowing(false);
      toast.success("Wishlist unfollowed");
    } catch (error) {
      console.error("Error unfollowing wishlist:", error);
      toast.error("Failed to unfollow wishlist");
    }
  };

  const handleImageSelect = async (itemId: string, imageUrl: string) => {
    if (!accessToken) return;

    try {
      const data = await updateItemImage(
        accessToken,
        wishlist.id,
        itemId,
        imageUrl
      );
      if (onUpdate) {
        onUpdate(data.wishlist);
      }
      toast.success("Item image updated!");
    } catch (error) {
      console.error("Error updating item image:", error);
      toast.error("Failed to update item image.");
    }
  };

  const sortedItems = wishlist.items.sort(
    (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
  );

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;

    setIsSubmitting(true);
    try {
      const data = await addItem(accessToken, wishlist.id, {
        url: itemUrl,
        title: itemTitle,
        description: itemDescription,
      });

      if (onUpdate) {
        onUpdate(data.wishlist);
      }

      setItemUrl("");
      setItemTitle("");
      setItemDescription("");
      setIsAddDialogOpen(false);
      toast.success("Item added to wishlist!");
    } catch (error) {
      console.error("Error adding item:", error);
      toast.error("Failed to add item");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !editingItem) return;

    setIsSubmitting(true);
    try {
      const data = await updateItem(accessToken, wishlist.id, editingItem.id, {
        title: itemTitle,
        url: itemUrl,
        description: itemDescription,
      });

      if (onUpdate) {
        onUpdate(data.wishlist);
      }

      setEditingItem(null);
      setItemUrl("");
      setItemTitle("");
      setItemDescription("");
      setIsEditDialogOpen(false);
      toast.success("Item updated!");
    } catch (error) {
      console.error("Error updating item:", error);
      toast.error("Failed to update item");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!accessToken) return;

    try {
      const data = await deleteItem(accessToken, wishlist.id, itemId);
      if (onUpdate) {
        onUpdate(data.wishlist);
      }
      toast.success("Item removed from wishlist");
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to remove item");
    }
  };

  const handleToggleClaim = async (itemId: string, claimed: boolean) => {
    if (!accessToken) return;

    try {
      const data = await updateItemClaimed(
        accessToken,
        wishlist.id,
        itemId,
        claimed
      );
      if (onUpdate) {
        onUpdate(data.wishlist);
      }
      toast.success(
        claimed ? "Item marked as purchased!" : "Item marked as available"
      );
    } catch (error) {
      console.error("Error updating item claim status:", error);
      toast.error("Failed to update item status");
    }
  };

  const handleCopyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Share link copied to clipboard!");
  };

  const handleDeleteWishlist = async () => {
    if (!accessToken) return;

    try {
      await deleteWishlist(accessToken, wishlist.id);
      if (onDelete) {
        onDelete(wishlist.id);
      }
      toast.success("Wishlist deleted");
    } catch (error) {
      console.error("Error deleting wishlist:", error);
      toast.error("Failed to delete wishlist");
    }
  };

  const handleEditWishlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;

    setIsSubmitting(true);
    try {
      const data = await updateWishlist(accessToken, wishlist.id, {
        name: wishlistName,
        description: wishlistDescription,
      });
      if (onUpdate) {
        onUpdate(data.wishlist);
      }
      setIsEditTitleDialogOpen(false);
      toast.success("Wishlist updated!");
    } catch (error) {
      console.error("Error updating wishlist:", error);
      toast.error("Failed to update wishlist");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <CardTitle>{wishlist.name}</CardTitle>
              {isOwner && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditTitleDialogOpen(true)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
            </div>
            <CardDescription>{wishlist.description}</CardDescription>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isOwner && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Add Item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add a new item</DialogTitle>
                  <DialogDescription>
                    Enter the details of the item you want to add to your
                    wishlist.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddItem}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="item-url" className="text-right">
                        URL
                      </Label>
                      <Input
                        id="item-url"
                        value={itemUrl}
                        onChange={(e) => setItemUrl(e.target.value)}
                        className="col-span-3"
                        placeholder="https://example.com/product"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="item-title" className="text-right">
                        Title
                      </Label>
                      <Input
                        id="item-title"
                        value={itemTitle}
                        onChange={(e) => setItemTitle(e.target.value)}
                        className="col-span-3"
                        placeholder="A cool product"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="item-description" className="text-right">
                        Description
                      </Label>
                      <Textarea
                        id="item-description"
                        value={itemDescription}
                        onChange={(e) => setItemDescription(e.target.value)}
                        className="col-span-3"
                        placeholder="Any specific details, like size or color"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Adding..." : "Add Item"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
          <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Share2 className="mr-2 h-4 w-4" /> Share
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Share Wishlist</DialogTitle>
                <DialogDescription>
                  Anyone with this link can view this wishlist.
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center space-x-2">
                <Input value={shareUrl} readOnly />
                <Button onClick={handleCopyShareUrl}>
                  <Copy className="mr-2 h-4 w-4" /> Copy
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          {isOwner && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your wishlist and all its items.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteWishlist}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          {!isOwner && accessToken && (
            <>
              {isFollowing ? (
                <Button
                  variant="outline"
                  onClick={handleUnfollowWishlist}
                  aria-label="Unfollow this wishlist"
                >
                  <HeartOff className="mr-2 h-4 w-4" />
                  Unfollow
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={handleFollowWishlist}
                  aria-label="Follow this wishlist"
                >
                  <Heart className="mr-2 h-4 w-4" />
                  Follow
                </Button>
              )}
            </>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedItems.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-4 p-4 border rounded-lg"
            >
              <div className="flex flex-col gap-2">
                <ImageWithFallback
                  src={item.image_url}
                  alt={item.title || "Item preview"}
                  className="w-24 h-24 object-cover rounded-md"
                />
                {isOwner && (
                  <ImageSelector
                    accessToken={accessToken}
                    wishlistId={wishlist.id}
                    itemId={item.id}
                    currentImageUrl={item.image_url}
                    suggestedImageUrls={item.image_urls}
                    onImageSelect={handleImageSelect}
                  />
                )}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-500 hover:underline flex items-center gap-1"
                      >
                        View Product <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {isOwner ? (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingItem(item);
                            setItemTitle(item.title);
                            setItemUrl(item.url);
                            setItemDescription(item.description);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Item</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove "{item.title}"
                                from your wishlist?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteItem(item.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    ) : (
                      <Button
                        variant={item.claimed ? "secondary" : "primary"}
                        onClick={() =>
                          handleToggleClaim(item.id, !item.claimed)
                        }
                      >
                        {item.claimed ? (
                          <>
                            <CheckCircle2 className="mr-2 h-4 w-4" /> Purchased
                          </>
                        ) : (
                          <>
                            <Circle className="mr-2 h-4 w-4" /> Mark as
                            Purchased
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditItem}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-item-title" className="text-right">
                  Title
                </Label>
                <Input
                  id="edit-item-title"
                  value={itemTitle}
                  onChange={(e) => setItemTitle(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-item-url" className="text-right">
                  URL
                </Label>
                <Input
                  id="edit-item-url"
                  value={itemUrl}
                  onChange={(e) => setItemUrl(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-item-description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="edit-item-description"
                  value={itemDescription}
                  onChange={(e) => setItemDescription(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEditTitleDialogOpen}
        onOpenChange={setIsEditTitleDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Wishlist Details</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditWishlist}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="wishlist-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="wishlist-name"
                  value={wishlistName}
                  onChange={(e) => setWishlistName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="wishlist-description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="wishlist-description"
                  value={wishlistDescription}
                  onChange={(e) => setWishlistDescription(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
