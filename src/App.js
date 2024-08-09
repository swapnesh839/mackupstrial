import React from 'react';
import logo from "./logo.png"
import MediaPipeComponent from './MediaPipeComponent';

const App = () => {
  const [isRendering, setIsRendering] = React.useState(false)
  return (
    <div className='vh-100 text-white container-fluid'>
      <img alt='logo' style={{zIndex:99999}} width={130} className='position-absolute top-0 start-0 ' src={logo} />
      <div className="row h-100">
        <div className='col col-12 h-100'>

          {isRendering ? <div className='w-100 h-100 d-flex'>
            <MediaPipeComponent isRendering={isRendering} />
          </div> : <div className='d-flex flex-column justify-content-center align-content-center h-100'>
            <h2 className='mx-auto mb-5 fs-1'>Try our vitual lipstick store</h2>
            <button className='btn text-white btn-outline-info border border-info mx-auto' onClick={() => setIsRendering(!isRendering)}>{isRendering ? 'Stop' : 'Start'}</button>
          </div>}
        </div>

      </div>
    </div>
  );
};

export default App;
