# ⚡ Nối Hán Tự

Game nối thẻ luyện nhận diện chữ Hán (HSK 1–2): tìm 2 thẻ giống nhau và nối chúng bằng đường gấp khúc không quá 2 lần rẽ. Mỗi từ được đọc bằng giọng ghi âm tiếng Trung.

## Tính năng

- 3 mức độ: Dễ (6×6), Vừa (6×8), Khó (8×8)
- Chạm thẻ để nghe phát âm, xem pinyin và nghĩa tiếng Việt
- Gợi ý, xáo trộn, tự xáo khi hết nước đi
- Bảng từ vựng: chạm vào từng từ để nghe lại
- Giọng đọc lấy từ `voice.mp3`; nếu không tải được sẽ dùng giọng zh-CN của trình duyệt

## Cấu trúc

```
docs/
├── index.html   # giao diện
├── style.css    # giao diện, màu sắc
├── game.js      # logic game + giọng đọc
├── voice.mp3    # ghi âm 35 từ theo đúng thứ tự trong WORDS
└── .nojekyll
```

## Chạy trên GitHub Pages

1. Đẩy repo lên GitHub.
2. Vào **Settings → Pages**.
3. Ở **Source** chọn **Deploy from a branch**, branch `main`, thư mục `/docs`, rồi bấm **Save**.
4. Sau 1–2 phút, game có tại `https://<tên-tài-khoản>.github.io/<tên-repo>/`.

## Chạy trên máy

Trình duyệt chặn tải `voice.mp3` khi mở file trực tiếp (`file://`), nên hãy chạy qua một server nhỏ:

```bash
cd docs
python3 -m http.server 8000
```

Rồi mở `http://localhost:8000`.

## Thêm hoặc đổi từ

Giọng đọc được cắt theo mốc thời gian trong `VOICE_SEGMENTS` (file `game.js`); phần tử thứ *i* là `[giây bắt đầu, giây kết thúc]` của từ thứ *i* trong `WORDS`. Khi thêm từ mới, hãy ghi âm lại toàn bộ danh sách theo đúng thứ tự và cập nhật các mốc thời gian.
