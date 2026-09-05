/**
 * @startingPoint section="Core" subtitle="Sharp-edged action button — Beacon fill or outline" viewport="360x120"
 */
export interface ButtonProps {
  /** 'primary' | 'secondary' | 'ghost' | 'danger' */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function Button(props: ButtonProps): JSX.Element;
