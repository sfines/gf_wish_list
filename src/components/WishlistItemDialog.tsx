import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { ImageSelectionCarousel } from "./ImageSelectionCarousel";
import { fetchOgImage } from "../utils/fetchOgImage";

export interface WishlistItemFormData {
    url: string;
    title: string;
    description: string;
    image_url?: string;
    image_urls?: string[];
}

interface WishlistItemDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: "add" | "edit";
    initialData?: WishlistItemFormData;
    onSubmit: (data: WishlistItemFormData) => Promise<void>;
}

export function WishlistItemDialog({
    open,
    onOpenChange,
    mode,
    initialData,
    onSubmit,
}: WishlistItemDialogProps) {
    const [url, setUrl] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [previewImages, setPreviewImages] = useState<string[]>([]);
    const [selectedImage, setSelectedImage] = useState("");
    const [isFetchingImages, setIsFetchingImages] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [debouncedUrl, setDebouncedUrl] = useState("");

    // Initialize state when initialData changes or dialog opens
    useEffect(() => {
        if (open) {
            if (initialData) {
                setUrl(initialData.url || "");
                setTitle(initialData.title || "");
                setDescription(initialData.description || "");
                setPreviewImages(initialData.image_urls || []);
                setSelectedImage(initialData.image_url || "");
                // Don't auto-fetch if we already have images in edit mode
            } else {
                // Reset for Add mode
                setUrl("");
                setTitle("");
                setDescription("");
                setPreviewImages([]);
                setSelectedImage("");
            }
        }
    }, [open, initialData]);

    // Debounce URL for image fetching
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedUrl(url);
        }, 1000);

        return () => clearTimeout(timer);
    }, [url]);

    // Fetch images logic
    useEffect(() => {
        const fetchImages = async () => {
            // Only fetch if we are in Add mode OR if the URL changed in Edit mode
            // Logic: If initialData is present (Edit), only fetch if expected logic dictates.
            // Current behavior in WishlistView:
            // "if (debouncedItemUrl && !editingItem)" -> Only fetched for Add Item
            // BUT, if user changes URL in Edit, we probably want to fetch?
            // The original code PREVENTED fetching in edit mode: "&& !editingItem".
            // Let's stick to the requested parity: "Unify...".
            // If I change URL in Edit, I expect new images.
            // Let's allow fetching if URL is different from initial or if it's add mode.

            const isAddMode = mode === "add";
            const hasUrlChanged = initialData ? url !== initialData.url : true;

            if (debouncedUrl && (isAddMode || hasUrlChanged)) {
                // Avoid re-fetching if we already have images for this URL (optimization), 
                // but for now let's just trigger it if URL matches debounced and isn't empty.

                // Don't fetch if it's the same as what we just initialized with
                if (initialData && debouncedUrl === initialData.url && previewImages.length > 0) {
                    return;
                }

                setIsFetchingImages(true);
                try {
                    const images = await fetchOgImage(debouncedUrl);
                    if (images && images.length > 0) {
                        setPreviewImages(images);
                        // Only auto-select if we don't have one or if we just fetched new ones
                        if (!selectedImage || isAddMode) {
                            setSelectedImage(images[0]);
                        }
                    } else {
                        // Only clear if we really failed to find anything for a NEW url
                        if (isAddMode) {
                            setPreviewImages([]);
                            setSelectedImage("");
                        }
                    }
                } catch (error) {
                    console.error("Error fetching images:", error);
                    if (isAddMode) {
                        setPreviewImages([]);
                        setSelectedImage("");
                    }
                } finally {
                    setIsFetchingImages(false);
                }
            }
        };

        fetchImages();
    }, [debouncedUrl, mode, initialData]); // removed previewImages rely

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSubmit({
                url,
                title,
                description,
                image_url: selectedImage,
                image_urls: previewImages,
            });
            // Don't close here, parent handles it or we close on success? 
            // Parent usually closes.
        } finally {
            setIsSubmitting(false);
        }
    };

    const titleText = mode === "add" ? "Add a new item" : "Edit Item";
    const descText = mode === "add"
        ? "Enter the details of the item you want to add to your wishlist."
        : "Make changes to your item here. Click save when you're done.";
    const submitText = mode === "add" ? "Add Item" : "Save Changes";
    const submittingText = mode === "add" ? "Adding..." : "Saving...";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg overflow-x-hidden">
                <DialogHeader>
                    <DialogTitle>{titleText}</DialogTitle>
                    <DialogDescription>{descText}</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="item-url" className="text-right">
                                URL
                            </Label>
                            <Input
                                id="item-url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="col-span-3"
                                placeholder="https://example.com/product"
                            />
                        </div>

                        {/* Carousel */}
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label className="text-right pt-2">
                                Image {previewImages.length > 0 && `(${previewImages.length})`}
                            </Label>
                            <div className="col-span-3">
                                {isFetchingImages ? (
                                    <div className="text-sm text-muted-foreground py-2">
                                        Loading images...
                                    </div>
                                ) : previewImages.length > 0 ? (
                                    <ImageSelectionCarousel
                                        images={previewImages}
                                        selectedImage={selectedImage}
                                        onSelect={setSelectedImage}
                                    />
                                ) : url ? (
                                    <div className="text-sm text-muted-foreground py-2">
                                        {mode === 'add' ? "No images found" : "No images available"}
                                    </div>
                                ) : null}
                            </div>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="item-title" className="text-right">
                                Title
                            </Label>
                            <Input
                                id="item-title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
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
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="col-span-3"
                                placeholder="Any specific details, like size or color"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? submittingText : submitText}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
