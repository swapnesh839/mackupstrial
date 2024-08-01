// src/MediaPipeComponent.jsx
import React, { useEffect, useRef, useState } from 'react';
import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';
import { FACEMESH_LIPS } from '@mediapipe/face_mesh';
import { SquarePlay } from 'lucide-react';

const MediaPipeComponent = ({ isRendering = false }) => {
  useEffect(() => {

  }, [isRendering]);
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
    if (isRendering) {
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
            if (isRendering && faceMeshRef.current) {
              await faceMesh.send({ image: videoElement });
            }
          },
          width: 640,
          height: 480
        });
        camera.start();

        faceMeshRef.current = faceMesh;
        cameraRef.current = camera;
      };

      initializeFaceMesh();
    }


    return () => {
      if (faceMeshRef.current) {
        faceMeshRef.current.close();
        faceMeshRef.current = null;
      }
      if (cameraRef.current) {
        cameraRef.current.stop();
        cameraRef.current = null;
      }
    };
  }, [isRendering]);

  useEffect(() => {
    if (faceMeshRef.current && isRendering) {
      faceMeshRef.current.onResults(onResults);
    }
  }, [lipColor, isRendering]);

  return (
    <div className="d-flex w-100">
      {isRendering ? (
        <>
          <video ref={videoRef} height={500} width={320} style={{ display: 'none' }} playsInline></video>
          <canvas ref={canvasRef} height={500} width={320} className='m-auto rounded-1'></canvas>
          <div className='z-3 position-fixed translate-middle start-50 w-100 d-flex justify-content-center' style={{ top: '20px' }}>
            <span className='ratio-1x1 mx-1 rounded-circle' onClick={() => setLipColor('rgba(255, 0, 0, 0.5)')} style={{ backgroundColor: 'red', color: 'white', padding: "14px" }}></span>
            <span className='ratio-1x1 mx-1 rounded-circle' onClick={() => setLipColor('rgba(255, 192, 203, 0.5)')} style={{ backgroundColor: 'pink', color: 'white', padding: "14px" }}></span>
            <span className='ratio-1x1 mx-1 rounded-circle' onClick={() => setLipColor('rgba(128, 0, 128, 0.5)')} style={{ backgroundColor: 'purple', color: 'white', padding: "14px" }}></span>
            <span className='ratio-1x1 mx-1 rounded-circle' onClick={() => setLipColor('rgba(139, 0, 0, 0.5)')} style={{ backgroundColor: 'darkred', color: 'white', padding: "14px" }}></span>
          </div>
        </>
      ) : (
        <div style={{ height: '500px', width: '320px' }} className='m-auto bg-dark-subtle d-flex'>
          <SquarePlay className='m-auto text-dark fs-2' />
        </div>
      )}
    </div>
  );

};

export default MediaPipeComponent;
