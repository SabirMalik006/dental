import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  variant?: 'horizontal' | 'full' | 'icon' | 'dark';
}

export const Logo: React.FC<LogoProps> = ({ className, variant = 'horizontal' }) => {
  if (variant === 'dark') {
    return (
      <div className={cn('relative h-14 sm:h-16 lg:h-20 aspect-square select-none flex-shrink-0', className)}>
        <Image
          src="/logo-full-light-text.png"
          alt="Dental Cosmetics & Implant Centre Logo"
          fill
          priority
          sizes="(max-width: 640px) 120px, (max-width: 1024px) 160px, 200px"
          className="object-contain"
        />
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div className={cn('relative h-14 sm:h-16 lg:h-20 aspect-square select-none flex-shrink-0', className)}>
        <Image
          src="/logo-full.png"
          alt="Dental Cosmetics & Implant Centre Logo"
          fill
          priority
          sizes="(max-width: 640px) 120px, (max-width: 1024px) 160px, 200px"
          className="object-contain"
        />
      </div>
    );
  }

  if (variant === 'icon') {
    return (
      <div className={cn('relative h-10 sm:h-12 lg:h-14 aspect-square select-none flex-shrink-0', className)}>
        <Image
          src="/logo-icon.png"
          alt="Dental Cosmetics & Implant Centre Logo"
          fill
          priority
          sizes="(max-width: 640px) 40px, (max-width: 1024px) 48px, 56px"
          className="object-contain"
        />
      </div>
    );
  }

  // Default is 'horizontal' navbar variant
  return (
    <div className={cn('relative h-10 sm:h-12 lg:h-16 aspect-square select-none flex-shrink-0', className)}>
      <Image
        src="/logo-horizontal.png"
        alt="Dental Cosmetics & Implant Centre Logo"
        fill
        priority
        sizes="(max-width: 640px) 100px, (max-width: 1024px) 125px, 160px"
        className="object-contain"
      />
    </div>
  );
};

export default Logo;
