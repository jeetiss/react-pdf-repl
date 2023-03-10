import { Text, Page, View, Document, Font } from "@react-pdf/renderer";

Font.registerEmojiSource({
  format: "png",
  url: "https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/",
});

export default function Example() {
  return (
    <Document>
      <Page size="A6" orientation="landscape">
        <View
          style={{
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text>🚨 💅 💞 react-pdf and sandpack 🚨 💅 💓</Text>
        </View>
      </Page>
    </Document>
  );
}
