export const getPlanLabel = (plan: string): string => {
  switch (plan) {
    case "pro":
      return "Pro";
    default:
      return "Free plan";
  }
};

export const GUIDED_PROJECT_THRESHOLD = 3;
export const SEARCH_VISIBLE_THRESHOLD = 6;
