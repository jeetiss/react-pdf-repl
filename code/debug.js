import { Document, Page, View, Text } from "@react-pdf/renderer";

const Doc = () => (
  <Document>
    <Page size={[15, 60]}>
      <View style={{
        backgroundColor: 'wheat',
      }}>
        <Text>a a a a</Text>
      </View>
    </Page>
  </Document>
);
// hack for hmr
const exportComponent = { component: Doc };
export default exportComponent;
