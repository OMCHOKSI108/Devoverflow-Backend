# main.py
import os
import smtplib
from email.mime.text import MIMEText
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr
from passlib.hash import bcrypt

app = FastAPI()

class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str

users = {}

@app.post("/register")
async def register(data: RegisterRequest):
    if data.email in users:
        raise HTTPException(status_code=409, detail="Email already registered")

    users[data.email] = {"username": data.username, "password": bcrypt.hash(data.password)}

    # Compose email
    msg = MIMEText(f"Hi {data.username}, welcome to MyApp!")
    msg["Subject"] = f"Welcome {data.username}"
    msg["From"] = os.environ["GMAIL_USER"]
    msg["To"] = data.email

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(os.environ["GMAIL_USER"], os.environ["GMAIL_PASS"])
            server.send_message(msg)
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Email failed to send")

    return {"ok": True, "message": "Registered and welcome email sent"}
