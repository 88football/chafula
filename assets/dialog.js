(() => {
  const showIndependentDialog = function (durl) {
    const host = document.createElement("div");

    // 既存ページのレイアウトへの影響をなくす
    Object.assign(host.style, {
      position: "fixed",
      width: "0",
      height: "0",
      margin: "0",
      padding: "0",
      border: "0",
      overflow: "visible",
      zIndex: "2147483647",
    });

    document.documentElement.appendChild(host);

    const shadow = host.attachShadow({
      mode: "closed",
    });

    // ------------------------------------------------------------
    // HTML + CSS
    // ------------------------------------------------------------

    shadow.innerHTML = `
    <style>

      /*
       * ----------------------------------------------------------
       * Dialog
       * ----------------------------------------------------------
       */

      .independent-dialog {
        width: min(90vw, 420px);

        margin: 0;
        padding: 0;

        position: fixed;
        top: 50%;
        left: 50%;

        transform: translate(-50%, -50%);

        border: 1px solid rgba(255, 255, 255, 0.65);
        border-radius: 16px;

        background: rgba(255, 255, 255, 0.88);

        color: #0f172a;

        box-shadow:
          0 15px 40px rgba(0, 0, 0, 0.14);

        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);

        font-family:
          Inter,
          "Helvetica Neue",
          Arial,
          "Hiragino Kaku Gothic ProN",
          "Hiragino Sans",
          Meiryo,
          sans-serif;

        box-sizing: border-box;

        animation: dialog-in 0.2s ease-out;
      }


      /*
       * dialog内部の全要素について
       * 既存ページのbox-sizing等を受けない
       */

      .independent-dialog *,
      .independent-dialog *::before,
      .independent-dialog *::after {
        box-sizing: border-box;
      }


      /*
       * ----------------------------------------------------------
       * Content
       * ----------------------------------------------------------
       */

      .dialog-content {
        padding: 2rem;
        text-align: center;
      }


      .dialog-title {
        margin: 0 0 0.6rem;

        font-size: 1.25rem;
        line-height: 1.5;

        font-weight: 700;

        color: #0f172a;
      }


      .dialog-message {
        margin: 0 0 1.5rem;

        font-size: 0.95rem;
        line-height: 1.6;

        color: #64748b;
      }


      /*
       * ----------------------------------------------------------
       * Buttons
       * ----------------------------------------------------------
       */

      .dialog-buttons {
        display: flex;

        justify-content: center;
        align-items: center;

        gap: 0.4rem;
      }


      .dialog-button {
        min-width: 100px;

        margin: 0;
        padding: 0.8rem 1.6rem;

        border: none;
        border-radius: 999px;

        font-family: inherit;
        font-size: 0.95rem;
        font-weight: 600;

        cursor: pointer;

        transition:
          background 0.2s ease,
          transform 0.2s ease,
          box-shadow 0.2s ease;

        outline: none;
      }


      /*
       * はい
       */

      .dialog-yes {
        background: #6366f1;
        color: #ffffff;
      }


      .dialog-yes:hover {
        background: #4f46e5;

        transform: translateY(-2px);

        box-shadow:
          0 4px 12px rgba(99, 102, 241, 0.3);
      }


      /*
       * いいえ
       */

      .dialog-no {
        background: #e2e8f0;
        color: #0f172a;
      }


      .dialog-no:hover {
        background: #cbd5e1;

        transform: translateY(-2px);
      }


      /*
       * キーボード操作時
       */

      .dialog-button:focus-visible {
        box-shadow:
          0 0 0 3px rgba(99, 102, 241, 0.25);
      }


      /*
       * ----------------------------------------------------------
       * Animation
       * ----------------------------------------------------------
       */

      @keyframes dialog-in {
        from {
          opacity: 0;
          transform:
            translate(-50%, -46%);
        }

        to {
          opacity: 1;
          transform:
            translate(-50%, -50%);
        }
      }


      /*
       * ----------------------------------------------------------
       * Mobile
       * ----------------------------------------------------------
       */

      @media (max-width: 480px) {

        .independent-dialog {
          width: calc(100vw - 32px);
        }

        .dialog-content {
          padding: 1.5rem;
        }

        .dialog-button {
          min-width: 90px;
        }

      }

    </style>


    <dialog
      class="independent-dialog"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-message"
    >

      <div class="dialog-content">

        <h2
          class="dialog-title"
          id="dialog-title"
        ></h2>

        <p
          class="dialog-message"
          id="dialog-message"
        ></p>

        <div class="dialog-buttons">

          <button
            type="button"
            class="dialog-button dialog-yes"
            id="dialog-yes"
          >
            はい
          </button>

          <button
            type="button"
            class="dialog-button dialog-no"
            id="dialog-no"
          >
            いいえ
          </button>

        </div>

      </div>

    </dialog>
  `;

    // ------------------------------------------------------------
    // Elements
    // ------------------------------------------------------------

    const dialog = shadow.querySelector(".independent-dialog");
    const title = shadow.querySelector(".dialog-title");
    const message = shadow.querySelector(".dialog-message");

    const yesButton = shadow.querySelector(".dialog-yes");
    const noButton = shadow.querySelector(".dialog-no");

    title.textContent = "Blocked Content";
    message.textContent = durl;

    // 二重呼び出し対策
    if (dialog.open) {
      dialog.close();
    }

    // 結果を一度だけ返す
    let finished = false;

    const finish = (result) => {
      dialog.close();
    };

    yesButton.onclick = () => {
      open(durl);
    };

    noButton.onclick = () => {
      finish(false);
    };
    setTimeout(() => finish(false), 3000);

    // ESCを押した場合は「いいえ」とする
    const cancelHandler = () => {
      if (!finished) {
        finish(false);
      }
    };

    dialog.addEventListener("cancel", cancelHandler, { once: true });

    /*
     * showModal() ではなく show()
     *
     * これにより背景ページを操作可能にする。
     */
    dialog.show();
  };

  // ------------------------------------------------------------
  // 外部から呼び出せる関数だけ公開
  // ------------------------------------------------------------

  window.ABEKENMAN_showIndependentDialog = showIndependentDialog;
})();
