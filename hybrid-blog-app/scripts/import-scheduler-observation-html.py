"""Package the integrated cache timeline and full trace, with lazy window decompression."""
import argparse, base64, gzip, hashlib, json, re
from pathlib import Path

ap=argparse.ArgumentParser();ap.add_argument('source',type=Path);args=ap.parse_args()
root=Path(__file__).resolve().parents[1]
out=root/'public/demos/chunk-scheduler-20260923/observations/cache-timeline.html'
source=args.source
raw=json.loads((source/'timeline-data.json').read_text())
start=raw['times'][0]
data={k:raw[k] for k in ['labels','weightLabels','currentWeightLabels','series','weightSeries','currentWeightSeries','currentWeightSteps','availability','pools']}
data['times']=[t-start for t in raw['times']]
data['replicas']=[f'Engine-{i+1}' for i in range(len(raw['replicas']))]
data['windows']=[{'start':w['start']-start,'end':w['end']-start} for w in raw['windows']]
pack=lambda v:json.dumps(v,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c')
def compress(v):return base64.b64encode(gzip.compress(pack(v).encode(),mtime=0)).decode()
alias={r:data['replicas'][i] for i,r in enumerate(raw['replicas'])}
alias.update({'LLMServer_actor_rollout_'+r:v for r,v in list(alias.items())})
counters={}
def add_alias(value,prefix):
    if value and value not in alias:
        counters[prefix]=counters.get(prefix,0)+1
        alias[value]=f'{prefix}-{counters[prefix]:04}'
def clean(v):
    if isinstance(v,dict):return {k:clean(x) for k,x in v.items()}
    if isinstance(v,list):return [clean(x) for x in v]
    if isinstance(v,str):return alias.get(v,v)
    return v
source_hashes={name:hashlib.sha256((source/name).read_bytes()).hexdigest() for name in ['index.html','timeline-data.json']}
packed_details=[]
seen_times=[]
for wi,window in enumerate(raw['windows']):
    name=f'detail-{wi:03}.json';content=(source/name).read_bytes()
    source_hashes[name]=hashlib.sha256(content).hexdigest()
    detail=json.loads(content)
    times=set(detail['times']);seen_times.extend(detail['times'])
    for v in detail['sessions']:add_alias(v,'cache')
    for row in detail['identities']:
        add_alias(row.get('task_id'),'task');add_alias(row.get('cache_session_id'),'session')
        for v in row.get('task_ids',[]):add_alias(v,'task')
        # Keep metadata for this window; the source repeats full-history metadata.
        row['task_samples']={str(int(t)-start):v for t,v in row.get('task_samples',{}).items() if int(t) in times}
        row.pop('identity_source',None)
        for v in row['task_samples'].values():
            add_alias(v.get('task_id'),'task');v.pop('observed_at',None)
    detail=clean({k:detail[k] for k in ['times','replicas','sessions','identities','hostPairs','devPairs']})
    detail['times']=[t-start for t in detail['times']]
    packed_details.append(compress(detail))
assert seen_times==raw['times'], 'Detail windows must cover all timeline samples exactly once'
assert len(packed_details)==len(data['windows'])
page=(source/'index.html').read_text()
def change(a,b):
    global page
    assert a in page,a[:100]
    page=page.replace(a,b)
change('<title>Cache 历史时间轴</title>','<title>GPU / Host 缓存时间轴</title>')
change('<h1>Cache 历史时间轴</h1>','<h1>GPU / Host 缓存时间轴</h1>')
page=re.sub(r'<p><a href="completed-turns.html">.*?</a></p>','',page)
change('type=datetime-local','type=number')
change('type="datetime-local"','type="number"')
change('开始时间','开始秒数');change('结束时间','结束秒数')
change("const fmt=t=>new Date(t*1000).toLocaleString('zh-CN',{timeZone:'Asia/Shanghai',hour12:false});const inputTime=t=>new Date((t+28800)*1000).toISOString().slice(0,19);", "const fmt=t=>'t = '+t.toFixed(0)+' s';const inputTime=t=>t;")
change("fmt(t).split(' ')[1]","t.toFixed(0)+'s'")
change("Date.parse($('startTime').value+'+08:00')/1000","Number($('startTime').value)")
change("Date.parse($('endTime').value+'+08:00')/1000","Number($('endTime').value)")
change("'Trial '+D.trial_id+' / run '+D.run_id+' · '+fmt(lo)+' — '+fmt(hi)+' · '+D.times.length+' 帧 · 北京时间'", "D.times.length+' 帧 · '+D.windows.length+' 个窗口 · '+((D.times.at(-1)-D.times[0])/3600).toFixed(2)+' 小时 · GPU / Host 长程观测'")
page=re.sub(r'<p class="muted">北京时间.*?</p>', '<p class="muted">横向拖选主图或下方总览可缩放；滚轮围绕鼠标位置缩放。点击主图或切换帧可查看明细。橙色虚线标记上报不完整的帧，悬停可查看已上报部分。</p>',page)
page=re.sub(r'<p class="muted">Weight version.*?</p>', '<p class="muted">当前版本取每个 Engine 截至该帧观测到的最大 step。按 bucket 分组时，已关联的缓存按 task 最近一次请求的 request_index 分类，其余映射状态单独成组。</p>',page)
change('Turn bucket','Request-index bucket');change('Turn index','Request index')
change("$('legend').innerHTML=labels.map((l,i)=>'<span style=", "$('legend').innerHTML=labels.map((l,i)=>weight&&!D.weightSeries[$('tier').value].some(rep=>rep[i].some(v=>v>0))?'':'<span style=")
change('turn index 表示 task 最新已接受请求序号','request index 表示 task 最新已接受请求序号')
change("const response=await fetch('detail-'+String(wi).padStart(3,'0')+'.json');", 'const response={ok:true,json:()=>unpack(PACKED_DETAILS[wi])};')
change("fetch('timeline-data.json').then(r=>r.json()).then(data=>", 'unpack(PACKED_DATA).then(data=>')
change('<script>','<script>\nconst PACKED_DATA='+json.dumps(compress(data))+';\nconst PACKED_DETAILS='+json.dumps(packed_details)+';\n'+"async function unpack(encoded){const bytes=Uint8Array.from(atob(encoded),c=>c.charCodeAt(0));const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));return JSON.parse(await new Response(stream).text());}\n")
# Series, availability and capacity values are retained without resampling.
for key in ['series','weightSeries','currentWeightSeries','currentWeightSteps','availability','pools']:
    assert data[key]==raw[key]
assert 'fetch(' not in page and 'completed-turns.html' not in page
out.write_text(page)
provenance={'source':'integrated-report cache timeline renderer, complete history','frames':len(data['times']),'windows':len(data['windows']),'seconds':data['times'][-1],'source_start_epoch':start,'source_end_epoch':raw['times'][-1],'source_hashes':source_hashes,'output_sha256':hashlib.sha256(out.read_bytes()).hexdigest()}
(root/'../work/chunk-scheduler-update/cache-timeline-provenance.json').write_text(json.dumps(provenance,indent=2)+'\n')
print(f'Packaged {len(data["times"])} frames / {len(packed_details)} windows; {out.stat().st_size:,} bytes: {out}')
