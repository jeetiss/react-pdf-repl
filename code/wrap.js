import React from "react";
import {
  StyleSheet,
  Document,
  Page,
  Font,
  View,
  Text,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  header: {
    fontFamily: "Oswald",
    fontSize: 24,
    fontWeight: "bold",
    margin: 20,
  },
  text: {
    fontFamily: "Oswald",
    fontSize: 14,
    lineHeight: 1.4,
    margin: 20,
  },
  spacer: {
    paddingTop: 449,
  },
});

const Wrap = () => {
  return (
    <Document>
      <Page size='A5'>
        <View style={styles.spacer}></View>
        <View>
          <Text style={styles.header} minPresenceAhead={50}>Header #1</Text>
          <Text style={styles.text}>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum.
          </Text>
        </View>
      </Page>
    </Document>
  );
};

Font.register({
  family: "Oswald",
  src: "https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf",
});

export default Wrap;
