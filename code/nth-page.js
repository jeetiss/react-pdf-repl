export const code = `
const styles = StyleSheet.create({
  variation: {
    width: 100,
    height: 100,
    border: '1px solid black',
    '&:first-page': {
      backgroundColor: 'red'
    },
    '&:nth-page(3)': {
      backgroundColor: 'blue'
    }
  }
});

render(
  <Document>
    <Page size="A5">
      <View style={styles.variation}></View>
    </Page>
    <Page size="A5">
      <View style={styles.variation}></View>
    </Page>
    <Page size="A5">
      <View style={styles.variation}></View>
    </Page>
  </Document>
);
`;
