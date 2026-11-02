import React from "react";

interface PageSnapshotImageProps {
  url: string;
}

export const PageSnapshotImage = ({ url }: PageSnapshotImageProps): React.ReactElement => (
  <img
    src={url}
    alt=""
    draggable={false}
    decoding="async"
    className="absolute inset-0 w-full h-full pointer-events-none select-none"
  />
);
