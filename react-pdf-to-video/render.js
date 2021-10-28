const React = require("react");
const {
  Font,
  StyleSheet,
  Document,
  Page,
  View,
  Text,
} = require("@react-pdf/renderer");
const render = require("./index");
const { writeFile } = require("fs/promises");

var styles = StyleSheet.create({
  body: {
    padding: 20,
    fontFamily: "Oswald",
  },
  card: {
    padding: 20,
    backgroundColor: "#efefef",
    color: "rgb(23, 23, 23)",
    borderRadius: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    paddingBottom: 8,
  },
});

Font.register({
  family: "Oswald",
  src: "https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf",
});

const doc = (i) =>
  React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      {
        style: styles.body,
        size: [400, 400],
      },
      React.createElement(View, {
        style: {
          paddingBottom: i,
        },
      }),
      React.createElement(
        View,
        {
          style: styles.card,
        },
        React.createElement(
          Text,
          {
            style: styles.title,
          },
          "Section Title"
        ),
        React.createElement(
          Text,
          null,
          "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum."
        )
      )
    )
  );

(async () => {
  try {
    for (let i = 1; i < 331; ++i) {
      const buffer = await render(doc(i));
      await writeFile(
        `react-pdf-to-video/frames/${String(i).padStart(3, "0")}.png`,
        buffer
      );

      console.log(i);
    }
  } catch (error) {
    console.log(error);
  }
})();

//
// command for video concatenation
// ffmpeg -i out.mp4 -i out2.mp4 -filter_complex hstack output.mp4
//

//
// command for video creation
// ffmpeg -r 30 -i %03d.png -c:v libx264 -vf fps=30 -pix_fmt yuv420p out.mp4
//
