# pydantic-settings lets us define our config as a class.
# It automatically reads from the .env file and validates
# that required values are present. If OPENAI_API_KEY is
# missing, the app crashes on startup with a clear error
# rather than failing silently later when you try to use it.
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # PostgreSQL connection string — used by the retriever
    # to search the knowledge base vectors
    database_url: str = ""

    # Your OpenAI API key — used for both embeddings
    # (converting text to vectors) and chat completions
    # (generating the AI's responses)
    openai_api_key: str = ""

    # The model used to convert text into vectors (numbers).
    # text-embedding-3-small is cheap ($0.02/million tokens)
    # and produces 1536-dimensional vectors — good enough for
    # a knowledge base of your size
    openai_embedding_model: str = "text-embedding-3-small"

    # The model that actually generates the chat responses.
    # gpt-4o-mini is fast, cheap, and smart enough for this
    openai_chat_model: str = "gpt-4o-mini"

    # How many knowledge chunks to retrieve per question.
    # 5 is a good balance — enough context without overloading
    # the AI's input window or spending too many tokens
    max_context_chunks: int = 5

    class Config:
        # Tell pydantic-settings where to find the .env file
        env_file = ".env"
        # Ignore any extra env vars that aren't defined above
        # (prevents crashes if your .env has unrelated variables)
        extra = "ignore"

# Create a single shared instance.
# Other files do: from app.config import settings
# Then use: settings.openai_api_key
# This pattern is called a singleton — one object, shared everywhere
settings = Settings()