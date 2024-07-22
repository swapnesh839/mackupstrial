import React, { useEffect, useRef } from 'react';
import { FaceMesh } from '@mediapipe/face_mesh';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { Camera } from '@mediapipe/camera_utils';
import { FACEMESH_LIPS } from '@mediapipe/face_mesh';

const MediaPipeComponent = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const onResults = (results) => {
      const canvasCtx = canvasRef.current.getContext('2d');
      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      canvasCtx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);
      if (results.multiFaceLandmarks) {
        for (const landmarks of results.multiFaceLandmarks) {
          // Draw only the lips
          drawConnectors(canvasCtx, landmarks, FACEMESH_LIPS, { color: '#FF3030', lineWidth: 1 });
          const lipLandmarks = FACEMESH_LIPS.flat();
          const lipPoints = lipLandmarks.map(index => landmarks[index]);
          drawLandmarks(canvasCtx, lipPoints, { color: '#FF3030', lineWidth: 1 });
        }
      }
      canvasCtx.restore();
    };

    const faceMesh = new FaceMesh({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
    });
    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });
    faceMesh.onResults(onResults);

    const videoElement = videoRef.current;
    const camera = new Camera(videoElement, {
      onFrame: async () => {
        await faceMesh.send({ image: videoElement });
      },
      width: 640,
      height: 480
    });
    camera.start();

    // Handle WebGL context loss
    const canvasElement = canvasRef.current;
    canvasElement.addEventListener('webglcontextlost', (event) => {
      event.preventDefault();
      // Handle the context loss, possibly by reinitializing WebGL
    });

    canvasElement.addEventListener('webglcontextrestored', () => {
      // Reinitialize WebGL resources
    });

    return () => {
      faceMesh.close();
      camera.stop();
    };
  }, []);

  return (
    <div>
      <video ref={videoRef} style={{ display: 'none' }} playsInline></video>
      <canvas ref={canvasRef} width="640" height="480"></canvas>
    </div>
  );
};

export default MediaPipeComponent;
