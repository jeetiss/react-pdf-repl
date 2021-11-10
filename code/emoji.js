import { Document, Page, Text, Font } from "@react-pdf/renderer";

Font.registerEmojiSource({
  format: 'png',
  url: 'https://twemoji.maxcdn.com/2/72x72/',
});

const Bug = () => (
  <Document>
    <Page style={{ padding: 20 }} size="A5">
      <Text style={{ fontSize: 30 }}>Xe-xe 💩🗿🐥♿️🤡❤️🌈😊</Text>
    </Page>
  </Document>
);

// hack for hmr
const exportComponent = { component: Bug };
export default exportComponent;
