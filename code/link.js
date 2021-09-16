import {
  StyleSheet,
  Document,
  Page,
  Font,
  Text,
  Link,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  text: {
    fontFamily: "Oswald",
    fontSize: 14,
    lineHeight: 1.4,
    color: "#666",
    margin: 20,
  },
  bold: {
    fontWeight: "bold",
  },
  through: {
    textDecoration: "line-through",
  },
});

const LinkDoc = () => {
  return (
    <Document>
      <Page size="A5">
        <Text style={styles.text}>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do
          eiusmod tempor incididunt ut{" "}
          <Link href="https://github.com/diegomura/react-pdf">
            <Text style={styles.through}>labore</Text> et{" "}
            <Text style={styles.through}>dolore</Text>
          </Link>{" "}
          magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
          ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute
          irure dolor in reprehenderit in voluptate velit esse cillum.
        </Text>
      </Page>
    </Document>
  );
};

Font.register({
  family: "Oswald",
  src: "https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf",
});

// hack for hmr
const exportComponent = { component: LinkDoc };
export default exportComponent;
