import styles from "../styles/box-sizing.module.css";

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
            {box.width ? box.width.toFixed(2) : "-"} x{" "}
            {box.height ? box.height.toFixed(2) : "-"}
          </div>
        </SizingWrapper>
      </SizingWrapper>
    </div>
  );
};

const SizingWrapper = ({ className, numbers = [], children, text }) => (
  <div className={[styles.sizingWrapper, className].join(" ")}>
    {text && text}
    <div style={{ gridRow: "1", gridColumn: "2" }}>{numbers[0] || "-"}</div>
    <div style={{ gridRow: "2", gridColumn: "1" }}>{numbers[1] || "-"}</div>

    <div style={{ gridRow: "2", gridColumn: "2" }}>{children}</div>

    <div style={{ gridRow: "2", gridColumn: "3" }}>{numbers[2] || "-"}</div>
    <div style={{ gridRow: "3", gridColumn: "2" }}>{numbers[3] || "-"}</div>
  </div>
);

export default BoxSizing;
