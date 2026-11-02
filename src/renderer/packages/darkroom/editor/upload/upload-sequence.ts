import { StaleUploadError } from "./upload-errors";

const uploadSequenceRef = { current: 0 };

export const beginUpload = (): number => {
  uploadSequenceRef.current += 1;
  return uploadSequenceRef.current;
};

export const isLatestUpload = (token: number): boolean => token === uploadSequenceRef.current;

export const assertLatestUpload = (token: number): void => {
  if (!isLatestUpload(token)) throw new StaleUploadError();
};
