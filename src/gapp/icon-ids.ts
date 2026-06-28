/** 16×16 zany icons shipped under Users/.local/icons/ (fixture seed). */
export const ZANY_ICON_IDS = [
  'alien',
  'banana',
  'bomb',
  'cat',
  'crown',
  'disco-ball',
  'donut',
  'eye',
  'flame',
  'frog',
  'gem',
  'ghost',
  'heart',
  'hotdog',
  'lightning',
  'mushroom',
  'pizza',
  'pretzel',
  'rainbow',
  'robot',
  'rocket',
  'skull',
  'sparkle',
  'star',
  'taco',
  'ufo',
  'watermelon',
  'wizard',
] as const

export type ZanyIconId = (typeof ZANY_ICON_IDS)[number]

const iconSet = new Set<string>(ZANY_ICON_IDS)

export function isZanyIconId(value: string): value is ZanyIconId {
  return iconSet.has(value)
}