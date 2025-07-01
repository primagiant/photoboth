'use client'

import { useEffect, useRef, useState } from "react";

export default function Photo() {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    // Photo Count
    const [showDropdown1, setShowDropdown1] = useState(false);
    const [photoCount, setPhotoCount] = useState(2);

    // Countdown
    const [showCountdown, setShowCountdown] = useState(false);
    const [showDropdown2, setShowDropdown2] = useState(false);
    const [delay, setDelay] = useState(3);
    const [countdown, setCountdown] = useState(3);

    // On Capture
    const [disableRetake, setDisableRetake] = useState(true);
    const [photoList, setPhotoList] = useState([]);
    const [isDisabled, setIsDisable] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const video = videoRef.current;

        navigator.mediaDevices.getUserMedia({ video: true })
            .then((stream) => {
                video.srcObject = stream;
                video.play();

                video.onloadedmetadata = () => {
                    // Wait for video dimensions to load
                    const updateCanvas = () => {
                        const cw = canvas.width;
                        const ch = canvas.height;

                        const vw = video.videoWidth;
                        const vh = video.videoHeight;

                        // Canvas aspect ratio
                        const canvasRatio = cw / ch;
                        const videoRatio = vw / vh;

                        let sx, sy, sw, sh;

                        // Crop video to match canvas ratio (center crop)
                        if (videoRatio > canvasRatio) {
                            // Video is wider, crop horizontally
                            sw = vh * canvasRatio;
                            sh = vh;
                            sx = (vw - sw) / 2;
                            sy = 0;
                        } else {
                            // Video is taller, crop vertically
                            sw = vw;
                            sh = vw / canvasRatio;
                            sx = 0;
                            sy = (vh - sh) / 2;
                        }

                        ctx.save(); // Save current state

                        // Flip horizontally
                        ctx.translate(cw, 0);     // move context to right edge
                        ctx.scale(-1, 1);         // flip horizontally

                        ctx.drawImage(video, sx, sy, sw, sh, 0, 0, cw, ch);

                        ctx.restore();

                        // Keep drawing every frame
                        requestAnimationFrame(updateCanvas);
                    };

                    updateCanvas(); // start drawing loop
                };
            })
            .catch((err) => console.error('Error accessing camera:', err));
    }, []);

    const handleDropdown1 = () => {
        setShowDropdown2(_ => false);
        setShowDropdown1(value => !value);
    }

    const handleDropdown2 = () => {
        setShowDropdown1(_ => false);
        setShowDropdown2(value => !value);
    }

    const handleCapture = (seconds, photoCount) => {
        let currentPhoto = 0;

        const startCountdown = () => {
            let count = seconds;
            setCountdown(count);
            setIsDisable(true);
            setShowCountdown(true);

            const interval = setInterval(() => {
                count--;

                if (count > 0) {
                    setCountdown(count);
                } else {
                    clearInterval(interval);

                    setCountdown(0);
                    const canvas = canvasRef.current;
                    const dataURL = canvas.toDataURL('image/png');
                    setPhotoList(prev => [...prev, dataURL]);

                    currentPhoto++;

                    if (currentPhoto < photoCount) {
                        setTimeout(startCountdown, 900);
                    } else {
                        setDisableRetake(false);
                        setShowCountdown(false);
                    }
                }
            }, 1000);
        };

        startCountdown();
    };

    const handleSelectPhotoCount = (counts) => {
        setShowDropdown1(false);
        setPhotoCount(counts);
    }

    const handleSelectCountdown = (countdown) => {
        setShowDropdown2(false);
        setDelay(countdown);
        setCountdown(countdown);
    }

    return (
        <div className="flex flex-col gap-4 min-h-screen items-center justify-center">
            <div className="flex items-center justify-center gap-4 z-10">
                {/* Drop Down 1 */}
                <div className="relative">
                    <button disabled={isDisabled != 0} onClick={handleDropdown1} className={`${!isDisabled ? 'hover:border-2 hover:border-indigo-500' : ''} px-4 py-2 border-2 border-white disabled:text-slate-300 bg-white hover:bg-slate-50 text-slate-900 rounded-md font-bold flex gap-2 justify-between`}>
                        {photoCount} Photos
                        {!showDropdown1 ?
                            <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5.54779 9.09467C5.84069 8.80178 6.31556 8.80178 6.60846 9.09467L12.3281 14.8143L18.0478 9.09467C18.3407 8.80178 18.8156 8.80178 19.1085 9.09467C19.4013 9.38756 19.4013 9.86244 19.1085 10.1553L12.8585 16.4053C12.5656 16.6982 12.0907 16.6982 11.7978 16.4053L5.54779 10.1553C5.2549 9.86244 5.2549 9.38756 5.54779 9.09467Z" fill="#323544" />
                            </svg>
                            :
                            <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M19.1085 14.9053C18.8156 15.1982 18.3407 15.1982 18.0478 14.9053L12.3281 9.18566L6.60845 14.9053C6.31556 15.1982 5.84069 15.1982 5.5478 14.9053C5.2549 14.6124 5.2549 14.1376 5.5478 13.8447L11.7978 7.59467C12.0907 7.30178 12.5656 7.30178 12.8585 7.59467L19.1085 13.8447C19.4013 14.1376 19.4013 14.6124 19.1085 14.9053Z" fill="#323544" />
                            </svg>
                        }
                    </button>

                    <div className={`${showDropdown1 ? '' : 'hidden'} absolute p-2 bg-white rounded-md -bottom-24 border-2 border-white flex w-72 flex-wrap gap-2`}>
                        <button onClick={() => handleSelectPhotoCount(1)} className={`${photoCount == 1 ? 'bg-slate-200' : ''} hover:bg-slate-200 px-3 py-1.5 text-sm text-black rounded-md`}>1 Photos</button>
                        <button onClick={() => handleSelectPhotoCount(2)} className={`${photoCount == 2 ? 'bg-slate-200' : ''} hover:bg-slate-200 px-3 py-1.5 text-sm text-black rounded-md`}>2 Photos</button>
                        <button onClick={() => handleSelectPhotoCount(3)} className={`${photoCount == 3 ? 'bg-slate-200' : ''} hover:bg-slate-200 px-3 py-1.5 text-sm text-black rounded-md`}>3 Photos</button>
                        <button onClick={() => handleSelectPhotoCount(4)} className={`${photoCount == 4 ? 'bg-slate-200' : ''} hover:bg-slate-200 px-3 py-1.5 text-sm text-black rounded-md`}>4 Photos</button>
                        <button onClick={() => handleSelectPhotoCount(6)} className={`${photoCount == 6 ? 'bg-slate-200' : ''} hover:bg-slate-200 px-3 py-1.5 text-sm text-black rounded-md`}>6 Photos</button>
                    </div>

                </div>
                {/* End Drop Down 1 */}

                {/* Drop Down 2 */}
                <div className="relative">
                    <button disabled={isDisabled != 0} onClick={handleDropdown2} className={`${!isDisabled ? 'hover:border-2 hover:border-indigo-500' : ''} px-4 py-2 border-2 border-white disabled:text-slate-300 bg-white hover:bg-slate-50 text-slate-900 rounded-md font-bold flex gap-2 justify-between`}>
                        {delay}s Delay
                        {!showDropdown2 ?
                            <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5.54779 9.09467C5.84069 8.80178 6.31556 8.80178 6.60846 9.09467L12.3281 14.8143L18.0478 9.09467C18.3407 8.80178 18.8156 8.80178 19.1085 9.09467C19.4013 9.38756 19.4013 9.86244 19.1085 10.1553L12.8585 16.4053C12.5656 16.6982 12.0907 16.6982 11.7978 16.4053L5.54779 10.1553C5.2549 9.86244 5.2549 9.38756 5.54779 9.09467Z" fill="#323544" />
                            </svg>
                            :
                            <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M19.1085 14.9053C18.8156 15.1982 18.3407 15.1982 18.0478 14.9053L12.3281 9.18566L6.60845 14.9053C6.31556 15.1982 5.84069 15.1982 5.5478 14.9053C5.2549 14.6124 5.2549 14.1376 5.5478 13.8447L11.7978 7.59467C12.0907 7.30178 12.5656 7.30178 12.8585 7.59467L19.1085 13.8447C19.4013 14.1376 19.4013 14.6124 19.1085 14.9053Z" fill="#323544" />
                            </svg>
                        }
                    </button>
                    <div className={`${showDropdown2 ? '' : 'hidden'} absolute p-2 bg-white rounded-md -bottom-24 border-2 border-white flex flex-wrap gap-2`}>
                        <button onClick={() => handleSelectCountdown(3)} className={`${delay == 3 ? 'bg-slate-200' : ''} w-full hover:bg-slate-200 px-3 py-1.5 text-sm text-black rounded-md`}>3 Second</button>
                        <button onClick={() => handleSelectCountdown(10)} className={`${delay == 10 ? 'bg-slate-200' : ''} w-full hover:bg-slate-200 px-3 py-1.5 text-sm text-black rounded-md`}>10 Second</button>
                    </div>
                </div>
                {/* End Drop Down 2  */}
            </div>

            <div className="relative">
                <video className="hidden" ref={videoRef}></video>
                <canvas ref={canvasRef} width={400} height={600} className={`aspect-2/3 rounded-md w-98`}>
                </canvas>
                <div className={`${!showCountdown && 'hidden'} absolute top-0 left-0 w-full h-full flex items-center justify-center`}>
                    <div className=" bg-gray-100/80 animate-ping py-1.5 px-4 rounded-md">
                        <p className="text-4xl text-indigo-400">{countdown}</p>
                    </div>
                </div>
                <div className="absolute -right-64 top-0 h-full overflow-x-scroll">
                    {photoList.map((photo, idx) => (
                        <div key={idx} className="group relative w-48 overflow-hidden aspect-3/4 bg-blue-500 rounded-md mb-2 last:mb-0">
                            <img src={photo} alt={`Photo ${idx}`} className="w-64 h-full object-cover rounded-md" />

                            <div className={`${!disableRetake && 'group-hover:flex'} absolute inset-0 hidden bg-white/60 rounded-md cursor-pointer justify-center items-center`}>
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M12 7.00195C9.37665 7.00195 7.25 9.1286 7.25 11.752C7.25 14.3753 9.37665 16.502 12 16.502C14.6234 16.502 16.75 14.3753 16.75 11.752C16.75 9.1286 14.6234 7.00195 12 7.00195ZM8.75 11.752C8.75 9.95703 10.2051 8.50195 12 8.50195C13.7949 8.50195 15.25 9.95703 15.25 11.752C15.25 13.5469 13.7949 15.002 12 15.002C10.2051 15.002 8.75 13.5469 8.75 11.752Z"
                                        fill="#323544"
                                    />
                                    <path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M9.9939 2.75C9.28408 2.75 8.61587 3.08496 8.19114 3.65369L7.59735 4.4488C7.45577 4.63838 7.23304 4.75003 6.99643 4.75003H4.25C3.00736 4.75003 2 5.75739 2 7.00003V17.25C2 18.4927 3.00736 19.5 4.25 19.5H19.75C20.9926 19.5 22 18.4927 22 17.25V7.00003C22 5.75739 20.9926 4.75003 19.75 4.75003H17.0035C16.7669 4.75003 16.5442 4.63838 16.4026 4.4488L15.8088 3.65369C15.3841 3.08496 14.7159 2.75 14.006 2.75H9.9939ZM9.39298 4.55123C9.53456 4.36165 9.75729 4.25 9.9939 4.25H14.006C14.2426 4.25 14.4654 4.36165 14.607 4.55123L15.2008 5.34635C15.6255 5.91508 16.2937 6.25003 17.0035 6.25003H19.75C20.1642 6.25003 20.5 6.58582 20.5 7.00003V17.25C20.5 17.6642 20.1642 18 19.75 18H4.25C3.83579 18 3.5 17.6642 3.5 17.25V7.00003C3.5 6.58582 3.83579 6.25003 4.25 6.25003H6.99643C7.70625 6.25003 8.37446 5.91508 8.79919 5.34634L9.39298 4.55123Z"
                                        fill="#323544"
                                    />
                                </svg>
                            </div>
                        </div>
                    ))}
                </div>

            </div>

            <div>
                {photoList.length == 0 ?
                    <button disabled={isDisabled} onClick={() => { handleCapture(delay, photoCount) }} className={`${!isDisabled ? 'bg-indigo-500 hover:bg-indigo-600 cursor-pointer' : 'bg-red-500 cursor-not-allowed'} px-4 py-2 rounded-md`}>
                        {!isDisabled ? 'Capture' : 'Capturing'}
                    </button>
                    : <button className={`bg-indigo-500 hover:bg-indigo-600 cursor-pointer px-4 py-2 rounded-md`}>
                        Next
                    </button>}
            </div>
        </div>
    );
}
