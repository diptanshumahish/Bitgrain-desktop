type GuestHandoff = () => Promise<string>;

let activeHandoff: GuestHandoff | null = null;

export function registerGuestHandoff(handoff: GuestHandoff): () => void {
  activeHandoff = handoff;
  return () => {
    if (activeHandoff === handoff) activeHandoff = null;
  };
}

export async function runGuestHandoff(): Promise<string | null> {
  return activeHandoff ? await activeHandoff() : null;
}
