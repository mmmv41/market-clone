from fastapi import FastAPI,UploadFile,Form,Response,Depends
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from fastapi.staticfiles import StaticFiles
from fastapi_login import LoginManager
from typing import Annotated
from fastapi_login.exceptions import InvalidCredentialsException
import sqlite3

con = sqlite3.connect('db.db',check_same_thread=False)  #db.db와 연결

cur = con.cursor()

app = FastAPI()

SERCRET = "min" # access token을 어떻게 인코딩할지 정함
manager = LoginManager(SERCRET,"/login")
 
 
#유저가 DB에 존재하는지 조회
@manager.user_loader()
def query_user(data):
    # SQL 쿼리의 WHERE 절을 동적으로 생성하기 위한 변수.
    WHERE_STATEMENTS = f'id="{data}"'
    if type(data) == dict:
        WHERE_STATEMENTS = f'''id="{data['id']}"'''
    con.row_factory = sqlite3.Row #컬럼명도 같이 가져옴
    cur = con.cursor()
    user = cur.execute(f"""
                        SELECT * FROM users WHERE { WHERE_STATEMENTS }
                        """).fetchone()
    return user
 
 
@app.post('/login')
def login(id:Annotated[str,Form()],
           password : Annotated[str,Form()]):
    user = query_user(id) #유저를 받아와서
    
    #유저의 존재유무 확인
    if not user: 
        raise InvalidCredentialsException 
    elif password != user['password']:#401 을 자동으로 생성해서 내려줌
        raise InvalidCredentialsException
    #입력한 password와 유저 정보를 조회해서 얻은 password가 다르면
    
    
    access_token = manager.create_access_token(data= { #어떤 데이터 넣을지
        'sub': {
            'id':user['id'],
            'name' : user['name'],
            'email':user['email']
        }                                              
           
    }) #액세스 토큰 생성
    return {'access_token': access_token}


#사용자 추가 과정
@app.post('/signup') #프론트에서 폼을 통해 post로 보냄
#http의 메소드와 경로지정 
def signup(id:Annotated[str,Form()],
           password : Annotated[str,Form()],
           name:Annotated[str,Form()],
           email:Annotated[str,Form()]):
    
    cur.execute(f"""
                INSERT INTO users(id,name,email,password)
                VALUES ('{id}','{name}','{email}','{password}')
                """)
    con.commit()
    return 200

#글쓰기 페이지에서 post / 조회 페이지에서 get

@app.post('/items') # 1) POST를 통해 items라는 API 받음
async def create_item(image:UploadFile, 
                title:Annotated[str, Form()], #Form data 형식, 문자열로 온다 (fastapi의 변수설정법)
                price:Annotated[int, Form()], #가격이므로 int 숫자 형식으로
                description:Annotated[str, Form()], 
                place:Annotated[str, Form()],
                insertAt:Annotated[int,Form()]
                ):
    # 2) 이런 정보들이 Form()데이터 형식으로 옴

    image_bytes = await image.read()
     # 3)이미지 데이터 크기때문 -> 읽는과정에서 await 필요, await 쓰려면 async 써야함.

    cur.execute(f"""
                INSERT INTO 
                items(title,image,price,description,place,insertAt)
                VALUES 
                ('{title}','{image_bytes.hex()}',{price},'{description}','{place}','{insertAt}')
                """)
    #insert into 문 사용/ 이미지바이트는 hex로바꿈 (16진법)
    # 4)items 라는 테이블에 값을 넣어줌
    
    con.commit() #데이터가 들어감
    return 200

@app.get('/items')  #items라는 get요청 들어왔을 때
async def get_items(user=Depends(manager)): 
    #유저가 인증된 상태에서만 응답 보낼 수 있게
    con.row_factory = sqlite3.Row #컬럼명도 같이 가져옴

    cur = con.cursor()
    rows = cur.execute(f"""
                       SELECT * FROM items 
                       """).fetchall() #가져오는 문법 fetchall()
    
    return JSONResponse(jsonable_encoder(
    dict(row) for row in rows))
     #rows들 중에 array(배열)를 dict(객체)으로 바꿔줌
     #js쪽으로 보낼거니까 json응답으로 가져옴(상단 import필수)
     #items 테이블의 모든 데이터 가져오기


    
@app.get('/images/{item_id}') #item_id를 보내면 item에 맞는 image를 보내준다.

async def get_image(item_id):
    cur = con.cursor()
    
    #16진법이므로 변환해야함
    image_bytes = cur.execute(f"""
                              SELECT image FROM items WHERE id = {item_id}
                              """).fetchone()[0] #하나의 컬럼만가져오는 문법
    
    return Response(content = bytes.fromhex(image_bytes), media_type='image/*')
    #image_bytes를 가져와 해석한뒤 bytes 컨텐츠로 response하겠다.
    
    
    
app.mount("/", StaticFiles(directory='frontend', html=True), name='static')
#path 라서 맨밑에 작성하는게 좋음
