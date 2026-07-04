export interface ExtractedInfo {
  username: string;
  country: string;
  niche: string;
  reviewText: string;
  imageDescription: string;
  freelancerName?: string;
  hasExtracted: boolean;
}

export type SocialPlatform = 'linkedin' | 'twitter' | 'facebook' | 'instagram' | 'github' | 'web';

export interface SocialProfile {
  id: string;
  platform: SocialPlatform;
  url: string;
  displayName: string;
  handle: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  matchReason: string;
  summary: string;
}

export interface ManualSearchInputs {
  username: string;
  country: string;
  niche: string;
  reviewText: string;
}

export interface CustomSearchLink {
  platform: string;
  label: string;
  url: string;
  icon: string;
  description: string;
}

export interface SearchHistoryItem {
  id: string;
  timestamp: string;
  username: string;
  country: string;
  results: SocialProfile[];
  inputs: ManualSearchInputs;
}
