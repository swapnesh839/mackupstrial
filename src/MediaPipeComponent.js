import React, { useEffect, useRef, useState } from 'react';
import { FaceMesh } from '@mediapipe/face_mesh';
import { drawConnectors } from '@mediapipe/drawing_utils';
import { Camera } from '@mediapipe/camera_utils';
import { FACEMESH_LIPS } from '@mediapipe/face_mesh';

const MediaPipeComponent = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [lipColor, setLipColor] = useState('#FF3030');
  const faceMeshRef = useRef(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    const onResults = (results) => {
      const canvasCtx = canvasRef.current.getContext('2d');
      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      canvasCtx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);
      if (results.multiFaceLandmarks) {
        for (const landmarks of results.multiFaceLandmarks) {
          const lipLandmarks = FACEMESH_LIPS.flat();
          const lipPoints = lipLandmarks.map(index => landmarks[index]);

          // Draw filled lips
          canvasCtx.beginPath();
          canvasCtx.moveTo(lipPoints[0].x * canvasRef.current.width, lipPoints[0].y * canvasRef.current.height);
          lipPoints.forEach(point => {
            canvasCtx.lineTo(point.x * canvasRef.current.width, point.y * canvasRef.current.height);
          });
          canvasCtx.closePath();
          canvasCtx.fillStyle = lipColor;
          canvasCtx.fill();
        }
      }
      canvasCtx.restore();
    };

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
  }, []);

  // Ensure that changing the lip color does not reinitialize FaceMesh
  useEffect(() => {
    if (faceMeshRef.current) {
      faceMeshRef.current.onResults((results) => {
        const canvasCtx = canvasRef.current.getContext('2d');
        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        canvasCtx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);
        if (results.multiFaceLandmarks) {
          for (const landmarks of results.multiFaceLandmarks) {
            const lipLandmarks = FACEMESH_LIPS.flat();
            const lipPoints = lipLandmarks.map(index => landmarks[index]);

            // Draw filled lips
            canvasCtx.beginPath();
            canvasCtx.moveTo(lipPoints[0].x * canvasRef.current.width, lipPoints[0].y * canvasRef.current.height);
            lipPoints.forEach(point => {
              canvasCtx.lineTo(point.x * canvasRef.current.width, point.y * canvasRef.current.height);
            });
            canvasCtx.closePath();
            canvasCtx.fillStyle = lipColor;
            canvasCtx.fill();
          }
        }
        canvasCtx.restore();
      });
    }
  }, [lipColor]);

  return (
    <div>
      <video ref={videoRef} style={{ display: 'none' }} playsInline></video>
      <canvas ref={canvasRef} width="640" height="480"></canvas>
      <div>
        <button onClick={() => setLipColor('red')} style={{ backgroundColor: 'red', color: 'white', margin: '5px' }}>Red</button>
        <button onClick={() => setLipColor('pink')} style={{ backgroundColor: 'pink', color: 'white', margin: '5px' }}>Pink</button>
        <button onClick={() => setLipColor('purple')} style={{ backgroundColor: 'purple', color: 'white', margin: '5px' }}>Purple</button>
        <button onClick={() => setLipColor('darkred')} style={{ backgroundColor: 'darkred', color: 'white', margin: '5px' }}>Dark Red</button>
      </div>
    </div>
  );
};

export default MediaPipeComponent;
