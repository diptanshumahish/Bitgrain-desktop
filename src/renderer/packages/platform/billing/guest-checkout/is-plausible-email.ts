const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isPlausibleEmail = (value: string): boolean => EMAIL_SHAPE.test(value.trim());
