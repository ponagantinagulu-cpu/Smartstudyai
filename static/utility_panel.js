// Utility panel script - launcher + floating windows
(function(){
    const btn = document.getElementById('studentUtilsBtn');
    const launcher = document.getElementById('utilitiesLauncher');
    const launcherClose = document.getElementById('launcherClose');
    const windowsContainer = document.getElementById('utilitiesWindows');

    btn.addEventListener('click', () => {
        launcher.hidden = !launcher.hidden;
    });
    launcherClose.addEventListener('click', () => {
        launcher.hidden = true;
    });

    // map of tool titles for headers
    const toolTitles = {
        calcBasic: 'Calculator',
        calcSci: 'Scientific Calculator',
        unitConv: 'Unit Converter',
        currencyConv: 'Currency Converter',
        pomodoro: 'Pomodoro',
        countdown: 'Countdown',
        goalTracker: 'Goal Tracker'
    };
    // track opened windows
    const openWindows = {};
    const windowOrder = []; // keep FIFO order for closing old windows
    const MAX_WINDOWS = 3;

    // pinned bar helpers
    function ensurePinnedBar(){
        let bar=document.getElementById('pinned-bar');
        if(!bar){ bar=document.createElement('div'); bar.id='pinned-bar'; document.body.appendChild(bar);}        
        return bar;
    }
    function pinUtility(id,text){
        const bar=ensurePinnedBar();
        removePin(id);
        const item=document.createElement('div'); item.className='pinned-item'; item.dataset.id=id;
        const span=document.createElement('span'); span.textContent=text;
        const rem=document.createElement('span'); rem.className='remove-pin'; rem.textContent='✖';
        rem.addEventListener('click', ()=>{ removePin(id); if(id==='pomodoro') localStorage.removeItem('pom'); if(id==='goalTracker') localStorage.removeItem('goalState'); });
        item.append(span,rem);
        bar.appendChild(item);
    }
    function removePin(id){
        const bar=document.getElementById('pinned-bar');
        if(!bar) return;
        const el=bar.querySelector(`.pinned-item[data-id="${id}"]`);
        if(el) bar.removeChild(el);
        if(bar.children.length===0){ bar.parentElement.removeChild(bar); }
    }
    function updatePinText(id,text){
        const bar=document.getElementById('pinned-bar');
        if(!bar) return;
        const el=bar.querySelector(`.pinned-item[data-id="${id}"] span`);
        if(el) el.textContent=text;
    }
    function showMotivation(){
        const lines=[
            'Keep going, you are doing great!',
            'Every step counts – stay strong!',
            'Success is the sum of small efforts.',
            'Don’t quit now, you’re almost there!',
            'Believe in yourself and all that you are.',
            'Your only limit is you.',
            'Dream it. Wish it. Do it.',
            'Hard work beats talent when talent doesn’t work hard.',
            'Stay positive, work hard, make it happen.',
            'You are stronger than you think.'
        ];
        const msg=lines[Math.floor(Math.random()*lines.length)];
        let popup=document.getElementById('motivation-popup');
        if(!popup){ popup=document.createElement('div'); popup.id='motivation-popup'; document.body.appendChild(popup);}        
        popup.textContent='Successfully goal achieved, keep going! '+msg;
        popup.style.display='block';
        setTimeout(()=>{ popup.style.display='none'; },5000);
    }
    function showGoalSuccess(){
        const overlay=document.createElement('div');
        overlay.id='goal-success-overlay';
        const box=document.createElement('div');
        box.className='success-box';
        box.innerHTML="Successfully reached today's goal!";
        const btn=document.createElement('button');
        btn.textContent='Done';
        btn.addEventListener('click', ()=>{
            overlay.style.opacity='0';
            overlay.addEventListener('transitionend',()=>overlay.remove());
        });
        box.appendChild(btn);
        overlay.appendChild(box);
        document.body.appendChild(overlay);
        // keep overlay until user clicks Done
    }
    // goal tracking update (runs independently)
    function updateGoal(){
        const st=JSON.parse(localStorage.getItem('goalState')||'null');
        if(!st) return;
        st.elapsed += 1;
        localStorage.setItem('goalState',JSON.stringify(st));
        updatePinText('goalTracker', st.raw+' '+st.unit+' goal');
        if(st.elapsed>=st.target){
            localStorage.removeItem('goalState');
            showGoalSuccess();
            removePin('goalTracker');
            // also update any open window display
            document.querySelectorAll('.goal-display').forEach(el=>el.textContent='Goal completed!');
        }
    }
    setInterval(updateGoal,1000);

    // close any existing utility windows (only one allowed at a time)
    function closeAllWindows(){
        // remove any currently open utility windows
        while(windowsContainer.firstChild){
            windowsContainer.removeChild(windowsContainer.firstChild);
        }
    }
    
    // open (or focus) window for tool
    function openToolWindow(toolId) {
        // if the tool is already open, just bring to front
        if(openWindows[toolId]){
            const existing = openWindows[toolId];
            existing.style.display='block';
            windowsContainer.appendChild(existing); // bring to front
            return;
        }
        // enforce max window count: remove oldest, even if hidden
        if(windowOrder.length >= MAX_WINDOWS){
            const oldest = windowOrder.shift();
            const w = openWindows[oldest];
            if(w){
                if(w.parentElement) windowsContainer.removeChild(w);
                delete openWindows[oldest];
            }
        }
        const template = document.getElementById('tmpl-'+toolId);
        if(!template) return;
        const content = template.cloneNode(true);
        content.id = '';

        const win = document.createElement('div');
        win.className = 'window draggable';
        win.style.top = '100px';
        win.style.left = 'calc(50% - 160px)';

        const header = document.createElement('div'); header.className='win-header';
        const title = document.createElement('span'); title.className='title';
        title.textContent = toolTitles[toolId] || 'Utility';
        const ctrls = document.createElement('div'); ctrls.className='controls';
        const btnReset = document.createElement('button'); btnReset.className='reset'; btnReset.title='Reset';
        const btnClose = document.createElement('button'); btnClose.className='close';
        const btnMin = document.createElement('button'); btnMin.className='min';
        const btnMax = document.createElement('button'); btnMax.className='max';
        ctrls.append(btnReset, btnClose, btnMin, btnMax);
        header.append(title, ctrls);
        win.append(header);
        const body = document.createElement('div'); body.className='win-body';
        body.appendChild(content);
        win.append(body);
        windowsContainer.appendChild(win);
        // register in tracking structures
        openWindows[toolId] = win;
        windowOrder.push(toolId);

        // event handlers
        btnReset.addEventListener('click', () => {
            // clear all inputs/selects/areas inside window
            win.querySelectorAll('input,select,textarea').forEach(el=>{
                if(el.type==='number' || el.type==='text' || el.tagName==='TEXTAREA') el.value='';
                else if(el.tagName==='SELECT') el.selectedIndex=0;
            });
            // clear output divs and remove highlights
            win.querySelectorAll('.unit-result, .curr-result, .pom-display, .count-display, .goal-display').forEach(d=>{
                d.textContent='';
                d.classList.remove('highlight');
            });
        });
        btnClose.addEventListener('click', () => {
            win.classList.add('closing');
            win.addEventListener('animationend', () => {
                if(win.parentElement) windowsContainer.removeChild(win);
            });
            // remove tracking (state lost)
            for(const key in openWindows){
                if(openWindows[key]===win){
                    delete openWindows[key];
                    const ix = windowOrder.indexOf(key);
                    if(ix!==-1) windowOrder.splice(ix,1);
                    break;
                }
            }
        });
        btnMin.addEventListener('click', () => {
            body.hidden = !body.hidden;
        });
        // no maximize for now

        makeDraggable(win, header);
        initTool(toolId, win);
    }

    // handle launcher icon clicks
    document.querySelectorAll('.tool-btn').forEach(b => {
        b.addEventListener('click', () => {
            openToolWindow(b.dataset.tool);
        });
    });

    // drag utility
    function makeDraggable(elem, handle) {
        let offsetX, offsetY, dragging=false;
        handle.addEventListener('mousedown', e=>{
            dragging=true;
            offsetX = e.clientX - elem.getBoundingClientRect().left;
            offsetY = e.clientY - elem.getBoundingClientRect().top;
            document.body.style.userSelect='none';
        });
        document.addEventListener('mousemove', e=>{
            if(dragging){
                elem.style.left = (e.clientX-offsetX)+'px';
                elem.style.top = (e.clientY-offsetY)+'px';
            }
        });
        document.addEventListener('mouseup', ()=>{
            dragging=false;
            document.body.style.userSelect='';
        });
    }

    // initialize tool logic inside given window
    function initTool(id, win) {
        const query = sel => win.querySelector(sel);
        if(id==='calcBasic'){
            const display = query('.basic-input');
            const buttonsDiv = query('.calc-buttons');
            if(display && buttonsDiv && buttonsDiv.children.length===0){
                const btns = ['C','7','8','9','/','4','5','6','*','1','2','3','-','0','.','=','+'];
                btns.forEach(v=>{
                    const el=document.createElement('button'); el.textContent=v; el.className='util-btn';
                    el.addEventListener('click', ()=>{
                        if(v==='='){ try{ display.value=eval(display.value); }catch{} }
                        else if(v==='C'){ display.value=''; }
                        else display.value+=v;
                    });
                    buttonsDiv.appendChild(el);
                });
            }
        } else if(id==='calcSci'){
            const txt = query('.sci-input');
            query('.sci-eval')?.addEventListener('click', ()=>{
                try{ txt.value=eval(txt.value); }catch{};
            });
            query('.sci-clear')?.addEventListener('click', ()=>{ txt.value=''; });
        } else if(id==='unitConv'){
            query('.unit-convert')?.addEventListener('click', ()=>{
                const v=parseFloat(query('.unit-value').value)||0;
                const from=query('.unit-from').value;
                const to=query('.unit-to').value;
                let res=v;
                if(from==='m'&&to==='km') res=v/1000;
                if(from==='km'&&to==='m') res=v*1000;
                const out=query('.unit-result');
                out.textContent=res;
                out.classList.add('highlight');
            });
            query('.unit-clear')?.addEventListener('click', ()=>{
                query('.unit-value').value='';
                const out=query('.unit-result');
                out.textContent='';
                out.classList.remove('highlight');
            });
        } else if(id==='currencyConv'){
            query('.curr-convert')?.addEventListener('click', ()=>{
                const a=parseFloat(query('.curr-amount').value)||0;
                const from=query('.curr-from').value;
                const to=query('.curr-to').value;
                let r=1;
                if(from==='USD'&&to==='EUR') r=0.9;
                if(from==='EUR'&&to==='USD') r=1.1;
                const out=query('.curr-result');
                out.textContent=(a*r).toFixed(2);
                out.classList.add('highlight');
            });
            query('.curr-clear')?.addEventListener('click', ()=>{
                query('.curr-amount').value='';
                const out=query('.curr-result');
                out.textContent='';
                out.classList.remove('highlight');
            });
        } else if(id==='pomodoro'){
            function start(){
                const work=parseInt(query('.pom-work').value)||25;
                const brk=parseInt(query('.pom-break').value)||5;
                const end=Date.now()+work*60000;
                localStorage.setItem('pom', JSON.stringify({end,work,brk,phase:'work'}));
            }
            query('.pom-start')?.addEventListener('click', ()=>{ start(); pinUtility('pomodoro'); });
            query('.pom-clear')?.addEventListener('click', ()=>{
                localStorage.removeItem('pom');
                const out=query('.pom-display'); out.textContent=''; out.classList.remove('highlight');
                removePin('pomodoro');
            });
            function update(){
                const state=JSON.parse(localStorage.getItem('pom')||'null');
                if(!state){ removePin('pomodoro'); return; }
                const now=Date.now();
                let diff=(state.end-now)/1000;
                if(diff<=0){
                    if(state.phase==='work'){ state.phase='break'; state.end=now+state.brk*60000; }
                    else { localStorage.removeItem('pom'); query('.pom-display').textContent='Done'; removePin('pomodoro'); return; }
                    localStorage.setItem('pom',JSON.stringify(state));
                    diff=(state.end-now)/1000;
                }
                const mins=Math.floor(diff/60); const secs=Math.floor(diff%60);
                const text=state.phase+': '+mins+':'+secs;
                const pout=query('.pom-display');
                pout.textContent=text;
                pout.classList.add('highlight');
                updatePinText('pomodoro','Pomodoro '+text);
            }
            setInterval(update,1000);
        } else if(id==='countdown'){
            query('.count-start')?.addEventListener('click', ()=>{
                const d=query('.count-date').value;
                if(d){ localStorage.setItem('count',d); }
            });
            function upd(){
                const d=localStorage.getItem('count'); if(!d) return;
                const diff=new Date(d)-new Date();
                if(diff<=0){ query('.count-display').textContent='Time!'; return; }
                const days=Math.floor(diff/8.64e7);
                query('.count-display').textContent=days+' days remaining';
            }
            setInterval(upd,60000);
            upd();
        } else if(id==='goalTracker'){
            query('.goal-set')?.addEventListener('click', ()=>{
                const h=parseFloat(query('.goal-hours').value)||0;
                const unit=query('.goal-units').value;
                let targetSeconds = unit==='hours' ? h*3600 : h*60;
                const state={target:targetSeconds,elapsed:0,unit,raw:h};
                localStorage.setItem('goalState',JSON.stringify(state));
                const gout=query('.goal-display');
                gout.textContent='Goal: '+h+' '+unit;
                gout.classList.add('highlight');
                pinUtility('goalTracker',h+' '+unit+' goal');
            });
            const existingState=JSON.parse(localStorage.getItem('goalState')||'null');
            if(existingState){
                query('.goal-display').textContent='Goal: '+existingState.raw+' '+existingState.unit;
                pinUtility('goalTracker',existingState.raw+' '+existingState.unit+' goal');
            }
            query('.goal-clear')?.addEventListener('click', ()=>{
                localStorage.removeItem('goalState');
                query('.goal-hours').value='';
                const out=query('.goal-display'); out.textContent=''; out.classList.remove('highlight');
                removePin('goalTracker');
            });
        }
    }
})();