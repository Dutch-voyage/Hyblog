"""Render the article's three communication contracts as static sequence diagrams."""
from html import escape
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / 'public/demos/chunk-scheduler-20260923/communication'
OUT.mkdir(parents=True, exist_ok=True)
INK, BLUE, GREEN, MUTED = '#24374b', '#2563a6', '#167568', '#65788c'

class Sequence:
    def __init__(self, title, subtitle, height, actors):
        self.height = height
        self.parts = [f'''<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="{height}" viewBox="0 0 1000 {height}" role="img" aria-labelledby="title desc">
<title id="title">{escape(title)}</title><desc id="desc">{escape(subtitle)}</desc>
<defs><marker id="arrow" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9" fill="{BLUE}"/></marker><marker id="reply" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9" fill="{GREEN}"/></marker></defs>
<rect width="1000" height="{height}" rx="14" fill="#fff"/>
<g font-family="-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif">''']
        self.text(30, 40, title, size=26, weight=700)
        self.text(30, 74, subtitle, size=18, color=MUTED)
        for x, label in actors:
            self.rect(x - 110, 96, 220, 46, '#eaf1f8', '#bdccdc')
            self.text(x, 126, label, anchor='middle', size=21, weight=600)
            self.parts.append(f'<path d="M{x} 142 V{height-55}" stroke="#a9b8c8" stroke-dasharray="6 6"/>')
    def text(self, x, y, label, size=20, color=INK, anchor='start', weight=400):
        self.parts.append(f'<text x="{x}" y="{y}" font-size="{size}" fill="{color}" text-anchor="{anchor}" font-weight="{weight}">{escape(label)}</text>')
    def rect(self, x, y, width, height, fill, stroke='none', radius=6):
        self.parts.append(f'<rect x="{x}" y="{y}" width="{width}" height="{height}" rx="{radius}" fill="{fill}" stroke="{stroke}"/>')
    def arrow(self, x1, x2, y, label, reply=False):
        color, marker = (GREEN, 'reply') if reply else (BLUE, 'arrow')
        dash = ' stroke-dasharray="7 5"' if reply else ''
        self.parts.append(f'<path d="M{x1} {y} H{x2}" fill="none" stroke="{color}" stroke-width="2" marker-end="url(#{marker})"{dash}/>')
        mid = (x1 + x2) / 2
        # Opaque label background keeps text legible over lifelines.
        self.parts.append(f'<text x="{mid}" y="{y-10}" font-size="19" fill="{color}" text-anchor="middle" stroke="white" stroke-width="5" paint-order="stroke">{escape(label)}</text>')
    def note(self, x, y, width, lines, green=False):
        self.rect(x, y, width, 18 + 28*len(lines), '#eaf6f2' if green else '#f0f4f8', '#c4ddd5' if green else '#d5dfe9')
        for i, line in enumerate(lines):
            self.text(x + width/2, y + 28 + i*28, line, size=19, anchor='middle')
    def band(self, y, label):
        self.rect(30, y, 940, 36, '#edf2f7')
        self.text(45, y + 25, label, size=19, weight=600)
    def finish(self, name, footer):
        self.text(30, self.height - 20, footer, size=17, color=MUTED)
        self.parts.append('</g></svg>')
        (OUT/name).write_text('\n'.join(self.parts), encoding='utf-8')

s = Sequence('01  原始模式：Proxy 的两个独立 loop', '时间向下；上下两条流程各自循环，消息可以交错。', 840,
             [(140, 'Proxy'), (535, '所有 ready Engines'), (865, 'RequestManager')])
s.band(162, '并行分支 ①  dispatch loop')
s.arrow(140, 535, 237, '主动查询全局 load')
s.arrow(535, 140, 289, '各 Engine 返回负载', True)
s.note(35, 308, 270, ['选择 request 归属'])
s.arrow(140, 535, 403, 'dispatch：交付 request 数据')
s.band(444, '并行分支 ②  update loop')
s.arrow(140, 535, 519, '触发进度 / 完成结果同步')
s.arrow(535, 865, 577, '提交 request 更新')
s.arrow(865, 535, 631, '确认更新', True)
s.arrow(535, 140, 689, '返回同步结果', True)
s.note(215, 718, 570, ['每个 loop 等待自己的 RPC，再进入下一轮'])
s.finish('01-proxy-loops.svg', '实线：发起调用 / 交付数据    虚线：返回 / 确认    Engine 的本地 scheduler 持续执行')

s = Sequence('02  第一版：Proxy 发起，两次握手', '一个控制轮依次经过：观测同步 → 决策 → 安装确认 → 数据交付。', 960,
             [(140, 'Proxy'), (535, '所有 ready Engines'), (865, 'RequestManager')])
s.band(162, '握手 ①  收齐状态，并完成结果同步')
s.arrow(140, 535, 237, '拉取 state / load')
s.arrow(535, 140, 289, '返回各 Engine 状态', True)
s.arrow(140, 535, 341, '触发 request 结果同步')
s.arrow(535, 865, 393, '提交 request 更新')
s.arrow(865, 535, 445, '确认更新', True)
s.arrow(535, 140, 497, '各 Engine 同步完成', True)
s.note(35, 520, 370, ['全部观测与同步结束', '固定 ControlSnapshot → 计算 plan'])
s.band(617, '握手 ②  下发 grant，收齐并校验安装 ACK')
s.arrow(140, 535, 691, '下发各 Engine 的 grant')
s.arrow(535, 140, 749, '各 Engine 返回安装 ACK', True)
s.note(35, 769, 370, ['全部安装 ACK 通过'])
s.arrow(140, 535, 869, '交付新 request 数据')
s.finish('02-two-handshakes.svg', '两处等待边界均覆盖本轮所有参与 Engine；较慢的回复会推迟后续控制阶段。')

s = Sequence('03  当前模式：Engine 发起，窗口内串行', '到达顺序决定何时开窗；发送时间与序号决定窗口内的处理顺序。', 900,
             [(150, 'Engine A'), (500, 'Proxy'), (850, 'Engine B')])
s.rect(482, 183, 36, 256, '#e8effa', '#a7bddb')
s.arrow(850, 518, 218, '请求 B：snapshot，sent_at=102')
s.text(540, 254, '本地 0ms：第一条请求开窗', size=18, color=MUTED)
s.arrow(150, 482, 304, '请求 A：snapshot，sent_at=100')
s.text(540, 340, '本地 3ms：加入同一窗口', size=18, color=MUTED)
s.note(80, 356, 345, ['固定 5ms 窗口', '后续到达不延长截止时间'])
s.band(449, '本地 5ms：取出已到请求，按 (sent_at, engine_id, request_seq) 排序 → A、B')
s.rect(491, 507, 18, 139, '#d5eee5', '#8fbfaf', 2)
s.note(540, 505, 390, ['① 写入 A 的 snapshot', '处理 A，生成回复'], green=True)
s.arrow(491, 150, 622, '回复 A', True)
s.rect(491, 662, 18, 139, '#d5eee5', '#8fbfaf', 2)
s.note(70, 660, 390, ['② 写入 B 的 snapshot', '共享视图已包含 A 的更新', '处理 B，生成回复'], green=True)
s.arrow(509, 850, 783, '回复 B', True)
s.text(500, 841, '单一处理器：处理 A / 回复 A 完成后，才开始处理 B', anchor='middle', size=20, weight=600)
s.finish('03-engine-window.svg', '每个 Engine 等待自己的回复；原 update / ownership dispatch 继续负责结果同步与请求分发。')
print(f'Rendered 3 SVGs in {OUT}')
