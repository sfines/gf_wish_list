import React from "react";

interface ImageSelectorProps {
  wishlistId: string;
  itemId: string;
  currentImageUrl?: string;
  suggestedImageUrls?: string[];
  onImageSelect: (itemId: string, url: string) => void;
}

const ImageSelector: React.FC<ImageSelectorProps> = ({
  itemId,
  currentImageUrl,
  suggestedImageUrls = [],
  onImageSelect,
}) => {
  if (!suggestedImageUrls || suggestedImageUrls.length === 0) {
    return null;
  }

  return (
    <div className="flex space-x-2 p-2 overflow-x-auto">
      {suggestedImageUrls.map((url) => (
        <img
          key={url}
          src={url}
          alt="item-thumbnail"
          className={`w-16 h-16 object-cover cursor-pointer rounded-md border-2 ${
            currentImageUrl === url ? "border-blue-500" : "border-transparent"
          }`}
          onClick={() => onImageSelect(itemId, url)}
        />
      ))}
    </div>
  );
};

export default ImageSelector;
