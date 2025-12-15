import os

def get_settings():
    secret_key = os.getenv("SECRET_KEY", "dev-only-change-me")
    algorithm = os.getenv("JWT_ALGORITHM", "HS256")
    access_token_exp_minutes = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    return {
        "SECRET_KEY": secret_key,
        "ALGORITHM": algorithm,
        "ACCESS_TOKEN_EXPIRE_MINUTES": access_token_exp_minutes,
    }
