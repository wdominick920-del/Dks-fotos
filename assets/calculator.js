(()=>{
const groups=[
['General events & functions',[['Essential',650,'1 hour','Approx. 25+ photos'],['Signature',1200,'2 hours','Approx. 60+ photos'],['Premium',2200,'4 hours','Approx. 120+ photos'],['Full Event',3200,'6 hours','Approx. 180+ photos']]],
['Birthdays & private parties',[['Mini Celebration',600,'1 hour','Approx. 25+ photos'],['Birthday Memories',1100,'2 hours','Approx. 55+ photos'],['Deluxe Celebration',1650,'3 hours','Approx. 90+ photos'],['Complete Celebration',2700,'5 hours','Approx. 150+ photos']]],
['Church events & ceremonies',[['Service Highlights',550,'1 hour','Approx. 25+ photos'],['Ceremony Coverage',1000,'2 hours','Approx. 55+ photos'],['Special Service',1500,'3 hours','Approx. 85+ photos'],['Full Programme',2500,'5 hours','Approx. 140+ photos']]],
['Engagement photography',[['Simple Engagement',750,'45 minutes','Approx. 20+ photos'],['Signature Engagement',1300,'90 minutes','Approx. 45+ photos'],['Premium Engagement',1750,'2 hours','Approx. 65+ photos']]],
['Wedding photography',[['Intimate Wedding',2200,'2 hours','Approx. 70+ photos'],['Classic Wedding',4000,'4 hours','Approx. 150+ photos'],['Signature Wedding',6000,'6 hours','Approx. 250+ photos'],['Full-Day Wedding',8000,'8 hours','Approx. 350+ photos']]],
['Portraits & graduations',[['Quick Portrait',400,'30 minutes','8 photos'],['Personal Portrait',650,'1 hour','20 photos'],['Graduation Memories',750,'1 hour','25 photos'],['Group Graduation',1200,'90 minutes','40 photos']]],
['Business, product & promotional',[['Business Starter',800,'1 hour','15 photos'],['Brand Essentials',1500,'2 hours','35 photos'],['Business Premium',2800,'4 hours','70 photos'],['Product Mini',650,'Up to 5 products','10 photos'],['Product Standard',1200,'Up to 10 products','25 photos']]]];
const $=id=>document.getElementById(id),cat=$('qcategory'),pkg=$('qpackage');
const money=n=>'R'+n.toLocaleString('en-ZA',{minimumFractionDigits:2,maximumFractionDigits:2});
const number=id=>{const n=Number($(id).value);return Number.isFinite(n)?Math.min(10000,Math.max(0,n)):0};
let last='';
groups.forEach((g,i)=>cat.add(new Option(g[0],String(i))));
function populate(){const g=groups[Number(cat.value)];pkg.replaceChildren();g[1].forEach((p,i)=>pkg.add(new Option(p[0]+' — '+money(p[1]),String(i))));update()}
function update(){$('quote-drafts').hidden=true;$('quote-status').textContent='';const gi=Number(cat.value),g=groups[gi],p=g[1][Number(pkg.value)||0],portrait=gi===5,wedding=gi===4,commercial=gi===6,km=number('qdistance'),hours=number('qextra'),blocks=number('qportrait'),locs=number('qlocations');
$('extra-hours-wrap').hidden=portrait;$('portrait-time-wrap').hidden=!portrait;
$('portraits-option').hidden=!portrait;$('events-option').hidden=portrait||commercial;
$('qpackageinfo').textContent=p[2]+' • '+p[3]+' • Professionally edited digital delivery';
const lines=[[g[0]+' · '+p[0],p[1]]];if(!portrait&&hours)lines.push(['Additional photography · '+hours+' h',hours*(wedding?900:500)]);if(portrait&&blocks)lines.push(['Extra portrait time · '+blocks*30+' min',blocks*300]);if(locs)lines.push(['Additional locations · '+locs,locs*200]);if(portrait&&$('qportraits').checked)lines.push(['5 additional edited portraits',150]);if(!portrait&&!commercial&&$('qevents').checked)lines.push(['10 additional edited event photos',200]);if($('qpriority').checked)lines.push(['Priority delivery (subject to confirmation)',350]);const rule=DKS_CONFIG.travel;const travel=km<=rule.freeReturnKm?0:Math.round(km*rule.ratePerKm*100)/100;lines.push(['Travel · '+km+' km return',travel]);$('qtravel').textContent=money(travel);
const total=lines.reduce((sum,item)=>sum+item[1],0);$('qbreakdown').replaceChildren(...lines.map(([label,cost])=>{const r=document.createElement('div');r.className='quote-line';const a=document.createElement('span'),b=document.createElement('strong');a.textContent=label;b.textContent=money(cost);r.append(a,b);return r}));$('qtotal').textContent=money(total);$('qdeposit').textContent=money(total*.3);$('qbalance').textContent=money(total*.7);last='DKs Photography — Quote request\n'+lines.map(x=>x[0]+': '+money(x[1])).join('\n')+'\nEstimated total: '+money(total)+'\n30% booking fee: '+money(total*.3)+'\n70% remaining: '+money(total*.7)+'\nPlease confirm availability and final pricing.';}
cat.addEventListener('change',()=>{['qextra','qportrait','qlocations','qdistance'].forEach(id=>$(id).value='0');['qportraits','qevents','qpriority'].forEach(id=>$(id).checked=false);populate()});
document.querySelectorAll('#calculator input,#calculator select').forEach(el=>{if(el!==cat)el.addEventListener('input',update)});
$('qreset').addEventListener('click',()=>{cat.value='0';['qextra','qportrait','qlocations','qdistance'].forEach(id=>$(id).value='0');['qportraits','qevents','qpriority'].forEach(id=>$(id).checked=false);populate()});
$('qemail').addEventListener('click',()=>{dksDraftLinks($('quote-email'),$('quote-whatsapp'),'DKs Photography — Custom quote request',last);$('quote-drafts').hidden=false;$('quote-status').textContent=DKS_MESSAGES.enquiryDraft;});
$('qcopy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(last);$('qcopy').textContent='Copied!';setTimeout(()=>$('qcopy').textContent='Copy estimate',1800)}catch(e){window.prompt('Copy your estimate:',last)}});
populate();
})();