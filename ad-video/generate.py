#!/usr/bin/env python3
"""Generate the ad's shots on Higgsfield.

pipeline mode (default): for every shot in shots.json, generate a keyframe image
from the reference photos, then animate it with an image-to-video model.
agent mode: hand the whole brief and the reference photos to the Higgsfield Agent.

Credentials come from HF_CREDENTIALS or HF_KEY ("key-id:key-secret"), or HF_API_KEY + HF_API_SECRET.
"""
import argparse
import json
import os
import pathlib
import re
import sys
import urllib.request

HERE = pathlib.Path(__file__).resolve().parent
OUT = HERE / 'output'
STATE_FILE = OUT / 'state.json'
RAW_PLACEHOLDER = re.compile(r'^\{(\w+)\}$')
EXTENSIONS = {
    'image': ('.png', '.jpg', '.jpeg', '.webp'),
    'video': ('.mp4', '.mov', '.webm'),
}


def load_config():
    cfg = json.loads((HERE / 'shots.json').read_text(encoding='utf-8'))
    if cfg['product_name'] == 'PRODUCT_NAME':
        sys.exit('Set "product_name" in shots.json first.')
    return cfg


def expand(text, cfg):
    """Fill {mother}, {baby}, {product}, {location}, {dialogue}, {dialogue_language}, {product_name} in a prompt."""
    values = dict(cfg['blocks'], product_name=cfg['product_name'], dialogue_language=cfg['dialogue_language'])
    values['dialogue'] = cfg['dialogue'].format_map(values)
    return text.format_map(values)


def fill_args(template, values):
    """Fill a model's argument template. "{name}" alone keeps the raw value (list, number)."""
    if isinstance(template, dict):
        return {k: fill_args(v, values) for k, v in template.items()}
    if isinstance(template, list):
        return [fill_args(v, values) for v in template]
    if isinstance(template, str):
        match = RAW_PLACEHOLDER.match(template)
        if match:
            return values[match.group(1)]
        return template.format_map(values)
    return template


def find_url(result, kind):
    """Pick the output URL of the given kind ('image' or 'video') out of a result JSON."""
    urls = []

    def walk(node):
        if isinstance(node, dict):
            for v in node.values():
                walk(v)
        elif isinstance(node, list):
            for v in node:
                walk(v)
        elif isinstance(node, str) and node.startswith('http'):
            urls.append(node)

    walk(result)
    for url in urls:
        if url.split('?')[0].lower().endswith(EXTENSIONS[kind]):
            return url
    if urls:
        return urls[0]
    raise RuntimeError(f'No {kind} URL in result: {json.dumps(result)[:500]}')


def download(url, dest_stem):
    suffix = pathlib.Path(url.split('?')[0]).suffix or '.bin'
    dest = dest_stem.with_suffix(suffix)
    dest.parent.mkdir(parents=True, exist_ok=True)
    urllib.request.urlretrieve(url, dest)
    return dest


def existing(dest_stem):
    return next(iter(sorted(dest_stem.parent.glob(dest_stem.name + '.*'))), None)


def run_model(model, args, label):
    import higgsfield_client

    print(f'  -> {label}: {model}')
    controller = higgsfield_client.submit(model, arguments=args)
    status = None
    for status in controller.poll_request_status():
        pass
    if not isinstance(status, higgsfield_client.Completed):
        raise RuntimeError(f'{label} ended with {type(status).__name__} (request {controller.request_id})')
    return controller.get()


def load_state():
    if STATE_FILE.exists():
        return json.loads(STATE_FILE.read_text())
    return {'refs': {}, 'keyframes': {}}


def save_state(state):
    OUT.mkdir(exist_ok=True)
    STATE_FILE.write_text(json.dumps(state, indent=2))


def ref_urls(shot, state):
    urls = []
    for ref in shot['refs']:
        key = ref[1:] if ref.startswith('@') else ref
        table = state['keyframes'] if ref.startswith('@') else state['refs']
        if key not in table:
            raise RuntimeError(f'{shot["id"]} needs {ref}, which has not been generated yet')
        urls.append(table[key])
    return urls


def pipeline(cfg, args):
    state = load_state()
    shots = [s for s in cfg['shots'] if not args.only or s['id'] in args.only]
    base = {'aspect_ratio': cfg['aspect_ratio'], 'negative': cfg['negative']}

    if args.dry_run:
        state['refs'] = {name: f'<upload {path}>' for name, path in cfg['references'].items()}
        state['keyframes'] = {s['id']: f'<keyframe {s["id"]}>' for s in cfg['shots']}
    else:
        import higgsfield_client

        for name, path in cfg['references'].items():
            if name not in state['refs']:
                print(f'Uploading {path}')
                state['refs'][name] = higgsfield_client.upload_file(HERE / path)
        save_state(state)

    for shot in shots:
        sid = shot['id']
        print(f'\n[{sid}] {shot["title"]}')

        if args.stage in ('keyframes', 'all'):
            dest = OUT / 'keyframes' / sid
            if existing(dest) and not args.force and sid in state['keyframes']:
                print(f'  keyframe exists: {existing(dest).name}')
            else:
                kf_args = fill_args(cfg['models']['keyframe']['args'], dict(
                    base,
                    prompt=f'{expand(shot["keyframe"], cfg)} {cfg["style"]}',
                    image_urls=ref_urls(shot, state),
                ))
                if args.dry_run:
                    print(json.dumps({'model': cfg['models']['keyframe']['id'], 'arguments': kf_args},
                                     ensure_ascii=False, indent=2))
                else:
                    result = run_model(cfg['models']['keyframe']['id'], kf_args, 'keyframe')
                    url = find_url(result, 'image')
                    state['keyframes'][sid] = url
                    save_state(state)
                    print(f'  saved {download(url, dest).relative_to(HERE)}')

        if args.stage in ('videos', 'all'):
            dest = OUT / 'clips' / sid
            model = shot.get('video_model', cfg['models']['video'])
            if existing(dest) and not args.force:
                print(f'  clip exists: {existing(dest).name}')
                continue
            if model['id'].startswith('SET_'):
                sys.exit('Set models.video.id in shots.json to an image-to-video model id from cloud.higgsfield.ai.')
            if sid not in state['keyframes']:
                sys.exit(f'{sid} has no keyframe yet; run with --stage keyframes first.')
            vid_args = fill_args(model['args'], dict(
                base,
                prompt=f'{expand(shot["motion"], cfg)} {cfg["style"]}',
                image_url=state['keyframes'][sid],
                duration=shot['duration'],
            ))
            if args.dry_run:
                print(json.dumps({'model': model['id'], 'arguments': vid_args}, ensure_ascii=False, indent=2))
                continue
            result = run_model(model['id'], vid_args, 'video')
            print(f'  saved {download(find_url(result, "video"), dest).relative_to(HERE)}')


def agent_brief(cfg, ref_urls_by_name):
    lines = [
        'Produce a photorealistic vertical (%s) TV commercial, about 30 seconds, as separate video clips, '
        'one per shot below. Keep the mother, the baby and the hoodie IDENTICAL to the reference photos in every '
        'shot: same faces, no identity drift. Facial expressions must be real and readable.' % cfg['aspect_ratio'],
        '',
        'Reference photos:',
    ]
    lines += [f'- {name.upper()}: {url}' for name, url in ref_urls_by_name.items()]
    lines += ['', f'Visual style for every shot: {cfg["style"]}', f'Avoid: {cfg["negative"]}', '']
    for shot in cfg['shots']:
        lines += [
            f'{shot["id"]} ({shot["duration"]}s):',
            f'  Frame: {expand(shot["keyframe"], cfg)}',
            f'  Action: {expand(shot["motion"], cfg)}',
        ]
    lines += ['', 'When done, reply with one video URL per shot, in order.']
    return '\n'.join(lines)


def agent(cfg, args):
    if args.dry_run:
        refs = {name: f'<upload {path}>' for name, path in cfg['references'].items()}
        print(agent_brief(cfg, refs))
        return

    from higgsfield_client import SyncClient

    client = SyncClient()
    refs = {}
    for name, path in cfg['references'].items():
        path = HERE / path
        refs[name] = client.agents.media.upload(path.read_bytes(), extension=path.suffix.lstrip('.'), type='image')
    session = client.agents.sessions.create()
    print(f'Agent session {session.session_id}')

    def on_question(question):
        print(f'\nAgent asks: {question}')
        if sys.stdin.isatty():
            return input('Your answer: ')
        return 'Follow the brief exactly. Photorealistic, identical faces to the references.'

    result = client.agents.sessions.run(session.session_id, agent_brief(cfg, refs),
                                        on_question=on_question, timeout=args.timeout)
    print(f'\nStatus: {result.status}\n{result.text}')
    for i, url in enumerate(result.asset_urls or [], 1):
        print(f'saved {download(url, OUT / "agent" / f"asset{i:02d}").relative_to(HERE)}')


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--mode', choices=('pipeline', 'agent'), default='pipeline')
    parser.add_argument('--stage', choices=('keyframes', 'videos', 'all'), default='all',
                        help='pipeline mode: generate keyframes only, videos only, or both')
    parser.add_argument('--only', type=lambda s: s.split(','), help='comma-separated shot ids, e.g. S06,S08')
    parser.add_argument('--force', action='store_true', help='regenerate shots that already exist')
    parser.add_argument('--dry-run', action='store_true', help='print the requests without calling Higgsfield')
    parser.add_argument('--timeout', type=float, default=3600, help='agent mode: seconds to wait for the turn')
    args = parser.parse_args()

    # The SDK reads HF_KEY; accept the HF_CREDENTIALS name used in Higgsfield's docs too.
    if os.environ.get('HF_CREDENTIALS') and not os.environ.get('HF_KEY'):
        os.environ['HF_KEY'] = os.environ['HF_CREDENTIALS']

    cfg = load_config()
    if args.mode == 'agent':
        agent(cfg, args)
    else:
        pipeline(cfg, args)


if __name__ == '__main__':
    main()
