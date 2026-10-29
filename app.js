const body=document.body, heart=document.querySelector('#heart'), reveal=document.querySelector('.reveal'), wish=document.querySelector('#wish'), sound=document.querySelector('#sound');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const garden=document.querySelector('#garden');
// Each stem and blossom is vector artwork, so the garden stays crisp on phones.
const plants=[[-2,12,0,310],[5,-18,1,360],[12,6,0,270],[20,-14,1,240],[29,18,0,190],[68,-12,0,195],[76,17,1,240],[84,-7,0,300],[92,18,1,370],[99,-20,0,300]];
plants.forEach(([x,a,kind,h],i)=>{const el=document.createElement('div');el.className='plant';el.style.cssText=`left:calc(${x}% - 90px);height:${h}px;--angle:${a}deg;transition-delay:${i*.06}s`;el.innerHTML=`<svg viewBox="0 0 180 350"><path class="stem" d="M90 350Q50 230 90 83"/><use href="#leaf" x="37" y="194" width="49" height="77" transform="rotate(-35 62 230)"/><use href="#leaf" x="82" y="153" width="44" height="72" transform="rotate(40 100 195)"/><g class="bloom-head"><use href="#${kind?'rose':'flower'}" x="27" y="20" width="126" height="126"/></g><path d="M75 280Q24 215 28 170" class="stem"/><use href="#flower" x="0" y="139" width="56" height="56" opacity=".8"/></svg>`;garden.append(el)});
let opened=false,wished=false,resumeOnVisible=false,playAttempt=0;
const photoPanel=document.querySelector('#photoSurprise'),photoDelayMs=58000;
let photoTimer=null,photoDeadline=0;
function showPhoto(){if(!opened||!photoDeadline||Date.now()<photoDeadline)return;clearTimeout(photoTimer);photoTimer=null;photoPanel.inert=false;photoPanel.setAttribute('aria-hidden','false');reveal.inert=true;reveal.setAttribute('aria-hidden','true');body.classList.add('photo-revealed');window.scrollTo({top:0,behavior:'instant'});burst(innerWidth/2,innerHeight*.4,45);if(reveal.contains(document.activeElement))document.querySelector('#photoReplay').focus({preventScroll:true})}
function startPhotoCountdown(){clearTimeout(photoTimer);photoDeadline=Date.now()+photoDelayMs;photoTimer=setTimeout(showPhoto,photoDelayMs)}
function resetPhoto(){clearTimeout(photoTimer);photoTimer=null;photoDeadline=0;body.classList.remove('photo-revealed');photoPanel.inert=true;photoPanel.setAttribute('aria-hidden','true');reveal.inert=false}
const song=document.querySelector('#birthdaySong'),songStart=28;
song.volume=.8;
function setSoundState(playing,needsTap=false){sound.setAttribute('aria-pressed',String(playing));sound.setAttribute('aria-label',playing?'Turn music off':'Turn music on');document.querySelector('#soundLabel').textContent=playing?'Sound on':needsTap?'Tap for sound':'Sound off'}
function seekToSongStart(){try{song.currentTime=songStart}catch{/* The media fragment also requests the same start time before metadata loads. */}}
function playSong(restart=false){const attempt=++playAttempt;resumeOnVisible=false;if(restart||song.ended||song.currentTime<songStart)seekToSongStart();try{const playback=song.play();playback?.catch(()=>{if(attempt===playAttempt)setSoundState(false,true)})}catch{setSoundState(false,true)}}
function pauseSong(){playAttempt++;song.pause();setSoundState(false)}
song.addEventListener('loadedmetadata',()=>{if(song.paused&&song.currentTime<songStart)seekToSongStart()});
song.addEventListener('playing',()=>setSoundState(true));
song.addEventListener('pause',()=>setSoundState(false));
song.addEventListener('ended',()=>setSoundState(false));
song.addEventListener('error',()=>setSoundState(false,true));
sound.addEventListener('click',()=>{resumeOnVisible=false;if(song.paused)playSong();else pauseSong()});
heart.addEventListener('click',()=>{if(opened)return;opened=true;startPhotoCountdown();playSong(true);body.classList.add('opened');reveal.setAttribute('aria-hidden','false');heart.disabled=true;setTimeout(()=>{burst(innerWidth/2,innerHeight*.5,55);wish.focus({preventScroll:true})},reduced?0:1700)});
wish.addEventListener('click',()=>{if(wished)return;wished=true;body.classList.add('wished');wish.innerHTML='Wish sent to the stars <span>✧</span>';wish.disabled=true;document.querySelector('#wishNote').textContent='يا رب كل اللي بتتمنّيه يبقى حقيقة ♡';burst(innerWidth/2,innerHeight*.6,95)});
function replaySurprise(){resumeOnVisible=false;pauseSong();seekToSongStart();resetPhoto();body.classList.remove('opened','wished');opened=false;wished=false;heart.disabled=false;reveal.setAttribute('aria-hidden','true');wish.disabled=false;wish.innerHTML='Make a wish <span>✧</span>';document.querySelector('#wishNote').textContent='Close your eyes. Make it a beautiful one.';particles=[];heart.focus({preventScroll:true})}
document.querySelector('#replay').addEventListener('click',replaySurprise);
document.querySelector('#photoReplay').addEventListener('click',replaySurprise);
const canvas=document.querySelector('#particles'),ctx=canvas.getContext('2d');let particles=[],last=0,width=0,height=0,raf=0;
function resize(){const d=Math.min(devicePixelRatio||1,2);width=innerWidth;height=innerHeight;canvas.width=width*d;canvas.height=height*d;ctx.setTransform(d,0,0,d,0,0)}addEventListener('resize',resize);resize();
function burst(x,y,n){if(reduced)return;for(let i=0;i<n;i++)particles.push({x,y,vx:(Math.random()-.5)*6,vy:-2-Math.random()*5,r:3+Math.random()*5,rot:Math.random()*7,spin:(Math.random()-.5)*.08,life:1,color:['#d997a8','#bd9c60','#e8b6b5','#9aa88a','#edd5ac'][i%5]});if(!raf)raf=requestAnimationFrame(draw)}
function draw(t){const dt=Math.min((t-last)/16.67||1,2);last=t;ctx.clearRect(0,0,width,height);particles=particles.filter(p=>p.life>0&&p.y<height+20);for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=.045*dt;p.rot+=p.spin*dt;p.life-=.0025*dt;ctx.save();ctx.globalAlpha=Math.min(p.life,1);ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.fillStyle=p.color;ctx.beginPath();ctx.ellipse(0,0,p.r,p.r*.45,0,0,Math.PI*2);ctx.fill();ctx.restore()}raf=particles.length?requestAnimationFrame(draw):0}
document.addEventListener('visibilitychange',()=>{if(document.hidden){resumeOnVisible=!song.paused&&!song.ended;if(resumeOnVisible)pauseSong()}else{if(photoDeadline&&!body.classList.contains('photo-revealed'))showPhoto();if(resumeOnVisible){resumeOnVisible=false;playSong()}}});
