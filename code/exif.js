/* eslint-disable jsx-a11y/alt-text */
import { Document, Page, View, Image, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  body: {
    padding: 0,
  },
});

const Doc = () => (
  <Document>
    <Page style={styles.body} size="A5">
      <Document>
        <Page style={styles.body} size="A4">
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            <Image
              style={{ width: 100 }}
              src="https://raw.githubusercontent.com/recurser/exif-orientation-examples/master/Landscape_0.jpg"
            />
            <Image
              style={{ width: 100 }}
              src="https://raw.githubusercontent.com/recurser/exif-orientation-examples/master/Landscape_1.jpg"
            />
            <Image
              style={{ width: 100 }}
              src="https://raw.githubusercontent.com/recurser/exif-orientation-examples/master/Landscape_2.jpg"
            />
            <Image
              style={{ width: 100 }}
              src="https://raw.githubusercontent.com/recurser/exif-orientation-examples/master/Landscape_3.jpg"
            />
            <Image
              style={{ width: 100 }}
              src="https://raw.githubusercontent.com/recurser/exif-orientation-examples/master/Landscape_4.jpg"
            />
            <Image
              style={{ width: 100 }}
              src="https://raw.githubusercontent.com/recurser/exif-orientation-examples/master/Landscape_5.jpg"
            />
            <Image
              style={{ width: 100 }}
              src="https://raw.githubusercontent.com/recurser/exif-orientation-examples/master/Landscape_6.jpg"
            />
            <Image
              style={{ width: 100 }}
              src="https://raw.githubusercontent.com/recurser/exif-orientation-examples/master/Landscape_7.jpg"
            />
            <Image
              style={{ width: 100 }}
              src="https://raw.githubusercontent.com/recurser/exif-orientation-examples/master/Landscape_8.jpg"
            />
          </View>
        </Page>
      </Document>
    </Page>
  </Document>
);

// hack for hmr
const exportComponent = { component: Doc };
export default exportComponent;
