window.addEventListener('load', function () {
    // adapose_imgを無効化
    window.adapose_img = function () {
        return false;
    };

    // サイト側が設定した右クリック処理を解除
    document.querySelectorAll('img').forEach(function (img) {
        img.oncontextmenu = null;
    });
});
