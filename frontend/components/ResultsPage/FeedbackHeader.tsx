import React, { useState } from "react";
import macros from "../macros";

export default function FeedbackHeader() {
    const [close, setClose] = useState(false);
    const [yes, setYes] = useState(false);
    const [no, setNo] = useState(false);

    return (
       !close && (<>
        <div className="FeedbackHeader">
          { !yes && !no &&  
            (<>
            <label className="FeedbackHeader__q1">
                Did you find what you're looking for?
            </label>
            <div className="FeedbackHeader__yes" role="button" onClick={() => setYes(true)}>
                {macros.isMobile ? "Y" : "Yes"}
            </div>
            <div className="FeedbackHeader__no" role="button" onClick={() => setNo(true)}>
            {macros.isMobile ? "N" : "No"}
            </div>
            </>
            )
          }
          {yes && <div className="FeedbackHeader__thanks">Thank you for helping make SearchNEU better!</div> }
          {no && (<>
                <div className="FeedbackHeader__q2">What were you looking for?</div>
                <input className="FeedbackHeader__input"/>
                </>)}
            <div className="FeedbackHeader__close" onClick={() => setClose(true)} role="button"/>
        </div>
        <div className="FeedbackHeader__padding"/>
        </>) 

    );
}