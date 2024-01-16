import React from "react";
import "./advancedTooltip.css";
import { useTranslation } from "react-i18next";

interface Props {
  positionY: string;
  positionX: string;
  header: string;
  description: string;
  exportInf: () => void;
}

// sideTriangle, header, description, clickNext, clickPrev
export const AdvancedTooltip: React.FC<Props> = React.memo(
  ({
    positionX,
    positionY,
    header,
    description,
    exportInf
  }) => {
    const { t } = useTranslation('translation');
    return (
      <div
        className={"wrapBlock"}
        style={{ bottom: positionY, left: positionX }}
      >
        <div className="modalWindow">
          <h1 className="header">{header}</h1>
          <span className="description">{description}</span>
            <button onClick = {() => exportInf()} className="downloadBtn">{t('Download form data')}</button>
        </div>
      </div>
    );
  }
);
