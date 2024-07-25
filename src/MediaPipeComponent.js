import React, { useEffect, useRef, useState } from 'react';
import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';
import { FACEMESH_LIPS } from '@mediapipe/face_mesh';

const MediaPipeComponent = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [lipColor, setLipColor] = useState('rgba(255, 48, 48, 0.5)'); // Red with 50% opacity
  const faceMeshRef = useRef(null);
  const cameraRef = useRef(null);

  const onResults = (results) => {
    const canvasCtx = canvasRef.current.getContext('2d');
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);
    if (results.multiFaceLandmarks) {
      for (const landmarks of results.multiFaceLandmarks) {
        const lipOuterLandmarks = FACEMESH_LIPS.slice(0, 20).flat(); // Outer lip landmarks
        const lipInnerLandmarks = FACEMESH_LIPS.slice(20).flat();    // Inner lip landmarks

        const lipOuterPoints = lipOuterLandmarks.map(index => ({
          x: landmarks[index].x * canvasRef.current.width,
          y: landmarks[index].y * canvasRef.current.height
        }));

        const lipInnerPoints = lipInnerLandmarks.map(index => ({
          x: landmarks[index].x * canvasRef.current.width,
          y: landmarks[index].y * canvasRef.current.height
        }));

        // Draw outer lips
        canvasCtx.beginPath();
        canvasCtx.moveTo(lipOuterPoints[0].x, lipOuterPoints[0].y);
        lipOuterPoints.forEach(point => {
          canvasCtx.lineTo(point.x, point.y);
        });
        canvasCtx.closePath();

        // Draw inner lips
        canvasCtx.moveTo(lipInnerPoints[0].x, lipInnerPoints[0].y);
        lipInnerPoints.forEach(point => {
          canvasCtx.lineTo(point.x, point.y);
        });
        canvasCtx.closePath();

        canvasCtx.fillStyle = lipColor;
        canvasCtx.fill('evenodd'); // Use 'evenodd' rule to properly handle inner and outer paths
      }
    }
    canvasCtx.restore();
  };

  useEffect(() => {
    const initializeFaceMesh = async () => {
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

      faceMeshRef.current = faceMesh;
      cameraRef.current = camera;
    };

    initializeFaceMesh();

    return () => {
      if (faceMeshRef.current) {
        faceMeshRef.current.close();
      }
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
    };
  }, [lipColor]);

  useEffect(() => {
    if (faceMeshRef.current) {
      faceMeshRef.current.onResults(onResults);
    }
  }, [lipColor]);

  return (
    <div>
      <video ref={videoRef} style={{ display: 'none' }} playsInline></video>
      <canvas ref={canvasRef} width="640" height="480"></canvas>
      <div>
        <button onClick={() => setLipColor('rgba(255, 0, 0, 0.5)')} style={{ backgroundColor: 'red', color: 'white', margin: '5px' }}>Red</button>
        <button onClick={() => setLipColor('rgba(255, 192, 203, 0.5)')} style={{ backgroundColor: 'pink', color: 'white', margin: '5px' }}>Pink</button>
        <button onClick={() => setLipColor('rgba(128, 0, 128, 0.5)')} style={{ backgroundColor: 'purple', color: 'white', margin: '5px' }}>Purple</button>
        <button onClick={() => setLipColor('rgba(139, 0, 0, 0.5)')} style={{ backgroundColor: 'darkred', color: 'white', margin: '5px' }}>Dark Red</button>
      </div>
    </div>
  );
};

export default MediaPipeComponent;
