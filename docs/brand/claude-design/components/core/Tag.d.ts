export interface TagProps {
  /** 'valid' | 'expiring' | 'revoked' | 'accent' | 'neutral' — lifecycle states map to alternate beacons */
  state?: 'valid' | 'expiring' | 'revoked' | 'accent' | 'neutral';
  children?: React.ReactNode;
}
export declare function Tag(props: TagProps): JSX.Element;
