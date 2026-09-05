export interface InputProps {
  label?: string;
  value?: string;
  onChange?: (e: any) => void;
  placeholder?: string;
  /** helper line under the field, rendered in Trace */
  meta?: string;
  type?: string;
  style?: React.CSSProperties;
}
export declare function Input(props: InputProps): JSX.Element;
