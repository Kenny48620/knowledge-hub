from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Knowledge Hub API",
    version="0.1.0",
)

# Frontend dev server (Vite) default: http://localhost:5173
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/")
def root():
    return {"message": "Knowledge Hub API is running"}
