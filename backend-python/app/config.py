from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str = ""
    openai_api_key: str = ""
    openai_embedding_model: str = "text-embedding-3-small"
    openai_chat_model: str = "gpt-4o-mini"
    max_context_chunks: int = 5

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()