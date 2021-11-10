import { Document, Page, View, Text } from "@react-pdf/renderer";

const Bug = () => (
  <Document>
    <Page>
      <View style={{ alignSelf: "flex-start", backgroundColor: "green" }}>
        <Text style={{ transform: "translate(50%, 0)" }}>hello</Text>
      </View>
    </Page>
  </Document>
);

// hack for hmr
const exportComponent = { component: Bug };
export default exportComponent;
