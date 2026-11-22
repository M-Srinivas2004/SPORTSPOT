export interface MatchResult {
  score: number; // 0 to 100
  reasons: string[];
  explanation: string;
}

export interface AthleteMatchInput {
  primarySport: string;
  secondarySports?: string | null;
  location: string;
  experienceLevel: string;
}

export interface CampaignMatchInput {
  sportCategory: string;
  location: string;
  eligibilityRequirements: string;
  sponsorshipType: string;
  budgetMin: number;
  budgetMax: number;
}

/**
 * Deterministic Explainable Rule-Based Recommendation Engine
 * Analyzes concrete sporting parameters to score compatibility between athlete and campaign.
 */
export function calculateMatchScore(
  athlete: AthleteMatchInput,
  campaign: CampaignMatchInput
): MatchResult {
  let score = 0;
  const reasons: string[] = [];

  // 1. Sport Compatibility (Max: 40 pts)
  const athletePrimary = athlete.primarySport.trim().toLowerCase();
  const campaignSport = campaign.sportCategory.trim().toLowerCase();
  const secondaryList = athlete.secondarySports
    ? athlete.secondarySports.toLowerCase().split(',').map((s) => s.trim())
    : [];

  if (campaignSport === 'all' || campaignSport === 'any' || athletePrimary === campaignSport) {
    score += 40;
    reasons.push(`Direct sport match: ${athlete.primarySport}`);
  } else if (secondaryList.includes(campaignSport)) {
    score += 28;
    reasons.push(`Secondary sport match: ${campaign.sportCategory}`);
  } else if (
    campaignSport.includes(athletePrimary) ||
    athletePrimary.includes(campaignSport)
  ) {
    score += 24;
    reasons.push(`Related discipline alignment with ${campaign.sportCategory}`);
  }

  // 2. Location Compatibility (Max: 20 pts)
  const athleteLoc = athlete.location.trim().toLowerCase();
  const campaignLoc = campaign.location.trim().toLowerCase();

  if (campaignLoc === 'global' || campaignLoc === 'anywhere' || campaignLoc === 'remote') {
    score += 20;
    reasons.push('Campaign is open to athletes worldwide');
  } else if (athleteLoc === campaignLoc || athleteLoc.includes(campaignLoc) || campaignLoc.includes(athleteLoc)) {
    score += 20;
    reasons.push(`Target region match: ${campaign.location}`);
  } else {
    score += 5; // Minimal partial for inter-state/regional
  }

  // 3. Experience Requirements (Max: 25 pts)
  const reqText = campaign.eligibilityRequirements.toLowerCase();
  const exp = athlete.experienceLevel.toUpperCase();

  const levelHierarchy: Record<string, number> = {
    BEGINNER: 1,
    INTERMEDIATE: 2,
    STATE_LEVEL: 3,
    NATIONAL_LEVEL: 4,
    INTERNATIONAL_PRO: 5,
  };

  const athleteTier = levelHierarchy[exp] || 2;

  if (reqText.includes('national') && athleteTier >= 4) {
    score += 25;
    reasons.push('Meets high-level national competition tier requirements');
  } else if (reqText.includes('state') && athleteTier >= 3) {
    score += 25;
    reasons.push('Satisfies state-level achievement criteria');
  } else if (reqText.includes('beginner') || reqText.includes('grassroots') || reqText.includes('all levels')) {
    score += 25;
    reasons.push('Open to developmental & rising athletes');
  } else if (athleteTier >= 3) {
    score += 20;
    reasons.push(`Competitive background (${exp.replace('_', ' ')}) aligns with opportunity`);
  } else {
    score += 15;
    reasons.push('Opportunity encourages promising talent');
  }

  // 4. Sponsorship Category Value (Max: 15 pts)
  score += 15;
  reasons.push(`${campaign.sponsorshipType} sponsorship suits active athletes`);

  // Cap at 100
  const finalScore = Math.min(100, Math.round(score));

  const explanation =
    reasons.length > 0
      ? `Recommended because: ${reasons.slice(0, 2).join(' and ')}.`
      : 'Potential opportunity matching your profile category.';

  return {
    score: finalScore,
    reasons,
    explanation,
  };
}
