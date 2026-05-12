// All pricing verified as of May 2026 — see PRICING_DATA.md for source URLs

export interface PlanData {
  pricePerSeat: number;
  minSeats?: number;
  label: string;
}

export interface ToolPricing {
  plans: Record<string, PlanData>;
  category: 'coding' | 'writing' | 'data' | 'research' | 'mixed';
  description: string;
}

export const PRICING: Record<string, ToolPricing> = {
  cursor: {
    description: 'AI-powered code editor',
    category: 'coding',
    plans: {
      hobby: { pricePerSeat: 0, label: 'Hobby (Free)' },
      pro: { pricePerSeat: 20, label: 'Pro' },
      business: { pricePerSeat: 40, label: 'Business' },
      enterprise: { pricePerSeat: 60, label: 'Enterprise' },
    },
  },
  copilot: {
    description: 'GitHub AI code completion',
    category: 'coding',
    plans: {
      individual: { pricePerSeat: 10, label: 'Individual' },
      business: { pricePerSeat: 19, label: 'Business' },
      enterprise: { pricePerSeat: 39, label: 'Enterprise' },
    },
  },
  claude: {
    description: 'Anthropic Claude AI assistant',
    category: 'mixed',
    plans: {
      free: { pricePerSeat: 0, label: 'Free' },
      pro: { pricePerSeat: 20, label: 'Pro' },
      max: { pricePerSeat: 100, label: 'Max' },
      team: { pricePerSeat: 25, label: 'Team', minSeats: 5 },
      enterprise: { pricePerSeat: 60, label: 'Enterprise', minSeats: 10 },
      api: { pricePerSeat: 0, label: 'API Direct (usage-based)' },
    },
  },
  chatgpt: {
    description: 'OpenAI ChatGPT AI assistant',
    category: 'mixed',
    plans: {
      plus: { pricePerSeat: 20, label: 'Plus' },
      team: { pricePerSeat: 30, label: 'Team', minSeats: 2 },
      enterprise: { pricePerSeat: 60, label: 'Enterprise', minSeats: 10 },
      api: { pricePerSeat: 0, label: 'API Direct (usage-based)' },
    },
  },
  anthropic_api: {
    description: 'Anthropic API direct usage',
    category: 'mixed',
    plans: {
      api: { pricePerSeat: 0, label: 'API Direct (usage-based)' },
    },
  },
  openai_api: {
    description: 'OpenAI API direct usage',
    category: 'mixed',
    plans: {
      api: { pricePerSeat: 0, label: 'API Direct (usage-based)' },
    },
  },
  gemini: {
    description: 'Google Gemini AI assistant',
    category: 'mixed',
    plans: {
      free: { pricePerSeat: 0, label: 'Free' },
      pro: { pricePerSeat: 20, label: 'Gemini Advanced (Pro)' },
      ultra: { pricePerSeat: 30, label: 'Gemini Business (Ultra)' },
      api: { pricePerSeat: 0, label: 'API Direct (usage-based)' },
    },
  },
  windsurf: {
    description: 'Codeium Windsurf AI code editor',
    category: 'coding',
    plans: {
      free: { pricePerSeat: 0, label: 'Free' },
      pro: { pricePerSeat: 15, label: 'Pro' },
      teams: { pricePerSeat: 35, label: 'Teams' },
    },
  },
};

export const TOOL_LABELS: Record<string, string> = {
  cursor: 'Cursor',
  copilot: 'GitHub Copilot',
  claude: 'Claude',
  chatgpt: 'ChatGPT',
  anthropic_api: 'Anthropic API',
  openai_api: 'OpenAI API',
  gemini: 'Gemini',
  windsurf: 'Windsurf',
};

export const USE_CASES = [
  { value: 'coding', label: 'Coding / Engineering' },
  { value: 'writing', label: 'Writing / Content' },
  { value: 'data', label: 'Data Analysis' },
  { value: 'research', label: 'Research' },
  { value: 'mixed', label: 'Mixed / General' },
];
