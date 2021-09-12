import {
  Document,
  Page,
  Font,
  LinearGradient,
  Svg,
  Stop,
  Rect,
  Defs,
} from "@react-pdf/renderer";

const Gradient = () => {
  return (
    <Document>
      <Page>
        <Svg width="595.28" height="841.89">
          <Defs>
            <LinearGradient id="Grad1" x1="0" x2="1" y1="0" y2="1">
              <Stop offset="0%" stopColor="rgb(60, 251, 165)" />
              <Stop offset="50%" stopColor="rgb(62, 148, 234)" />
              <Stop offset="100%" stopColor="rgb(136, 0, 240)" />
            </LinearGradient>
          </Defs>

          <Rect x="0" y="0" width="595.28" height="841.89" fill="url(#Grad1)" />
        </Svg>
      </Page>
    </Document>
  );
};

Font.register({
  family: "Oswald",
  src: "https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf",
});

export default Gradient;
