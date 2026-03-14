#!/usr/bin/env python3
import discord
import os
import json
from discord.ext import commands
from dotenv import load_dotenv

# --- Engedélyek beállítása ---
intents = discord.Intents.default()
intents.message_content = True

bot = commands.Bot(command_prefix="!", intents=intents)

load_dotenv()
TOKEN = os.getenv("DISCORD_TOKEN")

def load_radios():
    with open("radiok.json", "r", encoding="utf-8") as f:
        return json.load(f)

RADIO_STREAMS = load_radios()

@bot.event
async def on_ready():
    print(f"✅ Bejelentkezve mint {bot.user}")
    await bot.change_presence(
        activity=discord.Activity(
            type=discord.ActivityType.listening,
            name="!hp"
        )
    )


@bot.command(name="csatlakozz")
async def join(ctx):
    if ctx.author.voice:
        channel = ctx.author.voice.channel
        await channel.connect()
        await ctx.send(f"🎙️ Csatlakoztam a(z) **{channel.name}** csatornához.")
    else:
        await ctx.send("❌ Nem vagy hangcsatornában!")

@bot.command(name="play")
async def play(ctx, adas: str):
    vc = ctx.voice_client
    if not vc:
        if ctx.author.voice:
            channel = ctx.author.voice.channel
            vc = await channel.connect()
        else:
            await ctx.send("Először csatlakozz egy hangcsatornához!")
            return

    if adas not in RADIO_STREAMS:
        await ctx.send(f"❌ Ismeretlen rádió: `{adas}`\nElérhetők: {', '.join(RADIO_STREAMS.keys())}")
        return

    stream_url = RADIO_STREAMS[adas]
    vc.stop()
    vc.play(
        discord.FFmpegPCMAudio(
            stream_url,
            before_options="-reconnect 1 -reconnect_streamed 1 -reconnect_delay_max 5",
            options="-vn"
        )
    )
    await ctx.send(f"📻 Most szól: **{adas}** rádió")

@bot.command(name="stop")
async def stop(ctx):
    if ctx.voice_client:
        ctx.voice_client.stop()
        await ctx.send("⏹️ Lejátszás leállítva.")

@bot.command(name="left")
async def leave(ctx):
    if ctx.voice_client:
        await ctx.voice_client.disconnect()
        await ctx.send("👋 Kiléptem a hangcsatornából.")

@bot.command(name="hp")
async def help_command(ctx):
    help_text = (
        "🆘 **Elérhető parancsok:**\n"
        "```text\n"
        "!csatlakozz        → Csatlakozik a hangcsatornához\n"
        "!play <nev>   → Lejátssza az adott rádiót (pl. !play retro)\n"
        "!stop        → Leállítja a lejátszást\n"
        "!left           → Kilép a hangcsatornából\n"
        "!hp         → Megjeleníti ezt a súgót\n"
        "\n"
        "Elérhető rádiók: Rádió 1(radio1), Retro Rádió(retro), Best FM Debrecen(bestfm),Oxygen rádió(oxygen),Roxy Rádió(roxy)"
        "\n"
        "By Ray 2026 03.14"
        "```"
    )
    await ctx.send(help_text)

bot.run(TOKEN)