import "./Overlay.css";

const Overlay = ({
  showOverlay,
  setShowOverlay,
}: {
  showOverlay: boolean;
  setShowOverlay: (value: boolean) => void;
}) => {
  const closeOverlay = () => {
    setShowOverlay(false);
  };
  return (
    <div className={`overlay-display ${showOverlay ? "visible" : "hidden"}`}>
      <div className="overlay">
        <div className="close">
          <img src="./close.svg" alt="close" onClick={closeOverlay} />
        </div>
        <div className="content">
          <h1>こんにちは世界</h1>
          <h1>( ˘ω˘)ｽﾔｧ</h1>
          <input
            type="file"
            accept=".xml"
            title="臨時便用のファイルを選択してください"
          />
        </div>
      </div>
    </div>
  );
};

export default Overlay;
