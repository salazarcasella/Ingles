from pathlib import Path
import asyncio
import subprocess
import edge_tts
from pydub import AudioSegment

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "assets" / "v8" / "audio"
OUT.mkdir(parents=True, exist_ok=True)
VOICE = "en-US-JennyNeural"
RATE = "-8%"

QUESTIONS = [
    ("Where do you sleep?", ["kitchen", "bedroom", "bathroom"]),
    ("Where do we cook food?", ["living room", "kitchen", "bedroom"]),
    ("Where do you take a bath?", ["bathroom", "kitchen", "living room"]),
    ("Where do you sit on a sofa?", ["bedroom", "living room", "bathroom"]),
    ("The ball is blank the table.", ["in", "on", "under"]),
    ("The rabbit is blank the chair.", ["on", "under", "in"]),
    ("The rabbit is blank the bag.", ["under", "in", "on"]),
    ("The rabbit is blank the closet.", ["on", "under", "in"]),
    ("Where is the computer?", ["It's on the desk.", "They're on the desk.", "It's under the desk."]),
    ("Where are the shoes?", ["It's under the bed.", "They're under the bed.", "They're in the bag."]),
    ("Where is the ball?", ["It's in the closet.", "It's on the closet.", "They're in the closet."]),
    ("Where are the books?", ["They're on the bed.", "It's on the bed.", "They're under the bed."]),
    ("His pants are blank.", ["green", "brown", "yellow"]),
    ("His shoes are blank.", ["red", "brown", "green"]),
    ("Her dress is blank.", ["yellow", "red", "blue"]),
    ("Her shoes are blank.", ["brown", "yellow", "red"]),
    ("Complete the sentence. Her blank is orange.", ["shirt", "shoes", "pants"]),
    ("Complete the sentence. His blank are black.", ["shirt", "shoes", "dress"]),
    ("Where are the pants?", ["They're in the closet.", "They're under the closet.", "It's in the closet."]),
    ("Look at the room. Which sentence is correct?", ["The computer is on the desk.", "The cat is on the bed.", "The book is under the chair."]),
]

async def synth(text: str, destination: Path):
    temp = destination.with_suffix(".raw.mp3")
    communicator = edge_tts.Communicate(text=text, voice=VOICE, rate=RATE)
    await communicator.save(str(temp))
    audio = AudioSegment.silent(duration=320) + AudioSegment.from_file(temp)
    audio.export(destination, format="mp3", bitrate="96k")
    temp.unlink(missing_ok=True)

async def main():
    voices = await edge_tts.list_voices()
    voice = next((v for v in voices if v.get("ShortName") == VOICE), None)
    if not voice or voice.get("Gender") != "Female":
        raise RuntimeError(f"Female voice {VOICE} not available")

    await synth(
        "Hello! Welcome to My English Adventure. I am your English guide. I will read the complete question and all three answer choices. Press Listen whenever you want to hear them again.",
        OUT / "test.mp3",
    )
    await synth("Excellent! Great job!", OUT / "correct.mp3")
    await synth("Almost! Look carefully and try again.", OUT / "tryagain.mp3")

    for number, (question, options) in enumerate(QUESTIONS, start=1):
        text = (
            f"Question {number}. {question} "
            f"Option A. {options[0]} "
            f"Option B. {options[1]} "
            f"Option C. {options[2]}"
        )
        await synth(text, OUT / f"q{number:02d}.mp3")

    # Basic validation before the workflow-level ffprobe validation.
    expected = [OUT / "test.mp3", OUT / "correct.mp3", OUT / "tryagain.mp3"] + [OUT / f"q{i:02d}.mp3" for i in range(1, 21)]
    missing = [str(p) for p in expected if not p.exists() or p.stat().st_size < 5000]
    if missing:
        raise RuntimeError(f"Missing or invalid audio files: {missing}")
    print(f"Generated {len(expected)} MP3 files with {VOICE}.")

if __name__ == "__main__":
    asyncio.run(main())
