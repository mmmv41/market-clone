const calcTime = (timestamp) => {
  //한국 시간으로 받아짐 UTC+9
  const curTime = new Date().getTime() - 9 * 60 * 60 * 1000;
  const time = new Date(curTime - timestamp); //현재시간(curTime) - 과거시간(timestamp)
  const hour = time.getHours();
  const minute = time.getMinutes();
  const second = time.getSeconds();

  if (hour > 0) return `${hour}시간 전`;
  else if (minute > 0) return `${minute}분 전`;
  else if (second > 0) return `${second}초 전`;
  else return "방금 전";
};

const renderData = (data) => {
  const main = document.querySelector("main");

  //reverse() 데이터 순서를 뒤집어줌 (나중에 온게 제일 위로)
  // array에만 쓸 수 있는 구문 (foreach)
  data.reverse().forEach(async (obj) => {
    const div = document.createElement("div");
    div.className = "item-list";

    const imgDiv = document.createElement("div");
    imgDiv.className = "item-list_img";

    const img = document.createElement("img");

    const res = await fetch(`/images/${obj.id}`);
    //img에 대한 blob받아와서 src에 넣을거임

    const blob = await res.blob(); //blob타입으로 받아옴
    const url = URL.createObjectURL(blob); //url 생성
    img.src = url; //url 을 src에 넣어줌 -> 이미지 뜸

    const InfoDiv = document.createElement("div");
    InfoDiv.className = "item-list_info";

    const InfoTitleDiv = document.createElement("div");
    InfoTitleDiv.className = "item-list_info-title";
    InfoTitleDiv.innerText = obj.title; //타이틀 넣어줌

    const InfoMetaDiv = document.createElement("div");
    InfoMetaDiv.className = "item-list_info-meta";
    InfoMetaDiv.innerText = obj.place + " " + calcTime(obj.insertAt);

    const InfoPriceDiv = document.createElement("div");
    InfoPriceDiv.className = "item-list_info-price";
    InfoPriceDiv.innerText = obj.price;

    imgDiv.appendChild(img);

    InfoDiv.appendChild(InfoTitleDiv);
    InfoDiv.appendChild(InfoMetaDiv);
    InfoDiv.appendChild(InfoPriceDiv);

    div.appendChild(imgDiv);
    div.appendChild(InfoDiv);
    //const div = document.createElement("div");
    //div.innerText = obj.title;

    main.appendChild(div);
  });
};

const fetchList = async () => {
  const accessToken = window.localStorage.getItem("token");
  const res = await fetch("/items", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (res.status === 401) {
    alert("로그인이 필요합니다!");
    window.location.pathname = "/login.html";
    return;
  }
  const data = await res.json(); //data는 json으로 바꿔줘야함
  renderData(data);
};

fetchList();
