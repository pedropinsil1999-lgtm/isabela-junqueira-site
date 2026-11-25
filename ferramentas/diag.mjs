import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const OUT = path.resolve(process.cwd(), '..', 'site', 'out');
const T = { '.html':'text/html;charset=utf-8','.js':'text/javascript','.css':'text/css','.woff2':'font/woff2','.avif':'image/avif','.webp':'image/webp','.svg':'image/svg+xml','.json':'application/json','.txt':'text/plain' };
const srv = http.createServer((q,r)=>{let p=decodeURIComponent((q.url||'/').split('?')[0]);let a=path.join(OUT,p);
 if(fs.existsSync(a)&&fs.statSync(a).isDirectory())a=path.join(a,'index.html');
 if(!fs.existsSync(a))a=path.join(OUT,p.replace(/\/$/,'')+'.html');
 if(!fs.existsSync(a)){r.writeHead(404);return r.end();}
 r.writeHead(200,{'content-type':T[path.extname(a)]||'application/octet-stream'});fs.createReadStream(a).pipe(r);});
await new Promise(r=>srv.listen(4401,r));
const nav = await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx = await nav.newContext({viewport:{width:1440,height:900}}); ctx.setDefaultTimeout(90000);
const page = await ctx.newPage();
await page.goto('http://127.0.0.1:4401/',{waitUntil:'networkidle'});
await page.waitForTimeout(3000);
// rola devagar, como um humano, até o card do Golden House
for(let i=0;i<60;i++){ await page.mouse.wheel(0,400); await page.waitForTimeout(60); }
await page.waitForTimeout(1500);
const probe = await page.evaluate(() => {
  const linha = document.querySelector('[data-linha]');
  const etapa = document.querySelector('[data-etapa]');
  const palavra = document.querySelector('[data-manifesto] div, [data-manifesto]');
  return {
    scrollY: Math.round(window.scrollY),
    linhaOffset: linha ? getComputedStyle(linha).strokeDashoffset : null,
    etapaOpacity: etapa ? getComputedStyle(etapa).opacity : null,
    manifestoOpacity: palavra ? getComputedStyle(palavra).opacity : null,
  };
});
console.log('PROBE', JSON.stringify(probe));
const info = await page.evaluate(()=>{
  const links=[...document.querySelectorAll('a[href*="/projetos/golden-house/"]')];
  const card=links.find(l=>l.querySelector('picture,img'));
  if(!card) return {erro:'card não achado', total:links.length};
  const img=card.querySelector('img');
  const wrap=card.querySelector('[data-parallax]');
  const cs=getComputedStyle(card), cw=wrap?getComputedStyle(wrap):null, ci=img?getComputedStyle(img):null;
  const r=card.getBoundingClientRect();
  return {
    cardRect:{w:Math.round(r.width),h:Math.round(r.height),top:Math.round(r.top)},
    cardClip:cs.clipPath, cardOpacity:cs.opacity, cardDisplay:cs.display,
    wrapTransform:cw?cw.transform:null, wrapH:wrap?Math.round(wrap.getBoundingClientRect().height):null,
    imgSrc:img?img.currentSrc.split('/').pop():null,
    imgNatural:img?img.naturalWidth+'x'+img.naturalHeight:null,
    imgRect:img?{w:Math.round(img.getBoundingClientRect().width),h:Math.round(img.getBoundingClientRect().height)}:null,
    imgOpacity:ci?ci.opacity:null, imgObjFit:ci?ci.objectFit:null,
  };
});
console.log(JSON.stringify(info,null,1));
await nav.close(); srv.close();
