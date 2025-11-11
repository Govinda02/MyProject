from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
from enum import Enum

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.environ.get("JWT_SECRET", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30 * 24 * 60  # 30 days

security = HTTPBearer()

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Enums
class UserRole(str, Enum):
    PLAYER = "player"
    ORGANIZER = "organizer"
    ADMIN = "admin"

class SportType(str, Enum):
    FOOTBALL = "Football"
    VOLLEYBALL = "Volleyball"
    BADMINTON = "Badminton"
    BASKETBALL = "Basketball"
    MARATHON = "Marathon"
    CRICKET = "Cricket"
    ESPORTS = "E-Sports"
    OTHER = "Other"

class EventStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    CANCELLED = "cancelled"
    COMPLETED = "completed"

# Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    role: UserRole = UserRole.PLAYER
    avatar: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    participation_count: int = 0
    wins: int = 0
    points: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str] = None
    role: UserRole = UserRole.PLAYER
    location: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class Event(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    sport_type: SportType
    organizer_id: str
    organizer_name: str
    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    event_date: datetime
    registration_deadline: datetime
    max_participants: Optional[int] = None
    current_participants: int = 0
    entry_fee: float = 0
    prize_pool: Optional[str] = None
    image_url: Optional[str] = None
    status: EventStatus = EventStatus.PENDING
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class EventCreate(BaseModel):
    title: str
    description: str
    sport_type: SportType
    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    event_date: datetime
    registration_deadline: datetime
    max_participants: Optional[int] = None
    entry_fee: float = 0
    prize_pool: Optional[str] = None
    image_url: Optional[str] = None

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    sport_type: Optional[SportType] = None
    location: Optional[str] = None
    event_date: Optional[datetime] = None
    status: Optional[EventStatus] = None

class Registration(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    event_id: str
    user_id: str
    user_name: str
    registered_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    payment_status: str = "pending"

class RegistrationCreate(BaseModel):
    event_id: str

class Donation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    event_id: Optional[str] = None
    donor_name: str
    donor_email: Optional[str] = None
    amount: float
    message: Optional[str] = None
    payment_method: str  # esewa, khalti, stripe
    payment_status: str = "pending"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DonationCreate(BaseModel):
    event_id: Optional[str] = None
    donor_name: str
    donor_email: Optional[str] = None
    amount: float
    message: Optional[str] = None
    payment_method: str

class LeaderboardEntry(BaseModel):
    user_id: str
    full_name: str
    avatar: Optional[str] = None
    points: int
    participation_count: int
    wins: int
    rank: int

# Helper functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return User(**user)

# Auth Routes
@api_router.post("/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    hashed_password = get_password_hash(user_data.password)
    user_dict = user_data.model_dump(exclude={"password"})
    user_obj = User(**user_dict)
    
    doc = user_obj.model_dump()
    doc["hashed_password"] = hashed_password
    doc["created_at"] = doc["created_at"].isoformat()
    
    await db.users.insert_one(doc)
    
    # Create token
    access_token = create_access_token(data={"sub": user_obj.id})
    return Token(access_token=access_token, token_type="bearer", user=user_obj)

@api_router.post("/auth/login", response_model=Token)
async def login(login_data: UserLogin):
    user = await db.users.find_one({"email": login_data.email}, {"_id": 0})
    if not user or not verify_password(login_data.password, user.get("hashed_password", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    user_obj = User(**user)
    access_token = create_access_token(data={"sub": user_obj.id})
    return Token(access_token=access_token, token_type="bearer", user=user_obj)

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# Event Routes
@api_router.post("/events", response_model=Event)
async def create_event(event_data: EventCreate, current_user: User = Depends(get_current_user)):
    if current_user.role not in [UserRole.ORGANIZER, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Only organizers can create events")
    
    event_dict = event_data.model_dump()
    event_obj = Event(
        **event_dict,
        organizer_id=current_user.id,
        organizer_name=current_user.full_name,
        status=EventStatus.APPROVED if current_user.role == UserRole.ADMIN else EventStatus.PENDING
    )
    
    doc = event_obj.model_dump()
    doc["event_date"] = doc["event_date"].isoformat()
    doc["registration_deadline"] = doc["registration_deadline"].isoformat()
    doc["created_at"] = doc["created_at"].isoformat()
    
    await db.events.insert_one(doc)
    return event_obj

@api_router.get("/events", response_model=List[Event])
async def get_events(
    sport_type: Optional[SportType] = None,
    location: Optional[str] = None,
    status: Optional[EventStatus] = None,
    skip: int = 0,
    limit: int = 50
):
    query = {}
    if sport_type:
        query["sport_type"] = sport_type
    if location:
        query["location"] = {"$regex": location, "$options": "i"}
    if status:
        query["status"] = status
    else:
        query["status"] = EventStatus.APPROVED
    
    events = await db.events.find(query, {"_id": 0}).sort("event_date", 1).skip(skip).limit(limit).to_list(limit)
    
    for event in events:
        if isinstance(event.get("event_date"), str):
            event["event_date"] = datetime.fromisoformat(event["event_date"])
        if isinstance(event.get("registration_deadline"), str):
            event["registration_deadline"] = datetime.fromisoformat(event["registration_deadline"])
        if isinstance(event.get("created_at"), str):
            event["created_at"] = datetime.fromisoformat(event["created_at"])
    
    return events

@api_router.get("/events/{event_id}", response_model=Event)
async def get_event(event_id: str):
    event = await db.events.find_one({"id": event_id}, {"_id": 0})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if isinstance(event.get("event_date"), str):
        event["event_date"] = datetime.fromisoformat(event["event_date"])
    if isinstance(event.get("registration_deadline"), str):
        event["registration_deadline"] = datetime.fromisoformat(event["registration_deadline"])
    if isinstance(event.get("created_at"), str):
        event["created_at"] = datetime.fromisoformat(event["created_at"])
    
    return Event(**event)

@api_router.put("/events/{event_id}", response_model=Event)
async def update_event(event_id: str, event_update: EventUpdate, current_user: User = Depends(get_current_user)):
    event = await db.events.find_one({"id": event_id}, {"_id": 0})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if current_user.role != UserRole.ADMIN and event["organizer_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this event")
    
    update_data = {k: v for k, v in event_update.model_dump(exclude_unset=True).items() if v is not None}
    if "event_date" in update_data:
        update_data["event_date"] = update_data["event_date"].isoformat()
    
    await db.events.update_one({"id": event_id}, {"$set": update_data})
    
    updated_event = await db.events.find_one({"id": event_id}, {"_id": 0})
    if isinstance(updated_event.get("event_date"), str):
        updated_event["event_date"] = datetime.fromisoformat(updated_event["event_date"])
    if isinstance(updated_event.get("registration_deadline"), str):
        updated_event["registration_deadline"] = datetime.fromisoformat(updated_event["registration_deadline"])
    if isinstance(updated_event.get("created_at"), str):
        updated_event["created_at"] = datetime.fromisoformat(updated_event["created_at"])
    
    return Event(**updated_event)

# Registration Routes
@api_router.post("/registrations", response_model=Registration)
async def register_for_event(reg_data: RegistrationCreate, current_user: User = Depends(get_current_user)):
    # Check if event exists
    event = await db.events.find_one({"id": reg_data.event_id}, {"_id": 0})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Check if already registered
    existing_reg = await db.registrations.find_one(
        {"event_id": reg_data.event_id, "user_id": current_user.id},
        {"_id": 0}
    )
    if existing_reg:
        raise HTTPException(status_code=400, detail="Already registered for this event")
    
    # Check max participants
    if event.get("max_participants") and event["current_participants"] >= event["max_participants"]:
        raise HTTPException(status_code=400, detail="Event is full")
    
    # Create registration
    reg_obj = Registration(
        event_id=reg_data.event_id,
        user_id=current_user.id,
        user_name=current_user.full_name,
        payment_status="completed" if event["entry_fee"] == 0 else "pending"
    )
    
    doc = reg_obj.model_dump()
    doc["registered_at"] = doc["registered_at"].isoformat()
    
    await db.registrations.insert_one(doc)
    await db.events.update_one({"id": reg_data.event_id}, {"$inc": {"current_participants": 1}})
    await db.users.update_one({"id": current_user.id}, {"$inc": {"participation_count": 1, "points": 10}})
    
    return reg_obj

@api_router.get("/registrations/user", response_model=List[Registration])
async def get_user_registrations(current_user: User = Depends(get_current_user)):
    registrations = await db.registrations.find({"user_id": current_user.id}, {"_id": 0}).to_list(100)
    
    for reg in registrations:
        if isinstance(reg.get("registered_at"), str):
            reg["registered_at"] = datetime.fromisoformat(reg["registered_at"])
    
    return registrations

@api_router.get("/registrations/event/{event_id}", response_model=List[Registration])
async def get_event_registrations(event_id: str):
    registrations = await db.registrations.find({"event_id": event_id}, {"_id": 0}).to_list(1000)
    
    for reg in registrations:
        if isinstance(reg.get("registered_at"), str):
            reg["registered_at"] = datetime.fromisoformat(reg["registered_at"])
    
    return registrations

# Leaderboard Routes
@api_router.get("/leaderboard", response_model=List[LeaderboardEntry])
async def get_leaderboard(limit: int = 50):
    users = await db.users.find({}, {"_id": 0}).sort("points", -1).limit(limit).to_list(limit)
    
    leaderboard = []
    for idx, user in enumerate(users, 1):
        leaderboard.append(LeaderboardEntry(
            user_id=user["id"],
            full_name=user["full_name"],
            avatar=user.get("avatar"),
            points=user["points"],
            participation_count=user["participation_count"],
            wins=user["wins"],
            rank=idx
        ))
    
    return leaderboard

# Donation Routes
@api_router.post("/donations", response_model=Donation)
async def create_donation(donation_data: DonationCreate):
    donation_obj = Donation(**donation_data.model_dump(), payment_status="completed")
    
    doc = donation_obj.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    
    await db.donations.insert_one(doc)
    return donation_obj

@api_router.get("/donations/event/{event_id}", response_model=List[Donation])
async def get_event_donations(event_id: str):
    donations = await db.donations.find({"event_id": event_id}, {"_id": 0}).to_list(100)
    
    for donation in donations:
        if isinstance(donation.get("created_at"), str):
            donation["created_at"] = datetime.fromisoformat(donation["created_at"])
    
    return donations

# Admin Routes
@api_router.get("/admin/events/pending", response_model=List[Event])
async def get_pending_events(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    events = await db.events.find({"status": EventStatus.PENDING}, {"_id": 0}).to_list(100)
    
    for event in events:
        if isinstance(event.get("event_date"), str):
            event["event_date"] = datetime.fromisoformat(event["event_date"])
        if isinstance(event.get("registration_deadline"), str):
            event["registration_deadline"] = datetime.fromisoformat(event["registration_deadline"])
        if isinstance(event.get("created_at"), str):
            event["created_at"] = datetime.fromisoformat(event["created_at"])
    
    return events

@api_router.put("/admin/events/{event_id}/approve")
async def approve_event(event_id: str, current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.events.update_one({"id": event_id}, {"$set": {"status": EventStatus.APPROVED}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
    
    return {"message": "Event approved successfully"}

@api_router.get("/stats")
async def get_stats():
    total_users = await db.users.count_documents({})
    total_events = await db.events.count_documents({})
    total_registrations = await db.registrations.count_documents({})
    total_donations = await db.donations.count_documents({})
    
    return {
        "total_users": total_users,
        "total_events": total_events,
        "total_registrations": total_registrations,
        "total_donations": total_donations
    }

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
