import analytics from "./index";
import { isInternalTraffic } from "./internal-traffic";
import { applyTrackingOptOut } from "./tracking-opt-out";

interface IdentifiedUser {
  id: string;
  email: string;
  name: string;
  provider: string;
  plan?: string;
}

export const identifyUser = (user: IdentifiedUser): void => {
  const isOptedOut = applyTrackingOptOut(user.email);
  analytics.setOptedOut(isOptedOut);
  if (isOptedOut) return;
  const isInternal = isInternalTraffic(user.email);
  analytics.identify(user.id, {
    email: user.email,
    name: user.name,
    provider: user.provider,
    is_internal: isInternal,
    ...(user.plan ? { plan: user.plan } : {}),
  });
  analytics.register({ is_internal: isInternal });
};
