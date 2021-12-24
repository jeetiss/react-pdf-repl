import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({});

const Bug = () => (
  <Document>
    <Page>
      <View>
        <View>
          <Text>12</Text>
        </View>

        <View>
          <Text>12</Text>
        </View>

        <View>
          <Text>12</Text>
        </View>
      </View>
    </Page>
  </Document>
);

// hack for hmr
const exportComponent = { component: Bug };
export default exportComponent;
