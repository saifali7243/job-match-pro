from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    app_name: str = "JobMatch Pro API"
    debug: bool = True
    supabase_url: str = ""
    supabase_key: str = ""
    supabase_service_key: str = ""
    gemini_api_key: str = ""
    adzuna_app_id: str = ""
    adzuna_app_key: str = ""
    hunter_api_key: str = ""
    frontend_url: str = "http://localhost:3000"

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
