const React = require("react");
const {
  Font,
  StyleSheet,
  Document,
  Page,
  View,
  Text,
} = require("@react-pdf/renderer-v1");
const render = require("./index");
const { writeFile } = require("fs/promises");
("use strict");

const styles = StyleSheet.create({
  body: {
    fontFamily: "Oswald",
    padding: "40 50",
  },
  title: {
    fontSize: 14,
    lineHeight: 16 / 14,
    marginBottom: 12,
    color: "#1A1A1A",
  },
  text: {
    fontSize: 10,
    lineHeight: 12 / 10,
  },
  size: {
    position: "absolute",
    backgroundColor: "wheat",
    width: 20,
  },
});

Font.register({
  family: "Oswald",
  src: "https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf",
});

var Show = function Show(_ref) {
  var minPresenceAhead = _ref.minPresenceAhead,
    children = _ref.children;
  return  React.createElement(
    View,
    {
      minPresenceAhead: minPresenceAhead,
    },
    children,
     React.createElement(View, {
      style: [
        styles.size,
        {
          bottom: -minPresenceAhead,
          height: minPresenceAhead,
        },
      ],
    })
  );
};

const doc = (index) => (
   React.createElement(
    Document,
    null,
     React.createElement(
      Page,
      {
        style: styles.body,
        size: [300, 225],
      },
       React.createElement(View, {
        style: {
          paddingTop: index,
        },
      }),
       React.createElement(
        View,
        null,
         React.createElement(
          Show,
          {
            minPresenceAhead: 26,
          },
           React.createElement(
            Text,
            {
              style: styles.title,
            },
            "Header 1"
          )
        ),
         React.createElement(
          Text,
          {
            style: styles.text,
          },
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis vehicula nisl quis ex dapibus sollicitudin. Fusce blandit ante sed auctor laoreet. Donec eget mollis nisl. Suspendisse potenti. Proin suscipit, diam non efficitur tempor, turpis mi sodales lacus, nec accumsan orci dolor quis eros. Vivamus sagittis scelerisque dictum. Fusce tincidunt ultricies arcu non viverra."
        )
      )
    )
  )
);

(async () => {
  try {
    for (let i = 1; i < 145; ++i) {
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
// ffmpeg -r 10 -i %03d.png -c:v libx264 -vf fps=10 -pix_fmt yuv420p out.mp4
// 
