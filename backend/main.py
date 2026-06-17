from fastapi import FastAPI, HTTPException, Depends, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from sqlalchemy import create_engine, Column, Integer, String, Boolean, Float, Text, TIMESTAMP, ForeignKey, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from pydantic import BaseModel, EmailStr
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional, List
import hashlib, os, uuid, shutil

DATABASE_URL = f"postgresql://{os.getenv('POSTGRES_USER','postgres')}:{os.getenv('POSTGRES_PASSWORD','postgres123')}@{os.getenv('POSTGRES_HOST','localhost')}:{os.getenv('POSTGRES_PORT','5432')}/{os.getenv('POSTGRES_DB','junggomarket')}"
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "secret")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "1440"))
UPLOAD_DIR = "/app/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

app = FastAPI(title="중고마켓 API", version="2.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# ── Models ──────────────────────────────────────────────
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    email = Column(String(255), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    nickname = Column(String(100), nullable=False)
    profile_image = Column(Text)
    phone = Column(String(20))
    location = Column(String(100))
    manner_score = Column(Float, default=36.5)
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)

class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True)
    name = Column(String(50), nullable=False)
    icon = Column(String(50))

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True)
    seller_id = Column(Integer, ForeignKey("users.id"))
    category_id = Column(Integer, ForeignKey("categories.id"))
    title = Column(String(255), nullable=False)
    description = Column(Text)
    price = Column(Integer, nullable=False)
    status = Column(String(20), default="selling")
    location = Column(String(100))
    view_count = Column(Integer, default=0)
    like_count = Column(Integer, default=0)
    images = Column(Text, default="")
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow)

class Like(Base):
    __tablename__ = "likes"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    created_at = Column(TIMESTAMP, default=datetime.utcnow)

class ChatRoom(Base):
    __tablename__ = "chat_rooms"
    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    buyer_id = Column(Integer, ForeignKey("users.id"))
    seller_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(TIMESTAMP, default=datetime.utcnow)

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    id = Column(Integer, primary_key=True)
    room_id = Column(Integer, ForeignKey("chat_rooms.id"))
    sender_id = Column(Integer, ForeignKey("users.id"))
    content = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)

# ── Schemas ─────────────────────────────────────────────
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    nickname: str
    location: Optional[str] = None

class UserResponse(BaseModel):
    id: int; email: str; nickname: str
    location: Optional[str]; manner_score: float
    profile_image: Optional[str]; created_at: datetime
    class Config: from_attributes = True

class Token(BaseModel):
    access_token: str; token_type: str

class ProductCreate(BaseModel):
    title: str; description: Optional[str] = None
    price: int; category_id: int; location: Optional[str] = None

class ProductResponse(BaseModel):
    id: int; title: str; price: int; status: str
    location: Optional[str]; view_count: int; like_count: int
    images: Optional[str]; description: Optional[str]
    seller_id: int; category_id: Optional[int]
    created_at: datetime
    class Config: from_attributes = True

class ProductDetail(ProductResponse):
    seller_nickname: Optional[str] = None
    seller_manner_score: Optional[float] = None
    seller_location: Optional[str] = None
    is_liked: Optional[bool] = False

class ChatRoomResponse(BaseModel):
    id: int; product_id: int; buyer_id: int; seller_id: int
    product_title: Optional[str] = None
    other_nickname: Optional[str] = None
    last_message: Optional[str] = None
    created_at: datetime
    class Config: from_attributes = True

class ChatMessageCreate(BaseModel):
    content: str

class ChatMessageResponse(BaseModel):
    id: int; room_id: int; sender_id: int; content: str
    is_read: bool; created_at: datetime
    class Config: from_attributes = True

# ── Helpers ──────────────────────────────────────────────
def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

def hash_password(p: str) -> str:
    return hashlib.sha256(p.encode()).hexdigest()

def verify_password(plain: str, hashed: str) -> bool:
    return hashlib.sha256(plain.encode()).hexdigest() == hashed

def create_access_token(data: dict):
    to_encode = data.copy()
    to_encode.update({"exp": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if not email: raise HTTPException(status_code=401, detail="인증 실패")
    except JWTError:
        raise HTTPException(status_code=401, detail="인증 실패")
    user = db.query(User).filter(User.email == email).first()
    if not user: raise HTTPException(status_code=401, detail="인증 실패")
    return user

def get_current_user_optional(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try: return get_current_user(token, db)
    except: return None

# ── Routes ───────────────────────────────────────────────
@app.get("/health")
def health(): return {"status": "healthy", "service": "중고마켓 API v2"}

@app.post("/api/auth/register", response_model=UserResponse)
def register(data: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="이미 사용 중인 이메일입니다")
    user = User(email=data.email, hashed_password=hash_password(data.password),
                nickname=data.nickname, location=data.location)
    db.add(user); db.commit(); db.refresh(user)
    return user

@app.post("/api/auth/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="이메일 또는 비밀번호 오류")
    return {"access_token": create_access_token({"sub": user.email}), "token_type": "bearer"}

@app.get("/api/users/me", response_model=UserResponse)
def get_me(u: User = Depends(get_current_user)): return u

@app.put("/api/users/me")
def update_me(nickname: Optional[str] = None, location: Optional[str] = None,
              u: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if nickname: u.nickname = nickname
    if location: u.location = location
    db.commit(); db.refresh(u)
    return u

@app.get("/api/users/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user: raise HTTPException(status_code=404, detail="유저 없음")
    return user

@app.get("/api/categories")
def get_categories(db: Session = Depends(get_db)):
    return db.query(Category).all()

@app.get("/api/products", response_model=List[ProductResponse])
def get_products(skip: int = 0, limit: int = 20, category_id: Optional[int] = None,
                 search: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(Product).filter(Product.status == "selling")
    if category_id: q = q.filter(Product.category_id == category_id)
    if search: q = q.filter(Product.title.contains(search))
    return q.order_by(Product.created_at.desc()).offset(skip).limit(limit).all()

@app.get("/api/products/{product_id}")
def get_product(product_id: int, db: Session = Depends(get_db),
                token: Optional[str] = None):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product: raise HTTPException(status_code=404, detail="상품 없음")
    product.view_count += 1; db.commit()
    seller = db.query(User).filter(User.id == product.seller_id).first()
    result = ProductDetail.model_validate(product)
    if seller:
        result.seller_nickname = seller.nickname
        result.seller_manner_score = seller.manner_score
        result.seller_location = seller.location
    return result

@app.post("/api/products", response_model=ProductResponse)
def create_product(data: ProductCreate, u: User = Depends(get_current_user), db: Session = Depends(get_db)):
    product = Product(seller_id=u.id, **data.dict())
    db.add(product); db.commit(); db.refresh(product)
    return product

@app.put("/api/products/{product_id}")
def update_product(product_id: int, data: ProductCreate,
                   u: User = Depends(get_current_user), db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product: raise HTTPException(status_code=404, detail="상품 없음")
    if product.seller_id != u.id: raise HTTPException(status_code=403, detail="권한 없음")
    for k, v in data.dict().items(): setattr(product, k, v)
    product.updated_at = datetime.utcnow()
    db.commit(); db.refresh(product); return product

@app.delete("/api/products/{product_id}")
def delete_product(product_id: int, u: User = Depends(get_current_user), db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product: raise HTTPException(status_code=404, detail="상품 없음")
    if product.seller_id != u.id: raise HTTPException(status_code=403, detail="권한 없음")
    db.delete(product); db.commit(); return {"message": "삭제 완료"}

@app.patch("/api/products/{product_id}/status")
def update_status(product_id: int, status: str, u: User = Depends(get_current_user), db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product or product.seller_id != u.id: raise HTTPException(status_code=403)
    product.status = status; db.commit(); return {"status": status}

@app.post("/api/products/{product_id}/like")
def toggle_like(product_id: int, u: User = Depends(get_current_user), db: Session = Depends(get_db)):
    like = db.query(Like).filter(Like.user_id == u.id, Like.product_id == product_id).first()
    product = db.query(Product).filter(Product.id == product_id).first()
    if like:
        db.delete(like); product.like_count = max(0, product.like_count - 1)
        db.commit(); return {"liked": False}
    db.add(Like(user_id=u.id, product_id=product_id))
    product.like_count += 1; db.commit(); return {"liked": True}

@app.get("/api/users/me/likes")
def get_my_likes(u: User = Depends(get_current_user), db: Session = Depends(get_db)):
    likes = db.query(Like).filter(Like.user_id == u.id).all()
    product_ids = [l.product_id for l in likes]
    return db.query(Product).filter(Product.id.in_(product_ids)).all()

@app.get("/api/users/me/products")
def get_my_products(u: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Product).filter(Product.seller_id == u.id).order_by(Product.created_at.desc()).all()

@app.post("/api/products/{product_id}/images")
async def upload_image(product_id: int, file: UploadFile = File(...),
                       u: User = Depends(get_current_user), db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product or product.seller_id != u.id: raise HTTPException(status_code=403)
    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    filename = f"{uuid.uuid4()}.{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    with open(filepath, "wb") as f: shutil.copyfileobj(file.file, f)
    images = product.images.split(",") if product.images else []
    images.append(f"/uploads/{filename}")
    product.images = ",".join(images)
    db.commit(); return {"url": f"/uploads/{filename}"}

# 채팅
@app.post("/api/chat/rooms")
def create_room(product_id: int, u: User = Depends(get_current_user), db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product: raise HTTPException(status_code=404)
    if product.seller_id == u.id: raise HTTPException(status_code=400, detail="본인 상품입니다")
    existing = db.query(ChatRoom).filter(ChatRoom.product_id == product_id, ChatRoom.buyer_id == u.id).first()
    if existing: return existing
    room = ChatRoom(product_id=product_id, buyer_id=u.id, seller_id=product.seller_id)
    db.add(room); db.commit(); db.refresh(room); return room

@app.get("/api/chat/rooms")
def get_rooms(u: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rooms = db.query(ChatRoom).filter(
        (ChatRoom.buyer_id == u.id) | (ChatRoom.seller_id == u.id)
    ).order_by(ChatRoom.created_at.desc()).all()
    result = []
    for room in rooms:
        product = db.query(Product).filter(Product.id == room.product_id).first()
        other_id = room.seller_id if room.buyer_id == u.id else room.buyer_id
        other = db.query(User).filter(User.id == other_id).first()
        last_msg = db.query(ChatMessage).filter(ChatMessage.room_id == room.id).order_by(ChatMessage.created_at.desc()).first()
        result.append({
            "id": room.id, "product_id": room.product_id, "buyer_id": room.buyer_id,
            "seller_id": room.seller_id, "created_at": room.created_at,
            "product_title": product.title if product else "",
            "product_image": product.images.split(",")[0] if product and product.images else "",
            "other_nickname": other.nickname if other else "",
            "last_message": last_msg.content if last_msg else "",
            "last_message_at": last_msg.created_at if last_msg else room.created_at,
        })
    return result

@app.get("/api/chat/rooms/{room_id}/messages")
def get_messages(room_id: int, u: User = Depends(get_current_user), db: Session = Depends(get_db)):
    room = db.query(ChatRoom).filter(ChatRoom.id == room_id).first()
    if not room or (room.buyer_id != u.id and room.seller_id != u.id):
        raise HTTPException(status_code=403)
    db.query(ChatMessage).filter(ChatMessage.room_id == room_id, ChatMessage.sender_id != u.id).update({"is_read": True})
    db.commit()
    return db.query(ChatMessage).filter(ChatMessage.room_id == room_id).order_by(ChatMessage.created_at).all()

@app.post("/api/chat/rooms/{room_id}/messages")
def send_message(room_id: int, data: ChatMessageCreate,
                 u: User = Depends(get_current_user), db: Session = Depends(get_db)):
    room = db.query(ChatRoom).filter(ChatRoom.id == room_id).first()
    if not room or (room.buyer_id != u.id and room.seller_id != u.id):
        raise HTTPException(status_code=403)
    msg = ChatMessage(room_id=room_id, sender_id=u.id, content=data.content)
    db.add(msg); db.commit(); db.refresh(msg); return msg


import httpx

@app.post("/api/ai/chat")
async def ai_chat(request: dict):
    message = request.get("message", "")
    history = request.get("history", [])

    system = """당신은 중고마켓의 AI 상담사입니다.
오직 중고 거래와 관련된 질문에만 답변하세요.
관련 주제: 거래 방법, 사기 예방, 가격 협상, 물품 상태 확인, 배송/택배, 안전 거래, 중고 물품 관련 팁.
중고 거래와 무관한 질문(주식, 정치, 연예, 요리 등)에는 "죄송합니다, 저는 중고 거래 관련 질문만 답변할 수 있어요 😊 중고 거래에 대해 궁금한 점이 있으시면 편하게 물어보세요!"라고 답하세요.
항상 친절하고 간결하게 한국어로 답변하세요."""

    msgs = [{"role": m["role"], "content": m["content"]} for m in history if m.get("role") in ["user","assistant"]]
    msgs.append({"role": "user", "content": message})

    async with httpx.AsyncClient() as client:
        res = await client.post(
            "https://api.anthropic.com/v1/messages",
            headers={"Content-Type": "application/json", "x-api-key": os.getenv("ANTHROPIC_API_KEY", ""), "anthropic-version": "2023-06-01"},
            json={"model": "claude-haiku-4-5-20251001", "max_tokens": 500, "system": system, "messages": msgs},
            timeout=30
        )
        data = res.json()
        reply = data.get("content", [{}])[0].get("text", "죄송합니다, 잠시 후 다시 시도해주세요.")
    return {"reply": reply}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
