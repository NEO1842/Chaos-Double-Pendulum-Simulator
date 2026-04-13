/**
 * 高画質スクリーンショット専用プロセッサ
 */
const ScreenshotHandler = {
    RESOLUTION: 2048, // 解像度を上げてジャギーを最小限に抑制

    /**
     * 現在のシミュレーション状態をPNGとして保存
     * @param {HTMLElement} btn クリックされたボタン要素
     */
    async capture(btn) {
        const originalText = btn ? btn.innerText : "";
        const canvas = document.createElement('canvas');
        canvas.width = this.RESOLUTION;
        canvas.height = this.RESOLUTION;
        const ctx = canvas.getContext('2d', { alpha: false });

        // 1. 背景描画
        const gradient = ctx.createLinearGradient(0, 0, 0, this.RESOLUTION);
        gradient.addColorStop(0, "rgb(10 24 36)");
        gradient.addColorStop(0.45, "rgb(5 15 24)");
        gradient.addColorStop(1, "rgb(2 8 12)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.RESOLUTION, this.RESOLUTION);

        // 2. ジオメトリ計算
        const chain = computeChainKinematics(state);
        // 振り子のサイズに合わせてズームイン・ズームアウトするように、
        // 現在の全長（totalLength）に基づいてスケールを計算し、0.9倍のマージンで収めます。
        const totalLength = chain.lengths.reduce((sum, value) => sum + value, 0);
        const scale = totalLength > 0 ? (this.RESOLUTION / (totalLength * 2)) * 0.9 : 0;
        const pivotX = this.RESOLUTION / 2;
        const pivotY = this.RESOLUTION / 2;

        // 3. 軌跡描画 (高速バッチ処理)
        if (typeof trail !== 'undefined' && trail.length > 1) {
            ctx.save();
            ctx.lineJoin = "round";
            ctx.lineCap = "round"; // 継ぎ目を丸くしてカクつきを防止
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            
            const lastIndex = trail.length - 1;
            const getX = (p) => pivotX + p.px * scale;
            const getY = (p) => pivotY + p.py * scale;

            // スクショは品質優先のため、1セグメントずつ丁寧に描画して滑らかな変化を実現
            for (let i = 1; i < trail.length; i++) {
                const pPrev = trail[i - 1];
                const pCurr = trail[i];
                const pNext = trail[i + 1] || pCurr;

                // 進行度に基づいたスタイル計算 (極端な変化を抑えるため計算式を最適化)
                const progress = i / lastIndex;
                let alpha, lineScale;
                if (params.infiniteTrail) {
                    alpha = params.monochrome ? 0.8 : 0.95;
                    lineScale = 1.0;
                } else {
                    alpha = 0.95 * Math.pow(progress, 1.2);
                    lineScale = 0.1 + 1.2 * progress;
                }

                const huePrev = params.autoHue ? speedToTrailHue(pPrev.speed) : 194;
                const hueCurr = params.autoHue ? speedToTrailHue(pCurr.speed) : 194;

                // 始点と終点の隙間を完全に埋める補間計算
                const startX = i === 1 ? getX(pPrev) : (getX(pPrev) + getX(pCurr)) * 0.5;
                const startY = i === 1 ? getY(pPrev) : (getY(pPrev) + getY(pCurr)) * 0.5;
                const endX = i === lastIndex ? getX(pCurr) : (getX(pCurr) + getX(pNext)) * 0.5;
                const endY = i === lastIndex ? getY(pCurr) : (getY(pCurr) + getY(pNext)) * 0.5;

                ctx.beginPath();
                ctx.lineWidth = 4.5 * lineScale; // 高解像度に合わせて線の太さを最適化

                if (params.monochrome) {
                    ctx.strokeStyle = `rgba(228, 236, 240, ${alpha})`;
                } else {
                    // セグメントごとにグラデーションを作成して色をなめらかに繋ぐ
                    const grad = ctx.createLinearGradient(startX, startY, endX, endY);
                    grad.addColorStop(0, `hsla(${huePrev}, 100%, 50%, ${alpha})`);
                    grad.addColorStop(1, `hsla(${hueCurr}, 100%, 50%, ${alpha})`);
                    ctx.strokeStyle = grad;
                }

                if (params.glowEffect && params.glowStrength > 0) {
                    ctx.shadowBlur = 30 * params.glowStrength; // 解像度に合わせて発光範囲を調整
                    ctx.shadowColor = `hsla(${hueCurr}, 100%, 60%, ${Math.min(0.7, alpha)})`;
                } else {
                    ctx.shadowBlur = 0;
                }

                ctx.moveTo(startX, startY);
                ctx.quadraticCurveTo(getX(pCurr), getY(pCurr), endX, endY);
                ctx.stroke();
            }
            ctx.restore();
        }

        // 4. ダウンロード処理
        const randomId = Math.floor(10000000 + Math.random() * 90000000); // 8桁のランダム数値
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `Chaos_${randomId}.png`;
        link.click();

        if (btn) {
            btn.innerText = typeof t === "function" ? t("feedbackSavedPng") : "Saved!";
            setTimeout(() => {
                btn.innerText = typeof t === "function" ? t("btnSavePng") : originalText;
            }, 3000);
        }
    }
};

/**
 * HTMLの onclick="saveImage()" 等から呼ばれても動くようにグローバルに公開
 */
window.saveImage = function(btn) {
    ScreenshotHandler.capture(btn);
};