(()=>{
const app=document.getElementById('app'),$=s=>app.querySelector(s),screens=[...app.querySelectorAll('.screen')];
let names=['A','B'],index=0,player=0,phase='predict',answers={},deepPlayer=0,deepData={},history=[];
const show=id=>{screens.forEach(s=>s.classList.toggle('active',s.dataset.screen===id));window.scrollTo({top:0,behavior:'instant'})};
const choice=(g,v,t)=>{const l=document.createElement('label');l.className='choice';l.innerHTML=`<input type="radio" name="${g}" value="${v}"><span></span>`;l.querySelector('span').textContent=t;return l};
const para=(t,c='')=>{const e=document.createElement('p');e.textContent=t;if(c)e.className=c;return e};
const head=(el,t)=>{const b=document.createElement('b');b.textContent=t;el.appendChild(b)};

$('#beginBtn').onclick=()=>show('rules');
$('#rulesNext').onclick=()=>show('setup');
$('#setupForm').onsubmit=e=>{e.preventDefault();const a=$('#nameA').value.trim(),b=$('#nameB').value.trim();if(!a||!b){$('#setupError').style.display='block';$('#setupError').textContent='ふたりの名前を入力してね。';return}names=[a,b];index=0;player=0;phase='predict';answers={};deepData={};history=[];renderGame();show('game')};
$('#meaningBtn').onclick=()=>$('#meaningBox').classList.toggle('show');
$('#exampleBtn').onclick=()=>$('#exampleBox').classList.toggle('show');

function renderGame(){
 const c=cards[index],me=names[player],other=names[1-player];
 $('#category').textContent=`${c.cat}｜${c.jp}`; $('#turn').textContent=`${me}さんのターン`; $('#counter').textContent=`${index+1} / ${cards.length}`;
 const unit=index*4+player*2+(phase==='self'?1:0); $('#bar').style.width=`${Math.round(unit/(cards.length*4)*100)}%`;
 $('#question').textContent=c.q; $('#meaning').textContent=c.meaning; $('#example').textContent=c.example;
 $('#meaningBox').classList.remove('show'); $('#exampleBox').classList.remove('show');
 $('#instruction').textContent=phase==='predict'?`🎯 まず、${other}さんならどれを選ぶと思う？`:`♡ 次に、${me}さん自身の本音は？`;
 const box=$('#choices'); box.innerHTML=''; c.options.forEach((x,i)=>box.appendChild(choice('answer',i,x))); $('#answerError').style.display='none';
}
$('#answerForm').onsubmit=e=>{e.preventDefault();const s=$('input[name="answer"]:checked');if(!s){$('#answerError').style.display='block';return}answers[`${player}-${phase}`]=Number(s.value);if(phase==='predict'){phase='self';renderGame();return}if(player===0){$('#handoffTitle').textContent=`${names[0]}さんの回答をロックしました`;show('handoff')}else show('ready')};
$('#handoffBtn').onclick=()=>{player=1;phase='predict';renderGame();show('game')};
$('#revealBtn').onclick=()=>{renderResult();show('result')};

function renderResult(){
 const c=cards[index],box=$('#resultCards'); $('#resultQuestion').textContent=c.q; box.innerHTML='';
 [0,1].forEach(p=>{const actual=answers[`${p}-self`],pred=answers[`${1-p}-predict`],hit=actual===pred,el=document.createElement('div');el.className='card result-person';
 const top=document.createElement('div');top.className='topline';const b=document.createElement('b');b.textContent=names[p];const tag=document.createElement('span');tag.className='tag';tag.textContent=hit?'🎯 予想的中':'💡 新発見';top.append(b,tag);
 const a=para(c.options[actual]);a.insertAdjacentHTML('afterbegin','<span class="muted">本人の本音</span><br>');const pr=para(c.options[pred]);pr.insertAdjacentHTML('afterbegin',`<span class="muted">${names[1-p]}の予想</span><br>`);el.append(top,a,pr);box.appendChild(el)});
 const a=answers['0-self'],b=answers['1-self'],ha=a===answers['1-predict'],hb=b===answers['0-predict'];
 let text;if(a===b&&ha&&hb)text=`ふたりとも「${c.options[a]}」。本音も相手への予想も重なりました。次は、同じ答えの奥にある理由まで似ているかを見てみます。`;
 else if(a===b)text=`ふたりの本音は「${c.options[a]}」で一致しました。ただ、相手の予想にはズレがあり、「実は同じ感覚だった」という発見があります。`;
 else if(ha&&hb)text='本音は違いましたが、ふたりとも相手の答えを当てています。感じ方は違っても、その違いをすでに理解できているテーマです。';
 else if(ha||hb)text='ふたりの本音には違いがあり、片方の予想は的中しました。すでに分かっている部分と、今回初めて見えた部分が混ざっています。';
 else text='ふたりの本音には違いがあり、お互いの予想ともズレました。今回あらためて相手の感じ方を知れたポイントです。';
 $('#insight').textContent=text;
}

$('#deepBtn').onclick=()=>{deepPlayer=0;deepData={};renderDeep();show('deep')};
function renderDeep(){
 const c=cards[index],self=answers[`${deepPlayer}-self`];$('#deepTitle').textContent=`${names[deepPlayer]}さんの気持ちをもう少し`;$('#deepBase').textContent=`本音は「${c.options[self]}」。その答えに近い理由を選んでみよう。`;
 const box=$('#deepChoices');box.innerHTML='';c.deep.forEach((x,i)=>box.appendChild(choice('deepAnswer',i,x)));$('#deepText').value='';
}
$('#deepForm').onsubmit=e=>{e.preventDefault();const s=$('input[name="deepAnswer"]:checked');deepData[deepPlayer]={choice:s?cards[index].deep[Number(s.value)]:'',text:$('#deepText').value.trim()};if(deepPlayer===0){deepPlayer=1;renderDeep();return}renderTranslation();show('translation')};

function renderTranslation(){
 const c=cards[index],box=$('#translationCards');box.innerHTML='';
 [0,1].forEach(p=>{const d=deepData[p]||{},self=answers[`${p}-self`],el=document.createElement('div');el.className='card';head(el,`${names[p]}語`);el.append(para(`表面の答え：「${c.options[self]}」`,'muted'),para(d.text||d.choice||'まだうまく言葉にできないけれど、これも大事な本音。'));box.appendChild(el)});
 $('#talkPrompt').textContent=c.talk;const a=answers['0-self'],b=answers['1-self'];history.push({card:c,a,b,predA:answers['1-predict'],predB:answers['0-predict'],deepA:deepData[0],deepB:deepData[1],same:a===b,understood:(a===answers['1-predict']?1:0)+(b===answers['0-predict']?1:0)});
 $('#nextBtn').textContent=index===cards.length-1?'総合レポートを見る':'次のお題へ';
}
$('#nextBtn').onclick=()=>{if(index===cards.length-1){renderSummary();show('summary');return}index++;player=0;phase='predict';answers={};deepData={};renderGame();show('game')};

function personSummary(p){
 const by=Object.fromEntries(history.map(h=>[h.card.cat,h])),v=c=>p===0?by[c]?.a:by[c]?.b,parts=[];
 let x=v('CONTACT'); if(x!=null)parts.push(x<=1?'つながりが見えることを安心につなげやすい':x<=3?'連絡の空白だけでは関係を判断しにくい':'状況に応じて連絡の意味を考えやすい');
 x=v('RECIPROCITY'); if(x!=null)parts.push(x<=1?'愛情の往復を大切にする':x===2?'相手なりの好意を受け取りやすい':'愛情表現の形が左右で違っていても受け止めやすい');
 x=v('SECURITY'); if(x!=null)parts.push(x<=1?'好意が見えることで安心を作りやすい':x<=3?'関係そのものを安心の土台にしやすい':'安心のよりどころを状況ごとに考えやすい');
 x=v('EMPATHY'); const emp=['気持ちを受け止めてもらうことを大切にする','話を聞いてもらいながら整理しやすい','一緒に解決へ動くことを支えに感じやすい','気分を切り替える関わりを受け取りやすい','自分で整理するための距離も大切にする'];if(x!=null)parts.push(emp[x]);
 x=v('PRIORITY'); if(x!=null)parts.push(x<=1?'優先されることにも愛情を感じやすい':x===2?'優先順位を場面や事情まで含めて捉えやすい':'優先順位と愛情を切り分けて考えやすい');
 x=v('LOVE SIGNAL'); const love=['言葉から愛情を受け取りやすい','自発的な連絡や誘いから愛情を受け取りやすい','時間を使ってくれることから愛情を受け取りやすい','支えてくれる行動から愛情を受け取りやすい','一緒に楽しく過ごす時間から愛情を受け取りやすい'];if(x!=null)parts.push(love[x]);
 return `総じて、${parts.slice(0,3).join('、')}人です。${parts.slice(3).join('。')}。`.replace('。。','。');
}
function trendText(same,understood,total){
 const s=same/history.length,k=understood/total;
 if(s>=.67&&k>=.67)return 'ふたりは大切にするポイントが比較的近く、相手の感じ方もよく捉えられています。似ているからこそ理由まで言葉にすると、この強みがさらに活きそうです。';
 if(s>=.67)return '考え方そのものは近い一方で、「相手はこう思うはず」という予想には意外なズレがあります。似ているからこそ説明を省かず、理由まで確認することが大切です。';
 if(k>=.67)return '感じ方には違いがありますが、その違いを相手がかなり理解できています。「違うけれど分かる」が成立しているふたりです。';
 return '感じ方にも相手への予想にも違いが出ています。「自分ならこう」をいったん脇に置き、相手の答えと理由を別のものとして聞くことが翻訳の鍵です。';
}
function sharedAdvice(cat){
 return {CONTACT:'連絡頻度を決めるより、ふたりが心地よい距離感を言葉にしておくと活かせます。',RECIPROCITY:'お互いが自然に返している愛情を見つけて言葉にすると安心につながります。',SECURITY:'不安が出た時だけ「今どう感じてる？」と確認する会話が使いやすそうです。',EMPATHY:'つらい時に欲しい関わり方が近いので、合図を決めておくと支え合いやすくなります。',PRIORITY:'大切な予定ほど早めに共有すると余計なすれ違いを減らせます。','LOVE SIGNAL':'この表現をふたりの共通言語として意識的に使うと伝わりやすくなります。'}[cat]||'この共通点を、ときどき言葉にして確認すると強みになります。';
}
function perspective(h,p){
 const d=p===0?h.deepA:h.deepB,ans=p===0?h.a:h.b,reason=(d&&(d.text||d.choice))||h.card.options[ans];
 return `${names[p]}さんは「${reason}」を大切にしており、「${h.card.options[ans]}」と感じやすい傾向があります。`;
}
function renderSummary(){
 const total=history.length*2,understood=history.reduce((s,h)=>s+h.understood,0),same=history.filter(h=>h.same).length,discover=total-understood;
 $('#understoodStat').textContent=`${understood}/${total}`;$('#sameStat').textContent=`${same}/${history.length}`;$('#discoverStat').textContent=discover;
 const person=$('#personTendencies'),similar=$('#similar'),different=$('#different'),care=$('#care'),manual=$('#manualBook');[person,similar,different,care,manual].forEach(e=>e.innerHTML='');
 [0,1].forEach(p=>{const w=document.createElement('div');w.className='manual-item';head(w,`${names[p]}さんのパーソナリティ`);w.append(para(personSummary(p)));person.appendChild(w)});
 $('#trend').textContent=trendText(same,understood,total);

 history.forEach(h=>{
  if(h.same){const w=document.createElement('div');w.className='manual-item';head(w,`${h.card.cat}｜${h.card.jp}`);w.append(para(`ふたりとも「${h.card.options[h.a]}」`),para(`ふたりはこのテーマで大切にするポイントが近いようです。${sharedAdvice(h.card.cat)}`,'muted'));similar.appendChild(w)}
  else{const w=document.createElement('div');w.className='manual-item';head(w,`${h.card.cat}｜${h.card.jp}`);w.append(para(perspective(h,0)),para(perspective(h,1)));const t=document.createElement('div');t.className='translation-note';head(t,'↔ ふたりの翻訳');t.append(para(`同じ出来事でも、${names[0]}さんと${names[1]}さんでは「何を大事なサインとして受け取るか」が違う可能性があります。`));const hint=document.createElement('div');hint.className='translation-note';head(hint,'💬 コミュニケーションのヒント');hint.append(para(h.card.care));w.append(t,hint);different.appendChild(w);const cw=document.createElement('div');cw.className='manual-item';head(cw,`${h.card.cat}｜${h.card.jp}`);cw.append(para(h.card.care,'muted'));care.appendChild(cw)}
  const m=document.createElement('div');m.className='manual-item';head(m,`${h.card.cat}｜${h.card.jp}`);m.append(para(h.card.desc,'muted'),para(`${names[0]}：${h.card.options[h.a]}`),para(`${names[1]}：${h.card.options[h.b]}`),para(`相手予想　${names[0]}→${names[1]}：${h.card.options[h.predB]} / ${names[1]}→${names[0]}：${h.card.options[h.predA]}`,'muted'));manual.appendChild(m);
 });
 if(!similar.children.length)similar.append(para('今回は同じ回答になったお題はありませんでした。今回の6テーマでは違いが多く見えた結果です。','muted'));
 if(!different.children.length)different.append(para('今回は回答の違いが出たお題はありませんでした。同じ答えでも理由まで同じとは限らないので、取説から振り返ってみてください。','muted'));
 if(!care.children.length)care.append(para('大きな回答差は見えていません。似ているからこそ「言わなくても分かる」と思い込みすぎないことが、翻訳事故を防ぐポイントです。','muted'));
 $('#finalText').textContent=history.length-same?`今回の回答を翻訳すると、ふたりには共通する感覚と、それぞれ別の物差しで見ているテーマの両方がありました。違いをなくす必要はありません。「自分にはこう見える」「相手にはこう見える」を知ったうえで、届きやすい伝え方を選べることが次の一歩です。`:'今回の回答では、ふたりの感じ方はかなり近く見えました。だからこそ、同じ答えの裏にある理由まで同じだと決めつけず、ときどき言葉にして確認することが、ふたりの共通言語を長く保つコツです。';
}
$('#restartBtn').onclick=()=>show('splash');
if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
})();