/* eslint-disable jsx-a11y/alt-text */
import {
  Document,
  Page,
  Svg,
  Path,
  ClipPath,
  Defs,
  Circle,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  body: {
    padding: 20,
  },
});

const Doc = () => (
  <Document>
    <Page style={styles.body} size="A5">
      <Svg width={100} height={100} viewBox="0 0 100 100">
        <Defs>
          <ClipPath id="cut-circle">
            <Circle cx="50" cy="50" r="50" />
          </ClipPath>
        </Defs>

        <Image
          x={0}
          y={0}
          clipPath="url(#cut-circle)"
          style={{ width: 100, height: 100 }}
          src="https://images.unsplash.com/photo-1630332458162-acc073374da7?fit=crop&w=100&h=100&q=80"
        ></Image>
      </Svg>

      <Svg
        width={100}
        height={100}
        viewBox="0 0 100 100"
        style={{ alignSelf: "flex-end" }}
      >
        <Defs>
          <ClipPath id="cut-circle">
            <Path d="M50 0L54.3248 10.2345L60.7485 1.16897L62.7721 12.0939L70.9945 4.62123L70.6222 15.7257L80.2587 10.1953L77.508 20.9602L88.1081 17.6307L83.1076 27.5525L94.1756 26.5796L87.1591 35.1945L98.1775 36.6236L89.4731 43.5287L99.9267 47.2931L89.9413 52.1656L99.3413 58.0891L88.542 60.7011L96.4488 68.5069L85.3405 68.7363L91.3844 78.0594L80.4865 75.8955L84.385 86.2998L74.207 81.8437L75.7777 92.8429L66.7956 86.303L65.9651 97.3827L58.5988 89.0648L55.406 99.7069L50 90L44.594 99.7069L41.4012 89.0648L34.0349 97.3827L33.2044 86.303L24.2223 92.8429L25.793 81.8437L15.615 86.2998L19.5135 75.8955L8.61555 78.0594L14.6595 68.7363L3.55116 68.5069L11.458 60.7011L0.658672 58.0891L10.0587 52.1656L0.0733299 47.2931L10.5269 43.5287L1.8225 36.6236L12.8409 35.1945L5.8244 26.5796L16.8924 27.5525L11.8919 17.6307L22.492 20.9602L19.7413 10.1953L29.3778 15.7257L29.0055 4.62123L37.2279 12.0939L39.2515 1.16897L45.6752 10.2345L50 0Z" />
          </ClipPath>
        </Defs>

        <Image
          x={0}
          y={0}
          clipPath="url(#cut-circle)"
          style={{ width: 100, height: 100 }}
          src="https://images.unsplash.com/photo-1600267185393-e158a98703de?fit=crop&w=100&h=100&q=80"
        ></Image>
      </Svg>

      <Svg width={100} height={100} viewBox="0 0 100 100">
        <Defs>
          <ClipPath id="cut-circle">
            <Path d="M28.952 0.987935C17.4063 1.29586 0.499909 9.8408 0.5 16.7691C0.500091 23.6974 12.4581 31.0106 19.8804 31.0106C28.1273 31.0106 28.952 44.8672 19.8804 47.1766C10.8087 49.486 3.79879 63.3426 5.03583 71.8106C6.27287 80.2785 23.1791 91.4407 28.952 96.4445C34.7249 101.448 59.0534 103.373 59.0534 96.4445C59.0534 89.5162 73.0733 81.4332 84.619 80.2785C96.1648 79.1238 98.6389 49.486 100.288 39.4785C101.938 29.471 93.6907 22.9276 84.619 22.5427C75.5474 22.1578 66.4757 19.0785 59.0534 10.9955C51.6312 2.91246 43.3842 0.60303 28.952 0.987935Z" />
          </ClipPath>
        </Defs>

        <Image
          x={0}
          y={0}
          clipPath="url(#cut-circle)"
          style={{ width: 100, height: 100 }}
          src="https://images.unsplash.com/photo-1630332457582-e631f0a1013d?fit=crop&w=100&h=100&q=80"
        ></Image>
      </Svg>
    </Page>
  </Document>
);

// hack for hmr
const exportComponent = { component: Doc };
export default exportComponent;
