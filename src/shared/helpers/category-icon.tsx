import {
  AlertTriangle,
  Crosshair,
  Flame,
  MapPin,
  ShieldAlert,
  ShoppingBag,
  Target,
  type LucideIcon,
} from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  gun: Crosshair,
  bag: ShoppingBag,
  target: Target,
  flame: Flame,
  alert: AlertTriangle,
  'alert-triangle': AlertTriangle,
  shield: ShieldAlert,
  tiroteio: Flame,
  furto: Target,
  'area-suspeita': ShieldAlert,
};

export function categoryIcon(icon: string, slug: string): LucideIcon {
  return ICONS[icon] ?? ICONS[slug] ?? MapPin;
}
