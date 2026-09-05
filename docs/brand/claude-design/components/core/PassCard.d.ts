/**
 * @startingPoint section="Core" subtitle="Credential card with tornasol holo strip" viewport="320x220"
 */
export interface PassCardProps {
  passId?: string;
  /** lifecycle state colors the meta line */
  state?: 'valid' | 'expiring' | 'revoked';
  expires?: string;
  /** tornasol holo strip on the top edge */
  holo?: boolean;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function PassCard(props: PassCardProps): JSX.Element;
