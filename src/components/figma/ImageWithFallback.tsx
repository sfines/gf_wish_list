import { useState, useEffect } from "react";

export function ImageWithFallback(
  props: React.ImgHTMLAttributes<HTMLImageElement>
) {
  const { src, ...rest } = props;
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (!src || hasError) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-muted text-muted-foreground">
        <span className="text-xs">No Image</span>
      </div>
    );
  }

  const handleError = () => {
    console.error("Failed to load image:", src);
    setHasError(true);
  };

  return <img src={src} onError={handleError} {...rest} />;
}
