import React, {useState} from 'react';
import LogoInput from '../images/LogoInput';

export default function FeedbackModal() {
    const [open, setOpen] = useState(false);

    return (
        <div className="FeedbackModal">
            <div className="FeedbackModal__pill" onClick={() => setOpen(false)}>
                <LogoInput height='14' width='18' fill='#d41b2c'/>
                <p>SearchNEU Feedback</p>
            </div>
        </div>


    );

}