# V1 assembly + sound mix. Run inside a work dir that holds main.mp4 (Wan clip) and endcard.mp4.
# Cut point: frame 758 of main.mp4 = first black frame after the eye push-in.
set -e
SFX="$(cd "$(dirname "$0")/../assets/sfx" && pwd)"
FC="[0:v]trim=end_frame=758,setpts=PTS-STARTPTS,format=yuv420p[mv];[1:v]setpts=PTS-STARTPTS,format=yuv420p[ev];[mv][ev]concat=n=2:v=1:a=0[v];
[0:a]aresample=48000,aformat=channel_layouts=stereo,atrim=0:25.267,asetpts=PTS-STARTPTS,volume=enable='between(t,0,4.5)':volume=2.8,volume=enable='between(t,13.4,21.45)':volume=4,afade=t=out:st=25.237:d=0.03,apad=whole_dur=30[a0];
[2:a]aresample=48000,aformat=channel_layouts=stereo,atrim=start=0.33,asetpts=PTS-STARTPTS,afade=t=out:st=1.35:d=0.4,volume=0.9,adelay=25300|25300[a1];
[3:a]aresample=48000,aformat=channel_layouts=stereo,afade=t=out:st=2.45:d=0.45,adelay=27017|27017[a2];
[4:a]aresample=48000,aformat=channel_layouts=stereo,atrim=0.7:2.0,asetpts=PTS-STARTPTS,afade=t=in:d=0.2,volume=2.0,adelay=23967|23967[a3];
[5:a]aresample=48000,aformat=channel_layouts=stereo,afade=t=out:st=1.6:d=0.8,volume=0.6,adelay=21300|21300[a4];
[a0][a1][a2][a3][a4]amix=inputs=5:normalize=0:duration=first,alimiter=limit=0.89:level=false,atrim=0:30[amix]"
ffmpeg -loglevel error -y -i main.mp4 -i endcard.mp4 -i "$SFX/sub_hit.mp3" -i "$SFX/logo_impact.mp3" -i "$SFX/whoosh.mp3" -i "$SFX/fire_ignite.mp3" \
  -filter_complex "$FC" -map "[v]" -map "[amix]" -c:v libx264 -preset slow -crf 16 -profile:v high -pix_fmt yuv420p -r 30 \
  -c:a pcm_s16le stage1.mov
# two-pass loudness normalisation to -14 LUFS (Instagram)
J=$(ffmpeg -hide_banner -i stage1.mov -af loudnorm=I=-14:TP=-1.0:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
II=$(echo "$J" | python3 -c "import json,sys;d=json.load(sys.stdin);print(d['input_i'],d['input_tp'],d['input_lra'],d['input_thresh'],d['target_offset'])")
read I TP LRA TH OFF <<< "$II"
echo "measured: I=$I TP=$TP LRA=$LRA"
ffmpeg -loglevel error -y -i stage1.mov -c:v copy -af "loudnorm=I=-14:TP=-1.0:LRA=11:measured_I=$I:measured_TP=$TP:measured_LRA=$LRA:measured_thresh=$TH:offset=$OFF:linear=true,aresample=48000" \
  -c:a aac -b:a 320k -movflags +faststart OrganicWarfare_Viking_30s.mp4
ffprobe -v error -show_entries format=duration -show_entries stream=codec_name,width,height,r_frame_rate -of compact OrganicWarfare_Viking_30s.mp4
ffmpeg -hide_banner -i OrganicWarfare_Viking_30s.mp4 -af ebur128=peak=true -f null - 2>&1 | grep -A12 "Summary" | grep -E "I:|Peak:|LRA:"
