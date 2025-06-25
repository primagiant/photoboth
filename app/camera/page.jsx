'use client'
import { useState, useRef, useEffect } from "react";

const borderImages = [
  "/borders/temp.png",
  "/borders/temp1.png",
  "/borders/temp2.png",
];

export default function CameraWithBorders() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayImgRef = useRef(null);
  const [selectedBorder, setSelectedBorder] = useState(borderImages[0]);
  const [imageData, setImageData] = useState(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      })
      .catch((err) => console.error('Error accessing camera:', err));
  }, []);

  const takeSnapshotWithTemplate = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(overlayImgRef.current, 0, 0, canvas.width, canvas.height);

    setImageData(canvas.toDataURL('image/png'));
  };

  return (
    <div className="grid grid-cols-12 gap-4 p-4 min-h-screen relative">
      {/* Main preview */}
      <div className="col-span-8 relative bg-black rounded-md overflow-hidden">
        <video ref={videoRef} className="w-full h-full object-cover" />
        <img
          ref={overlayImgRef}
          src={selectedBorder}
          alt="Overlay template"
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
        />
      </div>

      {/* Sidebar with list of borders */}
      <div className="col-span-4 bg-gray-100 rounded-md p-4 overflow-y-auto">
        <h2 className="font-bold mb-2">Pilih Border:</h2>
        <div className="grid grid-cols-2 gap-2">
          {borderImages.map((src) => (
            <img
              key={src}
              src={src}
              alt={src}
              onClick={() => setSelectedBorder(src)}
              className={`cursor-pointer border-2 ${
                selectedBorder === src ? "border-blue-500" : "border-transparent"
              }`}
            />
          ))}
        </div>

        <button
          onClick={takeSnapshotWithTemplate}
          className="bg-blue-500 text-white px-4 py-2 mt-4 w-full rounded"
        >
          Capture with Template
        </button>

        {imageData && (
          <img
            src={imageData}
            alt="Captured Result"
            className="mt-2 border max-w-full"
          />
        )}
      </div>

      {/* Hidden canvas */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}
