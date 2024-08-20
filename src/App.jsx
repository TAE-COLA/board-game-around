import { useState } from 'react';

function App() {

  let [글제목, b] = useState('남자 코드 추천');
  let posts = '강남 우동 맛집';

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
        <p>2월 17일 발행</p>
      </div>
      <button className="btn" onClick={ like }>👍 { likes }</button>
    </div>
  );
}

export default App