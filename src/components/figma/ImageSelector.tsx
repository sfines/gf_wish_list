import React from 'react';

interface ImageSelectorProps {
  imageUrls: string[];
  selectedImageUrl: string;
  onSelect: (url: string) => void;
}

const ImageSelector: React.FC<ImageSelectorProps> = ({ imageUrls, selectedImageUrl, onSelect }) => {
  return (
    <div className="flex space-x-2 p-2">
      {imageUrls.map((url) => (
        <img
          key={url}
          src={url}
          alt="item-thumbnail"
          className={`w-16 h-16 object-cover cursor-pointer rounded-md border-2 ${
            selectedImageUrl === url ? 'border-blue-500' : 'border-transparent'
          }`}
          onClick={() => onSelect(url)}
        />
      ))}
    </div>
  );
};

export default ImageSelector;
