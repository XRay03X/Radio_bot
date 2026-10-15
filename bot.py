#!/usr/bin/env python3
import discord
import os
import json
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from discord.ext import commands, tasks
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


def load_json(filename, default=None):
    try:
        with open(filename, "r", encoding="utf-8") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"⚠️ Nem sikerült betölteni: {filename}: {e}")
        return default if default is not None else {}


NAMEDAYS = load_json("nevnapok.json", {})
BIRTHDAYS = load_json("szulinapok.json", {})

DAILY_CHANNEL_ID = int(os.getenv("DAILY_CHANNEL_ID", "0"))
BUDAPEST = ZoneInfo("Europe/Budapest")


def get_namedays(month, day):
    """Névnapok a helyi nevnapok.json hónap -> nap -> main struktúrájából."""
    month_data = NAMEDAYS.get(str(month), {})
    day_data = month_data.get(str(day), {})

    if not isinstance(day_data, dict):
        return []

    main = day_data.get("main", [])
    return [name for name in main if name]


def get_birthdays(month, day):
    """Mai születésnaposok lekérése a szulinapok.json-ból."""
    result = []

    if not isinstance(BIRTHDAYS, dict):
        return result

    for name, data in BIRTHDAYS.items():
        if isinstance(data, str):
            date = data
        elif isinstance(data, dict):
            date = data.get("date", "")
        else:
            continue

        if date in (
            f"{month:02d}-{day:02d}",
            f"{month:02d}.{day:02d}",
            f"{month:02d}/{day:02d}",
        ):
            result.append(name)

    return result


async def send_daily_info(channel=None):
    if channel is None:
        if not DAILY_CHANNEL_ID:
            print("⚠️ DAILY_CHANNEL_ID nincs beállítva.")
            return

        channel = bot.get_channel(DAILY_CHANNEL_ID)

    if channel is None:
        print("⚠️ A DAILY_CHANNEL_ID csatorna nem található.")
        return

    now = datetime.now(BUDAPEST)
    names = get_namedays(now.month, now.day)
    birthdays = get_birthdays(now.month, now.day)

    message = f"💜 **{now:%Y. %m. %d.}**\n\n"

    if names:
        message += f"🌸 **Mai névnapok:** {', '.join(names)}\n"
    else:
        message += "🌸 **Mai névnapok:** nincs adat\n"

    if birthdays:
        message += f"🎂 **Ma születésnapos:** {', '.join(birthdays)}\n"

    await channel.send(message)


@tasks.loop(hours=24)
async def daily_loop():
    await send_daily_info()


@daily_loop.before_loop
async def before_daily_loop():
    await bot.wait_until_ready()

    now = datetime.now(BUDAPEST)
    target = now.replace(hour=8, minute=0, second=0, microsecond=0)

    if target <= now:
        target += timedelta(days=1)

    await discord.utils.sleep_until(target)


@bot.event
async def on_ready():
    print(f"✅ Bejelentkezve mint {bot.user}")

    if not daily_loop.is_running():
        daily_loop.start()

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
        await ctx.send(
            f"❌ Ismeretlen rádió: `{adas}`\n"
            f"Elérhetők: {', '.join(RADIO_STREAMS.keys())}"
        )
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


@bot.command(name="daily")
@commands.has_permissions(administrator=True)
async def daily(ctx):
    await ctx.send("🧪 **Daily teszt indítása...**")
    await send_daily_info(ctx.channel)
    await ctx.send(
        "✅ **Daily teszt lefutott.** "
        "A normál daily időpont: **08:00 (Europe/Budapest)**."
    )


@daily.error
async def daily_error(ctx, error):
    if isinstance(error, commands.MissingPermissions):
        await ctx.send("❌ Ehhez a parancshoz rendszergazdai jogosultság kell.")


@bot.command(name="hp")
async def help_command(ctx):
    help_text = (
        "🆘 **Elérhető parancsok:**\n"
        "```text\n"
        "!csatlakozz     → Csatlakozik a hangcsatornához\n"
        "!play <nev>     → Lejátssza az adott rádiót\n"
        "!stop           → Leállítja a lejátszást\n"
        "!left           → Kilép a hangcsatornából\n"
        "!daily          → Azonnal lefuttatja a napi üzenetet (teszt, admin)\n"
        "!hp             → Megjeleníti ezt a súgót\n"
        "\n"
        "Elérhető rádiók: Rádió 1(radio1), Retro Rádió(retro), BaseFM(basefm), "
        "Best FM Debrecen(bestfm), Oxygen rádió(oxygen), Roxy Rádió(roxy)\n"
        "By Ray 2026 10.15"
        "```"
    )
    await ctx.send(help_text)


bot.run(TOKEN)
