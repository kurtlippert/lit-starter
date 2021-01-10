export const deepFreeze = <T>(obj: T) => {
  Object.keys(obj).forEach((prop) => {
    if (typeof obj[prop] === 'object') {
      deepFreeze(obj[prop]);
    }
  });
  return Object.freeze(obj);
};

export const Immutable = <T>(obj: T) => deepFreeze(obj);
