import "./Overlay.css";

const Overlay = ({ showOverlay, setShowOverlay }: {showOverlay: boolean, setShowOverlay: (value: boolean) => void}) => {
    const closeOverlay = () => {
        setShowOverlay(false);
    };
    if (showOverlay) {
        return (
            <div className="overlay-display">
                <div className="overlay">
                    <img src="./close.svg" alt="close" onClick={closeOverlay}/>
                    <div className="content">
                        <h1>こんにちは世界</h1>
                        <h1>さようなら現世</h1>
                    </div>
                </div>
            </div>
        )
    }
}

export default Overlay;