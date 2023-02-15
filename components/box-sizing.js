import styles from "./box-sizing.module.css";

const isDefined = (value) => value != null;
const format = (number) => {
  const isFloat = number - Math.floor(number) > 0;

  if (isFloat) {
    return number.toFixed(2);
  }

  return number;
};

const BoxSizing = ({ box }) => {
  return (
    <div className={styles.container}>
      <SizingWrapper
        className={styles.margin}
        text={<div className={styles.text}>margin</div>}
        numbers={[
          box.marginTop,
          box.marginLeft,
          box.marginRight,
          box.marginBottom,
        ]}
      >
        <SizingWrapper
          className={styles.border}
          text={<div className={styles.text}>border</div>}
          numbers={[
            box.borderTopWidth,
            box.borderLeftWidth,
            box.borderRightWidth,
            box.borderBottomWidth,
          ]}
        >
          <SizingWrapper
            className={styles.padding}
            text={<div className={styles.text}>padding</div>}
            numbers={[
              box.paddingTop,
              box.paddingLeft,
              box.paddingRight,
              box.paddingBottom,
            ]}
          >
            <div className={styles.size}>
              {isDefined(box.width)
                ? format(
                    box.width -
                    box.paddingLeft -
                    box.paddingRight -
                    box.borderLeftWidth -
                    box.borderRightWidth
                  )
                : "-"}{" "}
              x{" "}
              {isDefined(box.height)
                ? format(
                    box.height -
                    box.paddingTop -
                    box.paddingBottom -
                    box.borderTopWidth -
                    box.borderBottomWidth
                  )
                : "-"}
            </div>
          </SizingWrapper>
        </SizingWrapper>
      </SizingWrapper>
    </div>
  );
};

const SizingWrapper = ({ className, numbers = [], children, text }) => (
  <div className={[styles.sizingWrapper, className].join(" ")}>
    {text && text}
    <div style={{ gridRow: "1", gridColumn: "2" }}>
      {isDefined(numbers[0]) ? format(numbers[0]) : "-"}
    </div>
    <div style={{ gridRow: "2", gridColumn: "1" }}>
      {isDefined(numbers[1]) ? format(numbers[1]) : "-"}
    </div>

    <div style={{ gridRow: "2", gridColumn: "2" }}>{children}</div>

    <div style={{ gridRow: "2", gridColumn: "3" }}>
      {isDefined(numbers[2]) ? format(numbers[2]) : "-"}
    </div>
    <div style={{ gridRow: "3", gridColumn: "2" }}>
      {isDefined(numbers[3]) ? format(numbers[3]) : "-"}
    </div>
  </div>
);

export default BoxSizing;
