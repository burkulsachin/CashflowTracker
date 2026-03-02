
import { Car, Home, Plane, GraduationCap, Gift, Bitcoin, TreePalm, ShieldCheck, ShoppingBag, type LucideIcon } from 'lucide-react';

export const goalIcons: Record<string, { icon: LucideIcon, label: string }> = {
  shopping: { icon: ShoppingBag, label: 'Major Purchase' },
  car: { icon: Car, label: 'Car' },
  house: { icon: Home, label: 'House' },
  vacation: { icon: Plane, label: 'Vacation' },
  education: { icon: GraduationCap, label: 'Education' },
  gift: { icon: Gift, label: 'Gift' },
  investment: { icon: Bitcoin, label: 'Investment' },
  retirement: { icon: TreePalm, label: 'Retirement' },
  emergency: { icon: ShieldCheck, label: 'Emergency Fund' },
};

export type GoalIconName = keyof typeof goalIcons;
