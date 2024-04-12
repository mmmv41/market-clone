const form = document.getElementById("write-form");
//write-form 이라는 form 요소 가져옴

//글쓰기 버튼 눌렀을 때 실행
const handleSubmitForm = async (event) => {
  event.preventDefault(); // console에서 뜨자마자 사라지는거 방지
  const body = new FormData(form); //body에 new formdata 보내기

  //세계 시간 기준으로 보냄
  body.append("insertAt", new Date().getTime());
  //body에 정보를 추가. append()문법 사용
  //insertAt이라는 컬럼명 지정,

  try {
    const res = await fetch("/items", {
      //이 함수에서 서버쪽으로 데이터 보냄
      method: "POST",
      body, //바디에 폼데이터 담아서 보냄 (= body: body = body: new FormData(form))
      //서버쪽으로 items라는 API로 데이터 보냄
    });
    const data = await res.json();
    if (data === "200") {
      //서버의 응답으로 위치 이동 (/를 붙여줌으로써 버튼을 눌렀을 때 기본페이지로 이동)
      window.location.pathname = "/";
    }
  } catch (e) {
    console.error(e);
  }
  // try로직에서 에러나면 catch로직으로 이동
};

form.addEventListener("submit", handleSubmitForm);
//form에 eventListener를 달아줌. submit이라는 이벤트
