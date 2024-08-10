import React, { useEffect, useRef, useState, useCallback } from 'react';
import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';
import { FACEMESH_LIPS } from '@mediapipe/face_mesh';
import { SquarePlay } from 'lucide-react';
import "./App.css";

const MediaPipeComponent = ({ isRendering = false }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [lipColor, setLipColor] = useState('rgba(255, 48, 48, 0.4)'); // Red with 50% opacity
  const faceMeshRef = useRef(null);
  const cameraRef = useRef(null);

  const onResults = useCallback((results) => {
    if (!canvasRef.current || !results || !faceMeshRef.current) return;

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
  }, [lipColor]);

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
            if (faceMeshRef.current) {
              try {
                await faceMesh.send({ image: videoElement });
              } catch (error) {
                console.warn('Error sending image to faceMesh:', error);
              }
            }
          },
          width: {
            ideal: 720
          },
          height: {
            ideal: 1280
          }
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
  }, [isRendering, onResults]);

  useEffect(() => {
    if (faceMeshRef.current && isRendering) {
      faceMeshRef.current.onResults(onResults);
    }
  }, [lipColor, isRendering, onResults]);

  return (
    <div className="d-flex w-100 position-relative">
      {isRendering ? (
        <>
          <video ref={videoRef} height={1280} width={720} style={{ display: 'none' }} playsInline></video>
          <div className='h-100 w-100 d-flex'>
            <canvas id="canvas" ref={canvasRef} className='m-auto rounded-1 '></canvas>
            <div style={{ zIndex: 99999 }} className='position-absolute bottom-0 start-50 translate-middle-x mb-3 d-flex'>
              <span className='ratio-1x1 mx-1 rounded-circle' onClick={() => setLipColor('rgba(255, 0, 0, 0.4)')} style={{ backgroundColor: 'red', color: 'white', padding: "14px" }}></span>
              <span className='ratio-1x1 mx-1 rounded-circle' onClick={() => setLipColor('rgba(255, 192, 203, 0.4)')} style={{ backgroundColor: 'pink', color: 'white', padding: "14px" }}></span>
              <span className='ratio-1x1 mx-1 rounded-circle' onClick={() => setLipColor('rgba(128, 0, 128, 0.4)')} style={{ backgroundColor: 'purple', color: 'white', padding: "14px" }}></span>
              <span className='ratio-1x1 mx-1 rounded-circle' onClick={() => setLipColor('rgba(139, 0, 0, 0.4)')} style={{ backgroundColor: 'darkred', color: 'white', padding: "14px" }}></span>
            </div>
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
