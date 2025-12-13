import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "./ui/carousel";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { cn } from "./ui/utils";

interface ImageSelectionCarouselProps {
    images: string[];
    selectedImage?: string;
    onSelect: (url: string) => void;
    className?: string;
}

export function ImageSelectionCarousel({
    images,
    selectedImage,
    onSelect,
    className,
}: ImageSelectionCarouselProps) {
    if (!images || images.length === 0) return null;

    return (
        <div className={cn("w-full flex flex-col items-center", className)}>
            {/* 300px default, 150px on screens shorter than 800px */}
            <div
                data-testid="carousel-wrapper"
                className="relative w-full max-w-[150px] [@media(min-height:800px)]:max-w-[300px] overflow-hidden rounded-xl transition-all duration-300"
            >
                <Carousel
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    className="w-full"
                    aria-label="Image selection carousel"
                >
                    <CarouselContent className="-ml-0">
                        {images.map((img, index) => (
                            <CarouselItem key={index} className="pl-0 basis-full">
                                <div
                                    className={cn(
                                        "relative w-full aspect-square cursor-pointer overflow-hidden border-2 transition-all bg-muted/20",
                                        selectedImage === img
                                            ? "border-primary ring-2 ring-primary/20"
                                            : "border-transparent hover:border-muted-foreground/20"
                                    )}
                                    onClick={() => onSelect(img)}
                                >
                                    <ImageWithFallback
                                        src={img}
                                        alt={`Option ${index + 1}`}
                                        className="h-full w-full object-contain"
                                    />

                                    {/* Selection Indicator Overlay */}
                                    {selectedImage === img && (
                                        <div className="absolute inset-0 bg-primary/10 flex items-center justify-center pointer-events-none">
                                            <div className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full shadow-sm">
                                                Selected
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    {images.length > 1 && (
                        <>
                            <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background z-10 border-none shadow-sm h-8 w-8" />
                            <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background z-10 border-none shadow-sm h-8 w-8" />
                        </>
                    )}
                </Carousel>
            </div>
        </div>
    );
}
