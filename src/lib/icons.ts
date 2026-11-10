import {
  Banknote,
  Briefcase,
  CircleHelp,
  Clock,
  EyeOff,
  Gift,
  KeyRound,
  Link,
  ShieldCheck,
  TrendingUp,
  UserRoundX,
  VenetianMask,
  Wallet,
  type LucideIcon,
} from "lucide-react";

/**
 * Nama ikon Lucide dari API v1 (`Category.icon`, `TacticRef.icon`) → komponen.
 * Daftar sesuai internal/data/v1 (categories.json, tactics.json).
 */
const ICONS: Record<string, LucideIcon> = {
  briefcase: Briefcase,
  gift: Gift,
  "user-round-x": UserRoundX,
  banknote: Banknote,
  "help-circle": CircleHelp,
  clock: Clock,
  wallet: Wallet,
  "venetian-mask": VenetianMask,
  "eye-off": EyeOff,
  "trending-up": TrendingUp,
  "key-round": KeyRound,
  link: Link,
  "shield-check": ShieldCheck,
};

/** Ikon untuk nama dari API; nama tak dikenal → CircleHelp. */
export function iconFor(name: string): LucideIcon {
  return ICONS[name] ?? CircleHelp;
}
