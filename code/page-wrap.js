import React from "react";
import {
  Document,
  Page,
  Font,
  Text,
  View
  
} from "./pdf";

const WAP = () => {
  return (
    <Document>
      <Page>
        <View>
          <Text wrap={false}>{'a\na\na\na\na\na\na\na\na\na\na\na\na\na\na\na\na\na\na\na\na\na\na\na\na\na\na\na\na\na\na\na\na\na\na\na\na\na\na\na\na\na\na\na\na\na\na\na\n'}</Text>
        </View>
      </Page>
    </Document>
  );
};

Font.register({
  family: "Oswald",
  src: "https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf",
});

export default WAP;
