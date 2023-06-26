(() => {
    let dragging = false;
    let panning = false;
    let startX, startY, startTime;

    let pendingRepaint;

    addBubblingListener('mousedown', 'level', (target, startEv) => {
        startX = startEv.clientX;
        startY = startEv.clientY;
        startTime = startEv.timeStamp;

        dragging = true;
        panning = false;
    });

    window.addEventListener('mousemove', ev => {
        if (!dragging) return;
        if (ev.timeStamp - startTime < 100) return;
        panning = true;

        const level = document.querySelector('level');
        const properties = getGlobalCssProperties(level);
        const cellSize = properties.cellSize + properties.cellSpacing;

        const changeX = Math.round((ev.clientX - startX) / cellSize);
        const changeY = Math.round((ev.clientY - startY) / cellSize);

        // Repainting the level actually messes with the drag events
        /*if (Math.abs(changeX) > 10 || Math.abs(changeY) > 10) {
            applyPan(ev);
            startX = ev.clientX;
            startY = ev.clientY;
        } else {*/
            document.body.style.setProperty('--level-dragging-x', (changeX * cellSize) + 'px');
            document.body.style.setProperty('--level-dragging-y', (changeY * cellSize) + 'px');
        //}
    });

    function cancel(ev) {
        dragging = false;

        if (!panning) return;
        panning = false;
        ev.preventDefault();

        applyPan(ev);
    }

    function applyPan(ev) {
        const level = document.querySelector('level');
        const properties = getGlobalCssProperties(level);
        const cellSize = (properties.cellSize + properties.cellSpacing) * properties.scale;

        const changeX = Math.round(-(ev.clientX - startX) / cellSize);
        const changeY = Math.round(-(ev.clientY - startY) / cellSize);

        level.classList.add('repainting');
        requestAnimationFrame(() => {
            document.body.style.setProperty('--level-dragging-x', 0);
            document.body.style.setProperty('--level-dragging-y', 0);
            scrollViewPort(level, changeX, changeY);
            requestAnimationFrame(() => level.classList.remove('repainting'));
        });
    }

    window.addEventListener('mouseup', cancel);
    window.addEventListener('blur', cancel);
})();
