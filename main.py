from fastapi import FastAPI,UploadFile,Form,Response
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from fastapi.staticfiles import StaticFiles
from typing import Annotated
import sqlite3

con = sqlite3.connect('db.db',check_same_thread=False)
cur = con.cursor()

app = FastAPI()

@app.post('/items') # 1) POST를 통해 items라는 API 받음
async def create_item(image:UploadFile, 
                title:Annotated[str, Form()], #Form data 형식, 문자열로 온다
                price:Annotated[int, Form()], #가격이므로 int 숫자 형식으로
                description:Annotated[str, Form()], 
                place:Annotated[str, Form()],
                insertAt:Annotated[int,Form()]
                ):
    image_bytes = await image.read()
    cur.execute(f"""
                INSERT INTO 
                items(title,image,price,description,place,insertAt)
                VALUES 
                ('{title}','{image_bytes.hex()}',{price},'{description}','{place}','{insertAt}')
                """)
    con.commit() #데이터가 들어감
    return '200'

@app.get('/items')
async def get_items():
    con.row_factory = sqlite3.Row #컬럼명도 같이 가져옴

    cur = con.cursor()
    rows = cur.execute(f"""
                       SELECT * FROM items 
                       """).fetchall()
    return JSONResponse(jsonable_encoder(
    dict(row) for row in rows))
    
@app.get('/images/{item_id}') #아이템 아이디를 보내면 아이템에 맞는 이미지를 보내준다.
async def get_image(item_id):
    cur = con.cursor()
    
    #16진법이므로 변환해야함
    image_bytes = cur.execute(f"""
                              SELECT image FROM items WHERE id = {item_id}
                              """).fetchone()[0] #하나의 컬럼만가져오는 문법
    
    return Response(content = bytes.fromhex(image_bytes))
    #image_bytes를 가져와 해석한뒤 bytes 컨텐츠로 response하겠다.
    
app.mount("/", StaticFiles(directory='frontend', html=True), name='static')

