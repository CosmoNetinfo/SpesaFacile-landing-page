'use strict';
let shareRequest = 0;
async function renderSharedList(){
 const request = ++shareRequest;
 const token=location.hash.slice(1);
 const status=document.getElementById('status');
 const button=document.getElementById('open-app');
 document.getElementById('preview').hidden=true;
 document.getElementById('list-items').replaceChildren();
 button.removeAttribute('href');button.setAttribute('aria-disabled','true');
 try {
  if(!/^[A-Za-z0-9_-]{1,12000}$/.test(token)) throw Error('Il link non contiene una lista valida.');
  button.href='spesafacile://import?data='+token;
  if(typeof DecompressionStream==='undefined') {
   button.removeAttribute('aria-disabled');
   status.textContent='Apri il collegamento nell’app aggiornata per leggere e salvare la lista.';
   return;
  }
  const base64=token.replace(/-/g,'+').replace(/_/g,'/');
  const raw=Uint8Array.from(atob(base64+'='.repeat((4-base64.length%4)%4)),c=>c.charCodeAt(0));
  const reader=new Blob([raw]).stream().pipeThrough(new DecompressionStream('gzip')).getReader();
  let size=0;const chunks=[];
  while(true){const result=await reader.read();if(result.done)break;size+=result.value.length;if(size>256000){await reader.cancel();throw Error('La lista è troppo grande.');}chunks.push(result.value);}
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
  const data=JSON.parse(new TextDecoder().decode(bytes));
  const list=data.list;
  if(data.format!=='spesafacile-list'||data.version!==1||!list||typeof list.name!=='string'||!list.name.trim()||list.name.length>500||!Array.isArray(list.items)||list.items.length>1000) throw Error('Formato della lista non supportato.');
  for(const item of list.items) {
   if(typeof item.name!=='string'||!item.name.trim()||item.name.length>500||!Number.isFinite(item.quantity)||item.quantity<=0||item.quantity>1000000||typeof item.unit!=='string'||item.unit.length>20) throw Error('La lista contiene prodotti non validi.');
  }
  if(request!==shareRequest)return;
  document.getElementById('list-name').textContent=list.name;
  document.getElementById('list-count').textContent=list.items.length+' prodotti · quantità e spunte incluse';
  for(const item of list.items){const row=document.createElement('li');row.textContent=(item.checked?'✓ ':'○ ')+item.name+' · '+String(item.quantity).replace('.',',')+' '+item.unit;document.getElementById('list-items').append(row);}
  document.getElementById('preview').hidden=false;
  button.removeAttribute('aria-disabled');
  status.textContent='Apri l’app per salvare questa lista sul tuo telefono.';
 } catch(error) {
  if(request!==shareRequest)return;
  button.removeAttribute('href');button.setAttribute('aria-disabled','true');
  status.textContent=error.message&&error.message.startsWith('La lista')?error.message:'Questo collegamento non contiene una lista valida. Chiedi a chi lo ha inviato di condividerlo di nuovo.';
 }
}
window.addEventListener('hashchange',renderSharedList);
renderSharedList();
