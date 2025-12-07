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
    return null;
  }

  const handleError = () => {
    console.error("Failed to load image:", src);
    setHasError(true);
  };

  return <img src={src} onError={handleError} {...rest} />;
}
