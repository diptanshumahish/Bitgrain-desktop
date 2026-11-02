import { renderScreenRows } from "../plugins/halftone";
import type { BandReply, BandRequest } from "./band-messages";

self.onmessage = (event: MessageEvent<BandRequest>) => {
  const { id, plan, rows } = event.data;
  const reply: BandReply = { id, band: renderScreenRows(plan, rows) };
  (self as unknown as Worker).postMessage(reply, [reply.band.buffer]);
};
