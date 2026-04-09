import { WalletContextState } from "@solana/wallet-adapter-react";
import bs58 from "bs58";
import { fetchProfile, saveProfileToServer, deleteProfileFromServer } from "./profile-api";

export type Faction = "sentinel" | "vanguard" | "phantom";

export interface LinkedWallet {
  address: string;
  linkedAt: number;
  label?: string;
}

export interface OperativeProfile {
  callsign: string;
  walletAddress: string;
  faction: Faction;
  clearanceLevel: number;
  xp: number;
  registeredAt: number;
  signature: string;
  avatarStyle: string;
  linkedWallets: LinkedWallet[];
}

const STORAGE_PREFIX = "sentinel_operative_";

export function generateAuthMessage(
  callsign: string,
  walletAddress: string,
  timestamp: number
): string {
  return `SENTINEL PROTOCOL: Authorize Operative "${callsign}" with wallet ${walletAddress} at ${timestamp}`;
}

export async function signAndCreateProfile(
  wallet: WalletContextState,
  callsign: string,
  faction: Faction,
  avatarStyle: string
): Promise<OperativeProfile> {
  if (!wallet.publicKey || !wallet.signMessage) {
    throw new Error("Wallet not connected or does not support message signing");
  }

  const walletAddress = wallet.publicKey.toBase58();
  const timestamp = Date.now();
  const message = generateAuthMessage(callsign, walletAddress, timestamp);
  const encodedMessage = new TextEncoder().encode(message);

  const signatureBytes = await wallet.signMessage(encodedMessage);
  const signature = bs58.encode(signatureBytes);

  const profile: OperativeProfile = {
    callsign,
    walletAddress,
    faction,
    clearanceLevel: 1,
    xp: 0,
    registeredAt: timestamp,
    signature,
    avatarStyle,
    linkedWallets: [],
  };

  saveProfile(profile);
  // Persist to server (fire-and-forget, localStorage is the primary during registration)
  saveProfileToServer(profile).catch(() => {});
  return profile;
}

export function loadProfile(walletAddress: string): OperativeProfile | null {
  try {
    const data = localStorage.getItem(`${STORAGE_PREFIX}${walletAddress}`);
    if (!data) return null;
    const profile = JSON.parse(data);
    // Backward compat: migrate old avatarIndex to avatarStyle
    if (!profile.avatarStyle && profile.avatarIndex !== undefined) {
      profile.avatarStyle = "bottts";
      delete profile.avatarIndex;
      saveProfile(profile);
    }
    // Backward compat: add linkedWallets if missing
    if (!profile.linkedWallets) {
      profile.linkedWallets = [];
      saveProfile(profile);
    }
    return profile as OperativeProfile;
  } catch {
    return null;
  }
}

/** Load profile with server fallback — use when localStorage may be empty (new device/browser). */
export async function loadProfileAsync(walletAddress: string): Promise<OperativeProfile | null> {
  // Try localStorage first (fast)
  const local = loadProfile(walletAddress);
  if (local) return local;

  // Fallback to server
  const remote = await fetchProfile(walletAddress);
  if (remote) {
    // Cache locally for next time
    saveProfile(remote);
  }
  return remote;
}

export function saveProfile(profile: OperativeProfile): void {
  try {
    localStorage.setItem(
      `${STORAGE_PREFIX}${profile.walletAddress}`,
      JSON.stringify(profile)
    );
  } catch {
    console.error("Failed to save operative profile to localStorage");
  }
  // Dual-write to server
  saveProfileToServer(profile).catch(() => {});
}

export function deleteProfile(walletAddress: string): void {
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${walletAddress}`);
  } catch {
    console.error("Failed to delete operative profile from localStorage");
  }
  // Also delete from server
  deleteProfileFromServer(walletAddress).catch(() => {});
}

export function isAuthenticated(walletAddress: string): boolean {
  return loadProfile(walletAddress) !== null;
}

export function addXP(walletAddress: string, amount: number): void {
  const profile = loadProfile(walletAddress);
  if (!profile) return;
  profile.xp += amount;
  profile.clearanceLevel = getClearanceLevel(profile.xp);
  saveProfile(profile);
}

export function getClearanceLevel(xp: number): number {
  if (xp >= 2000) return 5;
  if (xp >= 1000) return 4;
  if (xp >= 500) return 3;
  if (xp >= 100) return 2;
  return 1;
}

export function getXPForNextLevel(currentXP: number): {
  current: number;
  required: number;
  progress: number;
} {
  const thresholds = [0, 100, 500, 1000, 2000];
  const level = getClearanceLevel(currentXP);
  if (level >= 5) return { current: currentXP, required: 2000, progress: 100 };
  const currentThreshold = thresholds[level - 1];
  const nextThreshold = thresholds[level];
  const progress = ((currentXP - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
  return { current: currentXP, required: nextThreshold, progress: Math.min(progress, 100) };
}

export const AVATAR_STYLES = [
  { id: "bottts", label: "MECH", desc: "Robotic operative" },
  { id: "bottts-neutral", label: "DROID", desc: "Neutral construct" },
  { id: "pixel-art", label: "PIXEL", desc: "Retro encoded" },
  { id: "pixel-art-neutral", label: "GHOST", desc: "Low-res phantom" },
  { id: "identicon", label: "SIGIL", desc: "Identity hash" },
  { id: "shapes", label: "PRISM", desc: "Geometric form" },
  { id: "thumbs", label: "SIGNAL", desc: "Status beacon" },
  { id: "rings", label: "ORBIT", desc: "Ring signature" },
];

export function getAvatarUrl(style: string, seed: string, size = 128): string {
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(seed)}&size=${size}`;
}

export function generateLinkMessage(
  primaryWallet: string,
  newWallet: string,
  timestamp: number
): string {
  return `SENTINEL PROTOCOL: Link wallet ${newWallet} to operative ${primaryWallet} at ${timestamp}`;
}

export async function linkWallet(
  wallet: WalletContextState,
  profile: OperativeProfile
): Promise<OperativeProfile> {
  if (!wallet.publicKey || !wallet.signMessage) {
    throw new Error("Wallet not connected or does not support message signing");
  }

  const newAddress = wallet.publicKey.toBase58();

  if (newAddress === profile.walletAddress) {
    throw new Error("Cannot link your primary wallet");
  }

  if (profile.linkedWallets.some((w) => w.address === newAddress)) {
    throw new Error("Wallet already linked");
  }

  const timestamp = Date.now();
  const message = generateLinkMessage(profile.walletAddress, newAddress, timestamp);
  const encodedMessage = new TextEncoder().encode(message);
  await wallet.signMessage(encodedMessage);

  const updated: OperativeProfile = {
    ...profile,
    linkedWallets: [
      ...profile.linkedWallets,
      { address: newAddress, linkedAt: timestamp },
    ],
  };

  saveProfile(updated);
  return updated;
}

export function unlinkWallet(
  addressToRemove: string,
  profile: OperativeProfile
): OperativeProfile {
  const updated: OperativeProfile = {
    ...profile,
    linkedWallets: profile.linkedWallets.filter(
      (w) => w.address !== addressToRemove
    ),
  };
  saveProfile(updated);
  return updated;
}

export const FACTION_INFO: Record<Faction, { name: string; color: string; description: string; plainDescription: string }> = {
  sentinel: {
    name: "SENTINEL",
    color: "#00E5CC",
    description: "Guardians of protocol integrity. Specialize in monitoring and enforcement.",
    plainDescription: "Monitors AI agents for rule violations and ensures they stay within their approved limits.",
  },
  vanguard: {
    name: "VANGUARD",
    color: "#FF9B26",
    description: "First responders. Lead the charge in agent containment operations.",
    plainDescription: "First to respond when an AI agent misbehaves — flags issues and initiates reviews.",
  },
  phantom: {
    name: "PHANTOM",
    color: "#6C5CE7",
    description: "Covert operatives. Masters of intelligence gathering and surveillance.",
    plainDescription: "Tracks AI agent activity behind the scenes and gathers evidence for governance votes.",
  },
};
