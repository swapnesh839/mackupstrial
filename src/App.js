import React from 'react';
import logo from "./logo.png"
import MediaPipeComponent from './MediaPipeComponent';

const App = () => {
  const [isRendering, setIsRendering] = React.useState(false)
  return (
    <div className='container-fluid h-100 text-white'>
      <img alt='logo' width={130} className='position-absolute top-0 start-0 m-1' src={logo} />
      <div className="row h-100">
      <div className='col col-md-6 col-12 h-100'>
          <div className='d-flex flex-column justify-content-center align-content-center h-100'>
          <h2 className='mx-auto mb-5 fs-1'>Try our vitual lipstick store</h2>
          <button className='btn text-white btn-outline-info border border-info mx-auto' onClick={() => setIsRendering(!isRendering)}>{isRendering ? 'Stop' : 'Start'}</button>
          </div>
        </div>
        <div className='col col-md-6 col-12 h-100 d-flex'>
          <MediaPipeComponent isRendering={isRendering} />
        </div>
      </div>
    </div>
  );
};

export default App;
