import React, { useState } from "react";
import macros from "../macros";

export default function FeedbackHeader() {
    const [open, setOpen] = useState(true);
    const [yes, setYes] = useState(false);
    const [no, setNo] = useState(false);

    return (
        <>
        <div className="FeedbackHeader">
            <label className="FeedbackHeader__text">
                Did you find what you're looking for?
            </label>
            <div className="FeedbackHeader__yes" role="button">
                {macros.isMobile ? "Y" : "Yes"}
            </div>
            <div className="FeedbackHeader__no" role="button">
            {macros.isMobile ? "N" : "No"}
            </div>
            <div className="FeedbackHeader__close" role="button"/>
        </div>
        <div className="FeedbackHeader__padding"/>
        </>

    );
}