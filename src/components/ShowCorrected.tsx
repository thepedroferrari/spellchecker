// import React, {useState} from "react";
import "./ShowCorrected.css"

type Props = {
  text: string | null
}

const ShowCorrected = ({ text }: Props) => (
  <div className="corrected-text">{text || ""}</div>
)

export default ShowCorrected
