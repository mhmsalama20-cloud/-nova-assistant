"""Assemble V2: list of (file, in, out) segments -> hard cuts with tiny audio fades, then SFX + loudnorm.
Usage: python3 assemble.py edl.json out.mp4
edl.json: {"segments": [{"file":..., "in":..., "out":..., "gain_db": 0}], "sfx": [{"file":..., "at":..., "trim_start":0, "dur":null, "gain_db":0, "fade_out":0.3}], "duration": 30}
"""
import json, subprocess, sys

edl = json.load(open(sys.argv[1]))
out = sys.argv[2]
segs, sfx = edl['segments'], edl.get('sfx', [])
inputs, fc = [], []
for i, s in enumerate(segs):
    inputs += ['-i', s['file']]
    sp = s.get('speed', 1.0)
    d = (s['out'] - s['in']) / sp
    g = 10 ** (s.get('gain_db', 0) / 20)
    fi, fo = s.get('afade_in', 0.04), s.get('afade_out', 0.04)
    vf_extra = s.get('vf', '')
    fc.append(f"[{i}:v]trim=start={s['in']}:end={s['out']},setpts=(PTS-STARTPTS)/{sp},fps=30,scale=1080:1920:flags=lanczos,setsar=1{(',' + vf_extra + ',setsar=1') if vf_extra else ''},format=yuv420p[v{i}]")
    if s.get('silent'):
        fc.append(f"anullsrc=r=48000:cl=stereo,atrim=0:{d}[a{i}]")
    else:
        speed_a = f",asetrate={int(48000 * sp)},aresample=48000" if sp != 1.0 else ''
        fc.append(f"[{i}:a]aresample=48000,aformat=channel_layouts=stereo,atrim=start={s['in']}:end={s['out']},asetpts=PTS-STARTPTS{speed_a},"
                  f"volume={g:.4f},afade=t=in:d={fi},afade=t=out:st={max(0, d - fo):.3f}:d={fo}[a{i}]")
n = len(segs)
fc.append(''.join(f'[v{i}][a{i}]' for i in range(n)) + f'concat=n={n}:v=1:a=1[v][abed]')
mix = ['[abed]']
for j, x in enumerate(sfx):
    k = n + j
    inputs += ['-i', x['file']]
    g = 10 ** (x.get('gain_db', 0) / 20)
    ms = int(x['at'] * 1000)
    chain = f"[{k}:a]aresample=48000,aformat=channel_layouts=stereo"
    if x.get('trim_start') or x.get('dur'):
        end = f":end={x.get('trim_start', 0) + x['dur']}" if x.get('dur') else ''
        chain += f",atrim=start={x.get('trim_start', 0)}{end},asetpts=PTS-STARTPTS"
    if x.get('fade_in'):
        chain += f",afade=t=in:d={x['fade_in']}"
    if x.get('fade_out') and x.get('dur'):
        chain += f",afade=t=out:st={x['dur'] - x['fade_out']}:d={x['fade_out']}"
    chain += f",volume={g:.4f},adelay={ms}|{ms}[s{j}]"
    fc.append(chain)
    mix.append(f'[s{j}]')
D = edl.get('duration', 30)
fc.append(''.join(mix) + f"amix=inputs={len(mix)}:normalize=0:duration=first,alimiter=limit=0.89:level=false,atrim=0:{D}[amix]")
cmd = ['ffmpeg', '-loglevel', 'error', '-y'] + inputs + ['-filter_complex', ';'.join(fc), '-map', '[v]', '-map', '[amix]',
       '-c:v', 'libx264', '-preset', 'slow', '-crf', '15', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-r', '30',
       '-c:a', 'pcm_s16le', 'stage_v2.mov']
subprocess.run(cmd, check=True)
# loudnorm 2-pass
r = subprocess.run(['ffmpeg', '-hide_banner', '-i', 'stage_v2.mov', '-af', 'loudnorm=I=-14:TP=-1.0:LRA=11:print_format=json', '-f', 'null', '-'],
                   capture_output=True, text=True).stderr
js = json.loads(r[r.rfind('{'):r.rfind('}') + 1])
af = (f"loudnorm=I=-14:TP=-1.0:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}:"
      f"measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true,aresample=48000")
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', 'stage_v2.mov', '-c:v', 'copy', '-af', af, '-c:a', 'aac', '-b:a', '320k',
                '-movflags', '+faststart', out], check=True)
print('measured', js['input_i'], js['input_tp'], js['input_lra'])
