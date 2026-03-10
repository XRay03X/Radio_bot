# Könnyített Python 3.12 kép
FROM python:3.12-slim

# Szükséges rendszerfájlok (FFmpeg a hanghoz, gcc a PyNaCl-hoz)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libffi-dev \
    libopus-dev \
    gcc \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Függőségek telepítése
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
# Kényszerített újrafordítás a 4017-es hiba ellen
RUN pip install --no-binary pynacl pynacl

# A bot kódjának másolása
COPY . .

# Indítás
CMD ["python", "bot.py"]
