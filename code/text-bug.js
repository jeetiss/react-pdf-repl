export const code = `
const Quixote = () => (
  <Document>
    <Page style={styles.body}>
      <View style={{ flexDirection: "row" }}>
        <View
          style={{
            flexGrow: 1,
            width: '100%',
            flexShrink: 1,
          }}
        >
          <Text style={{ padding: 10, backgroundColor: 'wheat' }}>
            Long                                                text with a bundle a lil kek a nkagn k nsdfk knkj sfnk jn sd
            nkjnsdf nksd nkjsdf nk n ksdn sjdfn ksdjn snkjnsjdfnj njksdn ksdjnf
            sdn ksjdn sdfj nskdjfnjsdn ksdf jkjnsdjfn knkn sdnknkjnd ksdjn
            ksjdkf nskdnf
          </Text>
        </View>
        <View
          style={{
            flexShrink: 0,
            width: 150,
            marginLeft: 20,
            color: "red",
          }}
        >
          <Text>WHY TEXT IS NOT IN BLOCK???</Text>
        </View>
      </View>
    </Page>
  </Document>
);


const styles = StyleSheet.create({
  body: {
    paddingTop: 35,
    paddingBottom: 65,
    paddingHorizontal: 35,
  },
});

render(<Quixote />);
`;
