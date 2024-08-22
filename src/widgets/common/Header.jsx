const Header = (props) => {
  return (
    <header>
      <div className="flex rounded-lg px-8 py-4  bg-white justify-between items-center">
          <p className="text-2xl font-bold">우니의 보드게임천국</p>
          <button className="btn">로그인</button>
        </div>
    </header>
  );
}

export default Header;