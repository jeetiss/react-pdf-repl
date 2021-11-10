import { Document, Page, View } from "@react-pdf/renderer";

const Bug = () => (
  <Document>
    <Page size="A4" orientation="portrait">
    <View style={{
      position: 'absolute',
      backgroundColor: 'red',
      top: '20%',
      bottom: '30%',
      left: '0',
      right: '0',
      // Bug: this border breaks the height of the view.
      border: '1px solid black',
      // Try commenting it out or using a zero border to see how it should really look:
      //border: '0px solid black',
      // Padding has the same issue:
      padding: '10px',
      // But margin works correctly:
      //margin: '10px'
    }} debug>
    </View>
  </Page>
  </Document>
);

// hack for hmr
const exportComponent = { component: Bug };
export default exportComponent;
