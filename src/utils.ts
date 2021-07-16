import { isEqual } from "lodash";
import { Alarm, Leds, Light } from "@devlights/types";
import { Gradient } from "./store/types/favouriteGradients";

export const lightEquality = (l: Light, r: Light): boolean => {
  return (
    isEqual(l?.isOn, r?.isOn) &&
    ledsEquality(l.leds, r.leds) &&
    isEqual(l?.tags, r?.tags) &&
    isEqual(l.count, r.count) &&
    isEqual(l.name, r.name)
  );
};

export const ledsEquality = (left: Leds, right: Leds): boolean =>
  isEqual(left.colors, right.colors) || isEqual(left.pattern, right.pattern);

export const tagArrayEquality = (l: string[], r: string[]) => {
  try {
    if (l.length !== r.length) return false;
    for (let i = 0; i < (l.length > r.length ? l.length : r.length); i++) {
      if (l[i] !== r[i]) return false;
    }
  } catch {
    return false;
  }
  return true;
};

export const lightsEquality = (l: Light[], r: Light[]): boolean => {
  if (l.length !== r.length) return false;
  for (let i = 0; i < l.length; i++) {
    if (!isEqual(l[i], r[i])) return false;
  }
  return true;
};

export const checkAlarmEquality = (l: Alarm, r: Alarm): boolean => {
  return (
    isEqual(l.color, r.color) &&
    isEqual(l.days, r.days) &&
    isEqual(l.isOn, r.isOn) &&
    isEqual(l.lights, r.lights) &&
    isEqual(l.name, r.name) &&
    isEqual(l.time, r.time)
  );
};
export const tagsEquality = (
  left: Light[],
  right: Light[],
  count: number,
  tag: string,
): boolean => {
  try {
    let tagCount = 0;
    for (
      let i = 0;
      i < (left.length > right.length ? left.length : right.length);
      i++
    ) {
      if (left[i].tags?.includes(tag)) tagCount++;
      if (left[i].tags !== right[i].tags) return false;
      if (left[i].isOn !== right[i].isOn) return false;
    }

    if (tagCount !== count) return false;
  } catch {
    return false;
  }
  return true;
};

export const isOnEquality = (left: Light[], right: Light[]): boolean => {
  if (left.length !== right.length) return false;
  for (let i = 0; i < left.length; i++) {
    if (left[i].isOn !== right[i].isOn) return false;
  }
  return true;
};

export const favouritesEquality = (
  left: string[],
  right: string[],
): boolean => {
  try {
    for (
      let i = 0;
      i < (left.length > right.length ? left.length : right.length);
      i++
    ) {
      if (right[i] !== left[i]) return false;
    }
  } catch {
    return false;
  }
  return true;
};

export const favouriteGradientsEquality = (
  left: Gradient[],
  right: Gradient[],
): boolean => {
  try {
    for (
      let i = 0;
      i < (left.length > right.length ? left.length : right.length);
      i++
    ) {
      if (right[i] !== left[i]) return false;
    }
  } catch {
    return false;
  }
  return true;
};

export const makeValidColorArray = (
  new_color: string,
  colorArray: string[],
  index: number,
): string[] => {
  const newArray: string[] = [...colorArray];
  newArray[index] = new_color;
  return newArray;
};

export const isFavouriteGradient = (
  favouriteGradients: Gradient[],
  gradient: Gradient,
): boolean => {
  for (let index = 0; index < favouriteGradients.length; index++) {
    const current = favouriteGradients[index];
    if (current.start === gradient.start && current.end === gradient.end) {
      return true;
    }
  }
  return false;
};
