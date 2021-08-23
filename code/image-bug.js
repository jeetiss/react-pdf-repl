import React from "react";
import { Document, Page, View, Text, Image, Font, StyleSheet } from "./pdf";

const styles = StyleSheet.create({
  body: {
    paddingTop: 35,
    paddingBottom: 65,
    paddingHorizontal: 35,
  },
  container: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  imgContainer: { margin: 20, width: 200 },
  img1: { paddingTop: 20 },
  img2: { paddingBottom: 20 },
  img3: { paddingLeft: 20 },
  img4: { paddingRight: 20 },
  paddingStyle: {
    fontSize: 12,
    marginTop: 5,
    textAlign: "center",
    color: "grey",
  },
});

const Images = () => {
  const imgUrl = "https://react-pdf.org/images/logo.png";
  return (
    <Document>
      <Page style={styles.body}>
        <View style={styles.container}>
          <View style={styles.imgContainer}>
            <Image style={styles.img1} src={imgUrl} />
            <Text style={styles.paddingStyle}>paddingTop: 20</Text>
          </View>
          <View style={styles.imgContainer}>
            <Image style={styles.img2} src={imgUrl} />
            <Text style={styles.paddingStyle}>paddingBottom: 20</Text>
          </View>
          <View style={styles.imgContainer}>
            <Image style={styles.img3} src={imgUrl} />
            <Text style={styles.paddingStyle}>paddingLeft: 20</Text>
          </View>
          <View style={styles.imgContainer}>
            <Image style={styles.img4} src={imgUrl} />
            <Text style={styles.paddingStyle}>paddingRight: 20</Text>
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

export default Images