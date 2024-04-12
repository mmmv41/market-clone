const form = document.querySelector("#signup-form");

const checkPassword = () => {
  const formData = new FormData(form);
  const password1 = formData.get("password");
  const password2 = formData.get("password2");

  if (password1 == password2) {
    return true; // 두개의 비밀번호가 같으면
  } else return false;
};

const handleSubmit = async (event) => {
  //submit 이벤트가 발생시
  event.preventDefault();
  const formData = new FormData(form); // 1) 폼데이터를 가져와서
  const sha256Password = sha256(formData.get("password"));
  //form데이터에서 password라는 값 가져온 후 sha256으로 감싸줌 -> 암호화됨
  // 2) 보안을 해준후

  formData.set("password", sha256Password);
  // 3) name="password"인 값에 넣어줌

  const div = document.querySelector("#info");

  if (checkPassword()) {
    const res = await fetch("/signup", {
      method: "POST",
      body: formData, // 4) formData를 바디에 담아, 서버로 보냄
    });
    const data = await res.json();
    if (data == "200") {
      div.innerText = "회원가입 성공";
      div.style.color = "blue";
      alert("회원 가입 성공"); // 알립팝업으로 띄워줌
      window.location.pathname = "/login.html";
    }
  } else {
    div.innerText = "비밀번호가 같지 않습니다.";
    div.style.color = "red";
  }
};

form.addEventListener("submit", handleSubmit);
