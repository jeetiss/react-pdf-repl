export const code = `const styles = StyleSheet.create({
  body: {
    flexGrow: 1,
  },
  row: {
    flexGrow: 1,
    flexDirection: "row",
  },
  text: {
    width: "60%",
    textAlign: "justify",
    fontSize: 50,
    padding: 20,
  },
  fill1: {
    width: "40%",
    backgroundColor: "#e14427",
  },
});

const Example = () => (
  <Document>
    <Page size="A4">
      <View style={styles.body}>
        <View style={styles.row}>
          <Text style={styles.text}>
            Lorem ipsum dolor sita met cons ecte tur ad ip
            Lorem ipsum dolor sita met cons ecte tur ad ip
          </Text>
          <View style={styles.fill1} />
        </View>

        <View style={styles.row}>
          <View style={styles.fill1} />
          <Text style={styles.text}>
            Lorem ipsum dolor sita met cons ecte tur ad ip
            Lorem ipsum dolor sita met cons ecte tur ad ip
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.text}>
            Lorem ipsum dolor sita met cons ecte tur ad ip
            Lorem ipsum dolor sita met cons ecte tur ad ip
          </Text>
          <View style={styles.fill1} />
        </View>

        <View style={styles.row}>
          <View style={styles.fill1} />
          <Text style={styles.text}>
            Lorem ipsum dolor sita met cons ecte tur ad ip
            Lorem ipsum dolor sita met cons ecte tur ad ip
          </Text>
        </View>
        
      </View>
    </Page>
  </Document>
);

render(<Example />);
`
