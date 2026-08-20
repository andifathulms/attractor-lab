import { dictionary, type Dictionary } from './dictionaries';

/** The app's (only) dictionary. Kept as a hook for call-site compatibility across ~30 components. */
export function useT(): Dictionary {
  return dictionary;
}
