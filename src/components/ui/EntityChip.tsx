import type { EntityType } from '@/types';

export interface EntityChipProps {
  type: EntityType;
  /** Canonicalized value. Rendered in mono so look-alikes (0/O, 1/l/I) are distinguishable. */
  value: string;
}

const LABEL: Record<EntityType, string> = {
  phone: 'Phone',
  url: 'URL',
  domain: 'Domain',
  email: 'Email',
  wallet: 'Wallet',
  handle: 'Handle',
  brand: 'Brand',
};

/**
 * Displays a fraud-infrastructure entity. For url/domain, the caller should pass
 * a punycode-aware value (annotate `xn--` IDNs) so users can spot look-alike-domain
 * scams — never silently render decoded Unicode that masks an IDN-homograph attack (DS-7.3).
 */
export default function EntityChip({ type, value }: EntityChipProps): React.JSX.Element {
  return (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-sm border border-border bg-surface-muted px-2 py-1 text-sm">
      <span className="text-text-subtle">{LABEL[type]}</span>
      <span className="truncate font-mono text-text">{value}</span>
    </span>
  );
}
