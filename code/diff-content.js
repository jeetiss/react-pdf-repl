import { Image, Text, View, Document, Page, StyleSheet } from "../exp-layout";

const styles = StyleSheet.create({
  variation: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: "none",

    "&:first": {
      display: "flex",
    },
  },
  image: {
    width: "100%",
    height: "100%",
  },
  page: {
    padding: "30px",
  
    "&:first": {
      padding: "30px 30px 100px 30px",
    },
  },
  text: {
    color: "white",

    "&:not(:first)": {
      color: "black",
    },
  },
});

const Doc = () => (
  <Document>
    <Page size="A5" style={styles.page}>
      <View fixed style={styles.variation}>
        <Image
          style={styles.image}
          alt=""
          src="https://images.unsplash.com/photo-1643664673549-11814831d665?auto=format&fit=crop&w=420&h=596&q=80"
        />
      </View>
      <View style={{ flexGrow: 1 }}>
        <Text style={styles.text}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
          semper purus massa, vitae efficitur enim tempor eget. Nam vehicula
          lorem orci, non luctus mauris dapibus quis. Ut dignissim urna a
          blandit ultricies. Praesent venenatis sapien non consequat accumsan.
          Orci varius natoque penatibus et magnis dis parturient montes,
          nascetur ridiculus mus. Ut blandit maximus laoreet. Pellentesque
          eleifend tempus urna, in sodales arcu sollicitudin eu. Suspendisse
          potenti. Cras blandit risus quis justo varius, sit amet convallis elit
          vulputate. Donec at lorem eu ante dictum tincidunt eget vitae purus.
          Vestibulum non ornare nisl, eget elementum urna. Mauris felis nunc,
          ullamcorper sed lacinia sed, fermentum nec nisl. Donec cursus turpis
          ut tincidunt tincidunt. Curabitur risus tellus, egestas in efficitur
          sit amet, posuere eu ante. In pretium purus eget tortor cursus
          feugiat. Nam sed quam et velit vehicula maximus. Fusce lobortis, nisi
          quis accumsan pretium, mi purus lobortis risus, a consequat augue ex
          eget tellus. Nullam vehicula quis lorem eu ultrices. Proin ac molestie
          odio. Vestibulum felis augue, semper quis nulla ac, vulputate aliquam
          elit. Duis sed fermentum diam, vitae malesuada augue. Sed neque sem,
          porttitor eu convallis vel, semper vitae felis. Vestibulum nec mi
          pellentesque nunc eleifend mollis. Pellentesque a porttitor augue.
          Praesent arcu felis, rutrum eu velit nec, condimentum lobortis est.
          Donec enim magna, venenatis sit amet neque in, mollis lacinia lectus.
          Proin pellentesque luctus urna ac convallis. Sed faucibus pulvinar
          pulvinar. Duis dignissim suscipit ante, vel commodo ipsum tempor ac.
          Praesent varius velit ex, vitae convallis metus feugiat in. Nam
          condimentum tellus a ante consectetur, et sodales ex gravida. Quisque
          a posuere quam. Nam id pharetra libero. Aenean vitae scelerisque
          risus. Integer leo elit, iaculis dictum consequat rutrum, luctus eget
          justo. Proin diam eros, lacinia sit amet urna non, commodo vehicula
          mauris. Mauris dictum, ipsum vel vulputate pellentesque, augue velit
          dignissim nunc, eget cursus massa ipsum id purus. Pellentesque varius
          leo lorem, vel hendrerit elit scelerisque sed. Mauris laoreet vitae
          elit quis hendrerit. Aliquam luctus quam eu pretium tempor. Nam
          scelerisque eu diam non efficitur.
        </Text>
      </View>
    </Page>
  </Document>
);

const exportComponent = { component: Doc };
export default exportComponent;
