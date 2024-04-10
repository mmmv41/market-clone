const form = document.getElementById("write-form");

const handleSubmitForm = async (event) => {
  event.preventDefault(); // cons`ole에서 뜨자마자 사라지는거 방지
  const body = new FormData(form);

  //세계 시간 기준으로 보냄
  body.append("insertAt", new Date().getTime()); //body에 정보를 추가. append()문법 사용

  try {
    const res = await fetch("/items", {
      //이 함수에서 서버쪽으로 데이터 보냄
      method: "POST",
      body,
    });
    const data = await res.json();
    if (data === "200") window.location.pathname = "/";
  } catch (e) {
    console.error(e);
  }
  // try로직에서 에러나면 catch로직으로 이동
};

form.addEventListener("submit", handleSubmitForm);
