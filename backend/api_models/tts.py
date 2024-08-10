import os
from TTS.api import TTS

def text_to_speech(text, output_path):
    # Use GPU if available
    device = "cuda" if torch.cuda.is_available() else "cpu"
    
    # Initialize TTS
    tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2").to(device)

    # Generate speech
    tts.tts_to_file(text=text, file_path=output_path, speaker_wav="path/to/speaker_audio.wav")

    return output_path

def process_summaries(summaries):
    audio_files = []
    for i, summary in enumerate(summaries):
        text = summary['summary']
        output_path = f"audio_summary_{i}.wav"
        audio_file = text_to_speech(text, output_path)
        audio_files.append(audio_file)
    return audio_files