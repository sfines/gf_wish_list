import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { ArrowLeft, Plus, Trash2, ExternalLink, Share2, Copy, CheckCircle2, Circle, AlertCircle, Pencil } from 'lucide-react';
import { addItem, deleteItem, deleteWishlist, updateItemClaimed, updateItem, updateWishlist } from '../utils/api';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';

interface WishlistItem {
  id: string;
  title: string;
  url: string;
  description: string;
  addedAt: string;
  claimed: boolean;
  ogImageUrl?: string;
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

export function WishlistView({ wishlist, accessToken, isOwner, onBack, onUpdate, onDelete }: WishlistViewProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isEditTitleDialogOpen, setIsEditTitleDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WishlistItem | null>(null);
  const [itemUrl, setItemUrl] = useState('');
  const [itemTitle, setItemTitle] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [wishlistName, setWishlistName] = useState(wishlist.name);
  const [wishlistDescription, setWishlistDescription] = useState(wishlist.description);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const shareUrl = `${window.location.origin}?share=${wishlist.shareToken}`;

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
      
      setItemUrl('');
      setItemTitle('');
      setItemDescription('');
      setIsAddDialogOpen(false);
      toast.success('Item added to wishlist!');
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error('Failed to add item');
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
      
      setItemUrl('');
      setItemTitle('');
      setItemDescription('');
      setEditingItem(null);
      setIsEditDialogOpen(false);
      toast.success('Item updated successfully!');
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Failed to update item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (item: WishlistItem) => {
    setEditingItem(item);
    setItemTitle(item.title);
    setItemUrl(item.url);
    setItemDescription(item.description);
    setIsEditDialogOpen(true);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!accessToken) return;

    try {
      const data = await deleteItem(accessToken, wishlist.id, itemId);
      if (onUpdate) {
        onUpdate(data.wishlist);
      }
      toast.success('Item removed');
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  };

  const handleToggleClaimed = async (itemId: string, currentStatus: boolean) => {
    try {
      const data = await updateItemClaimed(wishlist.id, itemId, !currentStatus);
      if (onUpdate) {
        onUpdate(data.wishlist);
      }
      toast.success(!currentStatus ? 'Marked as claimed!' : 'Unmarked as claimed');
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Failed to update item');
    }
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('Share link copied to clipboard!');
  };

  const handleDeleteWishlist = async () => {
    if (!accessToken) return;

    try {
      await deleteWishlist(accessToken, wishlist.id);
      if (onDelete) {
        onDelete(wishlist.id);
      }
      toast.success('Wishlist deleted');
    } catch (error) {
      console.error('Error deleting wishlist:', error);
      toast.error('Failed to delete wishlist');
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
      toast.success('Wishlist updated successfully!');
    } catch (error) {
      console.error('Error updating wishlist:', error);
      toast.error('Failed to update wishlist');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="mb-2">{wishlist.name}</CardTitle>
                {wishlist.description && (
                  <CardDescription>{wishlist.description}</CardDescription>
                )}
              </div>
              <div className="flex gap-2 flex-wrap">
                {isOwner && (
                  <>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Item
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Item to Wishlist</DialogTitle>
                          <DialogDescription>
                            Add a link or description for something you'd like
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAddItem} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                              id="title"
                              placeholder="Item name"
                              value={itemTitle}
                              onChange={(e) => setItemTitle(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="url">URL (optional)</Label>
                            <Input
                              id="url"
                              type="url"
                              placeholder="https://..."
                              value={itemUrl}
                              onChange={(e) => setItemUrl(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                              id="description"
                              placeholder="Describe what you want..."
                              value={itemDescription}
                              onChange={(e) => setItemDescription(e.target.value)}
                              rows={3}
                              required={!itemUrl}
                            />
                          </div>
                          <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? 'Adding...' : 'Add Item'}
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Item</DialogTitle>
                          <DialogDescription>
                            Update the link or description for the item
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleEditItem} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-title">Title</Label>
                            <Input
                              id="edit-title"
                              placeholder="Item name"
                              value={itemTitle}
                              onChange={(e) => setItemTitle(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-url">URL (optional)</Label>
                            <Input
                              id="edit-url"
                              type="url"
                              placeholder="https://..."
                              value={itemUrl}
                              onChange={(e) => setItemUrl(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-description">Description</Label>
                            <Textarea
                              id="edit-description"
                              placeholder="Describe what you want..."
                              value={itemDescription}
                              onChange={(e) => setItemDescription(e.target.value)}
                              rows={3}
                            />
                          </div>
                          <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? 'Updating...' : 'Update Item'}
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <Share2 className="mr-2 h-4 w-4" />
                          Share
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Share Wishlist</DialogTitle>
                          <DialogDescription>
                            Share this link with friends and family so they can see your wishlist
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Share Link</Label>
                            <div className="flex gap-2">
                              <Input
                                value={shareUrl}
                                readOnly
                                className="flex-1"
                                onClick={(e) => e.currentTarget.select()}
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={handleCopyShareLink}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Anyone with this link can view your wishlist and mark items as claimed.
                          </p>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Wishlist</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this wishlist? This action cannot be undone.
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

                    <Dialog open={isEditTitleDialogOpen} onOpenChange={setIsEditTitleDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Wishlist</DialogTitle>
                          <DialogDescription>
                            Update the name and description of your wishlist
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleEditWishlist} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-name">Name</Label>
                            <Input
                              id="edit-name"
                              placeholder="Wishlist name"
                              value={wishlistName}
                              onChange={(e) => setWishlistName(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-description">Description</Label>
                            <Textarea
                              id="edit-description"
                              placeholder="Describe your wishlist..."
                              value={wishlistDescription}
                              onChange={(e) => setWishlistDescription(e.target.value)}
                              rows={3}
                            />
                          </div>
                          <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? 'Updating...' : 'Update Wishlist'}
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </>
                )}
                {!isOwner && (
                  <Button variant="outline" onClick={handleCopyShareLink}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Link
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {!isOwner && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm">
                You're viewing a shared wishlist. {isOwner ? "You can add items and manage it." : "Click items to mark them as claimed so others know you're getting them!"}
              </p>
            </div>
          </div>
        )}

        {wishlist.items.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground">
                {isOwner ? 'No items yet. Add your first item to get started!' : 'This wishlist is empty.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {wishlist.items.map((item) => (
              <Card key={item.id} className={item.claimed ? 'opacity-60' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleToggleClaimed(item.id, item.claimed)}
                      className="mt-0.5 flex-shrink-0 text-muted-foreground hover:text-primary transition-colors"
                    >
                      {item.claimed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </button>
                    
                    {item.ogImageUrl && (
                      <div className="flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-md overflow-hidden bg-gray-100">
                        <img
                          src={item.ogImageUrl}
                          alt={item.title || 'Item preview'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error('Failed to load image:', item.ogImageUrl);
                            e.currentTarget.style.display = 'none';
                          }}
                          onLoad={() => {
                            console.log('Successfully loaded image:', item.ogImageUrl);
                          }}
                        />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      {item.title && <h3 className="mb-1 line-clamp-1">{item.title}</h3>}
                      {item.description && (
                        <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                      )}
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                        >
                          View item
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>

                    {isOwner && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(item)}
                        className="flex-shrink-0"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}

                    {isOwner && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteItem(item.id)}
                        className="flex-shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}