export const SAMPLE_IMAGES = [
  "/sample.jpg",
  "/sample2.jpeg",
  "/sample3.jpg",
  "/sample4.png",
  "/sample5.jpeg",
  "/sample7.jpeg",
  "/sample8.jpeg",
  "/sample9.jpeg",
  "/sample10.jpeg",
  "/sample11.jpeg",
  "/sample12.jpeg",
  "/sample13.jpeg",
  "/sample14.jpeg",
  "/sample15.jpeg",
  "/sample16.jpeg",
];

export const pickSampleImage = (templateId: string, layerId: string): string => {
  const hash = [...(templateId + layerId)].reduce(
    (acc, character) => acc + character.charCodeAt(0),
    0,
  );
  return SAMPLE_IMAGES[hash % SAMPLE_IMAGES.length];
};
