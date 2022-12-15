// This should be "infer SS" but can't use it yet
interface NewLifecycle<P, S, SS> {

  getSnapshotBeforeUpdate?(
    prevProps: Readonly<P>,
    prevState: Readonly<S>
  ): SS | null;
  /**
   * Called immediately after updating occurs. Not called for the initial render.
   *
   * The snapshot is only present if getSnapshotBeforeUpdate is present and returns non-null.
   */
  componentDidUpdate?(
    prevProps: Readonly<P>,
    prevState: Readonly<S>,
    snapshot?: SS
  ): void;
}

interface ErrorInfo {
  /**
   * Captures which component contained the exception, and its ancestors.
   */
  componentStack: string;
}


interface ComponentLifecycle<P, S, SS = any> extends NewLifecycle<P, S, SS> {
  /**
   * Called immediately after a component is mounted. Setting state here will trigger re-rendering.
   */
  componentDidMount?(): void;

  shouldComponentUpdate?(
    nextProps: Readonly<P>,
    nextState: Readonly<S>,
    nextContext: any
  ): boolean;

  componentWillUnmount?(): void;
  /**
   * Catches exceptions generated in descendant components. Unhandled exceptions will cause
   * the entire component tree to unmount.
   */
  componentDidCatch?(error: Error, errorInfo: ErrorInfo): void;
}

interface Component<P = {}, S = {}, SS = any>
  extends ComponentLifecycle<P, S, SS> {}
declare class Component<P, S> {
  constructor(props: Readonly<P> | P);

  setState<K extends keyof S>(
    state:
      | ((prevState: Readonly<S>, props: Readonly<P>) => Pick<S, K> | S | null)
      | (Pick<S, K> | S | null),
    callback?: () => void
  ): void;

  forceUpdate(callback?: () => void): void;
  render(): ReactNode;

  readonly props: Readonly<P>;
  state: Readonly<S>;
}

type JSXElementConstructor<P> =
  | ((props: P) => ReactElement<any, any> | null)
  | (new (props: P) => Component<any, any>);

type Key = string | number;

interface ReactElement<
  P = any,
  T extends string | JSXElementConstructor<any> =
    | string
    | JSXElementConstructor<any>
> {
  type: T;
  props: P;
  key: Key | null;
}

type ReactFragment = Iterable<ReactNode>;

type ReactNode =
  | ReactElement
  | string
  | number
  | ReactFragment
  | boolean
  | null
  | undefined;

type PDFVersion = "1.3" | "1.4" | "1.5" | "1.6" | "1.7" | "1.7ext3";
interface SVGPresentationAttributes {
  fill?: string;
  color?: string;
  stroke?: string;
  transform?: string;
  strokeDasharray?: string;
  opacity?: string | number;
  strokeWidth?: string | number;
  fillOpacity?: string | number;
  fillRule?: "nonzero" | "evenodd";
  strokeOpacity?: string | number;
  textAnchor?: "start" | "middle" | "end";
  strokeLineCap?: "butt" | "round" | "square";
  visibility?: "visible" | "hidden" | "collapse";
  dominantBaseline?:
    | "auto"
    | "middle"
    | "central"
    | "hanging"
    | "mathematical"
    | "text-after-edge"
    | "text-before-edge";
}
interface Style {
  // Flexbox
  alignContent?:
    | "flex-start"
    | "flex-end"
    | "center"
    | "stretch"
    | "space-between"
    | "space-around";
  alignItems?: "flex-start" | "flex-end" | "center" | "stretch" | "baseline";
  alignSelf?:
    | "auto"
    | "flex-start"
    | "flex-end"
    | "center"
    | "baseline"
    | "stretch";
  flex?: number | string;
  flexDirection?: "row" | "row-reverse" | "column" | "column-reverse";
  flexWrap?: "nowrap" | "wrap" | "wrap-reverse";
  flexFlow?: number;
  flexGrow?: number;
  flexShrink?: number;
  flexBasis?: number | string;
  justifyContent?:
    | "flex-start"
    | "flex-end"
    | "center"
    | "space-around"
    | "space-between"
    | "space-evenly";
  // Layout
  bottom?: number | string;
  display?: "flex" | "none";
  left?: number | string;
  position?: "absolute" | "relative";
  right?: number | string;
  top?: number | string;
  overflow?: "hidden";
  zIndex?: number | string;
  // Dimension
  height?: number | string;
  maxHeight?: number | string;
  maxWidth?: number | string;
  minHeight?: number | string;
  minWidth?: number | string;
  width?: number | string;
  // Color
  backgroundColor?: string;
  color?: string;
  opacity?: number;
  // Text
  fontSize?: number | string;
  fontFamily?: string;
  fontStyle?: string | "normal";
  fontWeight?:
    | number
    | "thin"
    | "hairline"
    | "ultralight"
    | "extralight"
    | "light"
    | "normal"
    | "medium"
    | "semibold"
    | "demibold"
    | "bold"
    | "ultrabold"
    | "extrabold"
    | "heavy"
    | "black";
  letterSpacing?: number | string;
  lineHeight?: number | string;
  maxLines?: number; // ?
  textAlign?: "left" | "right" | "center" | "justify"; // ?
  textDecoration?:
    | "line-through"
    | "underline"
    | "none"
    | "line-through underline"
    | "underline line-through";
  textDecorationColor?: string;
  textDecorationStyle?: "dashed" | "dotted" | "solid" | string; // ?
  textIndent?: any; // ?
  textOverflow?: "ellipsis";
  textTransform?: "capitalize" | "lowercase" | "uppercase";
  // Sizing/positioning
  objectFit?: string;
  objectPosition?: number | string;
  objectPositionX?: number | string;
  objectPositionY?: number | string;
  // Margin/padding
  margin?: number | string;
  marginHorizontal?: number | string;
  marginVertical?: number | string;
  marginTop?: number | string;
  marginRight?: number | string;
  marginBottom?: number | string;
  marginLeft?: number | string;
  padding?: number | string;
  paddingHorizontal?: number | string;
  paddingVertical?: number | string;
  paddingTop?: number | string;
  paddingRight?: number | string;
  paddingBottom?: number | string;
  paddingLeft?: number | string;
  // Transformations
  transform?: string;
  transformOrigin?: number | string;
  transformOriginX?: number | string;
  transformOriginY?: number | string;
  // Borders
  border?: number | string;
  borderWidth?: number | string;
  borderColor?: string;
  borderStyle?: "dashed" | "dotted" | "solid";
  borderTop?: number | string;
  borderTopColor?: string;
  borderTopStyle?: "dashed" | "dotted" | "solid"; // ?
  borderTopWidth?: number | string;
  borderRight?: number | string;
  borderRightColor?: string;
  borderRightStyle?: "dashed" | "dotted" | "solid"; // ?
  borderRightWidth?: number | string;
  borderBottom?: number | string;
  borderBottomColor?: string;
  borderBottomStyle?: "dashed" | "dotted" | "solid"; // ?
  borderBottomWidth?: number | string;
  borderLeft?: number | string;
  borderLeftColor?: string;
  borderLeftStyle?: "dashed" | "dotted" | "solid"; // ?
  borderLeftWidth?: number | string;
  borderTopLeftRadius?: number | string;
  borderTopRightRadius?: number | string;
  borderBottomRightRadius?: number | string;
  borderBottomLeftRadius?: number | string;
  borderRadius?: number | string;
}
type HyphenationCallback = (
  words: string,
  glyphString: {
    [key: string]: any;
  }
) => string[];
type Orientation = "portrait" | "landscape";
type StandardPageSize =
  | "4A0"
  | "2A0"
  | "A0"
  | "A1"
  | "A2"
  | "A3"
  | "A4"
  | "A5"
  | "A6"
  | "A7"
  | "A8"
  | "A9"
  | "A10"
  | "B0"
  | "B1"
  | "B2"
  | "B3"
  | "B4"
  | "B5"
  | "B6"
  | "B7"
  | "B8"
  | "B9"
  | "B10"
  | "C0"
  | "C1"
  | "C2"
  | "C3"
  | "C4"
  | "C5"
  | "C6"
  | "C7"
  | "C8"
  | "C9"
  | "C10"
  | "RA0"
  | "RA1"
  | "RA2"
  | "RA3"
  | "RA4"
  | "SRA0"
  | "SRA1"
  | "SRA2"
  | "SRA3"
  | "SRA4"
  | "EXECUTIVE"
  | "FOLIO"
  | "LEGAL"
  | "LETTER"
  | "TABLOID"
  | "ID1";
type StaticSize = number | string;
type PageSize =
  | StandardPageSize
  | [StaticSize]
  | [StaticSize, StaticSize]
  | {
      width: StaticSize;
      height?: StaticSize;
    };
interface OnRenderProps {
  blob?: Blob;
}
interface DocumentProps {
  title?: string;
  author?: string;
  subject?: string;
  creator?: string;
  keywords?: string;
  producer?: string;
  language?: string;
  pdfVersion?: PDFVersion;
  onRender?: (props: OnRenderProps) => any;
  children?: ReactNode;
}
/**
 * This component represent the PDF document itself. It must be the root
 * of your tree element structure, and under no circumstances should it be
 * used as children of another react-pdf component. In addition, it should
 * only have childs of type <Page />.
 */
declare class Document extends Component<DocumentProps> {}
interface NodeProps {
  id?: string;
  style?: Style | Style[];
  /**
   * Render component in all wrapped pages.
   * @see https://react-pdf.org/advanced#fixed-components
   */
  fixed?: boolean;
  /**
   * Force the wrapping algorithm to start a new page when rendering the
   * element.
   * @see https://react-pdf.org/advanced#page-breaks
   */
  break?: boolean;
  /**
   * Hint that no page wrapping should occur between all sibling elements following the element within n points
   * @see https://react-pdf.org/advanced#orphan-&-widow-protection
   */
  minPresenceAhead?: number;
}
interface PageProps extends NodeProps {
  /**
   * Enable page wrapping for this page.
   * @see https://react-pdf.org/components#page-wrapping
   */
  wrap?: boolean;
  /**
   * Enables debug mode on page bounding box.
   * @see https://react-pdf.org/advanced#debugging
   */
  debug?: boolean;
  size?: PageSize;
  orientation?: Orientation;
  children?: ReactNode;
}
/**
 * Represents single page inside the PDF document, or a subset of them if
 * using the wrapping feature. A <Document /> can contain as many pages as
 * you want, but ensure not rendering a page inside any component besides
 * Document.
 */
declare class Page extends Component<PageProps> {}
interface ViewProps extends NodeProps {
  id?: string;
  /**
   * Enable/disable page wrapping for element.
   * @see https://react-pdf.org/components#page-wrapping
   */
  wrap?: boolean;
  /**
   * Enables debug mode on page bounding box.
   * @see https://react-pdf.org/advanced#debugging
   */
  debug?: boolean;
  render?: (props: {
    pageNumber: number;
    subPageNumber: number;
  }) => ReactNode;
  children?: ReactNode;
}
/**
 * The most fundamental component for building a UI and is designed to be
 * nested inside other views and can have 0 to many children.
 */
declare class View extends Component<ViewProps> {}
interface TextProps extends NodeProps {
  id?: string;
  /**
   * Enable/disable page wrapping for element.
   * @see https://react-pdf.org/components#page-wrapping
   */
  wrap?: boolean;
  /**
   * Enables debug mode on page bounding box.
   * @see https://react-pdf.org/advanced#debugging
   */
  debug?: boolean;
  render?: (props: {
    pageNumber: number;
    totalPages: number;
    subPageNumber: number;
    subPageTotalPages: number;
  }) => ReactNode;
  children?: ReactNode;
  /**
   * Override the default hyphenation-callback
   * @see https://react-pdf.org/fonts#registerhyphenationcallback
   */
  hyphenationCallback?: HyphenationCallback;
  /**
   * Specifies the minimum number of lines in a text element that must be shown at the bottom of a page or its container.
   * @see https://react-pdf.org/advanced#orphan-&-widow-protection
   */
  orphans?: number;
  /**
   * Specifies the minimum number of lines in a text element that must be shown at the top of a page or its container..
   * @see https://react-pdf.org/advanced#orphan-&-widow-protection
   */
  widows?: number;
}
declare interface SVGTextProps extends SVGPresentationAttributes {
  style?: SVGPresentationAttributes;
  x: string | number;
  y: string | number;
  /**
   * Override the default hyphenation-callback
   * @see https://react-pdf.org/fonts#registerhyphenationcallback
   */
  hyphenationCallback?: HyphenationCallback;
}
/**
 * A React component for displaying text. Text supports nesting of other
 * Text or Link components to create inline styling.
 */
declare class Text extends Component<TextProps | SVGTextProps> {}
declare function render(node: ReactNode): void;
