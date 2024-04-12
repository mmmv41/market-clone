const form = document.querySelector("#login-form");

const handleSubmit = async (event) => {
  //submit 이벤트가 발생시
  event.preventDefault();
  const formData = new FormData(form); // 1) 폼데이터를 가져와서
  const sha256Password = sha256(formData.get("password"));
  //form데이터에서 password라는 값 가져온 후 sha256으로 감싸줌 -> 암호화됨
  // 2) 보안을 해준후

  formData.set("password", sha256Password);
  // 3) name="password"인 값에 넣어줌

  //const div = document.querySelector("#info");

  const res = await fetch("/login", {
    method: "POST",
    body: formData, // 4) formData를 바디에 담아, 서버로 보냄
  });

  const data = await res.json();
  const accessToken = data.access_token;
  window.localStorage.setItem("token", accessToken);
  alert("로그인 되었습니다 !");

  const infoDiv = document.querySelector("#info");
  infoDiv.innerText = "로그인 되었습니다";

  window.location.pathname = "/";

  // const btn = document.createElement("button");
  // btn.innerText = "상품 가져오기";
  // btn.addEventListener("click", async () => {
  //   const res = await fetch("/items", {
  //     headers: {
  //       Authorization: `Bearer ${accessToken}`,
  //     },
  //   });
  //   const data = await res.json();
  //   console.log(data);
  // });
  // infoDiv.appendChild(btn);

  // if (res.status === 200) {
  //   //status 코드는 서버에서 내려줌(main.py)
  //   alert("로그인 성공");
  //   window.location.pathname = "/"; //로그인에 성공하면 원래페이지로 보내기
  // } else if (res.status === 401) {
  //   alert("id 혹은 password가 틀렸습니다");
  // }
};

form.addEventListener("submit", handleSubmit);
