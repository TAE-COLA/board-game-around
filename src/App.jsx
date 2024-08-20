import { useState } from 'react';

function App() {

  let [글제목, b] = useState('효진아 안뇽 사랑훼');

  let [likes, changeLikes] = useState(0);
  function like() {
    changeLikes(likes + 1);
  }

  return (
    <div className="App">
      <div className="w-full bg-black">
        <p className="p-2 text-white font-extrabold">개발 Blog</p>
      </div>
      <div className="list">
        <h4>{ 글제목 }</h4>
        <p>나를 얼만큼 사랑하니?!</p>
      </div>
      <button className="btn" onClick={ like }>{ likes } 만큼 사랑해</button>
    </div>
  );
}

export default App