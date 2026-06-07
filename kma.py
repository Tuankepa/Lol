# ============================
# ĐỊA NGỤC TRẦN GIAN 
# ============================
# HƯỚNG DẪN CHẠY CODE
#
# 1. Chạy ngoài CMD (Windows):
#    - Mở CMD, chuyển đến thư mục chứa file Python:
#         cd đường_dẫn_thư_mục
#    - Chạy code:
#         python lyric.py
#    - Dừng bất cứ lúc nào: Ctrl+C
#
# 2. Chạy trong VSCode:
#    Cách A – Terminal trong VSCode:
#      - Mở VSCode → mở thư mục chứa file Python.
#      - Mở Terminal (Ctrl+`) 
#      - Chạy code:
#           python lyric.py
#      - Dừng: Ctrl+C
#
#    Cách B – Chạy trực tiếp bằng nút Run Python:
#      - Mở file Python trong VSCode.
#      - Nhấn nút Run (▶) góc trên phải hoặc F5.
#      - Terminal VSCode sẽ tự mở và chạy code.
#      - Nhấn Ctrl+C nếu cần dừng sớm.
#
# 3. Nhạc nền (tùy chọn):
#    - Để phát nhạc, bạn cần tự tích hợp chức năng phát nhạc
#    - Hiện tại code không có chức năng phát nhạc
#
# Lưu ý:
# - Terminal phải hỗ trợ ANSI color codes để hiệu ứng hiển thị đúng.

import time, os, sys, random

# Danh sách hiệu ứng 
EFFECT_MODES = [
    'color_shimmer',   
    'background_pulse', 
    'glitch_reveal',    
    'color_blend',      
    'fold_from_sides'  
]

COLORS = [
    '\033[38;5;189m', '\033[38;5;152m', '\033[38;5;153m',
    '\033[38;5;218m', '\033[38;5;229m', '\033[38;5;117m',
    '\033[38;5;181m', '\033[38;5;159m', '\033[38;5;224m', '\033[97m'
]

BG_COLORS = ['\033[48;5;254m', '\033[48;5;253m', '\033[48;5;252m']

RESET, BRIGHT, DIM = '\033[0m', '\033[1m', '\033[2m'

# lyric
LYRICS = [
    "Chẳng-trách ai cũng phải sợ",
    "Đến lúc yêu-thương không còn",
    "Người cạnh•bên mà chẳng thể hiểu được",
    "Làm cách nào có thể giữ-lại",
    "Bão tố phong ba không bằng chia-tay",
    "Chìm xuống dưới vực sâu này",
    "Dễ nhớ mau quên những lời mây•bay",
    "Chỉ nhận lại những đắng-cay",
    "Còn điều gì để khiến anh vui trở lại",
    "Em biến nơi anh thành địa ngục-trần gian",
    ""
]

# Thời điểm bắt đầu lyric 
start_time = [0.0, 1.85, 3.85, 5.85, 6.85, 7.95, 9.85, 11.85, 13.0, 15.4, 21]

# Tốc độ xuất chữ
char_speed = [0.065, 0.064, 0.060, 0.055, 0.041, 0.043, 0.035, 0.045, 0.038, 0.070, 0.040]

# ẨN/HIỆN CON TRỎ
def hide_cursor():
    sys.stdout.write('\033[?25l')
    sys.stdout.flush()

def show_cursor():
    sys.stdout.write('\033[?25h')
    sys.stdout.flush()

# HIỆU ỨNG
def color_shimmer(line, color):
    for phase in (DIM + color, color, BRIGHT + color):
        sys.stdout.write('\r' + phase + line + RESET)
        sys.stdout.flush()
        time.sleep(0.06)
    sys.stdout.write('\n')

def background_pulse(line, color):
    for bg in BG_COLORS + [BG_COLORS[0]]:
        sys.stdout.write('\r' + bg + color + line + RESET)
        sys.stdout.flush()
        time.sleep(0.06)
    sys.stdout.write('\n')

def glitch_reveal(line, color, speed):
    fake = '@#$%^&*+=~!?'
    prev_len = 0
    glitch = ''.join(random.choice(fake) for _ in line)
    sys.stdout.write('\r' + DIM + color + glitch + RESET)
    sys.stdout.flush()
    time.sleep(0.12)

    reveal = [''] * len(line)
    for i, ch in enumerate(line):
        reveal[i] = ch
        disp = ''.join(reveal[j] if reveal[j] else random.choice(fake) for j in range(len(line)))
        sys.stdout.write('\r' + BRIGHT + color + disp + RESET)
        sys.stdout.write(' ' * max(prev_len - len(disp), 0))
        prev_len = len(disp)
        sys.stdout.flush()
        time.sleep(speed * 0.8)
    sys.stdout.write('\n')

def color_blend(line, _):
    for c in random.sample(COLORS, 3):
        sys.stdout.write('\r' + c + line + RESET)
        sys.stdout.flush()
        time.sleep(0.06)
    sys.stdout.write('\n')

def fold_from_sides(line, color, speed=0.05):
    length = len(line)
    revealed = [' '] * length
    prev_disp = ''
    for offset in range((length + 1)//2):
        revealed[offset] = line[offset]
        revealed[length - 1 - offset] = line[length - 1 - offset]
        disp = ''.join(revealed)
        sys.stdout.write('\r' + color + disp + RESET)
        sys.stdout.write(' ' * max(len(prev_disp) - len(disp), 0))
        prev_disp = disp
        sys.stdout.flush()
        time.sleep(speed)
    sys.stdout.write('\n')

EFFECT_FUNCS = {
    'color_shimmer': lambda l, c, s: color_shimmer(l, c),
    'background_pulse': lambda l, c, s: background_pulse(l, c),
    'glitch_reveal': glitch_reveal,
    'color_blend': lambda l, c, s: color_blend(l, c),
    'fold_from_sides': fold_from_sides
}

# CHƯƠNG TRÌNH CHÍNH
def choose_effect_sequential(i):
    return EFFECT_MODES[i % len(EFFECT_MODES)]

def main():
    os.system('cls' if os.name == 'nt' else 'clear')
    hide_cursor()
    time.sleep(0.8)

    start = time.time()

    try:
        for i, lyric in enumerate(LYRICS):
            while time.time() - start < start_time[i] - 0.12:
                time.sleep(0.005)

            color = random.choice(COLORS)
            eff = choose_effect_sequential(i)
            EFFECT_FUNCS[eff](lyric, color, char_speed[i])

        sys.stdout.write('\033[38;5;250m--- Đỗ KMA Rồi Mình Yêu Nhau -NgTuan- ---\033[0m\n')
    except KeyboardInterrupt:
        pass
    finally:
        show_cursor()

if __name__ == "__main__":
    main()
