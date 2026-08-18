import { MakerSignature } from './MakerSignature';

/**
 * The site's one shared bottom bar. This project carries no data/license
 * attribution to show here, so today it's just the maker's mark — but the
 * bar itself (border-t, padding) is the reusable seam a future legal line
 * would share, kept visually separate via layout rather than a second
 * divider.
 */
export function Footer() {
  return (
    <footer className="border-t border-rule bg-night px-4 py-4 sm:px-6">
      <MakerSignature />
    </footer>
  );
}
