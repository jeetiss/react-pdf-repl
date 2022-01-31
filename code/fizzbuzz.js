import {
  pdf,
  Text,
  View,
  Document,
  Page,
  StyleSheet,
} from "../exp-layout";

const styles = StyleSheet.create({
  page: {
    fontSize: 46,
    justifyContent: 'center',
    alignItems: 'center'
  },
  numbers: {
    display: 'none',
    overflow: 'hidden',
    "&:not(&:nth-child(3n), &:nth-child(5n))": {
      display: 'flex',
    }
  },
  fizz: {
    display: 'none',
    overflow: 'hidden',
    "&:nth-child(3n)": {
      display: 'flex',

    }
  },
  buzz: {
    display: 'none',
    overflow: 'hidden',
    "&:nth-child(5n)": {
      display: 'flex',
    }
  }
});

const FizzBuzz = ({ value }) => (
  <View break={value === 1 ? false : true}>
    <View style={styles.numbers}>
      <Text>{value}</Text>
    </View>
    <View style={styles.fizz}>
      <Text>Fizz</Text>
    </View>
    <View style={styles.buzz}>
      <Text>Buzz</Text>
    </View>
  </View>
);

const Doc = () => (
  <Document>
    <Page style={styles.page} size="A5">
      {Array.from({ length: 30 }, (_, i) => i + 1).map((value) => (
        <FizzBuzz key={value} value={value} />
      ))}
    </Page>
  </Document>
);

const exportComponent = { component: Doc };
export default exportComponent;
