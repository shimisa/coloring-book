import React from 'react';

interface ColoringPreviewProps {
    imageSrc: string;
}

const ColoringPreview: React.FC<ColoringPreviewProps> = ({ imageSrc }) => {
    return (
        <div className="coloring-preview">
            <h2>Coloring Book Preview</h2>
            <img src={imageSrc} alt="Coloring Preview" />
            <p>Get ready to color your memories!</p>
        </div>
    );
};

export default ColoringPreview;