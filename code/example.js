import {
  Document,
  Page,
  View,
  Text,
  Font,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  body: {
    flexGrow: 1,
  },
  row: {
    flexGrow: 1,
    flexDirection: "row",
  },
  text: {
    width: "60%",
    fontFamily: "Oswald",
    textAlign: "justify",
    fontSize: 50,
    padding: 20,
  },
  fill1: {
    width: "40%",
    backgroundColor: "#e14427",
  },
});

Font.register({
  family: "Oswald",
  src: "https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf",
});

const Doc = () => (
  <Document>
    <Page size="A4">
      <View style={styles.body}>
        <View style={styles.row}>
          <Text style={styles.text}>
            Lorem ipsum dolor sita met cons ecte tur ad ip
          </Text>
          <View style={styles.fill1} />
        </View>
      </View>
    </Page>
  </Document>
);

// hack for hmr
const exportComponent = { component: Doc };
export default exportComponent;
