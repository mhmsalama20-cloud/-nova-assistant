#!/usr/bin/env python3
"""Cut the generated clips (output/clips/S01.mp4 ...) into the final ad with ffmpeg.

Each shot is trimmed to its "edit_seconds" from shots.json, scaled/cropped to the
ad's aspect ratio, and joined in order. Optional: an end card image (logo / product
name) and a background music track mixed under the dialogue.
"""
import argparse
import json
import pathlib
import subprocess
import sys

HERE = pathlib.Path(__file__).resolve().parent
SIZES = {'9:16': (1080, 1920), '16:9': (1920, 1080), '1:1': (1080, 1080), '4:5': (1080, 1350)}
FPS = 30


def has_audio(path):
    out = subprocess.run(
        ['ffprobe', '-v', 'error', '-select_streams', 'a', '-show_entries', 'stream=index', '-of', 'csv=p=0', str(path)],
        capture_output=True, text=True, check=True,
    ).stdout
    return bool(out.strip())


def duration(path):
    out = subprocess.run(
        ['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(path)],
        capture_output=True, text=True, check=True,
    ).stdout
    return float(out)


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--clips', type=pathlib.Path, default=HERE / 'output' / 'clips')
    parser.add_argument('--out', type=pathlib.Path, default=HERE / 'output' / 'final.mp4')
    parser.add_argument('--endcard', type=pathlib.Path, help='image shown at the end (logo + product name)')
    parser.add_argument('--endcard-seconds', type=float, default=2.5)
    parser.add_argument('--music', type=pathlib.Path, help='background music, mixed under the dialogue')
    parser.add_argument('--music-volume', type=float, default=0.25)
    args = parser.parse_args()

    cfg = json.loads((HERE / 'shots.json').read_text(encoding='utf-8'))
    width, height = SIZES[cfg['aspect_ratio']]
    video_fmt = (f'scale={width}:{height}:force_original_aspect_ratio=increase,crop={width}:{height},'
                 f'fps={FPS},setsar=1,format=yuv420p')
    audio_fmt = 'aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo'

    inputs, filters, segments = [], [], []
    total = 0.0
    n_inputs = 0

    def add_input(*input_args):
        nonlocal n_inputs
        inputs.extend(input_args)
        n_inputs += 1
        return n_inputs - 1

    for shot in cfg['shots']:
        clip = next(iter(sorted(args.clips.glob(shot['id'] + '.*'))), None)
        if clip is None:
            sys.exit(f'Missing clip for {shot["id"]} in {args.clips}')
        i = add_input('-i', str(clip))
        seconds = min(shot.get('edit_seconds', shot['duration']), duration(clip))
        total += seconds
        filters.append(f'[{i}:v]trim=0:{seconds},setpts=PTS-STARTPTS,{video_fmt}[v{i}]')
        if has_audio(clip):
            filters.append(f'[{i}:a]atrim=0:{seconds},asetpts=PTS-STARTPTS,{audio_fmt}[a{i}]')
        else:
            filters.append(f'anullsrc=r=48000:cl=stereo,atrim=0:{seconds},{audio_fmt}[a{i}]')
        segments.append(f'[v{i}][a{i}]')

    if args.endcard:
        i = add_input('-loop', '1', '-t', str(args.endcard_seconds), '-i', str(args.endcard))
        total += args.endcard_seconds
        filters.append(
            f'[{i}:v]scale={width}:{height}:force_original_aspect_ratio=decrease,'
            f'pad={width}:{height}:(ow-iw)/2:(oh-ih)/2:color=0xF3EDE3,fps={FPS},setsar=1,format=yuv420p,'
            f'fade=t=in:st=0:d=0.4[v{i}]'
        )
        filters.append(f'anullsrc=r=48000:cl=stereo,atrim=0:{args.endcard_seconds},{audio_fmt}[a{i}]')
        segments.append(f'[v{i}][a{i}]')

    filters.append(f'{"".join(segments)}concat=n={len(segments)}:v=1:a=1[vcat][acat]')
    filters.append(f'[vcat]fade=t=in:st=0:d=0.3,fade=t=out:st={total - 0.4:.2f}:d=0.4[vout]')
    if args.music:
        i = add_input('-stream_loop', '-1', '-i', str(args.music))
        filters.append(f'[{i}:a]{audio_fmt},volume={args.music_volume},atrim=0:{total}[music]')
        filters.append('[acat][music]amix=inputs=2:duration=first:normalize=0[amix]')
        filters.append(f'[amix]afade=t=out:st={total - 0.6:.2f}:d=0.6[aout]')
    else:
        filters.append(f'[acat]afade=t=out:st={total - 0.6:.2f}:d=0.6[aout]')

    args.out.parent.mkdir(parents=True, exist_ok=True)
    cmd = ['ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', *inputs,
           '-filter_complex', ';'.join(filters), '-map', '[vout]', '-map', '[aout]',
           '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-c:a', 'aac', '-b:a', '192k',
           '-movflags', '+faststart', str(args.out)]
    subprocess.run(cmd, check=True)
    print(f'Wrote {args.out} ({total:.1f}s)')


if __name__ == '__main__':
    main()
