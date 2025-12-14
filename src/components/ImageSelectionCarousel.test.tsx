import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ImageSelectionCarousel } from "./ImageSelectionCarousel";

// Mock the UI Carousel components since they depend on Embla
vi.mock("./ui/carousel", () => {
    return {
        Carousel: ({ children, className }: any) => <div data-testid="carousel-root" className={className}>{children}</div>,
        CarouselContent: ({ children, className }: any) => <div data-testid="carousel-content" className={className}>{children}</div>,
        CarouselItem: ({ children, className }: any) => <div data-testid="carousel-item" className={className}>{children}</div>,
        CarouselNext: () => <button>Next</button>,
        CarouselPrevious: () => <button>Previous</button>,
    };
});

describe("ImageSelectionCarousel", () => {
    const defaultProps = {
        images: ["img1.jpg", "img2.jpg"],
        onSelect: vi.fn(),
    };

    it("does not render when images array is empty", () => {
        const { container } = render(<ImageSelectionCarousel {...defaultProps} images={[]} />);
        expect(container.firstChild).toBeNull();
    });

    it("renders with correct responsive classes", () => {
        render(<ImageSelectionCarousel {...defaultProps} />);

        // Find the wrapper div that has the responsive classes
        // It's the inner div inside the first child of the component
        // Implementation: <div className="..."><div className="relative w-full max-w-[150px] ...">...</div></div>

        // We can inspect the structure directly
        const wrapper = screen.getByTestId("carousel-root").parentElement;
        expect(wrapper).toHaveClass("relative");
        expect(wrapper).toHaveClass("max-w-[150px]");
        // Check for the media query class indirectly by string match if needed, or classList
        // Note: tailwind arbitrary variants might be compiled to a class name like `[@media...]:max-w-[300px]`
        // which appears in the class list as a string.
        const classes = wrapper?.className || "";
        expect(classes).toContain("[@media(min-height:800px)]:max-w-[300px]");
    });

    it("renders all images", () => {
        render(<ImageSelectionCarousel {...defaultProps} />);
        const items = screen.getAllByTestId("carousel-item");
        expect(items).toHaveLength(2);

        expect(screen.getByAltText("Option 1")).toBeInTheDocument();
        expect(screen.getByAltText("Option 2")).toBeInTheDocument();
    });

    it("calls onSelect when an image is clicked", () => {
        render(<ImageSelectionCarousel {...defaultProps} />);
        const firstImage = screen.getByAltText("Option 1");

        // Click the parent container logic
        // The click handler is on the div wrapping the image
        fireEvent.click(firstImage.closest('div')!);

        expect(defaultProps.onSelect).toHaveBeenCalledWith("img1.jpg");
    });

    it("shows selection overlay for selected image", () => {
        render(<ImageSelectionCarousel {...defaultProps} selectedImage="img1.jpg" />);

        // "Selected" text should be visible
        expect(screen.getByText("Selected")).toBeInTheDocument();

        // Verify it's on the first item
        // The overlay is a sibling of the image in the container
        const firstImage = screen.getByAltText("Option 1");
        const container = firstImage.closest("div");
        expect(container).toHaveTextContent("Selected");

        // Second image should not have it
        const secondImage = screen.getByAltText("Option 2");
        const container2 = secondImage.closest("div");
        expect(container2).not.toHaveTextContent("Selected");
    });
});
