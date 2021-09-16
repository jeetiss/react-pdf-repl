import {
  StyleSheet,
  Document,
  Page,
  Font,
  View,
  Text,
  Link,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  header: {
    fontFamily: "Oswald",
    fontSize: 12,
    lineHeight: 24 / 12,
    fontWeight: "bold",
    margin: 20,
  },
  subheader: {
    fontFamily: "Oswald",
    fontSize: 16,
    lineHeight: 24 / 16,
    margin: 20,
  },
  text: {
    fontFamily: "Oswald",
    fontSize: 14,
    lineHeight: 1.4,
    color: "#666",
    margin: 20,
  },
  spacer: {
    paddingTop: 469 + 6,
  },
});

const Wrap = () => {
  return (
    <Document>
      <Page size="A5">
        <View style={styles.spacer}></View>
        <View>
          <View style={{ flexDirection: "row" }}>
            <View>
              <Text style={styles.header} minPresenceAhead={35}>
                Header
              </Text>

              <Text style={[styles.text, { color: "white" }]}>{"w\ne"}</Text>
            </View>

            <View style={{ flexGrow: 1, flexBasis: 0 }}>
              <Text style={styles.subheader} minPresenceAhead={35}>
                Subheader #1
              </Text>

              <Text style={styles.text} widows={1} orphans={1}>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do
                eiusmod tempor incididunt ut{" "}
                <Link href="https://github.com/diegomura/react-pdf">
                  labore et dolore
                </Link>{" "}
                magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis
                aute irure dolor in reprehenderit in voluptate velit esse
                cillum.
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

Font.register({
  family: "Oswald",
  src: "https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf",
});

// hack for hmr
const exportComponent = { component: Wrap };
export default exportComponent;
