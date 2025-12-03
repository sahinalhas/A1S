import { ImgHTMLAttributes } from 'react';

interface LazyImageProps extends ImgHTMLAttributes<HTMLImageElement> {
 src: string;
 alt: string;
}

export const LazyImage = ({ src, alt, className, ...props }: LazyImageProps) => {
 return (
 <img
 src={src}
 alt={alt}
 loading="lazy"
 decoding="async"
 className={className}
 {...props}
 />
 );
};
