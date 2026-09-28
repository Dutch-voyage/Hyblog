"""Render the request/load topology figures used by Rollout Scheduler (1)."""
from html import escape
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / "public/images/rollout-scheduler-1"
OUT.mkdir(parents=True, exist_ok=True)


def text(x, y, value, size=20, fill="#25394b", anchor="middle"):
    return f'<text x="{x}" y="{y}" text-anchor="{anchor}" font-size="{size}" fill="{fill}">{escape(value)}</text>'


def box(x, y, width, title, subtitle, memory=False):
    color = "#8060a2" if memory else "#448578"
    fill = "#f3edf9" if memory else "#fff"
    dash = ' stroke-dasharray="6 4"' if memory else ""
    return (
        f'<rect x="{x}" y="{y}" width="{width}" height="96" rx="12" fill="{fill}" stroke="{color}" stroke-width="2"{dash}/>'
        + text(x + width / 2, y + 39, title, 22)
        + text(x + width / 2, y + 70, subtitle, 18, "#5c6d7c")
    )


def arrow(path, load=False):
    color = "#8060a2" if load else "#267c6a"
    dash = ' stroke-dasharray="8 6"' if load else ""
    marker = "load" if load else "request"
    return f'<path d="{path}" fill="none" stroke="{color}" stroke-width="2.5"{dash} marker-end="url(#{marker})"/>'


def diagram(name, title, content):
    svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="470" viewBox="0 0 1280 470" role="img" aria-labelledby="title">'
        f'<title id="title">{escape(title)}</title>'
        '<defs><marker id="request" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#267c6a"/></marker>'
        '<marker id="load" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#8060a2"/></marker></defs>'
        '<rect width="1280" height="470" rx="16" fill="#f7f9fb"/>'
        '<g font-family="system-ui, sans-serif">'
        + text(30, 43, title, 27, anchor="start")
        + text(1250, 43, "实线：请求　虚线：负载反馈", 18, "#5c6d7c", "end")
        + content
        + '</g></svg>\n'
    )
    (OUT / name).write_text(svg, encoding="utf-8")


diagram("vllm-request-load.svg", "vLLM · 前端选 DP，负载集中汇总", "".join([
    box(24, 194, 176, "Gateway（可选）", "准入 / 限流"),
    box(280, 194, 234, "API 前端进程", "Tokenize + 选择 DP"),
    box(650, 100, 208, "DP 0", "EngineCore 进程"),
    box(650, 288, 208, "DP 1", "EngineCore 进程"),
    box(1010, 194, 244, "Coordinator 进程", "汇总各 DP 的负载"),
    arrow("M200 242 H280"), text(240, 227, "HTTP", 17),
    arrow("M514 230 H580 V148 H650"),
    arrow("M514 254 H580 V336 H650"), text(584, 212, "ZMQ", 17, "#267c6a"),
    arrow("M858 148 H936 V220 H1010", True),
    arrow("M858 336 H936 V264 H1010", True), text(933, 123, "上报负载", 18, "#8060a2"),
    arrow("M1132 290 V427 H397 V290", True),
    text(770, 415, "发布汇总负载 → 前端路由使用", 19, "#8060a2"),
]))

diagram("sglang-request-load.svg", "SGLang · Controller 选 DP（单机）", "".join([
    box(20, 194, 172, "Gateway（可选）", "准入 / 限流"),
    box(249, 194, 182, "Tokenizer", "前端进程"),
    box(488, 194, 206, "DP Controller", "进程 · 选择 DP"),
    box(783, 100, 188, "DP 0", "Scheduler 进程"),
    box(783, 288, 188, "DP 1", "Scheduler 进程"),
    box(1074, 194, 186, "共享内存", "负载快照 · 非进程", True),
    arrow("M192 242 H249"), text(220, 227, "HTTP", 16),
    arrow("M431 242 H488"), text(460, 227, "ZMQ", 16),
    arrow("M694 230 H737 V148 H783"),
    arrow("M694 254 H737 V336 H783"), text(738, 212, "ZMQ", 16, "#267c6a"),
    arrow("M971 148 H1027 V220 H1074", True),
    arrow("M971 336 H1027 V264 H1074", True), text(1026, 123, "写入", 18, "#8060a2"),
    arrow("M1167 290 V427 H591 V290", True),
    text(890, 415, "读取负载快照 → Controller 路由使用", 19, "#8060a2"),
]))
