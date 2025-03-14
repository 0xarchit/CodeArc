import React from 'react';

interface PromoFeatureProps {
  feature: string;
}

export function PromoFeature({ feature }: PromoFeatureProps) {
  return (
    <li className="flex items-center gap-2">
      <span className="w-1.5 h-1.5 bg-white rounded-full" />
      {feature}
    </li>
  );
}