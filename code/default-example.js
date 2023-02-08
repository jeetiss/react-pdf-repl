const small = `import { Document, Page, Text } from '@react-pdf/renderer';

const center = {
  alignItems: 'center',
  justifyContent: 'center'
}

export default () => (
  <Document>
    <Page style={center} size="A4">
      <Text>
        HELLO WORLD !!!
      </Text>
    </Page>
  </Document>
);
`;

const big = `import { StyleSheet, Document, Page, View, Text } from '@react-pdf/renderer';

const styles = StyleSheet.create({
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

export default () => (
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
`;

const resume = `import {
  Link,
  Text,
  Font,
  Page,
  View,
  Image,
  Document,
  StyleSheet,
} from "@react-pdf/renderer";

const headerStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderBottomWidth: 2,
    borderBottomColor: "#112131",
    borderBottomStyle: "solid",
    alignItems: "stretch",
  },
  detailColumn: {
    flexDirection: "column",
    flexGrow: 9,
    textTransform: "uppercase",
  },
  linkColumn: {
    flexDirection: "column",
    flexGrow: 2,
    alignSelf: "flex-end",
    justifySelf: "flex-end",
  },
  name: {
    fontSize: 24,
    fontFamily: "Lato Bold",
  },
  subtitle: {
    fontSize: 10,
    justifySelf: "flex-end",
    fontFamily: "Lato",
  },
  link: {
    fontFamily: "Lato",
    fontSize: 10,
    color: "black",
    textDecoration: "none",
    alignSelf: "flex-end",
    justifySelf: "flex-end",
  },
});

const Header = () => (
  <View style={headerStyles.container}>
    <View style={headerStyles.detailColumn}>
      <Text style={headerStyles.name}>Luke Skywalker</Text>
      <Text style={headerStyles.subtitle}>Jedi Master</Text>
    </View>
    <View style={headerStyles.linkColumn}>
      <Link href="mailto:luke@theforce.com" style={headerStyles.link}>
        <Text>luke@theforce.com</Text>
      </Link>
    </View>
  </View>
);

const titleStyles = StyleSheet.create({
  title: {
    fontFamily: "Lato Bold",
    fontSize: 14,
    marginBottom: 10,
    textTransform: "uppercase",
  },
});

const Title = ({ children }) => (
  <Text style={titleStyles.title}>{children}</Text>
);

const listStyles = StyleSheet.create({
  item: {
    flexDirection: "row",
    marginBottom: 5,
  },
  bulletPoint: {
    width: 10,
    fontSize: 10,
  },
  itemContent: {
    flex: '1 1 0',
    fontSize: 10,
    fontFamily: "Lato",
  },
});

const List = ({ children }) => children;

export const Item = ({ children }) => (
  <View style={listStyles.item}>
    <Text style={listStyles.bulletPoint}>•</Text>
    <Text style={listStyles.itemContent}>{children}</Text>
  </View>
);

const skilsStyles = StyleSheet.create({
  title: {
    fontFamily: "Lato Bold",
    fontSize: 11,
    marginBottom: 10,
  },
  skills: {
    fontFamily: "Lato",
    fontSize: 10,
    marginBottom: 10,
  },
});

const SkillEntry = ({ name, skills }) => (
  <View>
    <Text style={skilsStyles.title}>{name}</Text>
    <List>
      {skills.map((skill, i) => (
        <Item key={i}>{skill}</Item>
      ))}
    </List>
  </View>
);

const Skills = () => (
  <View>
    <Title>Skills</Title>
    <SkillEntry
      name="Combat Abilities"
      skills={[
        "Completed Jedi Master training and built a lightsaber from scratch in order to do battle against the Empire",
        "Defeated the Rancor and rescued Princess Leia from Jabba the Hutt",
        "Competent fighter pilot as well as an excelent shot with nearly any weapon",
      ]}
    />
  </View>
);

const educationStyles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  school: {
    fontFamily: "Lato Bold",
    fontSize: 10,
  },
  degree: {
    fontFamily: "Lato",
    fontSize: 10,
  },
  candidate: {
    fontFamily: "Lato Italic",
    fontSize: 10,
  },
});

const Education = () => (
  <View style={educationStyles.container}>
    <Title>Education</Title>
    <Text style={educationStyles.school}>Jedi Academy</Text>
    <Text style={educationStyles.degree}>Jedi Master</Text>
    <Text style={educationStyles.candidate}>A long, long time ago</Text>
  </View>
);

const expStyles = StyleSheet.create({
  container: {
    flex: '1 1 0',
    paddingTop: 30,
    paddingLeft: 15,
    "@media max-width: 400": {
      paddingTop: 10,
      paddingLeft: 0,
    },
  },
  entryContainer: {
    marginBottom: 10,
  },
  date: {
    fontSize: 11,
    fontFamily: "Lato Italic",
  },
  detailContainer: {
    flexDirection: "row",
  },
  detailLeftColumn: {
    flexDirection: "column",
    marginLeft: 10,
    marginRight: 10,
  },
  detailRightColumn: {
    flexDirection: "column",
    flexGrow: 9,
  },
  bulletPoint: {
    fontSize: 10,
  },
  details: {
    fontSize: 10,
    fontFamily: "Lato",
  },
  headerContainer: {
    flexDirection: "row",
    marginBottom: 10,
  },
  leftColumn: {
    flexDirection: "column",
    flexGrow: 9,
  },
  rightColumn: {
    flexDirection: "column",
    flexGrow: 1,
    alignItems: "flex-end",
    justifySelf: "flex-end",
  },
  title: {
    fontSize: 11,
    color: "black",
    textDecoration: "none",
    fontFamily: "Lato Bold",
  },
});

const ExperienceEntry = ({ company, details, position, date }) => {
  const title = \`\${company} | \${position}\`;
  return (
    <View style={expStyles.entryContainer}>
      <View style={expStyles.headerContainer}>
        <View style={expStyles.leftColumn}>
          <Text style={expStyles.title}>{title}</Text>
        </View>
        <View style={expStyles.rightColumn}>
          <Text style={expStyles.date}>{date}</Text>
        </View>
      </View>
      <List>
        {details.map((detail, i) => (
          <Item key={i} style={expStyles.detailContainer}>
            {detail}
          </Item>
        ))}
      </List>
    </View>
  );
};

const experienceData = [
  {
    company: "Jedi Temple, Coruseant",
    date: "A long time ago...",
    details: [
      "Started a new Jedi Temple in order to train the next generation of Jedi Masters",
      "Discovered and trained a new generation of Jedi Knights, which he recruited from within the New Republic",
      "Communicates with decesased Jedi Masters such as Anakin Skywalker, Yoda, Obi-Wan Kenobi in order to learn the secrets of the Jedi Order",
    ],
    position: "Head Jedi Master",
  },
  {
    company: "Rebel Alliance",
    date: "A long time ago...",
    details: [
      "Lead legions of troops into battle while demonstrating bravery, competence and honor",
      "Created complicated battle plans in conjunction with other Rebel leaders in order to ensure the greatest chance of success",
      "Defeated Darth Vader in single-combat, and convinced him to betray his mentor, the Emperor",
    ],
    position: "General",
  },
  {
    company: "Rebel Alliance",
    date: "A long time ago...",
    details: [
      "Destroyed the Death Star by using the force to find its only weakness and delivering a torpedo into the center of the ship",
      "Commanded of squadron of X-Wings into battle",
      "Defeated an enemy AT-AT single handedly after his ship was destroyed",
      "Awarded a medal for valor and bravery in battle for his successful destruction of the Death Star",
    ],
    position: "Lieutenant Commander",
  },
  {
    company: "Tatooine Moisture Refinery",
    date: "A long time ago...",
    details: [
      "Replaced damaged power converters",
      "Performed menial labor thoughout the farm in order to ensure its continued operation",
    ],
    position: "Moisture Farmer",
  },
];

const Experience = () => (
  <View style={expStyles.container}>
    <Title>Experience</Title>
    {experienceData.map(({ company, date, details, position }) => (
      <ExperienceEntry
        company={company}
        date={date}
        details={details}
        key={company + position}
        position={position}
      />
    ))}
  </View>
);

const resumeStyles = StyleSheet.create({
  page: {
    padding: 30,
  },
  container: {
    flex: '1 1 0',
    flexDirection: "row",
    "@media max-width: 400": {
      flexDirection: "column",
    },
  },
  image: {
    marginBottom: 10,
  },
  leftColumn: {
    flexDirection: "column",
    width: 170,
    paddingTop: 30,
    paddingRight: 15,
    "@media max-width: 400": {
      width: "100%",
      paddingRight: 0,
    },
    "@media orientation: landscape": {
      width: 200,
    },
  },
  footer: {
    fontSize: 12,
    fontFamily: "Lato Bold",
    textAlign: "center",
    marginTop: 15,
    paddingTop: 5,
    borderWidth: 3,
    borderColor: "gray",
    borderStyle: "dashed",
    "@media orientation: landscape": {
      marginTop: 10,
    },
  },
});

Font.register({
  family: "Open Sans",
  src: "https://fonts.gstatic.com/s/opensans/v17/mem8YaGs126MiZpBA-UFVZ0e.ttf",
});

Font.register({
  family: "Lato",
  src: "https://fonts.gstatic.com/s/lato/v16/S6uyw4BMUTPHjx4wWw.ttf",
});

Font.register({
  family: "Lato Italic",
  src: "https://fonts.gstatic.com/s/lato/v16/S6u8w4BMUTPHjxsAXC-v.ttf",
});

Font.register({
  family: "Lato Bold",
  src: "https://fonts.gstatic.com/s/lato/v16/S6u9w4BMUTPHh6UVSwiPHA.ttf",
});

const Resume = (props) => (
  <Page {...props} style={resumeStyles.page}>
    <Header />
    <View style={resumeStyles.container}>
      <View style={resumeStyles.leftColumn}>
        <Image
          src="https://react-pdf.org/images/luke.jpg"
          style={resumeStyles.image}
        />
        <Education />
        <Skills />
      </View>
      <Experience />
    </View>
    <Text style={resumeStyles.footer}>
      This IS the candidate you are looking for
    </Text>
  </Page>
);

export default () => (
  <Document
    author="Luke Skywalker"
    keywords="awesome, resume, start wars"
    subject="The resume of Luke Skywalker"
    title="Resume"
  >
    <Resume size="A4" />
    <Resume orientation="landscape" size="A4" />
    <Resume size={[380, 1250]} />
  </Document>
);
`;

export { resume as code };
