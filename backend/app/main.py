from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes import health, universities, recommendations, compare, deadlines, analytics, counselor
from app.config import FRONTEND_ORIGIN

app = FastAPI(title="UniPath AI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN, "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"error": {"code": "INTERNAL_ERROR", "message": str(exc)}},
    )


app.include_router(health.router, prefix="/api")
app.include_router(universities.router, prefix="/api")
app.include_router(recommendations.router, prefix="/api")
app.include_router(compare.router, prefix="/api")
app.include_router(deadlines.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(counselor.router, prefix="/api")


@app.get("/")
def root():
    return {"message": "UniPath AI API", "docs": "/docs"}
