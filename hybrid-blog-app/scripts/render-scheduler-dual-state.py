"""Static explanations of execution state and session-cache residence."""
from html import escape
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / 'public/demos/chunk-scheduler-20260923/dual-state'
OUT.mkdir(parents=True, exist_ok=True)
INK, MUTED, BLUE, PURPLE = '#24374b', '#66798d', '#2563a6', '#7450a5'

class Figure:
    def __init__(self, height, title, desc):
        self.p = [f'''<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="{height}" viewBox="0 0 1000 {height}" role="img" aria-labelledby="title desc"><title id="title">{escape(title)}</title><desc id="desc">{escape(desc)}</desc><rect width="1000" height="{height}" rx="14" fill="white"/><g font-family="-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif">''']
        self.text(30, 40, title, 26, weight=700)
        self.text(30, 74, desc, 18, MUTED)
    def text(self,x,y,t,size=20,color=INK,anchor='start',weight=400):
        self.p.append(f'<text x="{x}" y="{y}" fill="{color}" font-size="{size}" text-anchor="{anchor}" font-weight="{weight}">{escape(t)}</text>')
    def rect(self,x,y,w,h,fill,stroke='none'):
        self.p.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="8" fill="{fill}" stroke="{stroke}"/>')
    def line(self,x1,y1,x2,y2,color='#cbd6e1',dash=False):
        self.p.append(f'<path d="M{x1} {y1} L{x2} {y2}" stroke="{color}" stroke-width="2"'+(' stroke-dasharray="5 5"' if dash else '')+'/>')
    def finish(self,name):
        (OUT/name).write_text('\n'.join(self.p+['</g></svg>']))

f=Figure(620,'Dual state：同一个候选，同时回答两个问题','候选关联一条顺序轨迹和一个可复用的 session；状态写成 S = (E, C)。')
f.rect(30,105,940,172,'#f0f6fc')
f.text(50,137,'E · 执行状态',22,BLUE,weight=700)
f.text(270,137,'当前 LLM 请求走到了哪一步？',21,BLUE)
for x,code,title,desc in [(55,'W','等待输入','例如正在等待 tool 返回'),(360,'R','输入就绪','等待缓存准备与执行准入'),(665,'X','正在执行','当前 LLM 请求占用 slot')]:
    f.rect(x,158,280,97,'white','#c9d9e9')
    f.text(x+16,190,code+'  '+title,22,BLUE,weight=600)
    f.text(x+16,225,desc,18)
f.rect(30,297,940,173,'#f6f2fa')
f.text(50,330,'C · 缓存状态',22,PURPLE,weight=700)
f.text(270,330,'session 的有效前缀副本在哪里？',21,PURPLE)
for x,code,title in [(55,'∅','两层均无有效副本'),(285,'G','仅 GPU'),(515,'H','仅 Host'),(745,'GH','GPU 与 Host 都有')]:
    f.rect(x,350,210,97,'white','#dbcee9')
    f.text(x+105,382,code,25,PURPLE,'middle',600)
    f.text(x+105,420,title,18,anchor='middle')
f.text(50,514,'(R, H)',23,BLUE,weight=700)
f.text(200,514,'输入已到；前缀在 Host，先恢复到 GPU，再等待准入。',20)
f.text(50,555,'(W, G)',23,PURPLE,weight=700)
f.text(200,555,'正在等 tool；GPU 仍保留前缀，此时没有执行中的请求。',20)
f.text(50,596,'(R, GH)',23,BLUE,weight=700)
f.text(200,596,'输入与 GPU 前缀已就绪；获得执行名额后进入 X。',20)
f.finish('01-two-dimensions.svg')

f=Figure(900,'沿着一条轨迹看：每一步改变哪一维？','从一次 LLM 执行，经过 tool 等待与缓存搬移，再进入下一次 LLM 执行。')
f.rect(30,101,940,66,'#edf2f7')
for x,t in [(55,'到达这一步的事件'),(407,'E · 执行状态'),(650,'C · 有效缓存副本'),(909,'执行中')]:
    f.text(x,129,t,18,anchor='middle' if x>55 else 'start',weight=600)
f.text(592,154,'GPU',16,BLUE,'middle');f.text(705,154,'Host',16,PURPLE,'middle');f.text(909,154,'slot',16,MUTED,'middle')
rows=[
('① 当前 LLM request 执行中','X · 执行',True,False,'G',1,False,False),
('② 本轮结束，开始等 tool','W · 等待',True,False,'G',0,True,False),
('③ GPU → Host 副本完成','W · 等待',True,True,'GH',0,False,True),
('④ 回收 GPU 副本','W · 等待',False,True,'H',0,False,True),
('⑤ tool 返回，新输入就绪','R · 就绪',False,True,'H',0,True,False),
('⑥ Promote 完成','R · 就绪',True,True,'GH',0,False,True),
('⑦ 获得执行名额，Run','X · 执行',True,True,'GH',1,True,False),
]
for i,(event,e,g,h,c,slot,ec,cc) in enumerate(rows):
    y=181+i*86
    if i%2==0:f.rect(30,y,940,74,'#fafbfd')
    f.text(50,y+43,event,19)
    f.rect(330,y+12,154,50,'#e7f1fc' if ec else '#f0f3f6',BLUE if ec else '#d6dfe7')
    f.text(407,y+44,e,21,BLUE if ec else INK,'middle',600 if ec else 400)
    f.rect(520,y+7,310,60,'#f3edf9' if cc else '#f9f7fb',PURPLE if cc else '#dfd7e9')
    for x,present,color in [(592,g,BLUE),(705,h,PURPLE)]:
        f.rect(x-43,y+18,86,36,'#e2ebf8' if present and color==BLUE else '#eae0f5' if present else '#eef1f4')
        f.text(x,y+43,'有效' if present else '—',18,color if present else MUTED,'middle')
    f.text(797,y+44,c,20,PURPLE,'middle',600)
    f.text(909,y+44,str(slot),23,BLUE if slot else MUTED,'middle',600)
f.text(45,820,'蓝色边框：执行状态改变    紫色边框：缓存位置改变',19)
f.text(45,855,'② 归还 slot，GPU 前缀仍在；⑤ 输入就绪，前缀仍在 Host；⑥ 恢复完成，尚未 Run。',18)
f.text(45,884,'图中 slot 只显示正在执行的名额；调度账本还会计入预留名额。',17,MUTED)
f.finish('02-one-trajectory.svg')
print(f'Rendered 2 SVGs in {OUT}')
